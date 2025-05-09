document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://open.er-api.com/v6/latest/';
    const form = document.getElementById('currencyForm');
    const baseCurrencySelect = document.getElementById('baseCurrency');
    const targetCurrencySelect = document.getElementById('targetCurrency');
    const amountInput = document.getElementById('amount');
    const swapButton = document.getElementById('swapButton');
    const resultDiv = document.getElementById('result');
    const comparisonDiv = document.getElementById('comparison');
    const comparisonTable = document.getElementById('comparisonTable');
    const baseAmountSpan = document.getElementById('baseAmount');
    const baseCodeSpan = document.getElementById('baseCode');
    const targetAmountSpan = document.getElementById('targetAmount');
    const targetCodeSpan = document.getElementById('targetCode');
    const lastUpdatedSpan = document.getElementById('lastUpdated');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMsg = document.getElementById('errorMsg');

    // Common currencies for comparison
    const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'NGN', 'INR'];

    // Fetch and populate currency options
    async function populateCurrencies() {
        try {
            const response = await fetch(`${API_URL}USD`);
            const data = await response.json();
            const currencies = Object.keys(data.rates);
            currencies.forEach(currency => {
                const option1 = document.createElement('option');
                const option2 = document.createElement('option');
                option1.value = option2.value = currency;
                option1.text = option2.text = currency;
                baseCurrencySelect.appendChild(option1);
                targetCurrencySelect.appendChild(option2);
            });
            // Set default values
            baseCurrencySelect.value = 'USD';
            targetCurrencySelect.value = 'NGN';
        } catch (error) {
            showError('Failed to load currencies. Please try again later.');
        }
    }

    // Show error message
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove('opacity-0');
        errorMsg.classList.add('opacity-100');
        setTimeout(() => {
            errorMsg.classList.remove('opacity-100');
            errorMsg.classList.add('opacity-0');
            errorMsg.textContent = '';
        }, 5000);
    }

    // Convert currency
    async function convertCurrency(amount, base, target) {
        try {
            loadingSpinner.style.display = 'inline-block';
            resultDiv.classList.add('hidden');
            comparisonDiv.classList.add('hidden');

            const response = await fetch(`${API_URL}${base}`);
            const data = await response.json();

            if (data.result === 'success') {
                const rate = data.rates[target];
                const convertedAmount = (amount * rate).toFixed(2);

                // Update result
                baseAmountSpan.textContent = amount;
                baseCodeSpan.textContent = base;
                targetAmountSpan.textContent = convertedAmount;
                targetCodeSpan.textContent = target;
                lastUpdatedSpan.textContent = new Date(data.time_last_update_utc).toLocaleString();
                resultDiv.classList.remove('hidden');

                // Populate comparison table
                comparisonTable.innerHTML = '';
                popularCurrencies.forEach(currency => {
                    if (currency !== base) {
                        const row = document.createElement('tr');
                        const converted = (amount * data.rates[currency]).toFixed(2);
                        row.innerHTML = `
                            <td class="p-3">${currency}</td>
                            <td class="p-3">${currency}</td>
                            <td class="p-3">${converted}</td>
                        `;
                        comparisonTable.appendChild(row);
                    }
                });
                comparisonDiv.classList.remove('hidden');
            } else {
                showError('Failed to fetch exchange rates.');
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // Swap currencies
    swapButton.addEventListener('click', () => {
        const baseValue = baseCurrencySelect.value;
        const targetValue = targetCurrencySelect.value;
        if (baseValue && targetValue) {
            baseCurrencySelect.value = targetValue;
            targetCurrencySelect.value = baseValue;
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(amountInput.value);
        const base = baseCurrencySelect.value;
        const target = targetCurrencySelect.value;

        if (!amount || amount <= 0) {
            showError('Please enter a valid amount.');
            return;
        }
        if (!base || !target) {
            showError('Please select both currencies.');
            return;
        }
        if (base === target) {
            showError('Base and target currencies must be different.');
            return;
        }

        convertCurrency(amount, base, target);
    });

    // Initialize
    populateCurrencies();
});