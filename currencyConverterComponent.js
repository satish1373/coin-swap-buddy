import React, { useState, useEffect } from 'react';
import { getCurrencies, convertCurrency } from './currencyManager';

const CurrencyConverter = () => {
    const [amount, setAmount] = useState(0);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('SGD');
    const [conversionResult, setConversionResult] = useState(null);
    const [availableCurrencies, setAvailableCurrencies] = useState([]);

    useEffect(() => {
        setAvailableCurrencies(getCurrencies());
    }, []);

    const handleConversion = () => {
        try {
            const result = convertCurrency(amount, fromCurrency, toCurrency);
            setConversionResult(result);
        } catch (error) {
            console.error(error.message);
            alert("Error during conversion: " + error.message);
        }
    };

    return (
        <div>
            <h1>Currency Converter</h1>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
                {availableCurrencies.map(currency => (
                    <option key={currency.code} value={currency.code}>{currency.name}</option>
                ))}
            </select>
            <select value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
                {availableCurrencies.map(currency => (
                    <option key={currency.code} value={currency.code}>{currency.name}</option>
                ))}
            </select>
            <button onClick={handleConversion}>Convert</button>
            {conversionResult && <p>Converted Amount: {conversionResult}</p>}
        </div>
    );
};

export default CurrencyConverter;