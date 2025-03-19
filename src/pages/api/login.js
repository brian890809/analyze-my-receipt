import { loginUser } from '@/controllers/firebase-auth-controller';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await loginUser(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}