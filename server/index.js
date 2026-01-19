const cors = require('cors');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { z } = require('zod');

const { getAccount, updateAccount, updateAvatar, isUsernameUnique } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads are allowed.'));
      return;
    }
    cb(null, true);
  },
});

const accountSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-zA-Z0-9]+$/, 'First name must be alphanumeric.'),
  lastName: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-zA-Z0-9]+$/, 'Last name must be alphanumeric.'),
  email: z.string().trim().min(1).email(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric with no spaces.'),
});

function toAccountResponse(account) {
  const avatarUrl = account.avatar_filename
    ? `http://localhost:${PORT}/uploads/${account.avatar_filename}`
    : null;

  return {
    firstName: account.first_name,
    lastName: account.last_name,
    email: account.email,
    username: account.username,
    avatarUrl,
  };
}

app.get('/api/account', (req, res) => {
  const account = getAccount();
  res.json(toAccountResponse(account));
});

app.put('/api/account', (req, res) => {
  const result = accountSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: 'Invalid account data.',
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (!isUsernameUnique(result.data.username)) {
    res.status(409).json({ message: 'Username already exists.' });
    return;
  }

  const updated = updateAccount(result.data);
  res.json(toAccountResponse(updated));
});

app.post('/api/account/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'Avatar file is required.' });
    return;
  }

  const updated = updateAvatar(req.file.filename);
  res.json(toAccountResponse(updated));
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: err.message });
    return;
  }
  if (err && err.message) {
    res.status(400).json({ message: err.message });
    return;
  }
  next(err);
});

app.listen(PORT, () => {
  console.warn(`Account API running on http://localhost:${PORT}`);
});

