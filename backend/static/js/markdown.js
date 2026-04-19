/**
 * markdown.js — minimal Markdown → HTML renderer.
 * Handles the subset of Markdown that Grok returns:
 * headings, bold, inline code, fenced code blocks, lists, paragraphs.
 */

function renderMarkdown(md) {
  let html = md || "";

  // 1. Fenced code blocks  ```lang\n...\n```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = escapeHtml(code.trim());
    return `<pre><code class="lang-${lang}">${escaped}</code></pre>`;
  });

  // 2. Inline code  `code`
  html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

  // 3. Bold  **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // 4. Headings  ## Heading
  html = html.replace(/^(#{1,3})\s+(.+)$/gm, (_, hashes, text) => {
    const level = Math.min(hashes.length + 1, 4); // map # → h2, ## → h3
    return `<h${level}>${text.trim()}</h${level}>`;
  });

  // 5. Unordered list items  - item  or  * item
  html = html.replace(/^[\-\*]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>");
  // wrap consecutive <li> groups
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // 6. Paragraphs — blank-line-separated blocks that aren't block elements
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote)/.test(block)) return block;
      return `<p>${block.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
