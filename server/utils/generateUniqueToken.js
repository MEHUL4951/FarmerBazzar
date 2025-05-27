import crypto from 'crypto';

function generateToken() {
  const length = 32;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  while (token.length < length) {
    const byte = crypto.randomBytes(1)[0];
    const index = byte % chars.length;
    token += chars.charAt(index);
  }
  return token;
}

export default generateToken;
