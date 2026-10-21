-- Database Schema for Post-Operative Patient Remote Recovery Tracker & Wound Evaluation Portal
-- Engine: MySQL / MariaDB compatible

CREATE DATABASE IF NOT EXISTS post_op_recovery;
USE post_op_recovery;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    age INT,
    gender VARCHAR(20),
    phone VARCHAR(30),
    address TEXT,
    surgery_type VARCHAR(100),
    surgery_date DATE,
    hospital VARCHAR(150),
    doctor_name VARCHAR(100),
    emergency_contact VARCHAR(100),
    recovery_status VARCHAR(50) DEFAULT 'Healing Normally',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    specialization VARCHAR(100),
    phone VARCHAR(30),
    hospital VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Recovery Updates Table
CREATE TABLE IF NOT EXISTS recovery_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    update_date DATE NOT NULL,
    pain_level INT NOT NULL, -- Scale 1-10
    temperature DECIMAL(4,1) NOT NULL, -- e.g. 98.6
    swelling VARCHAR(20) NOT NULL, -- None, Mild, Moderate, Severe
    redness VARCHAR(20) NOT NULL, -- None, Mild, Moderate, Severe
    discharge VARCHAR(20) NOT NULL, -- None, Clear, Purulent, Bloody
    bleeding VARCHAR(20) NOT NULL, -- None, Spotting, Active
    mobility VARCHAR(20) NOT NULL, -- Good, Limited, Bedrest
    appetite VARCHAR(20) DEFAULT 'Normal',
    sleep_quality VARCHAR(20) DEFAULT 'Good',
    recovery_status VARCHAR(50) DEFAULT 'Healing Normally',
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Wound Images Table
CREATE TABLE IF NOT EXISTS wound_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    ai_result VARCHAR(50) NOT NULL, -- 'Healing Normally' or 'Needs Attention'
    ai_confidence DECIMAL(5,2), -- e.g. 87.50
    ai_message TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Doctor Notes Table
CREATE TABLE IF NOT EXISTS doctor_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    note TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'AI Flag', 'High Pain', 'Fever', 'Doctor Follow-up'
    message TEXT NOT NULL,
    status ENUM('Active', 'Resolved') DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
