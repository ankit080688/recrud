from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import db, Assessment, Question

assessments_bp = Blueprint('assessments', __name__, url_prefix='/assessments')

@assessments_bp.route('/', methods=['POST'])
@jwt_required()
def create_assessment():
    data = request.get_json()
    identity = get_jwt_identity()
    assessment = Assessment(name=data.get('name'), created_by=identity['id'])
    db.session.add(assessment)
    db.session.commit()
    return jsonify({'id': assessment.id})

@assessments_bp.route('/<int:assessment_id>/questions', methods=['POST'])
@jwt_required()
def add_question(assessment_id):
    data = request.get_json()
    question = Question(assessment_id=assessment_id, text=data.get('text'))
    db.session.add(question)
    db.session.commit()
    return jsonify({'id': question.id})

@assessments_bp.route('/', methods=['GET'])
@jwt_required()
def list_assessments():
    assessments = Assessment.query.all()
    return jsonify([{'id': a.id, 'name': a.name} for a in assessments])
