import CryptoJS from 'crypto-js'
const KEY = process.env.ENCRYPTION_KEY || '01234567890123456789012345678901'
export function encrypt(obj){ return CryptoJS.AES.encrypt(JSON.stringify(obj), KEY).toString() }
export function decrypt(cipher){ try{ const bytes = CryptoJS.AES.decrypt(cipher, KEY); const str = bytes.toString(CryptoJS.enc.Utf8); return JSON.parse(str) }catch(e){ return null } }
