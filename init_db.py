"""
Database Initialization & Seeding Script
==========================================
Automatically creates database tables and seeds demo users, patients, doctors,
recovery updates, wound records, and sample alerts with valid password hashes.
"""

import os
from app import create_app
from config import Config
from models.database import db, User, Patient, Doctor, RecoveryUpdate, WoundImage, DoctorNote, Alert
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from PIL import Image, ImageDraw

from sqlalchemy import text, inspect

def migrate_database(app):
    with app.app_context():
        inspector = inspect(db.engine)
        if 'doctors' in inspector.get_table_names():
            columns = [c['name'] for c in inspector.get_columns('doctors')]
            
            with db.engine.begin() as conn:
                if 'registration_number' not in columns:
                    print("Migrating database: adding registration_number column to doctors...")
                    conn.execute(text("ALTER TABLE doctors ADD COLUMN registration_number VARCHAR(100)"))
                if 'years_of_experience' not in columns:
                    print("Migrating database: adding years_of_experience column to doctors...")
                    conn.execute(text("ALTER TABLE doctors ADD COLUMN years_of_experience INTEGER"))
                if 'address' not in columns:
                    print("Migrating database: adding address column to doctors...")
                    conn.execute(text("ALTER TABLE doctors ADD COLUMN address TEXT"))
                if 'approval_status' not in columns:
                    print("Migrating database: adding approval_status column to doctors...")
                    conn.execute(text("ALTER TABLE doctors ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending'"))
            
            # Ensure existing demo doctor and doctors have approval status set
            doctors = Doctor.query.all()
            for d in doctors:
                if not d.approval_status:
                    if d.user and d.user.email == 'doctor@demo.com':
                        d.approval_status = 'approved'
                    else:
                        d.approval_status = 'approved' # ensure existing doctors remain functional
                if d.user and d.user.email == 'doctor@demo.com':
                    d.approval_status = 'approved'
                    if not d.registration_number:
                        d.registration_number = 'DOC-89210-MEM'
                    if not d.years_of_experience:
                        d.years_of_experience = 12
            db.session.commit()

