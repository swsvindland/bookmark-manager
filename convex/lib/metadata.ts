// Pulls title / description / favicon out of a page's HTML without a DOM parser.

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  laquo: "«",
  raquo: "»",
  middot: "·",
  bull: "•",
  copy: "©",
  reg: "®",
  trade: "™",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const isHex = entity[1] === "x" || entity[1] === "X";
      const codePoint = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return codePoint > 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}

// Attribute values may be double-quoted, single-quoted, or bare, and appear in any order.
function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  for (const [, name, doubleQuoted, singleQuoted, bare] of tag.matchAll(pattern)) {
    attributes[name.toLowerCase()] = decodeEntities(doubleQuoted ?? singleQuoted ?? bare ?? "");
  }
  return attributes;
}

function findTags(html: string, tagName: string): Record<string, string>[] {
  // Quoted attribute values may themselves contain ">"
  const pattern = new RegExp(`<${tagName}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, "gi");
  return [...html.matchAll(pattern)].map((match) => parseAttributes(match[0]));
}

const collapseWhitespace = (text: string | undefined) => text?.replace(/\s+/g, " ").trim() ?? "";

export function extractMetadata(html: string, pageUrl: string) {
  // Only look at <head>, so an inline SVG <title> in the body can't be mistaken for the page title
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd === -1 ? html : html.slice(0, headEnd);

  const metas = findTags(head, "meta");
  const metaContent = (key: string) =>
    metas.find((meta) => meta.name?.toLowerCase() === key || meta.property?.toLowerCase() === key)
      ?.content;

  const titleText = head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const title =
    collapseWhitespace(titleText && decodeEntities(titleText)) ||
    collapseWhitespace(metaContent("og:title"));

  const description =
    collapseWhitespace(metaContent("description")) ||
    collapseWhitespace(metaContent("og:description"));

  const iconHref = findTags(head, "link").find(
    (link) => link.href && link.rel?.toLowerCase().split(/\s+/).includes("icon"),
  )?.href;

  let favicon = "";
  try {
    // Resolves relative, root-relative, and protocol-relative (//cdn...) hrefs correctly
    favicon = new URL(iconHref ?? "/favicon.ico", pageUrl).href;
  } catch {
    // Leave empty; the client falls back to /favicon.ico or a letter tile
  }

  return { title, description, favicon };
}
