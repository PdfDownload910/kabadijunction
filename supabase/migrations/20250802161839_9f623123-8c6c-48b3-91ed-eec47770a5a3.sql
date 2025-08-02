-- Fix security issues by updating function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_user_referral_code()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
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
$$;