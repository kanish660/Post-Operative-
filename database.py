# pyrefly: ignore [missing-import]
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='patient') # 'patient', 'doctor', 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    patient_profile = db.relationship('Patient', backref='user', uselist=False, cascade="all, delete-orphan")
    doctor_profile = db.relationship('Doctor', backref='user', uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    phone = db.Column(db.String(30))
    address = db.Column(db.Text)
    surgery_type = db.Column(db.String(100))
    surgery_date = db.Column(db.Date)
    hospital = db.Column(db.String(150))
    doctor_name = db.Column(db.String(100))
    emergency_contact = db.Column(db.String(100))
    recovery_status = db.Column(db.String(50), default='Healing Normally')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    recovery_updates = db.relationship('RecoveryUpdate', backref='patient', lazy=True, cascade="all, delete-orphan")
    wound_images = db.relationship('WoundImage', backref='patient', lazy=True, cascade="all, delete-orphan")
    doctor_notes = db.relationship('DoctorNote', backref='patient', lazy=True, cascade="all, delete-orphan")
    alerts = db.relationship('Alert', backref='patient', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.user.name if self.user else None,
            'email': self.user.email if self.user else None,
            'age': self.age,
            'gender': self.gender,
            'phone': self.phone,
            'address': self.address,
            'surgery_type': self.surgery_type,
            'surgery_date': self.surgery_date.strftime('%Y-%m-%d') if self.surgery_date else None,
            'hospital': self.hospital,
            'doctor_name': self.doctor_name,
            'emergency_contact': self.emergency_contact,
            'recovery_status': self.recovery_status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    specialization = db.Column(db.String(100))
    phone = db.Column(db.String(30))
    hospital = db.Column(db.String(150))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    doctor_notes = db.relationship('DoctorNote', backref='doctor', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.user.name if self.user else None,
            'email': self.user.email if self.user else None,
            'specialization': self.specialization,
            'phone': self.phone,
            'hospital': self.hospital,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class RecoveryUpdate(db.Model):
    __tablename__ = 'recovery_updates'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    update_date = db.Column(db.Date, nullable=False)
    pain_level = db.Column(db.Integer, nullable=False) # 1-10
    temperature = db.Column(db.Float, nullable=False) # e.g. 98.6
    swelling = db.Column(db.String(20), nullable=False) # None, Mild, Moderate, Severe
    redness = db.Column(db.String(20), nullable=False)
    discharge = db.Column(db.String(20), nullable=False)
    bleeding = db.Column(db.String(20), nullable=False)
    mobility = db.Column(db.String(20), nullable=False)
    appetite = db.Column(db.String(20), default='Normal')
    sleep_quality = db.Column(db.String(20), default='Good')
    recovery_status = db.Column(db.String(50), default='Healing Normally')
    comments = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'update_date': self.update_date.strftime('%Y-%m-%d') if self.update_date else None,
            'pain_level': self.pain_level,
            'temperature': self.temperature,
            'swelling': self.swelling,
            'redness': self.redness,
            'discharge': self.discharge,
            'bleeding': self.bleeding,
            'mobility': self.mobility,
            'appetite': self.appetite,
            'sleep_quality': self.sleep_quality,
            'recovery_status': self.recovery_status,
            'comments': self.comments,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class WoundImage(db.Model):
    __tablename__ = 'wound_images'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.Text)
    ai_result = db.Column(db.String(50), nullable=False) # 'Healing Normally' or 'Needs Attention'
    ai_confidence = db.Column(db.Float) # e.g. 87.5
    ai_message = db.Column(db.Text)

    def to_dict(self):
        conf = round(float(self.ai_confidence), 1) if self.ai_confidence is not None else 85.0
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'image_path': self.image_path,
            'image_url': self.image_path,
            'upload_date': self.upload_date.strftime('%Y-%m-%d %H:%M:%S') if self.upload_date else None,
            'created_at': self.upload_date.strftime('%Y-%m-%d %H:%M:%S') if self.upload_date else None,
            'description': self.description,
            'notes': self.description,
            'ai_result': self.ai_result,
            'result': self.ai_result,
            'assessment': self.ai_result,
            'status': self.ai_result,
            'classification': self.ai_result,
            'ai_confidence': conf,
            'confidence': conf,
            'ai_message': self.ai_message,
            'message': self.ai_message
        }

class DoctorNote(db.Model):
    __tablename__ = 'doctor_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='CASCADE'), nullable=False)
    note = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.user.name if self.doctor and self.doctor.user else 'Doctor',
            'note': self.note,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False) # 'AI Flag', 'High Pain', 'Fever', 'Doctor Follow-up'
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='Active') # 'Active', 'Resolved'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.user.name if self.patient and self.patient.user else 'Patient',
            'alert_type': self.alert_type,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }
