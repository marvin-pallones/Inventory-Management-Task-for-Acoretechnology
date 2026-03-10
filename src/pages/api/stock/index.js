import { readJSON, writeJSON } from '@/lib/data';

export default function handler(req, res) {
  let stock = readJSON('stock.json');

  if (req.method === 'GET') {
    res.status(200).json(stock);
  } else if (req.method === 'POST') {
    const newStock = req.body;
    newStock.id = stock.length ? Math.max(...stock.map(s => s.id)) + 1 : 1;
    stock.push(newStock);
    writeJSON('stock.json', stock);
    res.status(201).json(newStock);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
