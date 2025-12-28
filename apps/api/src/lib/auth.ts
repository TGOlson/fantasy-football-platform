import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

// JWT token payload
export type JwtPayload = {
  userId: string;
  email: string;
};

// Lazy getter for JWT_SECRET (only check when needed, after env is loaded)
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

/**
 * Generate a JWT token for a user
 */
export function signToken(payload: JwtPayload): string {
  const secret = getJwtSecret();

  // TODO: this type is kind of wrong, it should be ms.StringValue but can't figure out how to import it
  const expiresIn = (process.env.JWT_EXPIRES_IN as `${number}`) || '7d';

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return decoded;
  } catch (_error) {
    return null;
  }
}

/**
 * Hash a password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
