import { useLocation } from "react-router-dom";
import approvedPages from "@/config/approvedPageMetadata.json";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";

type ApprovedMetadata = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  robots?: string;
  pageOwnsSeo: boolean;
};

function PageTags({ metadata }: { metadata: ApprovedMetadata }) {
  useDocumentSeo(metadata);
  return null;
}

/** Supply approved tags only to pages without a page-local SEO declaration. */
export default function ApprovedPageSeo() {
  const { pathname } = useLocation();
  const metadata = (approvedPages as Record<string, ApprovedMetadata>)[pathname];
  if (!metadata || metadata.pageOwnsSeo || pathname === "/terms") return null;
  return <PageTags metadata={metadata} />;
}