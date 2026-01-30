import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
}

export function generateSessionToken(): string {
    return uuidv4();
}

export function signJwt(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); // Short lived
}

export function verifyJwt(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}
