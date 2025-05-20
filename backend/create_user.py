from werkzeug.security import generate_password_hash

from .app import create_app
from .models import db, User


def main():
    app = create_app()
    with app.app_context():
        db.create_all()
        if User.query.filter_by(email="Ankit").first():
            print("User already exists")
            return
        user = User(email="Ankit", password=generate_password_hash("priyal"), role="candidate")
        db.session.add(user)
        db.session.commit()
        print("User created with id", user.id)

if __name__ == "__main__":
    main()
