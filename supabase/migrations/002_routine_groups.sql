CREATE TABLE IF NOT EXISTS public.routine_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.routine_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own routine groups" ON public.routine_groups;
CREATE POLICY "Users can manage own routine groups"
  ON public.routine_groups FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_routine_groups_user_id ON public.routine_groups(user_id);

ALTER TABLE public.routines ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.routine_groups(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_routines_group_id ON public.routines(group_id);
