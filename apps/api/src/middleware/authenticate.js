import jwt from 'jsonwebtoken';

export function authenticate(request, response, next) {
  const [scheme, token] = (request.get('authorization') || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ error: 'Sign in to continue.' });
  }

  try {
    request.userId = jwt.verify(token, process.env.JWT_SECRET).sub;
    return next();
  } catch {
    return response.status(401).json({
      error: 'Your session has expired. Please sign in again.',
    });
  }
}
