interface BookmarkLike {
  url: string;
  title: string;
  favicon?: string;
}

export function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function getFaviconUrl(bookmark: Pick<BookmarkLike, "url" | "favicon">) {
  if (bookmark.favicon) return bookmark.favicon;
  try {
    const url = new URL(bookmark.url);
    return `${url.protocol}//${url.host}/favicon.ico`;
  } catch {
    return null;
  }
}

// Bookmarks whose page couldn't be fetched are saved with the URL as their title
export function getDisplayTitle(bookmark: Pick<BookmarkLike, "url" | "title">) {
  return bookmark.title === bookmark.url
    ? bookmark.url.replace(/^https?:\/\/(www\.)?/, "")
    : bookmark.title;
}
