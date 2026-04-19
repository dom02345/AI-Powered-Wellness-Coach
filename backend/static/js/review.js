/**
 * review.js — handles code submission on the dashboard.
 */

async function submitCode() {
  const code     = document.getElementById("code-input").value.trim();
  const language = document.getElementById("language").value;
  const btn      = document.getElementById("submit-btn");
  const btnText  = document.getElementById("btn-text");
  const spinner  = document.getElementById("btn-spinner");
  const errMsg   = document.getElementById("error-msg");

  // UI refs
  const emptyState   = document.getElementById("empty-state");
  const loadingState = document.getElementById("loading-state");
  const reviewContent = document.getElementById("review-content");
  const reviewPanel  = document.getElementById("review-panel");
  const badge        = document.getElementById("review-lang-badge");

  // Clear previous state
  errMsg.classList.add("hidden");

  if (!code) {
    errMsg.textContent = "Please paste some code before submitting.";
    errMsg.classList.remove("hidden");
    return;
  }

  // Loading state
  btn.disabled = true;
  btnText.classList.add("hidden");
  spinner.classList.remove("hidden");

  emptyState.classList.add("hidden");
  loadingState.classList.remove("hidden");
  reviewContent.classList.add("hidden");

  try {
    const res  = await fetch("/review-code", {
      method:  "POST",
      headers: authHeaders(),
      body:    JSON.stringify({ code, language }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) { logout(); return; }
      throw new Error(data.error || "Review failed.");
    }

    // Render review
    reviewContent.innerHTML = renderMarkdown(data.review.ai_response);
    badge.textContent = language;
    badge.classList.remove("hidden");

    loadingState.classList.add("hidden");
    reviewContent.classList.remove("hidden");

  } catch (err) {
    errMsg.textContent = err.message;
    errMsg.classList.remove("hidden");
    loadingState.classList.add("hidden");
    emptyState.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btnText.classList.remove("hidden");
    spinner.classList.add("hidden");
  }
}

// Allow Tab key in the code textarea (insert spaces instead of focus-jump)
document.getElementById("code-input").addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const ta  = e.target;
    const s   = ta.selectionStart;
    ta.value  = ta.value.substring(0, s) + "  " + ta.value.substring(ta.selectionEnd);
    ta.selectionStart = ta.selectionEnd = s + 2;
  }
});
