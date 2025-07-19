-- Fix the orders status constraint to include 'success' status
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the updated constraint with all valid statuses
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'picked', 'completed', 'cancelled', 'success'));

-- Update the pickup_time column to handle time ranges properly
ALTER TABLE public.orders ALTER COLUMN pickup_time TYPE text;

-- Add comment for clarity
COMMENT ON COLUMN public.orders.pickup_time IS 'Time range for pickup (e.g., 15:00-17:00)';