-- Skema database videobelajar (PostgreSQL)

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_token VARCHAR(36) UNIQUE,
  phone_country_code VARCHAR(5),
  phone_number VARCHAR(15),
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tutors (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  job_title VARCHAR(100) NOT NULL,
  company VARCHAR(100) NOT NULL,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE courses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id SMALLINT NOT NULL,
  tutor_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  headline VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  price NUMERIC(12,2) NOT NULL,
  duration_hours NUMERIC(4,1) NOT NULL,
  rating_avg NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_courses_categories FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_courses_tutors FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE RESTRICT,
  CONSTRAINT ck_courses_price CHECK (price >= 0)
);

CREATE TABLE modules (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  position SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_modules_courses FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT uq_modules_course_id_position UNIQUE (course_id, position)
);

CREATE TABLE materials (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  module_id BIGINT NOT NULL,
  type VARCHAR(10) NOT NULL,
  title VARCHAR(150) NOT NULL,
  duration_minutes SMALLINT,
  content_url TEXT,
  questions JSONB,
  position SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_materials_modules FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  CONSTRAINT ck_materials_type CHECK (type IN ('video','summary','quiz')),
  CONSTRAINT uq_materials_module_id_position UNIQUE (module_id, position)
);

CREATE TABLE pretests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_pretests_courses FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT uq_pretests_course_id UNIQUE (course_id)
);

CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  invoice_number VARCHAR(30) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  admin_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_orders_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_orders_courses FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  CONSTRAINT ck_orders_status CHECK (status IN ('pending','paid','failed'))
);

CREATE TABLE payment_methods (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  method_group VARCHAR(10) NOT NULL,
  va_prefix VARCHAR(10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT ck_payment_methods_group CHECK (method_group IN ('bank','ewallet','card'))
);

CREATE TABLE payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT NOT NULL,
  payment_method_id SMALLINT NOT NULL,
  va_number VARCHAR(30),
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'pending',
  expired_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_payments_orders FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_payment_methods FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE RESTRICT,
  CONSTRAINT ck_payments_status CHECK (status IN ('pending','paid','failed','expired'))
);

CREATE TABLE enrollments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  order_id BIGINT,
  completed_materials SMALLINT NOT NULL DEFAULT 0,
  total_materials SMALLINT NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT fk_enrollments_users FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_enrollments_courses FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_enrollments_orders FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT ck_enrollments_status CHECK (status IN ('active','completed')),
  CONSTRAINT uq_enrollments_user_id_course_id UNIQUE (user_id, course_id)
);

CREATE TABLE reviews (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  rating NUMERIC(2,1) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_reviews_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_courses FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 0 AND 5),
  CONSTRAINT uq_reviews_user_id_course_id UNIQUE (user_id, course_id)
);

-- Indeks tambahan (selain PK dan UNIQUE di atas)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_courses_category_id_price ON courses (category_id, price);
CREATE INDEX idx_courses_tutor_id          ON courses (tutor_id);
CREATE INDEX idx_courses_title_trgm        ON courses USING gin (title gin_trgm_ops);
CREATE INDEX idx_enrollments_user_id_status ON enrollments (user_id, status);
CREATE INDEX idx_enrollments_course_id     ON enrollments (course_id);
CREATE INDEX idx_orders_user_id_created_at ON orders (user_id, created_at DESC);
CREATE INDEX idx_orders_course_id          ON orders (course_id);
CREATE INDEX idx_payments_order_id         ON payments (order_id);
CREATE INDEX idx_payments_status_expired_at ON payments (status, expired_at);
CREATE INDEX idx_reviews_course_id_created_at ON reviews (course_id, created_at DESC);
