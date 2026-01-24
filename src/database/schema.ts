// SQLite Database Schema for Biblical App

export const createTables = `
-- Bible Versions
CREATE TABLE IF NOT EXISTS bible_versions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  language TEXT NOT NULL,
  description TEXT
);

-- Books (Bible, Torah, Quran, Apocrypha)
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  testament TEXT NOT NULL CHECK(testament IN ('OT', 'NT', 'APOCRYPHA', 'QURAN', 'TORAH')),
  chapters INTEGER NOT NULL,
  abbreviation TEXT NOT NULL,
  book_order INTEGER NOT NULL
);

-- Chapters
CREATE TABLE IF NOT EXISTS chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  chapter_number INTEGER NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id),
  UNIQUE(book_id, chapter_number)
);

-- Verses
CREATE TABLE IF NOT EXISTS verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  chapter_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  version_id TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (version_id) REFERENCES bible_versions(id),
  UNIQUE(book_id, chapter_number, verse_number, version_id)
);

-- Quran Verses (separate for specific structure)
CREATE TABLE IF NOT EXISTS quran_verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  surah_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  text_arabic TEXT NOT NULL,
  text_portuguese TEXT NOT NULL,
  UNIQUE(surah_number, verse_number)
);

-- Talmud Tractates (for theological studies)
CREATE TABLE IF NOT EXISTS talmud_tractates (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  name_hebrew TEXT NOT NULL,
  seder TEXT NOT NULL, -- Order/Section (Zeraim, Moed, Nashim, Nezikin, Kodashim, Tohorot)
  pages INTEGER NOT NULL,
  tractate_order INTEGER NOT NULL
);

-- Talmud Pages
CREATE TABLE IF NOT EXISTS talmud_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tractate_id INTEGER NOT NULL,
  page_number TEXT NOT NULL, -- e.g., "2a", "2b"
  text_hebrew TEXT,
  text_portuguese TEXT,
  FOREIGN KEY (tractate_id) REFERENCES talmud_tractates(id),
  UNIQUE(tractate_id, page_number)
);

-- User Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  book_id INTEGER NOT NULL,
  chapter_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Verse Highlights (marker/highlighter)
CREATE TABLE IF NOT EXISTS verse_highlights (
  id TEXT PRIMARY KEY,
  book_id INTEGER NOT NULL,
  chapter_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  color TEXT NOT NULL, -- 'yellow', 'green', 'blue', 'pink', 'orange'
  created_at TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id),
  UNIQUE(book_id, chapter_number, verse_number)
);

-- Reading History
CREATE TABLE IF NOT EXISTS reading_history (
  id TEXT PRIMARY KEY,
  book_id INTEGER NOT NULL,
  chapter_number INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY,
  preferred_version TEXT DEFAULT 'acf',
  preferred_language TEXT DEFAULT 'pt',
  font_size INTEGER DEFAULT 16,
  theme TEXT DEFAULT 'auto',
  notifications_enabled INTEGER DEFAULT 1,
  notification_time TEXT DEFAULT '08:00'
);

-- Hymns table (Harpa Cristã)
CREATE TABLE IF NOT EXISTS hymns (
  id INTEGER PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  lyrics TEXT NOT NULL,
  category TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Daily Verses Cache
CREATE TABLE IF NOT EXISTS daily_verses (
  id TEXT PRIMARY KEY,
  verse_id INTEGER NOT NULL,
  date TEXT NOT NULL UNIQUE,
  image_uri TEXT,
  FOREIGN KEY (verse_id) REFERENCES verses(id)
);

-- Reading Plans (Planos de Leitura)
CREATE TABLE IF NOT EXISTS reading_plans (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Reading Plan Days
CREATE TABLE IF NOT EXISTS reading_plan_days (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  readings TEXT NOT NULL, -- JSON: [{"book_id": 1, "chapter_start": 1, "chapter_end": 3}]
  completed INTEGER DEFAULT 0,
  completed_at TEXT,
  FOREIGN KEY (plan_id) REFERENCES reading_plans(id)
);

-- User reading plan progress
CREATE TABLE IF NOT EXISTS user_reading_progress (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER NOT NULL,
  current_day INTEGER DEFAULT 1,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_read_at TEXT,
  FOREIGN KEY (plan_id) REFERENCES reading_plans(id)
);

-- Study Materials (PDF Imports)
CREATE TABLE IF NOT EXISTS study_materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  page_count INTEGER NOT NULL,
  info TEXT,
  added_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verses_book_chapter ON verses(book_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_verses_version ON verses(version_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_book ON bookmarks(book_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON reading_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_hymns_number ON hymns(number);
CREATE INDEX IF NOT EXISTS idx_reading_plan_days ON reading_plan_days(plan_id, day_number);
CREATE INDEX IF NOT EXISTS idx_user_reading_progress ON user_reading_progress(plan_id);
CREATE INDEX IF NOT EXISTS idx_materials_title ON study_materials(title);
`;

export const insertInitialData = `
-- Insert Bible Versions
INSERT OR IGNORE INTO bible_versions (id, name, abbreviation, language, description) VALUES
  ('acf', 'Almeida Corrigida Fiel', 'ACF', 'pt', 'Tradução tradicional em português'),
  ('nvi', 'Nova Versão Internacional', 'NVI', 'pt', 'Tradução moderna em português'),
  ('ara', 'Almeida Revista e Atualizada', 'ARA', 'pt', 'Tradução atualizada em português'),
  ('kjv', 'King James Version', 'KJV', 'en', 'Traditional English translation'),
  ('niv', 'New International Version', 'NIV', 'en', 'Modern English translation'),
  ('rvr', 'Reina-Valera Revisada', 'RVR', 'es', 'Traducción tradicional en español');

-- Insert Sample Talmud Tractates (Babylonian Talmud - Main Orders)
INSERT OR IGNORE INTO talmud_tractates (id, name, name_hebrew, seder, pages, tractate_order) VALUES
  (1, 'Berachot', 'ברכות', 'Zeraim', 64, 1),
  (2, 'Shabbat', 'שבת', 'Moed', 157, 2),
  (3, 'Eruvin', 'עירובין', 'Moed', 105, 3),
  (4, 'Pesachim', 'פסחים', 'Moed', 121, 4),
  (5, 'Yoma', 'יומא', 'Moed', 88, 5),
  (6, 'Ketubot', 'כתובות', 'Nashim', 112, 6),
  (7, 'Baba Kamma', 'בבא קמא', 'Nezikin', 119, 7),
  (8, 'Sanhedrin', 'סנהדרין', 'Nezikin', 113, 8);

-- Insert default user settings
INSERT OR IGNORE INTO user_settings (id) VALUES (1);
`;
