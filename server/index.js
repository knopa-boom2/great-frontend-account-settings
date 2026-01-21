const cors = require('cors');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { z } = require('zod');

const {
  getAccount,
  updateAccount,
  updateAvatar,
  isUsernameUnique,
} = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const DEFAULT_AVATAR_FILENAME = 'default-avatar.jpg';

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
    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Only PNG and JPG uploads are allowed.'));
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
    : `http://localhost:${PORT}/uploads/${DEFAULT_AVATAR_FILENAME}`;

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

// check the uniqueness of the username
app.get('/api/account/username', (req, res) => {
  const value =
    typeof req.query.value === 'string' ? req.query.value.trim() : '';
  if (!value) {
    res.status(400).json({ message: 'Username value is required.' });
    return;
  }

  res.json({ unique: isUsernameUnique(value) });
});

app.put('/api/account', (req, res) => {
  const result = accountSchema.safeParse(req.body);
  if (!result.success) {
    const fieldMessageOverrides = {
      firstName: 'Only alphanumeric format is supported',
      lastName: 'Only alphanumeric format is supported',
      email: 'Valid email format is required',
      username: 'Alphanumeric without spaces and must be unique (case insensitive)',
    };

    res.status(400).json({
      message: 'Invalid account data.',
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message:
          fieldMessageOverrides[issue.path[0]] ??
          issue.message,
      })),
    });
    return;
  }

  if (!isUsernameUnique(result.data.username)) {
    res.status(409).json({
      message: 'Alphanumeric without spaces and must be unique (case insensitive)',
    });
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
  res.json({ avatarUrl: toAccountResponse(updated).avatarUrl });
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
