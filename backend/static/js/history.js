/**
 * history.js — loads and renders the user's past code reviews.
 */

(async function loadHistory() {
  const loadingState  = document.getElementById("loading-state");
  const emptyState    = document.getElementById("empty-state");
  const historyList   = document.getElementById("history-list");

  try {
    const res  = await fetch("/api/history", { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) { logout(); return; }
      throw new Error(data.error || "Failed to load history.");
    }

    loadingState.classList.add("hidden");

    if (!data.reviews || data.reviews.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    historyList.classList.remove("hidden");
    historyList.innerHTML = data.reviews.map(buildCard).join("");

    // Attach toggle listeners
    document.querySelectorAll(".history-card-header").forEach((header) => {
      header.addEventListener("click", () => {
        header.closest(".history-card").classList.toggle("open");
      });
    });

  } catch (err) {
    loadingState.classList.add("hidden");
    emptyState.querySelector("p").textContent = err.message;
    emptyState.classList.remove("hidden");
  }
})();


function buildCard(review) {
  // Truncate long code for preview
  const codePreview = review.code.length > 800
    ? review.code.slice(0, 800) + "\n…"
    : review.code;

  const reviewHtml = renderMarkdown(review.ai_response || "_No review available._");

  return `
    <article class="history-card">
      <div class="history-card-header">
        <div class="history-meta">
          <span class="history-lang">${escapeHtml(review.language)}</span>
          <span class="history-date">${escapeHtml(review.created_at)}</span>
        </div>
        <span class="history-toggle">▶</span>
      </div>

      <div class="history-body">
        <div class="history-code-block">
          <div class="history-code-label">Submitted code</div>
          <pre class="history-code">${escapeHtml(codePreview)}</pre>
        </div>

        <div class="history-review">
          <div class="history-code-label" style="margin-bottom:1rem;">AI Review</div>
          <div class="review-content">${reviewHtml}</div>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
