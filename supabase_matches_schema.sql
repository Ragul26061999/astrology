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
    age INTEGER,
    dosham_status BOOLEAN DEFAULT false,
    work TEXT,
    case TEXT,
    region TEXT,
    district TEXT,
    salary TEXT,
    other_country TEXT,
    dowry TEXT,
    business TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.match_profiles ENABLE ROW LEVEL SECURITY;

-- Add policies
-- Allow everyone to view profiles
CREATE POLICY "Allow anyone to view profiles" ON public.match_profiles
    FOR SELECT TO public USING (true);

-- Allow everyone to create profiles
CREATE POLICY "Allow anyone to create profiles" ON public.match_profiles
    FOR INSERT TO public WITH CHECK (true);

-- Allow everyone to update profiles
CREATE POLICY "Allow anyone to update profiles" ON public.match_profiles
    FOR UPDATE TO public USING (true);

-- Allow everyone to delete profiles
CREATE POLICY "Allow anyone to delete profiles" ON public.match_profiles
    FOR DELETE TO public USING (true);
