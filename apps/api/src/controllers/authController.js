import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

function createToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' },
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export const signup = asyncHandler(async (request, response) => {
  const { name, email, password } = request.body || {};
  const fields = {};

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    fields.name = 'Name must be between 2 and 80 characters.';
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    fields.email = 'Enter a valid email address.';
  }

  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    fields.password = 'Password must be at least 8 characters.';
  }

  if (Object.keys(fields).length) {
    return response.status(400).json({ error: 'Check the highlighted fields.', fields });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: await bcrypt.hash(password, 12),
      },
    });

    return response.status(201).json({
      token: createToken(user.id),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return response.status(409).json({
        error: 'An account with this email already exists.',
      });
    }

    throw error;
  }
});

export const login = asyncHandler(async (request, response) => {
  const { email, password } = request.body || {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return response.status(400).json({ error: 'Enter your email and password.' });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ error: 'Email or password is incorrect.' });
  }

  return response.json({
    token: createToken(user.id),
    user: publicUser(user),
  });
});
