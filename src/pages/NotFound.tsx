import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { getSiteUrl } from "@/lib/site-url";
import { pickNotFoundGif } from "@/config/notFoundGifs";

const NotFound = () => {
  const location = useLocation();
  // A different GIF now and then: one is picked at random each time the page opens (src/config/notFoundGifs.ts).
  const [gif] = useState(() => pickNotFoundGif());

  useDocumentSeo({
    title: "Page Not Found | Painted Porch Strategies",
    robots: "noindex, nofollow",
    canonical: `${getSiteUrl()}${location.pathname}`,
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-16">
      <div className="text-center max-w-lg mx-auto space-y-6">
        {/* One of the rotating GIFs */}
        <div className="mx-auto w-64 h-auto rounded-lg overflow-hidden shadow-md">
          <img
            src={gif.src}
            alt={gif.alt}
            width={480}
            height={480}
            className="w-full h-auto"
          />
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          Page not found
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>

        {/* Support info */}
        <p className="text-muted-foreground">
          If you are having trouble accessing a page on this site, please contact us at{" "}
          <a
            href="mailto:support@onthepaintedporch.com"
            className="font-semibold text-foreground underline underline-offset-2 hover:text-brand-teal transition-colors"
          >
            support@onthepaintedporch.com
          </a>
        </p>

        {/* Back Home Button */}
        <div className="pt-2">
          <Link to="/">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 px-8 text-base font-semibold uppercase tracking-wider border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              <Home className="w-4 h-4" />
              Back Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
