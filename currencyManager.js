// currencyManager.js - Manage currencies including SGD

const currencies = [
    { code: 'USD', name: 'United States Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'SGD', name: 'Singapore Dollar' } // Adding SGD
];

// Function to get all available currencies
export const getCurrencies = () => {
    return currencies;
};

// Function to convert currency
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
    const rates = {
        USD: { EUR: 0.85, SGD: 1.35 },
        EUR: { USD: 1.18, SGD: 1.59 },
        SGD: { USD: 0.74, EUR: 0.63 },
    };

    if (!rates[fromCurrency] || !rates[fromCurrency][toCurrency]) {
        throw new Error(`Conversion rate from ${fromCurrency} to ${toCurrency} not available.`);
    }

    return amount * rates[fromCurrency][toCurrency];
};