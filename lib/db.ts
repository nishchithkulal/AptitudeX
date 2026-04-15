import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

const globalForDb = globalThis as unknown as {
  db: Database | null;
};

export async function getDb(): Promise<Database> {
  if (globalForDb.db) return globalForDb.db;

  const dbPath = path.resolve(process.cwd(), 'database.sqlite');
  
  globalForDb.db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  return globalForDb.db;
}

export async function initDb() {
  const database = await getDb();
  
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'student')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionText TEXT NOT NULL,
      category TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON array of options
      correctAnswer TEXT NOT NULL,
      explanation TEXT,
      createdBy INTEGER NOT NULL,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      duration INTEGER NOT NULL, -- in minutes
      num_questions INTEGER NOT NULL,
      category TEXT NOT NULL,
      randomize_questions INTEGER DEFAULT 0, -- boolean
      randomize_options INTEGER DEFAULT 0, -- boolean
      exam_code TEXT UNIQUE NOT NULL,
      createdBy INTEGER NOT NULL,
      is_published INTEGER DEFAULT 0, -- boolean
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assessment_questions (
      assessment_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      PRIMARY KEY (assessment_id, question_id),
      FOREIGN KEY (assessment_id) REFERENCES assessments(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      examId INTEGER NOT NULL,
      startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT CHECK(status IN ('started', 'completed')) NOT NULL,
      FOREIGN KEY (studentId) REFERENCES users(id),
      FOREIGN KEY (examId) REFERENCES assessments(id)
    );

    CREATE TABLE IF NOT EXISTS violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      examId INTEGER NOT NULL,
      violation_type TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES users(id),
      FOREIGN KEY (examId) REFERENCES assessments(id)
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      examId INTEGER NOT NULL,
      score INTEGER,
      total_questions INTEGER,
      correct_answers INTEGER,
      time_taken INTEGER, -- in seconds
      answers_payload TEXT, -- JSON mapping of questionId to answer
      submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES users(id),
      FOREIGN KEY (examId) REFERENCES assessments(id)
    );
  `);

  console.log("Database initialized with schemas");
}
