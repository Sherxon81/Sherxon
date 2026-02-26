import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("cyber.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS competitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    type TEXT,
    prize TEXT,
    description TEXT,
    timeLeft TEXT,
    participants INTEGER,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank INTEGER,
    name TEXT,
    username TEXT,
    score INTEGER,
    competitions INTEGER,
    country TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    title TEXT,
    category TEXT,
    difficulty TEXT,
    points INTEGER,
    description TEXT,
    hint TEXT,
    flag TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    category TEXT,
    min_score INTEGER
  );

  CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id TEXT,
    question TEXT,
    options TEXT, -- JSON string array
    correct_answer INTEGER, -- index of options
    FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
  );

  CREATE TABLE IF NOT EXISTS user_quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    quiz_id TEXT,
    score INTEGER,
    passed BOOLEAN,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    quiz_id TEXT,
    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    certificate_code TEXT UNIQUE,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
  );
`);

// Seed admin user
const adminExists = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
if (!adminExists) {
  db.prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)").run('admin', 'admin@cyber.uz', 'admin123', 'admin');
}

// Seed Quizzes
const quizCount = db.prepare("SELECT count(*) as count FROM quizzes").get() as { count: number };
if (quizCount.count === 0) {
  const quizId = 'q1';
  db.prepare("INSERT INTO quizzes (id, title, description, category, min_score) VALUES (?, ?, ?, ?, ?)")
    .run(quizId, 'Kiberxavfsizlik Asoslari', 'Kiberxavfsizlik bo\'yicha boshlang\'ich bilimlar testi', 'Security', 70);
  
  const questions = [
    { q: 'SQL Injection nima?', o: ['Ma\'lumotlar bazasiga hujum', 'Veb-sayt dizaynini o\'zgartirish', 'Email yuborish'], a: 0 },
    { q: 'HTTPS protokoli qaysi portda ishlaydi?', o: ['80', '443', '21'], a: 1 },
    { q: 'Eng xavfsiz parol qaysi?', o: ['123456', 'password', 'Cyb3r_Ch4mp!ons_2024'], a: 2 },
    { q: 'Phishing nima?', o: ['Baliq ovi', 'Foydalanuvchi ma\'lumotlarini aldab olish', 'Virus turi'], a: 1 },
    { q: 'Firewall nima uchun kerak?', o: ['Internetni tezlashtirish', 'Tarmoq trafigini filtrlash', 'Kompyuterni sovutish'], a: 1 }
  ];

  questions.forEach(q => {
    db.prepare("INSERT INTO quiz_questions (quiz_id, question, options, correct_answer) VALUES (?, ?, ?, ?)")
      .run(quizId, q.q, JSON.stringify(q.o), q.a);
  });
}

// Seed data if empty
const compCount = db.prepare("SELECT count(*) as count FROM competitions").get() as { count: number };
if (compCount.count === 0) {
  const insertComp = db.prepare("INSERT INTO competitions (title, type, prize, description, timeLeft, participants, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertComp.run("Milliy CTF Chempionati 2024", "CTF", "$5,000", "O'zbekiston bo'ylab eng yaxshi hakerlar uchun. Web, Crypto, Reverse Engineering, PWN, Forensics yo'nalishlari.", "12:45:30", 423, "#00f3ff");
  insertComp.run("Bahor Bug Bounty Dasturi", "BUG BOUNTY", "$10,000", "\"SecureBank\" tizimidagi zaifliklarni toping. SQL Injection, XSS, CSRF, Authentication bypass mukofotlari.", "20 kun qoldi", 187, "#ffd700");
  insertComp.run("Secure Code Warrior 2024", "CODING", "$3,000", "Xavfsiz dasturlash bo'yicha musobaqa. Buffer overflow prevention, input validation, encryption algorithms.", "3:15:20", 312, "#00ff88");
  insertComp.run("Web Application Pentesting", "WEB PENTEST", "$7,500", "Real veb ilovalarni penetration testing qilish. OWASP Top 10 zaifliklarni exploit qilish va hisobot yozish.", "5 kun qoldi", 156, "#ff003c");
}

const leaderCount = db.prepare("SELECT count(*) as count FROM leaderboard").get() as { count: number };
if (leaderCount.count === 0) {
  const insertLeader = db.prepare("INSERT INTO leaderboard (rank, name, username, score, competitions, country, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertLeader.run(1, "Sherxon Xudoyberdiyev", "Sherxon_75", 3450, 8, "UZ", "online");
  insertLeader.run(2, "Ghost Hacker", "ghost", 2850, 6, "UZ", "online");
  insertLeader.run(3, "Zero Cool", "zerocool", 2120, 5, "US", "offline");
  insertLeader.run(4, "Crypto Master", "crypto", 1980, 7, "UZ", "online");
  insertLeader.run(5, "Web Slayer", "webslayer", 1050, 4, "DE", "offline");
}

const challengeCount = db.prepare("SELECT count(*) as count FROM challenges").get() as { count: number };
if (challengeCount.count === 0) {
  const insertChallenge = db.prepare("INSERT INTO challenges (id, title, category, difficulty, points, description, hint, flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  insertChallenge.run('web-01', 'Hidden in Plain Sight', 'Web', 'Easy', 100, 'Bizning yangi veb-saytimizda bir narsa yashiringan. Uni topa olasizmi? Saytning manba kodini (source code) tekshirib ko\'ring.', 'Brauzerda Ctrl+U tugmasini bosing.', 'CTF{view_source_is_your_friend}');
  insertChallenge.run('crypto-01', 'Caesar\'s Secret', 'Cryptography', 'Medium', 250, 'Ushbu shifrlangan xabarni yeching: "Fvgf_pber_fgehpgher_vf_pelcgb". Kalit: ROT13.', 'ROT13 - bu oddiy alifbo almashinuvi.', 'CTF{site_core_structure_is_crypto}');
  insertChallenge.run('rev-01', 'Binary Ghost', 'Reverse Engineering', 'Hard', 500, 'Ushbu kichik dastur ichida flag yashiringan. Dasturni tahlil qiling va flagni toping.', 'Ghidra yoki IDA Pro vositalaridan foydalaning.', 'CTF{b1nary_h4ck3r_2024}');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/register", (req, res) => {
    const { username, email, password } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)")
        .run(username, email, password);
      const user = db.prepare("SELECT id, username, email, role FROM users WHERE id = ?").get(info.lastInsertRowid);
      res.json({ success: true, user });
    } catch (error: any) {
      if (error.message.includes("UNIQUE")) {
        res.status(400).json({ error: "Username yoki email allaqachon mavjud" });
      } else {
        res.status(500).json({ error: "Ro'yxatdan o'tishda xatolik" });
      }
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT id, username, email, role FROM users WHERE username = ? AND password = ?")
      .get(username, password) as any;
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ error: "Username yoki parol noto'g'ri" });
    }
  });

  // API Routes
  app.get("/api/competitions", (req, res) => {
    const competitions = db.prepare("SELECT * FROM competitions").all();
    res.json(competitions);
  });

  app.get("/api/leaderboard", (req, res) => {
    const leaderboard = db.prepare("SELECT * FROM leaderboard ORDER BY rank ASC").all();
    res.json(leaderboard);
  });

  app.get("/api/challenges", (req, res) => {
    const challenges = db.prepare("SELECT id, title, category, difficulty, points, description, hint FROM challenges").all();
    res.json(challenges);
  });

  // Admin API for Competitions
  app.post("/api/admin/competitions", (req, res) => {
    const { title, type, prize, description, timeLeft, participants, color } = req.body;
    try {
      const info = db.prepare("INSERT INTO competitions (title, type, prize, description, timeLeft, participants, color) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(title, type, prize, description, timeLeft, participants, color);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add competition" });
    }
  });

  app.delete("/api/admin/competitions/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM competitions WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete competition" });
    }
  });

  app.post("/api/challenges/submit", (req, res) => {
    const { id, flag } = req.body;
    const challenge = db.prepare("SELECT flag FROM challenges WHERE id = ?").get(id) as { flag: string } | undefined;
    
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    if (challenge.flag === flag) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });

  // Admin: Get all users
  app.get('/api/admin/users', (req, res) => {
    const users = db.prepare("SELECT id, username, email, role, created_at FROM users").all();
    res.json(users);
  });

  // Quizzes
  app.get('/api/quizzes', (req, res) => {
    const quizzes = db.prepare("SELECT * FROM quizzes").all();
    res.json(quizzes);
  });

  app.get('/api/quizzes/:id/questions', (req, res) => {
    const questions = db.prepare("SELECT id, question, options FROM quiz_questions WHERE quiz_id = ?").all(req.params.id);
    const formatted = questions.map((q: any) => ({
      ...q,
      options: JSON.parse(q.options)
    }));
    res.json(formatted);
  });

  app.post('/api/quizzes/submit', (req, res) => {
    const { userId, quizId, answers } = req.body; // answers is { questionId: answerIndex }
    const questions = db.prepare("SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = ?").all(quizId) as any[];
    
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const quiz = db.prepare("SELECT min_score FROM quizzes WHERE id = ?").get(quizId) as any;
    const passed = score >= quiz.min_score;

    db.prepare("INSERT INTO user_quiz_results (user_id, quiz_id, score, passed) VALUES (?, ?, ?, ?)")
      .run(userId, quizId, score, passed ? 1 : 0);

    let certificate = null;
    if (passed) {
      const certId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const certCode = `CC-${Date.now()}-${userId}`;
      db.prepare("INSERT INTO certificates (id, user_id, quiz_id, certificate_code) VALUES (?, ?, ?, ?)")
        .run(certId, userId, quizId, certCode);
      certificate = { id: certId, code: certCode };
    }

    res.json({ score, passed, certificate });
  });

  app.get('/api/users/:userId/certificates', (req, res) => {
    const certs = db.prepare(`
      SELECT c.*, q.title as quiz_title 
      FROM certificates c 
      JOIN quizzes q ON c.quiz_id = q.id 
      WHERE c.user_id = ?
    `).all(req.params.userId);
    res.json(certs);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
