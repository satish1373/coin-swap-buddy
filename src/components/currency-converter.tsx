import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, TrendingUp } from "lucide-react";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
];

// Mock exchange rates - in a real app, you'd fetch these from an API
const exchangeRates: { [key: string]: number } = {
  "USD-EUR": 0.85,
  "USD-GBP": 0.73,
  "USD-JPY": 110.0,
  "USD-CAD": 1.25,
  "USD-AUD": 1.35,
  "USD-CHF": 0.92,
  "USD-CNY": 6.45,
  "EUR-USD": 1.18,
  "EUR-GBP": 0.86,
  "EUR-JPY": 129.4,
  "GBP-USD": 1.37,
  "GBP-EUR": 1.16,
  "JPY-USD": 0.009,
  "CAD-USD": 0.8,
  "AUD-USD": 0.74,
  "CHF-USD": 1.09,
  "CNY-USD": 0.155,
};

export function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [fromAmount, setFromAmount] = useState("100");
  const [toAmount, setToAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(0);

  const calculateConversion = () => {
    if (fromCurrency === toCurrency) {
      setToAmount(fromAmount);
      setExchangeRate(1);
      return;
    }

    const rateKey = `${fromCurrency}-${toCurrency}`;
    const rate = exchangeRates[rateKey] || 1;
    const amount = parseFloat(fromAmount) || 0;
    const convertedAmount = amount * rate;
    
    setToAmount(convertedAmount.toFixed(2));
    setExchangeRate(rate);
  };

  useEffect(() => {
    calculateConversion();
  }, [fromCurrency, toCurrency, fromAmount]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  };

  const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
  const toCurrencyData = currencies.find(c => c.code === toCurrency);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="p-6 bg-card border-card-border shadow-medium animate-slide-up">
        <div className="space-y-4">
          {/* From Currency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">From</label>
              <span className="text-xs text-muted-foreground">You send</span>
            </div>
            <div className="flex gap-2">
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-[120px] bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs">{currency.symbol}</span>
                        {currency.code}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 text-lg font-semibold bg-input border-border"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {fromCurrencyData?.symbol}{fromAmount} {fromCurrencyData?.name}
            </p>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              onClick={swapCurrencies}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-smooth"
            >
              <ArrowUpDown className="h-4 w-4 text-primary" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">To</label>
              <span className="text-xs text-muted-foreground">You receive</span>
            </div>
            <div className="flex gap-2">
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-[120px] bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs">{currency.symbol}</span>
                        {currency.code}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 flex items-center px-3 py-2 bg-background-secondary border border-border rounded-md">
                <span className="text-lg font-semibold text-foreground">{toAmount}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {toCurrencyData?.symbol}{toAmount} {toCurrencyData?.name}
            </p>
          </div>
        </div>
      </Card>

      {/* Exchange Rate Info */}
      <Card className="p-4 bg-gradient-secondary border-card-border shadow-soft animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Exchange Rate</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">
              1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </p>
            <p className="text-xs text-muted-foreground">Live rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
}