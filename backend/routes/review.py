"""
Review routes: /dashboard, /history, /review-code, /history (API).
"""

from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, User, CodeReview
from services.grok import get_code_review

review_bp = Blueprint("review", __name__)

SUPPORTED_LANGUAGES = [
    "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#",
    "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "Bash", "Other",
]

# ── Page routes ────────────────────────────────────────────────────────────────

@review_bp.get("/dashboard")
def dashboard_page():
    return render_template("dashboard.html", languages=SUPPORTED_LANGUAGES)


@review_bp.get("/history")
def history_page():
    return render_template("history.html")


# ── API routes ─────────────────────────────────────────────────────────────────

@review_bp.post("/review-code")
@jwt_required()
def review_code():
    """Submit code → get AI review → store in DB → return review."""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    code = (data.get("code") or "").strip()
    language = (data.get("language") or "").strip()

    if not code:
        return jsonify({"error": "Code is required."}), 400
    if len(code) > 50_000:
        return jsonify({"error": "Code is too long (max 50 000 chars)."}), 400
    if language not in SUPPORTED_LANGUAGES:
        return jsonify({"error": "Please select a valid language."}), 400

    try:
        ai_response = get_code_review(language, code)
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 502

    review = CodeReview(user_id=user_id, code=code, language=language, ai_response=ai_response)
    db.session.add(review)
    db.session.commit()

    return jsonify({"review": review.to_dict()})


@review_bp.get("/api/history")
@jwt_required()
def get_history():
    """Return all reviews for the logged-in user, newest first."""
    user_id = int(get_jwt_identity())
    reviews = (
        CodeReview.query
        .filter_by(user_id=user_id)
        .order_by(CodeReview.created_at.desc())
        .all()
    )
    return jsonify({"reviews": [r.to_dict() for r in reviews]})
