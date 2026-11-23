CREATE OR REPLACE FUNCTION public.list_editorial_authors()
RETURNS TABLE (id uuid, full_name text, is_guest_author boolean)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.is_guest_author
  FROM public.profiles p
  WHERE p.is_author = true AND p.is_active = true
    AND public.is_admin_or_editor(auth.uid())
  ORDER BY p.full_name;
$$;
REVOKE ALL ON FUNCTION public.list_editorial_authors() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_editorial_authors() TO authenticated, service_role;