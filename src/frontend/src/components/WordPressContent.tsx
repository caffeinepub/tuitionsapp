import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  Globe,
  LayoutList,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WpPost {
  id: number;
  title: { rendered: string };
  date: string;
  excerpt: { rendered: string };
  link: string;
}

interface WpPage {
  id: number;
  title: { rendered: string };
  link: string;
}

interface WpMedia {
  id: number;
  title: { rendered: string };
  source_url: string;
  mime_type: string;
}

interface Props {
  wpUrl: string; // saved WordPress site URL (empty = not configured)
  onUrlChange?: (newUrl: string) => void; // called after successful save in settings
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .trim();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function filenameFromUrl(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/");
    return parts[parts.length - 1] || url;
  } catch {
    return url;
  }
}

function normaliseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

async function fetchWpEndpoint<T>(
  baseUrl: string,
  endpoint: string,
): Promise<T[]> {
  const url = `${baseUrl}/wp-json/wp/v2/${endpoint}?per_page=20`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T[]>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WordPressContent({ wpUrl }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<WpPost[]>([]);
  const [pages, setPages] = useState<WpPage[]>([]);
  const [media, setMedia] = useState<WpMedia[]>([]);
  const [fetched, setFetched] = useState(false);

  const load = useCallback(async () => {
    if (!wpUrl) return;
    const base = normaliseUrl(wpUrl);
    setLoading(true);
    setError(null);
    try {
      const [postsData, pagesData, mediaData] = await Promise.all([
        fetchWpEndpoint<WpPost>(base, "posts").catch(() => [] as WpPost[]),
        fetchWpEndpoint<WpPage>(base, "pages").catch(() => [] as WpPage[]),
        fetchWpEndpoint<WpMedia>(base, "media").catch(() => [] as WpMedia[]),
      ]);
      // If all empty and no obvious errors, try a simple ping to check reachability
      setPosts(postsData);
      setPages(pagesData);
      setMedia(mediaData);
      setFetched(true);
    } catch {
      setError(
        "Unable to connect to your WordPress site. Please check the URL in Settings.",
      );
    } finally {
      setLoading(false);
    }
  }, [wpUrl]);

  // Auto-load once when expanded for the first time
  useEffect(() => {
    if (expanded && !fetched && wpUrl) {
      load();
    }
  }, [expanded, fetched, wpUrl, load]);

  // Re-fetch if URL changes — use a ref comparison to detect actual changes
  const prevUrlRef = useRef(wpUrl);
  useEffect(() => {
    if (prevUrlRef.current !== wpUrl) {
      prevUrlRef.current = wpUrl;
      setFetched(false);
      setPosts([]);
      setPages([]);
      setMedia([]);
      setError(null);
    }
  });

  return (
    <section
      data-ocid="teacher.wordpress.section"
      id="wordpress-content-section"
      className="mb-8"
    >
      {/* Header row — div wrapper avoids nesting buttons */}
      <div className="flex items-center gap-2 w-full mb-4 group">
        {/* Clickable toggle area */}
        <button
          type="button"
          data-ocid="teacher.wordpress.toggle"
          onClick={() => setExpanded((o) => !o)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          aria-expanded={expanded}
        >
          <Globe
            className="w-5 h-5 flex-shrink-0"
            style={{ color: "#1B2B50" }}
          />
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "#1B2B50" }}
          >
            My WordPress Content
          </h2>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground ml-2 group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 group-hover:text-foreground transition-colors" />
          )}
        </button>
        {/* Refresh button — sibling, not nested */}
        {expanded && wpUrl && !loading && (
          <button
            type="button"
            data-ocid="teacher.wordpress.refresh_button"
            aria-label="Refresh WordPress content"
            onClick={() => {
              setFetched(false);
              load();
            }}
            className="ml-auto p-1 rounded-md hover:bg-muted/50 transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="space-y-5">
          {/* Not configured */}
          {!wpUrl && (
            <div
              data-ocid="teacher.wordpress.empty_state"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-8 text-center"
            >
              <Globe
                className="w-8 h-8 mx-auto mb-3 opacity-40"
                style={{ color: "#1B2B50" }}
              />
              <p className="text-sm font-medium text-muted-foreground">
                Connect your WordPress site in Settings to display your content
                here.
              </p>
            </div>
          )}

          {/* Loading */}
          {wpUrl && loading && (
            <div
              data-ocid="teacher.wordpress.loading"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-10 flex flex-col items-center gap-3"
            >
              <Loader2
                className="w-7 h-7 animate-spin"
                style={{ color: "#1B2B50" }}
              />
              <p className="text-sm text-muted-foreground">
                Fetching your WordPress content…
              </p>
            </div>
          )}

          {/* Error */}
          {wpUrl && !loading && error && (
            <div
              data-ocid="teacher.wordpress.error"
              className="bg-card rounded-xl border border-border/60 shadow-xs p-6 flex items-start gap-3"
            >
              <AlertCircle
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                style={{ color: "#E8614A" }}
              />
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#E8614A" }}
                >
                  Unable to connect to your WordPress site.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please check the URL in Settings, or ensure your site's REST
                  API is publicly accessible.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 gap-1.5 text-xs"
                  style={{ borderColor: "#E8614A", color: "#E8614A" }}
                  onClick={() => {
                    setFetched(false);
                    load();
                  }}
                >
                  <RefreshCw className="w-3 h-3" /> Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          {wpUrl && !loading && !error && fetched && (
            <>
              {/* Posts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" style={{ color: "#1B2B50" }} />
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "#1B2B50" }}
                  >
                    Posts
                  </h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {posts.length} found
                  </span>
                </div>

                {posts.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No posts found.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {posts.map((post) => {
                      const excerpt = stripHtml(post.excerpt.rendered);
                      const truncated =
                        excerpt.length > 150
                          ? `${excerpt.slice(0, 150)}…`
                          : excerpt;
                      return (
                        <div
                          key={post.id}
                          data-ocid={`teacher.wordpress.post.${post.id}`}
                          className="bg-card rounded-xl border border-border/60 shadow-xs p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
                        >
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold leading-snug hover:underline flex items-start gap-1.5 group"
                            style={{ color: "#1B2B50" }}
                          >
                            <span className="flex-1">
                              {stripHtml(post.title.rendered)}
                            </span>
                            <ExternalLink
                              className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: "#E8614A" }}
                            />
                          </a>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(post.date)}
                          </p>
                          {truncated && (
                            <p
                              className="text-xs leading-relaxed"
                              style={{ color: "#8B929F" }}
                            >
                              {truncated}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pages */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <LayoutList
                    className="w-4 h-4"
                    style={{ color: "#1B2B50" }}
                  />
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "#1B2B50" }}
                  >
                    Pages
                  </h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {pages.length} found
                  </span>
                </div>

                {pages.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No pages found.
                  </p>
                ) : (
                  <div className="bg-card rounded-xl border border-border/60 shadow-xs divide-y divide-border/40">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        data-ocid={`teacher.wordpress.page.${page.id}`}
                        className="flex items-center justify-between px-4 py-2.5 gap-3"
                      >
                        <a
                          href={page.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline flex items-center gap-1.5 min-w-0 group"
                          style={{ color: "#1B2B50" }}
                        >
                          <span className="truncate">
                            {stripHtml(page.title.rendered)}
                          </span>
                          <ExternalLink
                            className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: "#E8614A" }}
                          />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Media */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Download className="w-4 h-4" style={{ color: "#1B2B50" }} />
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "#1B2B50" }}
                  >
                    Uploaded Files
                  </h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {media.length} found
                  </span>
                </div>

                {media.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No media found.
                  </p>
                ) : (
                  <div className="bg-card rounded-xl border border-border/60 shadow-xs divide-y divide-border/40">
                    {media.map((item) => {
                      const filename = filenameFromUrl(item.source_url);
                      return (
                        <div
                          key={item.id}
                          data-ocid={`teacher.wordpress.media.${item.id}`}
                          className="flex items-center justify-between px-4 py-2.5 gap-3 group"
                        >
                          <span
                            className="text-sm truncate min-w-0"
                            style={{ color: "#8B929F" }}
                          >
                            {filename}
                          </span>
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={filename}
                            aria-label={`Open ${filename}`}
                            className="flex-shrink-0 p-1.5 rounded-md transition-colors hover:bg-muted/50"
                          >
                            <Download
                              className="w-4 h-4 transition-colors"
                              style={{ color: "#E8614A" }}
                            />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
