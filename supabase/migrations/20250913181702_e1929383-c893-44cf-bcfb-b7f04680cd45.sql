-- Clean up orphaned study blocks (where user no longer exists in auth.users)
DELETE FROM public.study_blocks 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Now add the foreign key constraint safely
ALTER TABLE public.study_blocks 
ADD CONSTRAINT study_blocks_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;

-- Add the missing trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();