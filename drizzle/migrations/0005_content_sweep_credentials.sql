CREATE TABLE public.content_sweep_credentials (id boolean PRIMARY KEY DEFAULT true CHECK (id), token text NOT NULL);
GRANT ALL ON public.content_sweep_credentials TO service_role;
ALTER TABLE public.content_sweep_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.content_sweep_credentials FROM anon, authenticated;