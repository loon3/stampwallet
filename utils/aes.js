import crypto from 'crypto'

const algorithm = 'aes-256-ecb'

// Encrypt function
export function encrypt(text, key) {
  const cipher = crypto.createCipheriv(algorithm, key.substring(0, 32), null) // Note: null is used as the IV in ECB mode
  let encrypted = cipher.update(text, 'hex', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

// Decrypt function
export function decrypt(encrypted, key) {
  const decipher = crypto.createDecipheriv(algorithm, key.substring(0, 32), null)
  let decrypted = decipher.update(encrypted, 'hex', 'hex')
  decrypted += decipher.final('hex')
  return decrypted
}
