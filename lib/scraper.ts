
/**
 * Scrapes the content of a URL using a CORS proxy (allorigins).
 * Returns the raw text content of the page, cleaned of scripts and styles.
 */
export async function scrapeUrl(url: string): Promise<string | null> {
    try {
        // Use allorigins.win as a free CORS proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (!data.contents) return null;

        const html = data.contents;
        
        // Parse HTML in the browser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove script and style elements
        const scripts = doc.querySelectorAll('script, style, noscript, iframe, svg');
        scripts.forEach(script => script.remove());

        // Get text content
        const bodyText = doc.body.innerText || "";
        
        // Clean up whitespace
        return bodyText
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 8000); // Limit context size for LLM

    } catch (error) {
        console.error("Scraping failed:", error);
        return null;
    }
}
