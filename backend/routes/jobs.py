from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import db, JobPost, JobApplication

jobs_bp = Blueprint('jobs', __name__, url_prefix='/jobs')

@jobs_bp.route('/', methods=['POST'])
@jwt_required()
def create_job():
    identity = get_jwt_identity()
    if identity['role'] != 'recruiter':
        return jsonify({'message': 'Only recruiters can post jobs'}), 403
    data = request.get_json()
    job = JobPost(title=data.get('title'), description=data.get('description'), created_by=identity['id'])
    db.session.add(job)
    db.session.commit()
    return jsonify({'id': job.id})

@jobs_bp.route('/', methods=['GET'])
@jwt_required()
def list_jobs():
    jobs = JobPost.query.all()
    return jsonify([
        {'id': j.id, 'title': j.title, 'description': j.description}
        for j in jobs
    ])

@jobs_bp.route('/<int:job_id>/apply', methods=['POST'])
@jwt_required()
def apply_job(job_id):
    identity = get_jwt_identity()
    if identity['role'] != 'candidate':
        return jsonify({'message': 'Only candidates can apply'}), 403
    data = request.get_json()
    application = JobApplication(job_id=job_id, user_id=identity['id'], message=data.get('message'))
    db.session.add(application)
    db.session.commit()
    return jsonify({'status': 'applied'})

@jobs_bp.route('/<int:job_id>/applications', methods=['GET'])
@jwt_required()
def list_applications(job_id):
    identity = get_jwt_identity()
    job = JobPost.query.get_or_404(job_id)
    if identity['role'] != 'recruiter' or identity['id'] != job.created_by:
        return jsonify({'message': 'Forbidden'}), 403
    applications = JobApplication.query.filter_by(job_id=job_id).all()
    return jsonify([
        {'user_id': a.user_id, 'message': a.message}
        for a in applications
    ])
