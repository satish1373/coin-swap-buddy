import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, TrendingUp, Plus, History, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [fromAmount, setFromAmount] = useState("100");
  const [toAmount, setToAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customCurrencies, setCustomCurrencies] = useState<Array<{code: string, name: string, symbol: string}>>([]);
  const [allCurrencies, setAllCurrencies] = useState(defaultCurrencies);
  const [conversionHistory, setConversionHistory] = useState<Array<any>>([]);
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [newCurrency, setNewCurrency] = useState({ code: "", name: "", symbol: "" });
  const [calculatorInput, setCalculatorInput] = useState("");
  const [calculatorResult, setCalculatorResult] = useState("");

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

      // Save to conversion history if user is logged in
      if (user && amount > 0) {
        await saveConversionHistory(amount, convertedAmount, rate);
      }
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

  const saveConversionHistory = async (amount: number, convertedAmount: number, rate: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conversion_history')
        .insert({
          user_id: user.id,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          amount,
          converted_amount: convertedAmount,
          exchange_rate: rate
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving conversion history:', error);
    }
  };

  const loadCustomCurrencies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('custom_currencies')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const customCurs = data.map(cur => ({
        code: cur.code,
        name: cur.name,
        symbol: cur.symbol
      }));

      setCustomCurrencies(customCurs);
      setAllCurrencies([...defaultCurrencies, ...customCurs]);
    } catch (error) {
      console.error('Error loading custom currencies:', error);
    }
  };

  const loadConversionHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversion_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setConversionHistory(data || []);
    } catch (error) {
      console.error('Error loading conversion history:', error);
    }
  };

  const addCustomCurrency = async () => {
    if (!user || !newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
      toast({
        title: "Error",
        description: "Please fill in all currency fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_currencies')
        .insert({
          user_id: user.id,
          code: newCurrency.code.toUpperCase(),
          name: newCurrency.name,
          symbol: newCurrency.symbol
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Custom currency added successfully!"
      });

      setNewCurrency({ code: "", name: "", symbol: "" });
      setShowAddCurrency(false);
      loadCustomCurrencies();
    } catch (error: any) {
      console.error('Error adding custom currency:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "This currency code already exists."
          : "Failed to add custom currency.",
        variant: "destructive"
      });
    }
  };

  const evaluateCalculation = () => {
    try {
      // Simple calculator - only allow basic operations for security
      const sanitizedInput = calculatorInput.replace(/[^0-9+\-*/.() ]/g, '');
      const result = Function('"use strict"; return (' + sanitizedInput + ')')();
      setCalculatorResult(result.toString());
      setFromAmount(result.toString());
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid calculation. Please check your input.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadCustomCurrencies();
      loadConversionHistory();
    }
  }, [user]);

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

  const fromCurrencyData = allCurrencies.find(c => c.code === fromCurrency);
  const toCurrencyData = allCurrencies.find(c => c.code === toCurrency);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Action Buttons */}
      {user && (
        <div className="flex gap-2 justify-center">
          <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Built-in Calculator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calculation">Enter calculation:</Label>
                  <Input
                    id="calculation"
                    value={calculatorInput}
                    onChange={(e) => setCalculatorInput(e.target.value)}
                    placeholder="e.g., 100 + 50 * 2"
                    onKeyDown={(e) => e.key === 'Enter' && evaluateCalculation()}
                  />
                </div>
                {calculatorResult && (
                  <div className="p-3 bg-background-secondary rounded-md">
                    <p className="text-sm font-medium">Result: {calculatorResult}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={evaluateCalculation} className="flex-1">
                    Calculate
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCalculatorInput("");
                      setCalculatorResult("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddCurrency} onOpenChange={setShowAddCurrency}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Currency
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Currency</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currency-code">Currency Code</Label>
                  <Input
                    id="currency-code"
                    value={newCurrency.code}
                    onChange={(e) => setNewCurrency({...newCurrency, code: e.target.value})}
                    placeholder="e.g., BTC"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="currency-name">Currency Name</Label>
                  <Input
                    id="currency-name"
                    value={newCurrency.name}
                    onChange={(e) => setNewCurrency({...newCurrency, name: e.target.value})}
                    placeholder="e.g., Bitcoin"
                  />
                </div>
                <div>
                  <Label htmlFor="currency-symbol">Currency Symbol</Label>
                  <Input
                    id="currency-symbol"
                    value={newCurrency.symbol}
                    onChange={(e) => setNewCurrency({...newCurrency, symbol: e.target.value})}
                    placeholder="e.g., ₿"
                    maxLength={5}
                  />
                </div>
                <Button onClick={addCustomCurrency} className="w-full">
                  Add Currency
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Conversion History</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {conversionHistory.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No conversion history yet.</p>
                ) : (
                  conversionHistory.map((entry, index) => (
                    <div key={index} className="p-3 bg-background-secondary rounded-md text-sm">
                      <div className="flex justify-between items-center">
                        <span>{entry.amount} {entry.from_currency} → {entry.converted_amount} {entry.to_currency}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Rate: 1 {entry.from_currency} = {entry.exchange_rate} {entry.to_currency}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
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
                  {allCurrencies.map((currency) => (
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
                  {allCurrencies.map((currency) => (
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