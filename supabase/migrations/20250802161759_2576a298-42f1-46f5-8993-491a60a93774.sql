-- Create referrals table to track referral relationships
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  reward_amount NUMERIC DEFAULT 21.00,
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id) -- A user can only be referred once
);

-- Create referral_codes table to manage unique referral codes
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- Each user gets one referral code
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update referrals" 
ON public.referrals 
FOR UPDATE 
USING (true);

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral code" 
ON public.referral_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral code" 
ON public.referral_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral code" 
ON public.referral_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add referral_code column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN referral_code_used TEXT;

-- Create trigger for updating referrals table timestamp
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-generate referral code for new users
CREATE OR REPLACE FUNCTION public.generate_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.user_id, 'REF' || UPPER(LEFT(NEW.full_name, 3)) || EXTRACT(YEAR FROM NOW())::TEXT || FLOOR(RANDOM() * 1000)::TEXT);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If code collision, generate with timestamp
    INSERT INTO public.referral_codes (user_id, code)
    VALUES (NEW.user_id, 'REF' || UPPER(LEFT(NEW.full_name, 3)) || EXTRACT(EPOCH FROM NOW())::TEXT);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate referral codes
CREATE TRIGGER on_profile_created_generate_referral_code
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_user_referral_code();