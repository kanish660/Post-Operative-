-- Sample Data for Post-Operative Patient Remote Recovery Tracker
USE post_op_recovery;

-- Note: Passwords are hashed with Werkzeug pbkdf2:sha256 (default password for all demo accounts: 'password123')
-- Hashed representation of 'password123': 'pbkdf2:sha256:600000$mockhashforpassword123$sample' (in backend code we generate real hashes)

-- 1. Insert Users
INSERT INTO users (id, name, email, password, role, created_at) VALUES
(1, 'System Administrator', 'admin@demo.com', 'pbkdf2:sha256:600000$mockhash$admin', 'admin', '2026-09-01 10:00:00'),
(2, 'Dr. Sarah Jenkins', 'doctor@demo.com', 'pbkdf2:sha256:600000$mockhash$doctor', 'doctor', '2026-09-01 10:05:00'),
(3, 'John Doe', 'patient@demo.com', 'pbkdf2:sha256:600000$mockhash$patient', 'patient', '2026-09-02 09:00:00'),
(4, 'Jane Smith', 'janesmith@demo.com', 'pbkdf2:sha256:600000$mockhash$patient2', 'patient', '2026-09-03 11:30:00'),
(5, 'Robert Chen', 'robertchen@demo.com', 'pbkdf2:sha256:600000$mockhash$patient3', 'patient', '2026-09-04 14:15:00');

-- 2. Insert Doctor Details
INSERT INTO doctors (id, user_id, specialization, phone, hospital) VALUES
(1, 2, 'Orthopedic & Abdominal Surgery', '+1 (555) 234-5678', 'City Central Memorial Hospital');

-- 3. Insert Patient Details
INSERT INTO patients (id, user_id, age, gender, phone, address, surgery_type, surgery_date, hospital, doctor_name, emergency_contact, recovery_status) VALUES
(1, 3, 45, 'Male', '+1 (555) 123-4567', '124 Maple Avenue, Springfield', 'Laparoscopic Appendectomy', '2026-09-01', 'City Central Memorial Hospital', 'Dr. Sarah Jenkins', 'Mary Doe (+1 555-987-6543)', 'Healing Normally'),
(2, 4, 38, 'Female', '+1 (555) 345-6789', '789 Oak Lane, Springfield', 'Total Knee Arthroplasty', '2026-08-28', 'City Central Memorial Hospital', 'Dr. Sarah Jenkins', 'Mark Smith (+1 555-876-5432)', 'Needs Attention'),
(3, 5, 52, 'Male', '+1 (555) 456-7890', '456 Pine Ridge, Springfield', 'Inguinal Hernia Repair', '2026-09-05', 'City Central Memorial Hospital', 'Dr. Sarah Jenkins', 'Linda Chen (+1 555-765-4321)', 'Healing Normally');

-- 4. Insert Recovery Updates for Patient 1 (John Doe)
INSERT INTO recovery_updates (id, patient_id, update_date, pain_level, temperature, swelling, redness, discharge, bleeding, mobility, appetite, sleep_quality, recovery_status, comments) VALUES
(1, 1, '2026-09-02', 8, 99.2, 'Moderate', 'Mild', 'None', 'None', 'Bedrest', 'Fair', 'Poor', 'Needs Attention', 'Felt quite sore post surgery.'),
(2, 1, '2026-09-04', 6, 98.8, 'Mild', 'Mild', 'None', 'None', 'Limited', 'Good', 'Fair', 'Healing Normally', 'Pain level decreased, walking short distances.'),
(3, 1, '2026-09-06', 4, 98.6, 'Mild', 'None', 'None', 'None', 'Limited', 'Good', 'Good', 'Healing Normally', 'Feeling significantly better today.'),
(4, 1, '2026-09-08', 2, 98.4, 'None', 'None', 'None', 'None', 'Good', 'Normal', 'Good', 'Healing Normally', 'Incision site clean and almost painless.');

-- Insert Recovery Updates for Patient 2 (Jane Smith)
INSERT INTO recovery_updates (id, patient_id, update_date, pain_level, temperature, swelling, redness, discharge, bleeding, mobility, appetite, sleep_quality, recovery_status, comments) VALUES
(5, 2, '2026-09-07', 7, 100.4, 'Moderate', 'Moderate', 'Clear', 'Spotting', 'Limited', 'Poor', 'Poor', 'Needs Attention', 'Noticeable swelling around knee joint, slight fever.');

-- 5. Insert Wound Images
INSERT INTO wound_images (id, patient_id, image_path, upload_date, description, ai_result, ai_confidence, ai_message) VALUES
(1, 1, 'sample_wound_1.jpg', '2026-09-02 14:00:00', 'Day 2 incision site image.', 'Healing Normally', 88.50, 'No obvious abnormal visual pattern detected by prototype model. Continue monitoring.'),
(2, 1, 'sample_wound_2.jpg', '2026-09-08 09:30:00', 'Day 8 incision clean and closing.', 'Healing Normally', 94.20, 'Healthy tissue closure detected. Continue standard hygiene.'),
(3, 2, 'sample_wound_3.jpg', '2026-09-07 16:45:00', 'Knee incision with mild redness.', 'Needs Attention', 79.40, 'Image flagged for elevated redness around margin. Recommend healthcare provider review.');

-- 6. Insert Doctor Notes
INSERT INTO doctor_notes (id, patient_id, doctor_id, note, created_at) VALUES
(1, 1, 1, 'Patient incision looks clean on Day 8 image. Continue oral antibiotics until Day 10.', '2026-09-08 11:00:00'),
(2, 2, 1, 'Checked Day 7 upload. Flagged for follow-up due to mild fever (100.4F) and localized knee swelling. Scheduled phone call.', '2026-09-07 18:00:00');

-- 7. Insert Alerts
INSERT INTO alerts (id, patient_id, alert_type, message, status, created_at) VALUES
(1, 2, 'AI Flag', 'Wound image flagged by AI assessment for localized redness.', 'Active', '2026-09-07 16:45:00'),
(2, 2, 'Fever Alert', 'Patient reported elevated temperature of 100.4°F.', 'Active', '2026-09-07 16:46:00'),
(3, 1, 'Doctor Follow-up', 'Doctor completed routine follow-up note.', 'Resolved', '2026-09-08 11:00:00');
