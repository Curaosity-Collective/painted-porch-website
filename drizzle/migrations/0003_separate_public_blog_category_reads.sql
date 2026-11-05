DROP POLICY "Public can read categories for visible posts" ON public.blog_post_categories;
CREATE POLICY "Anonymous can read categories for published posts"
ON public.blog_post_categories FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.blog_posts bp WHERE bp.id = blog_post_categories.post_id AND (bp.status = 'published' OR (bp.status = 'scheduled' AND bp.publish_date IS NOT NULL AND bp.publish_date <= now()))));
CREATE POLICY "Authenticated can read categories for visible posts"
ON public.blog_post_categories FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.blog_posts bp WHERE bp.id = blog_post_categories.post_id AND (bp.status = 'published' OR (bp.status = 'scheduled' AND bp.publish_date IS NOT NULL AND bp.publish_date <= now()))) OR public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.blog_posts bp WHERE bp.id = blog_post_categories.post_id AND bp.author_id = auth.uid()));