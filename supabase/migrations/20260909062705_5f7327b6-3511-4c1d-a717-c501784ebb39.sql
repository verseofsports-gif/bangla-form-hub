GRANT INSERT ON public.submissions TO anon;
GRANT INSERT, SELECT, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;