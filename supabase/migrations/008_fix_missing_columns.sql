-- Fix missing columns that were not applied to the live database
-- This consolidates migrations 003 (creator_secret) and 005 (user_id) for the cards table

-- Add creator_secret column
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS creator_secret TEXT;

-- Add user_id column
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS user_id TEXT;
