import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { id } = req.query;
  const filePath = path.join(process.cwd(), 'data', 'transfers.json');
  const transfers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (req.method === 'GET') {
    const transfer = transfers.find(t => t.id === parseInt(id));
    if (transfer) {
      return res.status(200).json(transfer);
    }
    return res.status(404).json({ message: 'Transfer not found' });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
