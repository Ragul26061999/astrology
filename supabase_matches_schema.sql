-- SQL Script to create match_profiles table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE public.match_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_place TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    rasi TEXT,
    nakshatram TEXT,
    nakshatra_pada INTEGER,
    lagnam TEXT,
    dosham_status BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: add appropriate RLS policies if required for your use case
-- ALTER TABLE public.match_profiles ENABLE ROW LEVEL SECURITY;
