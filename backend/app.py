from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import io, contextlib

app = Flask(__name__)
app.config['SECRET_KEY'] = 'supersecretkey'  # Secret key for sessions (if needed)
app.config['JWT_SECRET_KEY'] = 'supersecretjwtkey'  # Secret key for JWT
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Define database models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)  # Note: store hashed in real app
    role = db.Column(db.String(20), nullable=False)       # 'candidate' or 'recruiter'
    name = db.Column(db.String(100))  # optional display name for profile

class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # which candidate it's assigned to (optional)
    # One-to-many relationship: Assessment -> Questions
    questions = db.relationship('Question', backref='assessment', cascade="all, delete-orphan")

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'))
    text = db.Column(db.Text, nullable=False)            # Problem description
    sample_input = db.Column(db.Text)                    # Sample input for the problem
    expected_output = db.Column(db.Text)                 # Expected output for the sample input

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    question_id = db.Column(db.Integer)
    code = db.Column(db.Text)
    result = db.Column(db.String(20))    # 'passed' or 'failed' (or 'error')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class ProctoringLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    assessment_id = db.Column(db.Integer)
    event_type = db.Column(db.String(50))  # e.g., 'TAB_SWITCH', 'COPY_PASTE', 'WEBCAM_DISABLED'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables and seed initial data if not already present
@app.before_request
def create_tables_and_seed():
    db.create_all()
    # Check if database is empty and seed data
    if User.query.count() == 0:
        # Create sample users
        alice = User(username='alice', password='alice123', role='candidate', name='Alice Anderson')
        bob = User(username='bob', password='bob123', role='candidate', name='Bob Brown')
        recruiter = User(username='recruiter', password='admin123', role='recruiter', name='Recruiter Admin')
        db.session.add_all([alice, bob, recruiter])
        db.session.flush()  # flush to get ids

        # Create sample assessments and questions
        # Assessment for Alice
        assess1 = Assessment(title='Sample Coding Test 1', candidate_id=alice.id)
        q1 = Question(text='Print Hello World', sample_input='', expected_output='Hello World', assessment=assess1)
        q2 = Question(text='Return sum of two numbers from input', 
                      sample_input='4 5', expected_output='9', assessment=assess1)
        # Assessment for Bob
        assess2 = Assessment(title='Sample Coding Test 2', candidate_id=bob.id)
        q3 = Question(text='Output Good Morning', sample_input='', expected_output='Good Morning', assessment=assess2)
        q4 = Question(text='Calculate 2*3', sample_input='', expected_output='6', assessment=assess2)
        db.session.add_all([assess1, q1, q2, assess2, q3, q4])
        db.session.commit()
        print("Seeded initial users, assessments, and questions.")

# Utility: role-based access decorator for recruiters
from functools import wraps
def recruiter_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()  # get JWT claims (including role)
        if not claims or claims.get('role') != 'recruiter':
            return jsonify({"msg": "Forbidden - Recruiter access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

def candidate_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if not claims or claims.get('role') != 'candidate':
            return jsonify({"msg": "Forbidden - Candidate access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

# Authentication endpoints
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password') or not data.get('role'):
        return jsonify({"msg": "Missing registration fields"}), 400
    username = data['username']
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400
    # In a real app, password should be hashed before storing
    user = User(username=username, password=data['password'], role=data['role'], name=data.get('name', ''))
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"msg": "Missing username or password"}), 400
    user = User.query.filter_by(username=data['username'], password=data['password']).first()
    if not user:
        return jsonify({"msg": "Invalid username or password"}), 401
    # Create JWT token with user ID as identity and role as additional claim
    access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "name": user.name
        }
    }), 200

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # For JWT, usually handled client side (just delete token). We can blacklist token if implementing persistent logout.
    # For now, we'll simply return a message (client should remove the token).
    return jsonify({"msg": "Logged out successfully"}), 200

# User profile endpoints
@app.route('/user/me', methods=['GET', 'PUT'])
@jwt_required()
def user_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    if request.method == 'GET':
        # Return user profile info
        return jsonify({"id": user.id, "username": user.username, "role": user.role, "name": user.name})
    elif request.method == 'PUT':
        data = request.get_json()
        # Allow updating name (and potentially other fields)
        if data.get('name') is not None:
            user.name = data['name']
        # If needed, could allow password change etc.
        db.session.commit()
        return jsonify({"msg": "Profile updated successfully"}), 200

