from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import db, ProctoringEvent

proctoring_bp = Blueprint('proctoring', __name__, url_prefix='/proctoring')

@proctoring_bp.route('/log', methods=['POST'])
@jwt_required()
def log_event():
    data = request.get_json()
    identity = get_jwt_identity()
    event = ProctoringEvent(user_id=identity['id'], event_type=data.get('event'))
    db.session.add(event)
    db.session.commit()
    return jsonify({'status': 'logged'})

@proctoring_bp.route('/', methods=['GET'])
@jwt_required()
def list_events():
    identity = get_jwt_identity()
    events = ProctoringEvent.query.filter_by(user_id=identity['id']).all()
    return jsonify([
        {'event_type': e.event_type, 'timestamp': e.timestamp.isoformat()}
        for e in events
    ])