def seed_database():
    app = create_app()
    migrate_database(app)
    with app.app_context():
        print("Creating database tables...")
        db.create_all()

        # Check if users already seeded
        if User.query.first():
            print("Database already contains data. Migration complete.")
            return

        print("Seeding demo accounts...")
        hashed_pw = generate_password_hash('password123')

        # 1. Users
        admin_user = User(name='System Administrator', email='admin@demo.com', password=hashed_pw, role='admin')
        doctor_user = User(name='Dr. Sarah Jenkins', email='doctor@demo.com', password=hashed_pw, role='doctor')
        patient1_user = User(name='John Doe', email='patient@demo.com', password=hashed_pw, role='patient')
        patient2_user = User(name='Jane Smith', email='janesmith@demo.com', password=hashed_pw, role='patient')
        patient3_user = User(name='Robert Chen', email='robertchen@demo.com', password=hashed_pw, role='patient')

        db.session.add_all([admin_user, doctor_user, patient1_user, patient2_user, patient3_user])
        db.session.flush()

        # 2. Doctor details
        doctor = Doctor(
            user_id=doctor_user.id,
            specialization='Orthopedic & Abdominal Surgery',
            phone='+1 (555) 234-5678',
            hospital='City Central Memorial Hospital',
            registration_number='DOC-89210-MEM',
            years_of_experience=12,
            approval_status='approved'
        )
        db.session.add(doctor)
        db.session.flush()

        # 3. Patient details
        today = datetime.now().date()
        p1 = Patient(
            user_id=patient1_user.id,
            age=45,
            gender='Male',
            phone='+1 (555) 123-4567',
            address='124 Maple Avenue, Springfield',
            surgery_type='Laparoscopic Appendectomy',
            surgery_date=today - timedelta(days=8),
            hospital='City Central Memorial Hospital',
            doctor_name='Dr. Sarah Jenkins',
            emergency_contact='Mary Doe (+1 555-987-6543)',
            recovery_status='Healing Normally'
        )
        p2 = Patient(
            user_id=patient2_user.id,
            age=38,
            gender='Female',
            phone='+1 (555) 345-6789',
            address='789 Oak Lane, Springfield',
            surgery_type='Total Knee Arthroplasty',
            surgery_date=today - timedelta(days=12),
            hospital='City Central Memorial Hospital',
            doctor_name='Dr. Sarah Jenkins',
            emergency_contact='Mark Smith (+1 555-876-5432)',
            recovery_status='Needs Attention'
        )
        p3 = Patient(
            user_id=patient3_user.id,
            age=52,
            gender='Male',
            phone='+1 (555) 456-7890',
            address='456 Pine Ridge, Springfield',
            surgery_type='Inguinal Hernia Repair',
            surgery_date=today - timedelta(days=4),
            hospital='City Central Memorial Hospital',
            doctor_name='Dr. Sarah Jenkins',
            emergency_contact='Linda Chen (+1 555-765-4321)',
            recovery_status='Healing Normally'
        )
        db.session.add_all([p1, p2, p3])
        db.session.flush()

        # 4. Recovery Updates for Patient 1 (John Doe)
        u1 = RecoveryUpdate(
            patient_id=p1.id,
            update_date=today - timedelta(days=7),
            pain_level=8,
            temperature=99.2,
            swelling='Moderate',
            redness='Mild',
            discharge='None',
            bleeding='None',
            mobility='Bedrest',
            appetite='Fair',
            sleep_quality='Poor',
            recovery_status='Needs Attention',
            comments='Felt quite sore post surgery.'
        )
        u2 = RecoveryUpdate(
            patient_id=p1.id,
            update_date=today - timedelta(days=5),
            pain_level=6,
            temperature=98.8,
            swelling='Mild',
            redness='Mild',
            discharge='None',
            bleeding='None',
            mobility='Limited',
            appetite='Good',
            sleep_quality='Fair',
            recovery_status='Healing Normally',
            comments='Pain level decreased, walking short distances.'
        )
        u3 = RecoveryUpdate(
            patient_id=p1.id,
            update_date=today - timedelta(days=3),
            pain_level=4,
            temperature=98.6,
            swelling='Mild',
            redness='None',
            discharge='None',
            bleeding='None',
            mobility='Limited',
            appetite='Good',
            sleep_quality='Good',
            recovery_status='Healing Normally',
            comments='Feeling significantly better today.'
        )
        u4 = RecoveryUpdate(
            patient_id=p1.id,
            update_date=today - timedelta(days=1),
            pain_level=2,
            temperature=98.4,
            swelling='None',
            redness='None',
            discharge='None',
            bleeding='None',
            mobility='Good',
            appetite='Normal',
            sleep_quality='Good',
            recovery_status='Healing Normally',
            comments='Incision site clean and almost painless.'
        )

        # Recovery update for Patient 2
        u5 = RecoveryUpdate(
            patient_id=p2.id,
            update_date=today - timedelta(days=2),
            pain_level=7,
            temperature=100.4,
            swelling='Moderate',
            redness='Moderate',
            discharge='Clear',
            bleeding='Spotting',
            mobility='Limited',
            appetite='Poor',
            sleep_quality='Poor',
            recovery_status='Needs Attention',
            comments='Noticeable swelling around knee joint, slight fever.'
        )
        db.session.add_all([u1, u2, u3, u4, u5])

        # 5. Create Sample Wound Images & DB Records
        upload_folder = app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)

        def generate_sample_image(filename, color_bg, text_label):
            path = os.path.join(upload_folder, filename)
            if not os.path.exists(path):
                img = Image.new('RGB', (400, 300), color=color_bg)
                d = ImageDraw.Draw(img)
                d.rectangle([150, 120, 250, 180], fill=(220, 180, 170), outline=(180, 60, 60), width=3)
                d.text((20, 20), text_label, fill=(255, 255, 255))
                img.save(path)
            return filename

        img1 = generate_sample_image('sample_wound_1.jpg', (140, 100, 90), 'Demo Wound Image 1 - Normal')
        img2 = generate_sample_image('sample_wound_2.jpg', (130, 110, 95), 'Demo Wound Image 2 - Normal')
        img3 = generate_sample_image('sample_wound_3.jpg', (190, 80, 70), 'Demo Wound Image 3 - Inflamed Flagged')

        w1 = WoundImage(
            patient_id=p1.id,
            image_path=img1,
            description='Day 2 incision site upload.',
            ai_result='Healing Normally',
            ai_confidence=88.5,
            ai_message='No obvious abnormal visual pattern detected by prototype model. Continue monitoring.'
        )
        w2 = WoundImage(
            patient_id=p1.id,
            image_path=img2,
            description='Day 8 incision site upload - clean closure.',
            ai_result='Healing Normally',
            ai_confidence=94.2,
            ai_message='Healthy tissue closure detected. Continue standard hygiene.'
        )
        w3 = WoundImage(
            patient_id=p2.id,
            image_path=img3,
            description='Knee incision with mild redness.',
            ai_result='Needs Attention',
            ai_confidence=79.4,
            ai_message='Image flagged for elevated redness around margin. Recommend healthcare provider review.'
        )
        db.session.add_all([w1, w2, w3])

        # 6. Doctor Notes
        n1 = DoctorNote(
            patient_id=p1.id,
            doctor_id=doctor.id,
            note='Patient incision looks clean on Day 8 image. Continue oral antibiotics until Day 10.'
        )
        n2 = DoctorNote(
            patient_id=p2.id,
            doctor_id=doctor.id,
            note='Checked Day 7 upload. Flagged for follow-up due to mild fever (100.4F) and localized knee swelling. Scheduled follow-up.'
        )
        db.session.add_all([n1, n2])

        # 7. Alerts
        a1 = Alert(
            patient_id=p2.id,
            alert_type='AI Flag',
            message='Wound image flagged by AI assessment for localized redness.',
            status='Active'
        )
        a2 = Alert(
            patient_id=p2.id,
            alert_type='Fever Alert',
            message='Patient reported elevated temperature of 100.4°F.',
            status='Active'
        )
        a3 = Alert(
            patient_id=p1.id,
            alert_type='Doctor Follow-up',
            message='Doctor completed routine follow-up note.',
            status='Resolved'
        )
        db.session.add_all([a1, a2, a3])

        db.session.commit()
        print("Database initialized and sample data seeded successfully!")

if __name__ == '__main__':
    seed_database()
