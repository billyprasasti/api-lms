-- Data awal (dari scripts/seed-courses.json). Jalankan setelah 01_schema.sql

BEGIN;

INSERT INTO categories (slug, name) VALUES
  ('pemasaran', 'Pemasaran'),
  ('digital', 'Digital & Teknologi'),
  ('pengembangan', 'Pengembangan Diri'),
  ('bisnis', 'Manajemen Bisnis'),
  ('desain', 'Desain')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tutors (full_name, job_title, company) VALUES
  ('Jenna Ortega', 'Senior Accountant', 'Gojek'),
  ('Raka Pradana', 'Marketing Lead', 'Tokopedia'),
  ('Nadin Amizah', 'Product Designer', 'Traveloka'),
  ('Dimas Anggara', 'Life Coach', 'Ruangguru'),
  ('Bagas Saputra', 'Frontend Engineer', 'Bukalapak');

INSERT INTO courses (category_id, tutor_id, title, headline, description, thumbnail_url, price, duration_hours, rating_avg, is_published) VALUES
  ((SELECT id FROM categories WHERE slug='bisnis'), (SELECT id FROM tutors WHERE full_name='Jenna Ortega'), 'Belajar Analisis Laporan Keuangan dari Nol', 'Big 4 Auditor Financial Analyst', 'Kuasai teknik audit dan analisis finansial profesional yang langsung terpakai di dunia kerja.', NULL, 300000, 6, 4.9, true),
  ((SELECT id FROM categories WHERE slug='pemasaran'), (SELECT id FROM tutors WHERE full_name='Raka Pradana'), 'Strategi Iklan Digital yang Efektif untuk Bisnis', 'Digital Marketing Specialist', 'Pelajari cara menyusun kampanye iklan digital yang tepat sasaran dan hemat biaya.', NULL, 275000, 5, 4.8, true),
  ((SELECT id FROM categories WHERE slug='desain'), (SELECT id FROM tutors WHERE full_name='Nadin Amizah'), 'Merancang Antarmuka yang Mudah Digunakan', 'UI/UX Design Fundamental', 'Dari riset pengguna hingga prototipe siap pakai, kuasai proses desain produk digital.', NULL, 320000, 8, 4.9, true),
  ((SELECT id FROM categories WHERE slug='pengembangan'), (SELECT id FROM tutors WHERE full_name='Dimas Anggara'), 'Membangun Kebiasaan Produktif Setiap Hari', 'Personal Growth Coach', 'Teknik manajemen waktu dan fokus yang terbukti membantu mencapai target harian.', NULL, 199000, 3, 4.7, true),
  ((SELECT id FROM categories WHERE slug='bisnis'), (SELECT id FROM tutors WHERE full_name='Jenna Ortega'), 'Menyusun Rencana Bisnis yang Siap Investor', 'Business Strategy Analyst', 'Pelajari kerangka kerja penyusunan business plan yang dipakai startup dan korporasi.', NULL, 350000, 9, 4.8, true),
  ((SELECT id FROM categories WHERE slug='pemasaran'), (SELECT id FROM tutors WHERE full_name='Raka Pradana'), 'Menulis Konten yang Menjual di Media Sosial', 'Content Marketing Expert', 'Bangun strategi konten yang konsisten menarik audiens dan meningkatkan penjualan.', NULL, 250000, 4, 4.6, true),
  ((SELECT id FROM categories WHERE slug='desain'), (SELECT id FROM tutors WHERE full_name='Nadin Amizah'), 'Desain Visual untuk Brand yang Konsisten', 'Graphic Design Mastery', 'Kuasai prinsip warna, tipografi, dan layout untuk membangun identitas brand.', NULL, 290000, 7, 4.9, true),
  ((SELECT id FROM categories WHERE slug='pengembangan'), (SELECT id FROM tutors WHERE full_name='Dimas Anggara'), 'Percaya Diri Berbicara di Depan Umum', 'Public Speaking Coach', 'Latihan praktis mengatasi grogi dan menyampaikan ide dengan jelas dan meyakinkan.', NULL, 225000, 2, 4.7, true),
  ((SELECT id FROM categories WHERE slug='bisnis'), (SELECT id FROM tutors WHERE full_name='Jenna Ortega'), 'Kelola Keuangan Bisnis Kecil dengan Tepat', 'Financial Planning Advisor', 'Panduan praktis mengatur arus kas, anggaran, dan laporan keuangan sederhana.', NULL, 300000, 6, 4.8, true),
  ((SELECT id FROM categories WHERE slug='digital'), (SELECT id FROM tutors WHERE full_name='Bagas Saputra'), 'Membangun Website Interaktif dengan React', 'Frontend Web Developer', 'Pelajari komponen, state, dan routing untuk membuat aplikasi web modern.', NULL, 340000, 10, 4.8, true);

COMMIT;
