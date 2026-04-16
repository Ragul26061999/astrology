-- Migration script to add new columns to existing match_profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.match_profiles 
ADD COLUMN IF NOT EXISTS work TEXT,
ADD COLUMN IF NOT EXISTS "case" TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS salary TEXT,
ADD COLUMN IF NOT EXISTS other_country TEXT,
ADD COLUMN IF NOT EXISTS dowry TEXT,
ADD COLUMN IF NOT EXISTS business TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT;
