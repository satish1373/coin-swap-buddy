-- Add custom currencies table
CREATE TABLE public.custom_currencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Enable RLS
ALTER TABLE public.custom_currencies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own custom currencies" 
ON public.custom_currencies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom currencies" 
ON public.custom_currencies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom currencies" 
ON public.custom_currencies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom currencies" 
ON public.custom_currencies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_custom_currencies_updated_at
BEFORE UPDATE ON public.custom_currencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();