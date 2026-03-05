// ============================================================
// Gleamio — Backend API Server
// ============================================================
// This is a minimal Express server that provides:
// - Project CRUD API
// - File uploads
// - Authentication (JWT)
// - Real-time collaboration (Socket.IO)
//
// For demo/GitHub Pages mode, the frontend runs standalone
// using localStorage — no backend required.
// ============================================================

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.SERVER_PORT || 4000;

// ── Middleware ──────────────────────────────────────────────

app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// ── In-memory store (replace with database in production) ──

const projects = new Map();
const users = new Map();

// ── Auth Routes ────────────────────────────────────────────

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (users.has(email)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const user = { id: crypto.randomUUID(), email, name, createdAt: new Date().toISOString() };
  users.set(email, { ...user, password }); // In prod, hash passwords!
  res.json({ user, token: generateToken(user.id) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: generateToken(user.id) });
});

// ── Project Routes ─────────────────────────────────────────

app.get('/api/projects', (req, res) => {
  const all = Array.from(projects.values()).map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    thumbnail: p.thumbnail,
    updatedAt: p.updatedAt,
    createdAt: p.createdAt,
  }));
  res.json(all);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.post('/api/projects', (req, res) => {
  const project = {
    ...req.body,
    id: req.body.id || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.set(project.id, project);
  res.status(201).json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const existing = projects.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });
  const updated = { ...existing, ...req.body, updatedAt: new Date().toISOString() };
  projects.set(req.params.id, updated);
  res.json(updated);
});

app.delete('/api/projects/:id', (req, res) => {
  if (!projects.has(req.params.id)) return res.status(404).json({ error: 'Project not found' });
  projects.delete(req.params.id);
  res.json({ success: true });
});

// ── File Upload ────────────────────────────────────────────

app.post('/api/upload', (req, res) => {
  // In production, use multer + storage driver (local or S3)
  res.json({ message: 'Upload endpoint — configure STORAGE_DRIVER in .env' });
});

// ── AI Routes (Stubs) ──────────────────────────────────────

app.post('/api/ai/generate-quiz', (req, res) => {
  res.json({
    message: 'AI quiz generation — configure OPENAI_API_KEY in .env',
    questions: [],
  });
});

app.post('/api/ai/generate-image', (req, res) => {
  res.json({ message: 'AI image generation — configure OPENAI_API_KEY in .env' });
});

app.post('/api/ai/text-to-speech', (req, res) => {
  res.json({ message: 'TTS — configure OPENAI_API_KEY in .env' });
});

app.post('/api/ai/translate', (req, res) => {
  res.json({ message: 'Translation — configure OPENAI_API_KEY in .env' });
});

app.post('/api/ai/edit-text', (req, res) => {
  res.json({ message: 'AI text edit — configure OPENAI_API_KEY in .env' });
});

// ── Real-Time Collaboration ────────────────────────────────

const io = new SocketServer(server, {
  cors: {
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`[Socket] ${socket.id} joined project:${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on('cursor-move', (data) => {
    socket.to(`project:${data.projectId}`).emit('cursor-move', {
      userId: socket.id,
      ...data,
    });
  });

  socket.on('element-update', (data) => {
    socket.to(`project:${data.projectId}`).emit('element-update', data);
  });

  socket.on('page-update', (data) => {
    socket.to(`project:${data.projectId}`).emit('page-update', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

// ── Live Session (Kahoot-like) ─────────────────────────────

const liveSessions = new Map();

app.post('/api/live/create', (req, res) => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const session = {
    code,
    projectId: req.body.projectId,
    hostSocketId: null,
    participants: [],
    currentPage: 0,
    responses: {},
    createdAt: new Date().toISOString(),
  };
  liveSessions.set(code, session);
  res.json({ code });
});

app.get('/api/live/:code', (req, res) => {
  const session = liveSessions.get(req.params.code.toUpperCase());
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// ── Health Check ───────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── Simple token helper (replace with proper JWT in prod) ──

function generateToken(userId) {
  // In production, use jsonwebtoken with JWT_SECRET from env
  return Buffer.from(JSON.stringify({ userId, exp: Date.now() + 86400000 })).toString('base64');
}

// ── Start Server ───────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║          Gleamio API Server               ║
  ║                                           ║
  ║  → http://localhost:${PORT}                 ║
  ║  → Health: /api/health                    ║
  ║  → Docs:   See README.md                  ║
  ╚═══════════════════════════════════════════╝
  `);
});
