

import os
import time
import logging
from dotenv import load_dotenv
from google import genai

# Load env variables
load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are a senior software engineer performing a friendly, thorough code review.

Respond STRICTLY in this Markdown format — use these exact section headers:

## 1. Approach Analysis
What the code does, which algorithm/pattern it uses.

## 2. Time & Space Complexity
- **Time:** O(...) — reason
- **Space:** O(...) — reason

## 3. Strengths
What's done well. If the code is excellent, say so explicitly and praise it.

## 4. Issues & Problems
Naming, readability, logic flaws, missing edge cases, bad practices.
If there are no issues, say so.

## 5. Improvements & Optimizations
Better approaches, data structures, or patterns — with brief code snippets if helpful.

## 6. Final Verdict
2–3 sentences. Encouraging summary with overall quality assessment.

Tone: friendly, constructive, encouraging — like a senior engineer mentoring a colleague.
"""


def get_code_review(language: str, code: str) -> str:
    """
    Call the Gemini API and return a structured Markdown review.
    Retries up to 3 times on transient errors.
    """

    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    user_prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"Please review this **{language}** code:\n\n"
        f"```{language.lower()}\n{code}\n```"
    )

    for attempt in range(1, 4):
        try:
            response = client.models.generate_content(
                model=model,
                contents=user_prompt
            )

            return response.text

        except Exception as e:
            logger.error(f"Gemini API error: {e}")

            if attempt < 3:
                time.sleep(2 ** attempt)
            else:
                return "Error: Failed to get AI review. Please try again later."