import random
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import db, Submission, Question

submissions_bp = Blueprint('submissions', __name__, url_prefix='/submissions')

@submissions_bp.route('/<int:question_id>', methods=['POST'])
@jwt_required()
def submit_code(question_id):
    data = request.get_json()
    identity = get_jwt_identity()
    code = data.get('code')
    # Simplified evaluation: random score
    score = random.randint(0, 100)
    submission = Submission(user_id=identity['id'], question_id=question_id, code=code, score=score)
    db.session.add(submission)
    db.session.commit()
    return jsonify({'score': score})

@submissions_bp.route('/', methods=['GET'])
@jwt_required()
def list_submissions():
    identity = get_jwt_identity()
    submissions = Submission.query.filter_by(user_id=identity['id']).all()
    return jsonify([
        {'question_id': s.question_id, 'score': s.score, 'submitted_at': s.submitted_at.isoformat()}
        for s in submissions
    ])
