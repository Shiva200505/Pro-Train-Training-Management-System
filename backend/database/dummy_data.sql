-- Insert dummy trainings
INSERT INTO trainings (title, description, trainerId, startDate, endDate, capacity, location, category, level, status) 
VALUES 
('Web Development Fundamentals', 'Learn the basics of HTML, CSS, and JavaScript', 1, '2025-11-01', '2025-11-30', 20, 'Room 101', 'Technical', 'Beginner', 'Active'),
('Advanced React Development', 'Master React hooks and advanced patterns', 1, '2025-12-01', '2025-12-31', 15, 'Room 102', 'Technical', 'Advanced', 'Upcoming'),
('Project Management Essentials', 'Learn the fundamentals of project management', 1, '2025-11-15', '2025-12-15', 25, 'Room 103', 'Professional', 'Intermediate', 'Active'),
('Leadership Skills Workshop', 'Develop essential leadership skills', 1, '2025-10-01', '2025-10-31', 20, 'Room 104', 'Leadership', 'Intermediate', 'Completed');

-- Insert dummy training materials
INSERT INTO training_materials (trainingId, title, fileUrl) 
VALUES 
(1, 'HTML Basics.pdf', '/uploads/materials/html-basics.pdf'),
(1, 'CSS Fundamentals.pdf', '/uploads/materials/css-fundamentals.pdf'),
(2, 'React Hooks Guide.pdf', '/uploads/materials/react-hooks.pdf'),
(3, 'PM Methodology.pdf', '/uploads/materials/pm-methodology.pdf');

-- Insert dummy enrollments
INSERT INTO training_enrollments (trainingId, userId, status, enrollmentDate) 
VALUES 
(1, 2, 'Approved', '2025-10-25'),
(2, 2, 'Pending', '2025-10-26'),
(3, 2, 'Approved', '2025-10-27');

-- Insert dummy attendance records
INSERT INTO attendance (trainingId, userId, date, status) 
VALUES 
(1, 2, '2025-10-25', 'Present'),
(1, 2, '2025-10-26', 'Present'),
(3, 2, '2025-10-27', 'Present');