

import os
from flask import Flask
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from models import db, bcrypt
from routes.auth import auth_bp
from routes.review import review_bp

load_dotenv()


def create_app():
    app = Flask(__name__)

   
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"sqlite:///{os.path.join(basedir, 'database.db')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-in-prod")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-secret-change-in-prod")
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"

   
    db.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)


    app.register_blueprint(auth_bp)
    app.register_blueprint(review_bp)


    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
