CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       role ENUM('customer', 'instructor', 'owner') NOT NULL DEFAULT 'customer',
                       first_name VARCHAR(100) NOT NULL,
                       last_name VARCHAR(100) NOT NULL,
                       address VARCHAR(255),
                       city VARCHAR(100),
                       birthdate DATE,
                       bsn VARCHAR(20),
                       phone VARCHAR(20),
                       is_active BOOLEAN DEFAULT TRUE,
                       email_verified BOOLEAN DEFAULT FALSE,
                       blocked BOOLEAN DEFAULT FALSE,
                       password_reset_required BOOLEAN DEFAULT FALSE,
                       last_login DATETIME,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Enhanced activation system with token expiry
CREATE TABLE user_activations (
                                  id INT AUTO_INCREMENT PRIMARY KEY,
                                  user_id INT NOT NULL,
                                  token VARCHAR(255) NOT NULL,
                                  token_type ENUM('activation', 'password_reset') NOT NULL,
                                  expires_at DATETIME NOT NULL,
                                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                  used BOOLEAN DEFAULT FALSE,
                                  used_at DATETIME,
                                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Session tracking for security
CREATE TABLE user_sessions (
                               id INT AUTO_INCREMENT PRIMARY KEY,
                               user_id INT NOT NULL,
                               session_token VARCHAR(255) NOT NULL,
                               ip_address VARCHAR(45),
                               user_agent TEXT,
                               created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                               expires_at DATETIME NOT NULL,
                               last_activity DATETIME,
                               FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhanced packages table
CREATE TABLE packages (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(100) NOT NULL,
                          description TEXT,
                          price DECIMAL(10,2) NOT NULL,
                          duration_hours DECIMAL(4,1) NOT NULL,
                          max_persons INT NOT NULL,
                          num_sessions INT NOT NULL,
                          active BOOLEAN DEFAULT TRUE,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced locations table
CREATE TABLE locations (
                           id INT AUTO_INCREMENT PRIMARY KEY,
                           name VARCHAR(100) NOT NULL,
                           address VARCHAR(255),
                           active BOOLEAN DEFAULT TRUE,
                           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced reservations table
CREATE TABLE reservations (
                              id INT AUTO_INCREMENT PRIMARY KEY,
                              customer_id INT NOT NULL,
                              instructor_id INT DEFAULT NULL,
                              package_id INT NOT NULL,
                              location_id INT NOT NULL,
                              date DATE NOT NULL,
                              start_time TIME NOT NULL,
                              end_time TIME NOT NULL,
                              status ENUM('pending','cancelled','confirmed','definitive') DEFAULT 'pending',
                              cancel_reason TEXT,
                              cancel_type ENUM('instructor_sick', 'weather', 'customer', 'other'),
                              wind_speed_cancel BOOLEAN DEFAULT FALSE,
                              paid BOOLEAN DEFAULT FALSE,
                              payment_date DATETIME,
                              payment_amount DECIMAL(10,2),
                              payment_reference VARCHAR(100),
                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                              FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                              FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
                              FOREIGN KEY (package_id) REFERENCES packages(id),
                              FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Enhanced participants table
CREATE TABLE duo_participants (
                                  id INT AUTO_INCREMENT PRIMARY KEY,
                                  reservation_id INT NOT NULL,
                                  name VARCHAR(100) NOT NULL,
                                  email VARCHAR(255) NOT NULL,
                                  phone VARCHAR(20),
                                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- Enhanced login logging
CREATE TABLE logins (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        action ENUM('login', 'logout', 'failed_attempt') NOT NULL,
                        timestamp DATETIME(6) NOT NULL,
                        ip_address VARCHAR(45),
                        user_agent TEXT,
                        success BOOLEAN DEFAULT TRUE,
                        failure_reason VARCHAR(255),
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhanced email logging
CREATE TABLE email_log (
                           id INT AUTO_INCREMENT PRIMARY KEY,
                           user_id INT,
                           email_to VARCHAR(255) NOT NULL,
                           email_from VARCHAR(255) NOT NULL,
                           subject VARCHAR(255) NOT NULL,
                           body TEXT,
                           template_name VARCHAR(100),
                           sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                           status ENUM('queued', 'sent', 'failed') DEFAULT 'queued',
                           error_message TEXT,
                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Weather conditions logging for lesson cancellations
CREATE TABLE weather_logs (
                              id INT AUTO_INCREMENT PRIMARY KEY,
                              location_id INT NOT NULL,
                              wind_speed DECIMAL(5,2),
                              wind_direction VARCHAR(10),
                              temperature DECIMAL(4,1),
                              recorded_at DATETIME NOT NULL,
                              FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Initial data setup
INSERT INTO users (email, password, role, first_name, last_name, is_active, email_verified)
VALUES (
           'terence@olieslager.nl',
           '$2y$12$sterkgehashtwachtwoord',
           'owner',
           'Terence',
           'Olieslager',
           1,
           1
       );

-- Insert instructors
INSERT INTO users (email, password, role, first_name, last_name, is_active, email_verified)
VALUES
    ('duco@windkracht12.nl', '$2y$12$hash', 'instructor', 'Duco', 'Veenstra', 1, 1),
    ('waldemar@windkracht12.nl', '$2y$12$hash', 'instructor', 'Waldemar', 'van Dongen', 1, 1),
    ('ruud@windkracht12.nl', '$2y$12$hash', 'instructor', 'Ruud', 'Terlingen', 1, 1),
    ('saskia@windkracht12.nl', '$2y$12$hash', 'instructor', 'Saskia', 'Brink', 1, 1),
    ('bernie@windkracht12.nl', '$2y$12$hash', 'instructor', 'Bernie', 'Vredenstein', 1, 1);

-- Insert packages
INSERT INTO packages (name, description, price, duration_hours, max_persons, num_sessions)
VALUES
    ('Privéles 2,5 uur', 'Eén persoon per les', 175.00, 2.5, 1, 1),
    ('Losse Duo Kiteles 3,5 uur', 'Max 2 personen', 135.00, 3.5, 2, 1),
    ('Kitesurf Duo lespakket 3 lessen 10,5 uur', 'Max 2 personen', 375.00, 10.5, 2, 3),
    ('Kitesurf Duo lespakket 5 lessen 17,5 uur', 'Max 2 personen', 675.00, 17.5, 2, 5);

-- Insert locations
INSERT INTO locations (name, address)
VALUES
    ('Zandvoort', NULL),
    ('Muiderberg', NULL),
    ('Wijk aan Zee', NULL),
    ('IJmuiden', NULL),
    ('Scheveningen', NULL),
    ('Hoek van Holland', NULL);