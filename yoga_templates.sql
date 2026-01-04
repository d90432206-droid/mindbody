-- Yoga Class Templates for Mindbody App

-- Clear existing small set of classes if desired (optional)
-- DELETE FROM classes;

INSERT INTO classes (name, teacher_name, category, color_theme)
VALUES 
('哈他瑜珈 (基礎)', 'Sarah J.', 'Yoga', 'bg-indigo-100 border-indigo-200 text-indigo-700'),
('流瑜珈 (進階)', 'Mike T.', 'Yoga', 'bg-purple-100 border-purple-200 text-purple-700'),
('陰瑜珈 (放鬆)', 'Anna W.', 'Yoga', 'bg-emerald-100 border-emerald-200 text-emerald-700'),
('艾揚格瑜珈', 'Sarah J.', 'Yoga', 'bg-blue-100 border-blue-200 text-blue-700'),
('阿斯坦加 Vinyasa', 'David L.', 'Yoga', 'bg-orange-100 border-orange-200 text-orange-700'),
('空中瑜珈', 'Chloe H.', 'Yoga', 'bg-pink-100 border-pink-200 text-pink-700'),
('皮拉提斯核心', 'Mike T.', 'Pilates', 'bg-teal-100 border-teal-200 text-teal-700'),
('高強度間歇 HIIT', 'Anna W.', 'HIIT', 'bg-rose-100 border-rose-200 text-rose-700');
