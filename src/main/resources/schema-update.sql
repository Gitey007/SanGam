-- ==============================================================================
-- SanGam Production Schema Migration / Update Script
-- Compatible with MySQL 8.x / Aiven MySQL (defaultdb)
-- Safe & Idempotent: Does NOT drop or reset any existing tables or data.
-- ==============================================================================

-- 1. Create user_looking_for collection table (matches User.lookingFor @ElementCollection)
CREATE TABLE IF NOT EXISTS user_looking_for (
    user_id BIGINT NOT NULL,
    preference VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, preference),
    CONSTRAINT fk_user_looking_for_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create user_achievements table (matches UserAchievement entity)
CREATE TABLE IF NOT EXISTS user_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    category VARCHAR(50) NULL,
    achievement_date VARCHAR(50) NULL,
    verification_url VARCHAR(255) NULL,
    created_at DATETIME(6) NULL,
    CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create user_projects table (matches UserProject entity)
CREATE TABLE IF NOT EXISTS user_projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    tech_stack VARCHAR(255) NULL,
    github_url VARCHAR(255) NULL,
    live_demo_url VARCHAR(255) NULL,
    created_at DATETIME(6) NULL,
    CONSTRAINT fk_user_projects_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create team_required_roles collection table (matches Team.roleSlots @ElementCollection)
CREATE TABLE IF NOT EXISTS team_required_roles (
    team_id BIGINT NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    slot_count INT NOT NULL DEFAULT 1,
    PRIMARY KEY (team_id, role_name),
    CONSTRAINT fk_team_required_roles_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create team_required_skills join table (matches Team.requiredSkills @ManyToMany)
CREATE TABLE IF NOT EXISTS team_required_skills (
    team_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (team_id, skill_id),
    CONSTRAINT fk_team_required_skills_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_team_required_skills_skill FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Add new columns to users table (if not already present)
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS leetcode_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS other_url VARCHAR(255);

-- 7. Add new columns to teams table (if not already present)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS project_name VARCHAR(150);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS project_description TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_vision TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS project_type VARCHAR(50);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS hackathon_name VARCHAR(150);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS hackathon_url VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS hackathon_deadline VARCHAR(50);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS github_repository_url VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS documentation_url VARCHAR(255);

-- 8. Add role slot column to team_required_roles
ALTER TABLE team_required_roles ADD COLUMN IF NOT EXISTS slot_count INT NOT NULL DEFAULT 1;

-- 9. Add role tracking columns to team_members
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS assigned_role VARCHAR(100);
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);

-- 10. Add role tracking columns to team_join_requests
ALTER TABLE team_join_requests ADD COLUMN IF NOT EXISTS requested_role VARCHAR(100);
ALTER TABLE team_join_requests ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);

-- 11. Add role tracking columns to team_invitations
ALTER TABLE team_invitations ADD COLUMN IF NOT EXISTS invited_role VARCHAR(100);
ALTER TABLE team_invitations ADD COLUMN IF NOT EXISTS custom_role VARCHAR(150);

-- 12. Align existing columns with JPA @Column(columnDefinition = "TEXT")
-- Expands VARCHAR(255) to TEXT to support long bios and team descriptions without data truncation.
ALTER TABLE users MODIFY COLUMN bio TEXT;
ALTER TABLE teams MODIFY COLUMN description TEXT;
