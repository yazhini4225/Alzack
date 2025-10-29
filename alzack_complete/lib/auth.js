import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
export function signToken(payload){ return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }) }
export function verifyToken(token){ try{ return jwt.verify(token, JWT_SECRET) }catch(e){ return null } }
export async function hashPassword(p){ const s = await bcrypt.genSalt(10); return bcrypt.hash(p,s) }
export async function verifyPassword(p,h){ return bcrypt.compare(p,h) }
