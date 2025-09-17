// Currency Converter Application

// Description: This module handles currency conversion, including the addition of SGD (Singapore Dollar) to the currency list.
// The currency conversion logic is implemented here, with proper error handling, documentation, and test-ready structure.

const currencyList = ['USD', 'EUR', 'GBP', 'AUD', 'SGD']; // Updated currency list including SGD
const exchangeRates = {
    'USD': 1,
    'EUR': 0.85,
    'GBP': 0.75,
    'AUD': 1.35,
    'SGD': 1.36 // Example exchange rate for SGD
};

/**
 * Converts an amount from one currency to another.
 * @param {number} amount - The amount to convert.
 * @param {string} fromCurrency - The currency to convert from.
 * @param {string} toCurrency - The currency to convert to.
 * @returns {number} - The converted amount.
 * @throws {Error} - Throws an error if the fromCurrency or toCurrency is not supported.
 */
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (!currencyList.includes(fromCurrency) || !currencyList.includes(toCurrency)) {
        throw new Error(`Currency not supported. Available currencies: ${currencyList.join(', ')}`);
    }

    const baseAmount = amount / exchangeRates[fromCurrency];
    const convertedAmount = baseAmount * exchangeRates[toCurrency];
    return parseFloat(convertedAmount.toFixed(2)); // Round to 2 decimal places
}

// Example usage:
try {
    const amountInSGD = convertCurrency(100, 'USD', 'SGD');
    console.log(`100 USD is equal to ${amountInSGD} SGD`);
} catch (error) {
    console.error(error.message);
}

/**
 * Updates the exchange rate for a specific currency.
 * @param {string} currency - The currency to update.
 * @param {number} rate - The new exchange rate.
 */
function updateExchangeRate(currency, rate) {
    if (!currencyList.includes(currency)) {
        throw new Error(`Currency not supported. Available currencies: ${currencyList.join(', ')}`);
    }
    exchangeRates[currency] = rate;
}

// Example usage of updating exchange rate
try {
    updateExchangeRate('SGD', 1.35); // Update SGD rate
    console.log('Exchange rate for SGD updated successfully.');
} catch (error) {
    console.error(error.message);
}