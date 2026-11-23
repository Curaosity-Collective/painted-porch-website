-- Restore Editor review and category access without changing anonymous policies.
ALTER POLICY "Authenticated users can read own or published posts"
ON public.blog_posts TO authenticated
USING (auth.uid() = author_id OR status = 'published' OR public.is_admin_or_editor(auth.uid()));

ALTER POLICY "Authenticated can read categories for visible posts"
ON public.blog_post_categories TO authenticated
USING (
  public.is_admin_or_editor(auth.uid())
  OR EXISTS (SELECT 1 FROM public.blog_posts bp WHERE bp.id = post_id)
);

ALTER POLICY "Authors or admins can insert post categories"
ON public.blog_post_categories TO authenticated
WITH CHECK (
  public.is_admin_or_editor(auth.uid())
  OR EXISTS (SELECT 1 FROM public.blog_posts bp WHERE bp.id = post_id AND bp.author_id = auth.uid())
);

ALTER POLICY "Authors or admins can delete post categories"
ON public.blog_post_categories TO authenticated
USING (
  public.is_admin_or_editor(auth.uid())
  OR EXISTS (SELECT 1 FROM public.blog_posts bp WHERE bp.id = post_id AND bp.author_id = auth.uid())
);