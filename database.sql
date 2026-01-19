CREATE DATABASE IF NOT EXISTS sport_equipment_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE sport_equipment_db;

-- ================= USERS =================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL
);

-- ================= EQUIPMENT =================
CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_name VARCHAR(100) NOT NULL,
    total INT NOT NULL,
    available INT NOT NULL
);

-- ================= BORROWS (CURRENT STATUS) =================
CREATE TABLE borrows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    equipment_id INT NOT NULL,
    qty INT NOT NULL,
    borrow_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    return_date DATETIME NULL,
    status ENUM('borrowed','returned') NOT NULL DEFAULT 'borrowed',

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- ================= BORROW HISTORY (LOG) =================
CREATE TABLE borrow_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    equipment_id INT NOT NULL,
    qty INT NOT NULL,
    borrow_date DATETIME NOT NULL,
    return_date DATETIME NULL,
    status ENUM('borrowed','returned') NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- ================= INDEX FOR PERFORMANCE =================
CREATE INDEX idx_borrows_status ON borrows(status);
CREATE INDEX idx_history_status ON borrow_history(status);
CREATE INDEX idx_history_date ON borrow_history(borrow_date);
