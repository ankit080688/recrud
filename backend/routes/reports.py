from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from ..models import Submission, User

reports_bp = Blueprint('reports', __name__, url_prefix='/reports')

@reports_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def user_report(user_id):
    submissions = Submission.query.filter_by(user_id=user_id).all()
    user = User.query.get(user_id)
    return jsonify({
        'user': user.email if user else 'unknown',
        'results': [
            {'question_id': s.question_id, 'score': s.score}
            for s in submissions
        ]
    })
