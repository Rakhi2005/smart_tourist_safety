-- Smart Tourist Safety Monitoring & Incident Response System Database Schema

CREATE DATABASE IF NOT EXISTS smart_tourist_safety;
USE smart_tourist_safety;

-- Users table for authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'safety_officer') DEFAULT 'user',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tourist locations table
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_type ENUM('beach', 'mountain', 'city', 'monument', 'park', 'other') NOT NULL,
    safety_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Incidents table
CREATE TABLE incidents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    incident_type ENUM('theft', 'accident', 'medical', 'lost_person', 'natural_disaster', 'other') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    status ENUM('reported', 'investigating', 'resolved', 'closed') DEFAULT 'reported',
    location_id INT,
    reporter_id INT,
    assigned_officer_id INT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (assigned_officer_id) REFERENCES users(id)
);

-- Safety alerts table
CREATE TABLE safety_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    alert_type ENUM('weather', 'traffic', 'security', 'medical', 'general') NOT NULL,
    severity ENUM('info', 'warning', 'danger') NOT NULL,
    location_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Emergency contacts table
CREATE TABLE emergency_contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    department VARCHAR(100),
    location_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Safety tips table
CREATE TABLE safety_tips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('general', 'weather', 'transportation', 'accommodation', 'food', 'health') NOT NULL,
    location_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Incident attachments table
CREATE TABLE incident_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- SOS alerts table (for emergency distress signals)
CREATE TABLE IF NOT EXISTS sos_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tourist_id INT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location VARCHAR(255),
    status ENUM('active','acknowledged','resolved') DEFAULT 'active',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_id) REFERENCES users(id)
);

-- Insert default admin user
INSERT INTO users (username, email, password, role, first_name, last_name) VALUES 
('admin', 'admin@smarttourist.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin', 'User');

-- Insert sample locations
INSERT INTO locations (name, address, latitude, longitude, location_type, safety_level, description) VALUES 
('Beach Paradise', '123 Ocean Drive, Coastal City', 25.7617, -80.1918, 'beach', 'medium', 'Popular beach destination with lifeguard services'),
('Mountain Peak', '456 Summit Road, Mountain Valley', 40.7128, -74.0060, 'mountain', 'high', 'Scenic mountain peak with hiking trails'),
('City Center', '789 Main Street, Downtown', 34.0522, -118.2437, 'city', 'low', 'Busy city center with shopping and dining'),
('Historic Monument', '321 Heritage Lane, Old Town', 38.9072, -77.0369, 'monument', 'medium', 'Historic monument with guided tours');

-- Insert sample emergency contacts
INSERT INTO emergency_contacts (name, phone, email, department, location_id) VALUES 
('Emergency Services', '911', 'emergency@city.gov', 'Emergency Response', 1),
('Tourist Police', '+1-555-0123', 'tourist.police@city.gov', 'Tourist Safety', 1),
('Medical Center', '+1-555-0124', 'medical@hospital.com', 'Medical Services', 1),
('Coast Guard', '+1-555-0125', 'coastguard@navy.mil', 'Marine Safety', 1);

-- Insert sample safety tips
INSERT INTO safety_tips (title, content, category, location_id) VALUES 
('Beach Safety', 'Always swim near lifeguard stations and be aware of rip currents. Apply sunscreen regularly and stay hydrated.', 'general', 1),
('Mountain Hiking', 'Inform someone of your hiking plans, carry proper equipment, and check weather conditions before heading out.', 'general', 2),
('City Safety', 'Keep valuables secure, be aware of your surroundings, and avoid poorly lit areas at night.', 'general', 3),
('Weather Awareness', 'Check weather forecasts regularly and be prepared for sudden changes in weather conditions.', 'weather', NULL);
