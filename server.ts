import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";
const dbUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

let sqliteDb: any = null;
let pgPool: pg.Pool | null = null;

if (dbUrl) {
  pgPool = new pg.Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
} else {
  sqliteDb = new Database("cyber.db");
}

async function query(sql: string, params: any[] = []) {
  if (pgPool) {
    let pgSql = sql;
    let pCount = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${pCount++}`);
    }
    
    if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
      pgSql += " RETURNING id";
    }

    const result = await pgPool.query(pgSql, params);
    return { rows: result.rows, lastInsertId: result.rows[0]?.id };
  } else {
    const stmt = sqliteDb.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return { rows: stmt.all(...params), lastInsertId: undefined };
    } else {
      const info = stmt.run(...params);
      return { rows: [], lastInsertId: info.lastInsertRowid };
    }
  }
}

async function getOne(sql: string, params: any[] = []) {
  const result = await query(sql, params);
  return result.rows[0];
}

async function initDb() {
  const schema = `
    CREATE TABLE IF NOT EXISTS competitions (
      id SERIAL PRIMARY KEY,
      title TEXT,
      type TEXT,
      prize TEXT,
      description TEXT,
      timeLeft TEXT,
      participants INTEGER,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS leaderboard (
      id SERIAL PRIMARY KEY,
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
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      category TEXT,
      min_score INTEGER
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id SERIAL PRIMARY KEY,
      quiz_id TEXT,
      question TEXT,
      options TEXT,
      correct_answer INTEGER
    );

    CREATE TABLE IF NOT EXISTS user_quiz_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      quiz_id TEXT,
      score INTEGER,
      passed BOOLEAN,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      quiz_id TEXT,
      issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      certificate_code TEXT UNIQUE
    );
  `;

  if (pgPool) {
    await pgPool.query(schema);
  } else {
    // SQLite uses AUTOINCREMENT instead of SERIAL
    const sqliteSchema = schema.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
                               .replace(/TIMESTAMP/g, 'DATETIME');
    sqliteDb.exec(sqliteSchema);
  }

  // Seed admin user
  const admin = await getOne("SELECT * FROM users WHERE username = 'admin'");
  if (!admin) {
    await query("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", ['admin', 'admin@cyber.uz', 'admin123', 'admin']);
  }

  // Seed Quizzes
  const quizCountRes = await getOne("SELECT count(*) as count FROM quizzes");
  if (parseInt(quizCountRes.count) === 0) {
    const quizId = 'q1';
    await query("INSERT INTO quizzes (id, title, description, category, min_score) VALUES (?, ?, ?, ?, ?)", 
      [quizId, 'Kiberxavfsizlik Asoslari', 'Kiberxavfsizlik bo\'yicha boshlang\'ich bilimlar testi', 'Security', 70]);
    
    const questions = [
      { q: 'SQL Injection nima?', o: ['Ma\'lumotlar bazasiga hujum', 'Veb-sayt dizaynini o\'zgartirish', 'Email yuborish'], a: 0 },
      { q: 'HTTPS protokoli qaysi portda ishlaydi?', o: ['80', '443', '21'], a: 1 },
      { q: 'Eng xavfsiz parol qaysi?', o: ['123456', 'password', 'Cyb3r_Ch4mp!ons_2024'], a: 2 },
      { q: 'Phishing nima?', o: ['Baliq ovi', 'Foydalanuvchi ma\'lumotlarini aldab olish', 'Virus turi'], a: 1 },
      { q: 'Firewall nima uchun kerak?', o: ['Internetni tezlashtirish', 'Tarmoq trafigini filtrlash', 'Kompyuterni sovutish'], a: 1 }
    ];

    for (const q of questions) {
      await query("INSERT INTO quiz_questions (quiz_id, question, options, correct_answer) VALUES (?, ?, ?, ?)",
        [quizId, q.q, JSON.stringify(q.o), q.a]);
    }
  }

  // Seed data if empty
  const compCountRes = await getOne("SELECT count(*) as count FROM competitions");
  if (parseInt(compCountRes.count) === 0) {
    await query("INSERT INTO competitions (title, type, prize, description, timeLeft, participants, color) VALUES (?, ?, ?, ?, ?, ?, ?)", ["Milliy CTF Chempionati 2024", "CTF", "$5,000", "O'zbekiston bo'ylab eng yaxshi hakerlar uchun. Web, Crypto, Reverse Engineering, PWN, Forensics yo'nalishlari.", "12:45:30", 423, "#00f3ff"]);
    await query("INSERT INTO competitions (title, type, prize, description, timeLeft, participants, color) VALUES (?, ?, ?, ?, ?, ?, ?)", ["Bahor Bug Bounty Dasturi", "BUG BOUNTY", "$10,000", "\"SecureBank\" tizimidagi zaifliklarni toping. SQL Injection, XSS, CSRF, Authentication bypass mukofotlari.", "20 kun qoldi", 187, "#ffd700"]);
    await query("INSERT INTO competitions (title, type, prize, description, timeLeft, participants, color) VALUES (?, ?, ?, ?, ?, ?, ?)", ["Secure Code Warrior 2024", "CODING", "$3,000", "Xavfsiz dasturlash bo'yicha musobaqa. Buffer overflow prevention, input validation, encryption algorithms.", "3:15:20", 312, "#00ff88"]);
    await query("INSERT INTO competitions (title, type, prize, description, timeLeft, participants, color) VALUES (?, ?, ?, ?, ?, ?, ?)", ["Web Application Pentesting", "WEB PENTEST", "$7,500", "Real veb ilovalarni penetration testing qilish. OWASP Top 10 zaifliklarni exploit qilish va hisobot yozish.", "5 kun qoldi", 156, "#ff003c"]);
  }

  const leaderCountRes = await getOne("SELECT count(*) as count FROM leaderboard");
  if (parseInt(leaderCountRes.count) === 0) {
    await query("INSERT INTO leaderboard (rank, name, username, score, competitions, country, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [1, "Sherxon Xudoyberdiyev", "Sherxon_75", 3450, 8, "UZ", "online"]);
    await query("INSERT INTO leaderboard (rank, name, username, score, competitions, country, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [2, "Ghost Hacker", "ghost", 2850, 6, "UZ", "online"]);
    await query("INSERT INTO leaderboard (rank, name, username, score, competitions, country, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [3, "Zero Cool", "zerocool", 2120, 5, "US", "offline"]);
    await query("INSERT INTO leaderboard (rank, name, username, score, competitions, country, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [4, "Crypto Master", "crypto", 1980, 7, "UZ", "online"]);
    await query("INSERT INTO leaderboard (rank, name, username, score, competitions, country, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [5, "Web Slayer", "webslayer", 1050, 4, "DE", "offline"]);
  }

  const challengeCountRes = await getOne("SELECT count(*) as count FROM challenges");
  if (parseInt(challengeCountRes.count) === 0) {
    await query("INSERT INTO challenges (id, title, category, difficulty, points, description, hint, flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", ['web-01', 'Hidden in Plain Sight', 'Web', 'Easy', 100, 'Bizning yangi veb-saytimizda bir narsa yashiringan. Uni topa olasizmi? Saytning manba kodini (source code) tekshirib ko\'ring.', 'Brauzerda Ctrl+U tugmasini bosing.', 'CTF{view_source_is_your_friend}']);
    await query("INSERT INTO challenges (id, title, category, difficulty, points, description, hint, flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", ['crypto-01', 'Caesar\'s Secret', 'Cryptography', 'Medium', 250, 'Ushbu shifrlangan xabarni yeching: "Fvgf_pber_fgehpgher_vf_pelcgb". Kalit: ROT13.', 'ROT13 - bu oddiy alifbo almashinuvi.', 'CTF{site_core_structure_is_crypto}']);
    await query("INSERT INTO challenges (id, title, category, difficulty, points, description, hint, flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", ['rev-01', 'Binary Ghost', 'Reverse Engineering', 'Hard', 500, 'Ushbu kichik dastur ichida flag yashiringan. Dasturni tahlil qiling va flagni toping.', 'Ghidra yoki IDA Pro vositalaridan foydalaning.', 'CTF{b1nary_h4ck3r_2024}']);
  }
}

async function startServer() {
  await initDb();
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const info = await query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, password]);
      const user = await getOne("SELECT id, username, email, role FROM users WHERE username = ?", [username]);
      res.json({ success: true, user });
    } catch (error: any) {
      if (error.message.includes("UNIQUE") || error.code === '23505') {
        res.status(400).json({ error: "Username yoki email allaqachon mavjud" });
      } else {
        res.status(500).json({ error: "Ro'yxatdan o'tishda xatolik" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await getOne("SELECT id, username, email, role FROM users WHERE username = ? AND password = ?", [username, password]);
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ error: "Username yoki parol noto'g'ri" });
    }
  });

  // API Routes
  app.get("/api/competitions", async (req, res) => {
    const result = await query("SELECT * FROM competitions");
    res.json(result.rows);
  });

  app.get("/api/leaderboard", async (req, res) => {
    const result = await query("SELECT * FROM leaderboard ORDER BY rank ASC");
    res.json(result.rows);
  });

  app.get("/api/challenges", async (req, res) => {
    const result = await query("SELECT id, title, category, difficulty, points, description, hint FROM challenges");
    res.json(result.rows);
  });

  // Admin API for Competitions
  app.post("/api/admin/competitions", async (req, res) => {
    const { title, type, prize, description, timeLeft, participants, color } = req.body;
    try {
      const info = await query("INSERT INTO competitions (title, type, prize, description, timeLeft, participants, color) VALUES (?, ?, ?, ?, ?, ?, ?)", [title, type, prize, description, timeLeft, participants, color]);
      res.json({ success: true, id: info.lastInsertId });
    } catch (error) {
      res.status(500).json({ error: "Failed to add competition" });
    }
  });

  app.delete("/api/admin/competitions/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await query("DELETE FROM competitions WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete competition" });
    }
  });

  app.post("/api/challenges/submit", async (req, res) => {
    const { id, flag } = req.body;
    const challenge = await getOne("SELECT flag FROM challenges WHERE id = ?", [id]);
    
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
  app.get('/api/admin/users', async (req, res) => {
    const result = await query("SELECT id, username, email, role, created_at FROM users");
    res.json(result.rows);
  });

  // Quizzes
  app.get('/api/quizzes', async (req, res) => {
    const result = await query("SELECT * FROM quizzes");
    res.json(result.rows);
  });

  app.get('/api/quizzes/:id/questions', async (req, res) => {
    const result = await query("SELECT id, question, options FROM quiz_questions WHERE quiz_id = ?", [req.params.id]);
    const formatted = result.rows.map((q: any) => ({
      ...q,
      options: JSON.parse(q.options)
    }));
    res.json(formatted);
  });

  app.post('/api/quizzes/submit', async (req, res) => {
    const { userId, quizId, answers } = req.body;
    const questionsRes = await query("SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = ?", [quizId]);
    const questions = questionsRes.rows;
    
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const quiz = await getOne("SELECT min_score FROM quizzes WHERE id = ?", [quizId]);
    const passed = score >= quiz.min_score;

    await query("INSERT INTO user_quiz_results (user_id, quiz_id, score, passed) VALUES (?, ?, ?, ?)", [userId, quizId, score, passed ? 1 : 0]);

    let certificate = null;
    if (passed) {
      const certId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const certCode = `CC-${Date.now()}-${userId}`;
      await query("INSERT INTO certificates (id, user_id, quiz_id, certificate_code) VALUES (?, ?, ?, ?)", [certId, userId, quizId, certCode]);
      certificate = { id: certId, code: certCode };
    }

    res.json({ score, passed, certificate });
  });

  app.get('/api/users/:userId/certificates', async (req, res) => {
    const result = await query(`
      SELECT c.*, q.title as quiz_title 
      FROM certificates c 
      JOIN quizzes q ON c.quiz_id = q.id 
      WHERE c.user_id = ?
    `, [req.params.userId]);
    res.json(result.rows);
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
