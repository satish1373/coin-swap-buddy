import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const defaultCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
];

export function CurrencyConverter() {
  const { toast } = useToast();
  
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [fromAmount, setFromAmount] = useState("100");
  const [toAmount, setToAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLiveRates = async () => {
    if (fromCurrency === toCurrency) {
      setToAmount(fromAmount);
      setExchangeRate(1);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('exchange-rates', {
        body: {
          base: fromCurrency,
          symbols: toCurrency
        }
      });

      if (error) throw error;

      const rate = data.rates[toCurrency] || 1;
      const amount = parseFloat(fromAmount) || 0;
      const convertedAmount = amount * rate;
      
      setToAmount(convertedAmount.toFixed(2));
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch live exchange rates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0) {
        fetchLiveRates();
      }
    }, 500); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [fromCurrency, toCurrency, fromAmount]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  };

  const fromCurrencyData = defaultCurrencies.find(c => c.code === fromCurrency);
  const toCurrencyData = defaultCurrencies.find(c => c.code === toCurrency);

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
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-[320px] bg-primary text-primary-foreground border border-primary-dark shadow-large">
                  {defaultCurrencies.map((currency) => (
                    <SelectItem 
                      key={`from-${currency.code}`} 
                      value={currency.code}
                      className="hover:bg-primary-light focus:bg-primary-light text-primary-foreground"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm min-w-[24px]">{currency.symbol}</span>
                          <span className="font-medium">{currency.code}</span>
                        </div>
                        <span className="text-sm text-primary-foreground/80 ml-4 truncate">
                          {currency.name}
                        </span>
                      </div>
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
                disabled={loading}
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
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-[320px] bg-primary text-primary-foreground border border-primary-dark shadow-large">
                  {defaultCurrencies.map((currency) => (
                    <SelectItem 
                      key={`to-${currency.code}`} 
                      value={currency.code}
                      className="hover:bg-primary-light focus:bg-primary-light text-primary-foreground"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm min-w-[24px]">{currency.symbol}</span>
                          <span className="font-medium">{currency.code}</span>
                        </div>
                        <span className="text-sm text-primary-foreground/80 ml-4 truncate">
                          {currency.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 flex items-center px-3 py-2 bg-background-secondary border border-border rounded-md">
                <span className="text-lg font-semibold text-foreground">
                  {loading ? "Converting..." : toAmount}
                </span>
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
              1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
            </p>
            <p className="text-xs text-muted-foreground">
              {loading ? "Fetching live rates..." : "Live exchange rate"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}