@app.route('/users', methods=['GET'])
@jwt_required()
@recruiter_required
def list_users():
    # Only recruiters can list all users
    users = User.query.all()
    # Return basic info to avoid exposing passwords
    result = []
    for u in users:
        result.append({"id": u.id, "username": u.username, "role": u.role, "name": u.name})
    return jsonify(result), 200

# Assessments and Questions endpoints
@app.route('/assessments', methods=['GET', 'POST'])
@jwt_required()
def assessments():
    claims = get_jwt()
    user_id = get_jwt_identity()
    user_role = claims.get('role')
    if request.method == 'GET':
        if user_role == 'recruiter':
            # Recruiter: return all assessments (without questions or with, depending on need)
            assessments = Assessment.query.all()
            result = []
            for a in assessments:
                result.append({
                    "id": a.id,
                    "title": a.title,
                    "candidate_id": a.candidate_id,
                    # include questions as list of dicts
                    "questions": [{"id": q.id, "text": q.text, "sample_input": q.sample_input, "expected_output": q.expected_output} for q in a.questions]
                })
            return jsonify(result)
        elif user_role == 'candidate':
            # Candidate: return only assessments assigned to them (with questions to take the test)
            assessments = Assessment.query.filter_by(candidate_id=user_id).all()
            result = []
            for a in assessments:
                result.append({
                    "id": a.id,
                    "title": a.title,
                    "questions": [{"id": q.id, "text": q.text, "sample_input": q.sample_input, "expected_output": q.expected_output} for q in a.questions]
                })
            return jsonify(result)
        else:
            return jsonify({"msg": "Invalid role"}), 403

    elif request.method == 'POST':
        # Only recruiters can create assessments
        if user_role != 'recruiter':
            return jsonify({"msg": "Only recruiters can create assessments"}), 403
        data = request.get_json()
        title = data.get('title')
        if not title:
            return jsonify({"msg": "Assessment title is required"}), 400
        candidate_id = data.get('candidate_id')  # optional: assign to a candidate
        assessment = Assessment(title=title, candidate_id=candidate_id)
        # If questions are provided in payload, create those as well
        questions_data = data.get('questions', [])
        for q in questions_data:
            question = Question(text=q.get('text', ''), 
                                sample_input=q.get('sample_input', ''), 
                                expected_output=q.get('expected_output', ''), 
                                assessment=assessment)
            db.session.add(question)
        db.session.add(assessment)
        db.session.commit()
        return jsonify({"msg": "Assessment created", "id": assessment.id}), 201

