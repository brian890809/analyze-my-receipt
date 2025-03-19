import { verifyToken } from '@/middleware/index';

export default async function handler(req, res) {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  try {
    await verifyToken(token);
    return res.status(200).json({ message: 'Authorized' });
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}