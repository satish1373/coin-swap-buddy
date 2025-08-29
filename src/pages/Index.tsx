import { CurrencyConverter } from "@/components/currency-converter";
import { Calculator, ArrowRightLeft } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Currency Converter
            </h1>
          </div>
          <p className="text-lg text-white/80 max-w-md mx-auto">
            Convert currencies instantly with real-time exchange rates
          </p>
        </div>

        {/* Main Converter */}
        <div className="flex justify-center">
          <CurrencyConverter />
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-fade-in">
            <ArrowRightLeft className="h-8 w-8 text-white mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Live Rates</h3>
            <p className="text-white/70 text-sm">
              Get real-time exchange rates for accurate conversions
            </p>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Calculator className="h-8 w-8 text-white mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Easy to Use</h3>
            <p className="text-white/70 text-sm">
              Simple interface for quick and easy currency conversions
            </p>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="h-8 w-8 text-white mx-auto mb-3 flex items-center justify-center font-bold text-lg">
              $€¥
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Currency</h3>
            <p className="text-white/70 text-sm">
              Support for major world currencies including USD, EUR, GBP, and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
