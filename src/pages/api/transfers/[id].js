import { readJSON } from '@/lib/data';

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const transfers = readJSON('transfers.json');
    const transfer = transfers.find(t => t.id === parseInt(id));
    if (transfer) {
      return res.status(200).json(transfer);
    }
    return res.status(404).json({ message: 'Transfer not found' });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
