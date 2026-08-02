-- Migration 010: Add recurrence to calendar_events

ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS recurrence text NOT NULL DEFAULT 'single' CHECK (recurrence IN ('single', 'yearly', 'monthly'));

-- Existing events will default to 'single'
