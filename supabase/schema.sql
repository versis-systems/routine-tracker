-- ============================================
-- Routine Tracker - Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Routines table
CREATE TABLE IF NOT EXISTS public.routines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  time_of_day text CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'free')) DEFAULT 'morning',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Steps table
CREATE TABLE IF NOT EXISTS public.steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id uuid REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  note text,
  repeat_rule text CHECK (repeat_rule IN ('daily', 'specific_days', 'x_per_week')) DEFAULT 'daily',
  repeat_days integer[] DEFAULT '{}',
  repeat_count integer DEFAULT 1,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  phase_enabled boolean DEFAULT false,
  phase_start_date date,
  phase_config jsonb,
  instructions text,
  product_name text,
  product_brand text,
  created_at timestamptz DEFAULT now()
);

-- Completions table
CREATE TABLE IF NOT EXISTS public.completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_id uuid REFERENCES public.steps(id) ON DELETE CASCADE NOT NULL,
  completed_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, step_id, completed_date)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id uuid REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  notify_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Routine info table
CREATE TABLE IF NOT EXISTS public.routine_info (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id uuid REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL UNIQUE,
  expected_results jsonb DEFAULT '[]',
  rules text[] DEFAULT '{}',
  products jsonb DEFAULT '[]',
  free_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- Enable Row Level Security
-- ============================================

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_info ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Routines: users can only access their own routines
DROP POLICY IF EXISTS "Users can manage own routines" ON public.routines;
CREATE POLICY "Users can manage own routines"
  ON public.routines
  FOR ALL
  USING (auth.uid() = user_id);

-- Steps: users can access steps of their own routines
DROP POLICY IF EXISTS "Users can manage own steps" ON public.steps;
CREATE POLICY "Users can manage own steps"
  ON public.steps
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.routines
      WHERE id = steps.routine_id AND user_id = auth.uid()
    )
  );

-- Completions: users can only access their own completions
DROP POLICY IF EXISTS "Users can manage own completions" ON public.completions;
CREATE POLICY "Users can manage own completions"
  ON public.completions
  FOR ALL
  USING (auth.uid() = user_id);

-- Notifications: users can only access their own notifications
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications"
  ON public.notifications
  FOR ALL
  USING (auth.uid() = user_id);

-- Routine info: users can access info for their own routines
DROP POLICY IF EXISTS "Users can manage own routine info" ON public.routine_info;
CREATE POLICY "Users can manage own routine info"
  ON public.routine_info
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.routines
      WHERE id = routine_info.routine_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_routines_user_id ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_steps_routine_id ON public.steps(routine_id);
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON public.completions(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_completions_step_id ON public.completions(step_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
