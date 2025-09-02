import { Navigate } from "react-router-dom";
import { CurrencyConverter } from "@/components/currency-converter";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Currency Converter
          </h1>
          <p className="text-muted-foreground text-lg">
            Convert currencies with real-time exchange rates
          </p>
        </div>
        
        <CurrencyConverter />
      </div>
    </div>
  );
};

export default Index;
