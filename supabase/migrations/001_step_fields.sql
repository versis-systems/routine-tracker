-- Add instructions and product fields to steps
ALTER TABLE public.steps ADD COLUMN IF NOT EXISTS instructions text;
ALTER TABLE public.steps ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE public.steps ADD COLUMN IF NOT EXISTS product_brand text;

-- Add notes/rules to routines directly (instead of only in routine_info)
ALTER TABLE public.routines ADD COLUMN IF NOT EXISTS notes text;
