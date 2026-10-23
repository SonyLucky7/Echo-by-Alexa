/**
 * Live Web Research Engine for ECHO AI Agent
 * Allows autonomous web research across the open web and culinary encyclopedias
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface WebSearchOutput {
  query: string;
  results: SearchResult[];
  summary: string;
  sourceCount: number;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "—")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function unwrapDdgUrl(rawUrl: string): string {
  try {
    if (rawUrl.includes("uddg=")) {
      const match = rawUrl.match(/uddg=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    if (rawUrl.startsWith("//")) {
      return "https:" + rawUrl;
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

async function searchDuckDuckGo(query: string, limit = 4): Promise<SearchResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encoded}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    clearTimeout(timeout);
    if (!res.ok) return [];

    const html = await res.text();
    const results: SearchResult[] = [];

    // Match each result block
    const titleMatches = [
      ...html.matchAll(
        /<h2 class="result__title">[\s\S]*?<a[^>]*class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
      ),
    ];
    const snippetMatches = [
      ...html.matchAll(/<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/gi),
    ];

    for (let i = 0; i < Math.min(titleMatches.length, limit); i++) {
      const titleMatch = titleMatches[i];
      const snippetMatch = snippetMatches[i];

      const rawUrl = titleMatch ? titleMatch[1] : "";
      const rawTitle = titleMatch ? titleMatch[2] : "";
      const rawSnippet = snippetMatch ? snippetMatch[1] : "";

      const cleanTitle = decodeHtmlEntities(rawTitle);
      const cleanSnippet = decodeHtmlEntities(rawSnippet);
      const cleanUrl = unwrapDdgUrl(rawUrl);

      if (cleanTitle && (cleanSnippet || cleanUrl)) {
        results.push({
          title: cleanTitle,
          url: cleanUrl,
          snippet: cleanSnippet || cleanTitle,
          source: "DuckDuckGo Web Search",
        });
      }
    }

    return results;
  } catch (err) {
    return [];
  }
}

async function searchWikipedia(query: string, limit = 3): Promise<SearchResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&utf8=&format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];

    const data = await res.json();
    const items = data?.query?.search || [];
    return items.slice(0, limit).map((it: any) => ({
      title: it.title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(it.title.replace(/ /g, "_"))}`,
      snippet: decodeHtmlEntities(it.snippet || ""),
      source: "Wikipedia Encyclopedia",
    }));
  } catch {
    return [];
  }
}

export async function executeWebSearch(query: string, limit = 4): Promise<WebSearchOutput> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return {
      query: "",
      results: [],
      summary: "Empty search query provided.",
      sourceCount: 0,
    };
  }

  // Run DuckDuckGo first, fallback or augment with Wikipedia
  let results = await searchDuckDuckGo(cleanQuery, limit);

  if (results.length === 0) {
    results = await searchWikipedia(cleanQuery, limit);
  } else if (results.length < limit) {
    const wiki = await searchWikipedia(cleanQuery, limit - results.length);
    results = [...results, ...wiki];
  }

  // Format concise summary for agent ingestion
  const summary = results.length > 0
    ? results
        .map(
          (r, idx) =>
            `[Source ${idx + 1}: ${r.title}](${r.url})\n${r.snippet}`
        )
        .join("\n\n")
    : `No public web sources found for "${cleanQuery}".`;

  return {
    query: cleanQuery,
    results,
    summary,
    sourceCount: results.length,
  };
}
