import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
