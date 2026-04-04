CREATE TABLE IF NOT EXISTS public.paired_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    groom_id UUID NOT NULL REFERENCES public.match_profiles(id) ON DELETE CASCADE,
    bride_id UUID NOT NULL REFERENCES public.match_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(groom_id),
    UNIQUE(bride_id)
);

-- Enable RLS
ALTER TABLE public.paired_profiles ENABLE ROW LEVEL SECURITY;

-- Add policies
-- Allow everyone to view pairs
CREATE POLICY "Allow anyone to view pairs" ON public.paired_profiles
    FOR SELECT TO public USING (true);

-- Allow everyone to create pairs
CREATE POLICY "Allow anyone to create pairs" ON public.paired_profiles
    FOR INSERT TO public WITH CHECK (true);

-- Allow everyone to delete/unpair
CREATE POLICY "Allow anyone to delete pairs" ON public.paired_profiles
    FOR DELETE TO public USING (true);
