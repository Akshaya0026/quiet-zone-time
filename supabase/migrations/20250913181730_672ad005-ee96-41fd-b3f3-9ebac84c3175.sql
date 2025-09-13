-- First, create missing profile records for existing users with study blocks
INSERT INTO public.profiles (user_id, email, full_name)
SELECT DISTINCT 
  sb.user_id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', '')
FROM public.study_blocks sb
JOIN auth.users au ON au.id = sb.user_id
WHERE sb.user_id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Add the missing trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Now add the foreign key constraint
ALTER TABLE public.study_blocks 
ADD CONSTRAINT study_blocks_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;