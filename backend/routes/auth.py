from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

from ..models import db, User

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'candidate')

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User exists'}), 400

    user = User(email=email, password=generate_password_hash(password), role=role)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'registered'})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not check_password_hash(user.password, data.get('password')):
        return jsonify({'message': 'Invalid credentials'}), 401
    token = create_access_token(identity={'id': user.id, 'role': user.role})
    return jsonify({'token': token, 'role': user.role})
