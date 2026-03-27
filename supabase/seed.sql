-- Insert Mock User for MVP dashboard testing
INSERT INTO users (id, email, name) VALUES 
('d14f9d0c-e2f7-41a4-b0fe-7eb0dbd4c4f0', 'student@yotreeni.fi', 'Mock Student')
ON CONFLICT DO NOTHING;

-- Insert exams
INSERT INTO exams (id, subject, year, season) VALUES 
('11111111-1111-1111-1111-111111111111', 'math_long', 2023, 'kevät'),
('22222222-2222-2222-2222-222222222222', 'physics', 2023, 'kevät')
ON CONFLICT DO NOTHING;

-- Insert questions
INSERT INTO questions (exam_id, number, content, max_points, model_answer) VALUES 
('11111111-1111-1111-1111-111111111111', 1, '{"text": "Ratkaise yhtälö $$x^2 - 5x + 6 = 0$$. Perustele kaikki vaiheet."}', 6, 'Juuret ovat x=2 ja x=3.'),
('11111111-1111-1111-1111-111111111111', 2, '{"text": "Integroi $$\\int_0^1 e^x dx$$."}', 6, 'e - 1'),
('22222222-2222-2222-2222-222222222222', 1, '{"text": "Laske kappaleen liike-energia, kun sen massa on 2,0 kg ja nopeus 5,0 m/s."}', 6, 'E = 0.5 * m * v^2 = 25 J.')
ON CONFLICT DO NOTHING;
