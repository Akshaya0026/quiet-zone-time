-- Fix the relationship between study_blocks and profiles tables
-- Add foreign key constraint to establish proper relationship
ALTER TABLE public.study_blocks 
ADD CONSTRAINT study_blocks_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;