

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (Mocking typical Supabase Auth schema logic using a custom users table for MVP, usually we sync with auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Exams table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(50) NOT NULL CHECK (subject IN ('math_long', 'math_short', 'physics')),
    year INT NOT NULL,
    season VARCHAR(20) NOT NULL CHECK (season IN ('kevät', 'syksy')),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(subject, year, season)
);

-- 3. Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    number INT NOT NULL,
    content JSONB NOT NULL, -- { "text": "..." }
    max_points INT NOT NULL,
    model_answer TEXT,
    UNIQUE(exam_id, number)
);

-- 4. Exam Sessions table
CREATE TABLE exam_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE SET NULL, -- optional if practice
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('mock', 'practice')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    total_score INT DEFAULT 0
);

-- 5. Answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    ai_feedback JSONB, -- { score, summary, correct[], errors[], hint }
    ai_score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Progress View
CREATE OR REPLACE VIEW user_progress AS
SELECT 
    e.subject,
    es.user_id,
    COUNT(DISTINCT es.id) as sessions_count,
    ROUND(AVG(
        CASE 
            WHEN q_totals.total_max > 0 THEN (es.total_score::FLOAT / q_totals.total_max) * 100 
            ELSE 0 
        END
    )) as avg_score_percentage
FROM exam_sessions es
JOIN exams e ON es.exam_id = e.id
LEFT JOIN (
    SELECT exam_id, SUM(max_points) as total_max 
    FROM questions 
    GROUP BY exam_id
) q_totals ON e.id = q_totals.exam_id
WHERE es.finished_at IS NOT NULL
GROUP BY e.subject, es.user_id;
