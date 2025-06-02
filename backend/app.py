from flask import Flask
import os
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from .models import db

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'change-me'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    from .routes.auth import auth_bp
    from .routes.assessments import assessments_bp
    from .routes.submissions import submissions_bp
    from .routes.proctoring import proctoring_bp
    from .routes.reports import reports_bp
    from .routes.jobs import jobs_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(assessments_bp)
    app.register_blueprint(submissions_bp)
    app.register_blueprint(proctoring_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(jobs_bp)

    return app

if __name__ == '__main__':
    import os

    app = create_app()
    with app.app_context():
        db.create_all()
    host = os.environ.get('HOST', '127.0.0.1')
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host=host, port=port)
