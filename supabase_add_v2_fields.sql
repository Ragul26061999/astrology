-- Migration script to add version 2 fields to match_profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.match_profiles 
ADD COLUMN IF NOT EXISTS no_case BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_widow BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS no_dob BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS no_parent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS siblings_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS siblings_details TEXT;
