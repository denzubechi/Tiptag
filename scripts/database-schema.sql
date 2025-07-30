-- tiptag Database Schema
-- This script creates the necessary tables for the tiptag platform

-- Users table for creator accounts
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    tip_tag VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    total_tips_received DECIMAL(10,2) DEFAULT 0.00,
    total_tip_count INTEGER DEFAULT 0,
    base_account_id VARCHAR(100), -- For Base Pay integration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creator links (portfolio, projects, etc.)
CREATE TABLE IF NOT EXISTS creator_links (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creator social media accounts
CREATE TABLE IF NOT EXISTS creator_social_media (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- twitter, instagram, youtube, etc.
    handle VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tips/payments received
CREATE TABLE IF NOT EXISTS tips (
    id SERIAL PRIMARY KEY,
    recipient_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    message TEXT,
    tipper_name VARCHAR(100) DEFAULT 'Anonymous',
    tipper_email VARCHAR(255), -- Optional, for receipt
    payment_provider VARCHAR(50) DEFAULT 'base_pay',
    payment_provider_id VARCHAR(100) NOT NULL, -- Base Pay transaction ID
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verification codes
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset codes
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profile views tracking (optional analytics)
CREATE TABLE IF NOT EXISTS profile_views (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    viewer_ip VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    referrer VARCHAR(500),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tip_tag ON users(tip_tag);
CREATE INDEX IF NOT EXISTS idx_tips_recipient ON tips(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_tips_status ON tips(payment_status);
CREATE INDEX IF NOT EXISTS idx_tips_created_at ON tips(created_at);
CREATE INDEX IF NOT EXISTS idx_email_verification_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_codes(user_id);

-- Sample data for development
INSERT INTO users (email, password_hash, display_name, tip_tag, bio, is_verified, total_tips_received, total_tip_count) VALUES
('alex@example.com', '$2a$12$example_hash', 'Alex Creator', 'alexcreator', 'Full-stack developer, content creator, and educator. I create tutorials on web development, share coding tips, and build open-source projects. Thanks for being part of my journey! 🚀', TRUE, 1247.50, 89),
('sarah@example.com', '$2a$12$example_hash', 'Sarah Designer', 'sarahdesigns', 'UI/UX Designer passionate about creating beautiful and functional digital experiences. Follow my design journey!', TRUE, 892.25, 67);

INSERT INTO creator_links (user_id, title, url, display_order) VALUES
(1, 'My Portfolio', 'https://alexcreator.dev', 1),
(1, 'YouTube Channel', 'https://youtube.com/@alexcreator', 2),
(1, 'Latest Course', 'https://course.alexcreator.dev', 3),
(1, 'GitHub Projects', 'https://github.com/alexcreator', 4);

INSERT INTO creator_social_media (user_id, platform, handle, url, display_order) VALUES
(1, 'Twitter', '@alexcreator', 'https://twitter.com/alexcreator', 1),
(1, 'Instagram', '@alex.creator', 'https://instagram.com/alex.creator', 2),
(1, 'YouTube', '@alexcreator', 'https://youtube.com/@alexcreator', 3);

INSERT INTO tips (recipient_user_id, amount, message, tipper_name, payment_provider_id, payment_status, payment_completed_at) VALUES
(1, 25.00, 'Love your content!', 'Anonymous', 'bp_1234567890', 'completed', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(1, 10.00, 'Keep up the great work!', 'Sarah M.', 'bp_1234567891', 'completed', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(1, 50.00, 'Amazing tutorial series!', 'Anonymous', 'bp_1234567892', 'completed', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, 15.00, '', 'Mike R.', 'bp_1234567893', 'completed', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 20.00, 'Thanks for the inspiration!', 'Anonymous', 'bp_1234567894', 'completed', CURRENT_TIMESTAMP - INTERVAL '3 days');