@app.route('/assessments/<int:assess_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def single_assessment(assess_id):
    claims = get_jwt()
    user_role = claims.get('role')
    assessment = Assessment.query.get_or_404(assess_id)
    if request.method == 'GET':
        # Allowed for both recruiters (to view any test) and candidates (if it's their test)
        if user_role == 'recruiter' or (user_role == 'candidate' and assessment.candidate_id == get_jwt_identity()):
            return jsonify({
                "id": assessment.id,
                "title": assessment.title,
                "candidate_id": assessment.candidate_id,
                "questions": [{"id": q.id, "text": q.text, "sample_input": q.sample_input, "expected_output": q.expected_output} for q in assessment.questions]
            })
        else:
            return jsonify({"msg": "Forbidden"}), 403
    elif request.method == 'PUT':
        # Only recruiters can update assessments (e.g., title or reassign candidate)
        if user_role != 'recruiter':
            return jsonify({"msg": "Only recruiters can update assessments"}), 403
        data = request.get_json()
        if data.get('title'):
            assessment.title = data['title']
        if data.get('candidate_id') is not None:
            assessment.candidate_id = data['candidate_id']
        # We won't handle question updates here for brevity
        db.session.commit()
        return jsonify({"msg": "Assessment updated"}), 200
    elif request.method == 'DELETE':
        # Only recruiters can delete assessments
        if user_role != 'recruiter':
            return jsonify({"msg": "Only recruiters can delete assessments"}), 403
        db.session.delete(assessment)
        db.session.commit()
        return jsonify({"msg": "Assessment deleted"}), 200

# Code submission endpoint
@app.route('/submit', methods=['POST'])
@jwt_required()
@candidate_required
def submit_code():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('question_id') or not data.get('code'):
        return jsonify({"msg": "question_id and code are required"}), 400
    question = Question.query.get(data['question_id'])
    if not question:
        return jsonify({"msg": "Question not found"}), 404

    code = data['code']
    # Basic code execution: Only supports Python code.
    # Warning: Executing arbitrary code can be dangerous. Here, it's done for demonstration and should be sandboxed or restricted in a real system.
    output = ""
    try:
        # If the question has sample_input, prepare to simulate input()
        if question.sample_input and question.sample_input.strip() != "":
            # We'll simulate input() by patching the built-in input function
            test_input = question.sample_input
            # Create a small wrapper to capture prints
            exec_globals = {}
            exec_code = f"input_data = '''{test_input}'''\n"
            exec_code += "def input():\n    import sys\n    # Return next line from the sample input\n    return input_data\n"
            exec_code += code
            f = io.StringIO()
            with contextlib.redirect_stdout(f):
                exec(exec_code, exec_globals)
            output = f.getvalue().strip()
        else:
            # No input needed, just run the code and capture stdout
            f = io.StringIO()
            with contextlib.redirect_stdout(f):
                exec(code, {})
            output = f.getvalue().strip()
        # Compare output with expected output
        expected = question.expected_output.strip() if question.expected_output else ""
        result = "passed" if output == expected else "failed"
    except Exception as e:
        # Capture execution errors as result
        result = "error"
        output = str(e)
    # Save submission record
    submission = Submission(user_id=user_id, question_id=question.id, code=code, result=result)
    db.session.add(submission)
    db.session.commit()
    if result == "error":
        # Return error details
        return jsonify({"result": result, "details": output}), 400
    else:
        return jsonify({"result": result, "output": output}), 200

# Proctoring endpoints
@app.route('/log_event', methods=['POST'])
@jwt_required()
@candidate_required
def log_event():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('event'):
        return jsonify({"msg": "Event type is required"}), 400
    event_type = data['event']
    # Optionally, allow assessment_id in data; otherwise we might infer current assessment if needed
    assess_id = data.get('assessment_id')
    log = ProctoringLog(user_id=user_id, assessment_id=assess_id, event_type=event_type)
    db.session.add(log)
    db.session.commit()
    return jsonify({"msg": "Event logged"}), 200

@app.route('/get_logs', methods=['GET'])
@jwt_required()
@recruiter_required
def get_logs():
    # Optionally filter by candidate or assessment if query params provided
    candidate_id = request.args.get('candidate_id')
    assessment_id = request.args.get('assessment_id')
    query = ProctoringLog.query
    if candidate_id:
        query = query.filter_by(user_id=int(candidate_id))
    if assessment_id:
        query = query.filter_by(assessment_id=int(assessment_id))
    logs = query.order_by(ProctoringLog.timestamp.desc()).all()
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "assessment_id": log.assessment_id,
            "event_type": log.event_type,
            "timestamp": log.timestamp.isoformat()  # return timestamp as string
        })
    return jsonify(result), 200

# Report endpoint
@app.route('/report/<int:candidate_id>', methods=['GET'])
@jwt_required()
def report(candidate_id):
    # If a candidate is requesting their own report, allow. If recruiter, allow any.
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')
    if role == 'candidate' and current_user_id != candidate_id:
        return jsonify({"msg": "Forbidden"}), 403

    # Get all submissions by this candidate
    submissions = Submission.query.filter_by(user_id=candidate_id).all()
    # Get all questions that belong to assessments assigned to this candidate
    assessments = Assessment.query.filter_by(candidate_id=candidate_id).all()
    questions = []
    for a in assessments:
        questions.extend(a.questions)
    total_questions = len(questions)
    # Count how many questions solved correctly (we consider question solved if any submission for that question has result "passed")
    solved_questions = 0
    if total_questions > 0:
        for q in questions:
            # if any submission for this question by user is passed
            for sub in submissions:
                if sub.question_id == q.id and sub.result == 'passed':
                    solved_questions += 1
                    break
    # Count proctoring flags for this user
    flags = ProctoringLog.query.filter_by(user_id=candidate_id).count()
    return jsonify({
        "candidate_id": candidate_id,
        "total_questions": total_questions,
        "solved_questions": solved_questions,
        "proctoring_flags": flags
    }), 200

# Run the Flask app (for development use; in production use a WSGI server)
if __name__ == '__main__':
    app.run(debug=True)
