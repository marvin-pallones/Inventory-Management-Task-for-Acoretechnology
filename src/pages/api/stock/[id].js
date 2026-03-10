import { readJSON, writeJSON } from '@/lib/data';

export default function handler(req, res) {
  const { id } = req.query;
  let stock = readJSON('stock.json');

  if (req.method === 'GET') {
    const stockItem = stock.find((s) => s.id === parseInt(id));
    if (stockItem) {
      res.status(200).json(stockItem);
    } else {
      res.status(404).json({ message: 'Stock item not found' });
    }
  } else if (req.method === 'PUT') {
    const index = stock.findIndex((s) => s.id === parseInt(id));
    if (index !== -1) {
      stock[index] = { ...stock[index], ...req.body, id: parseInt(id) };
      writeJSON('stock.json', stock);
      res.status(200).json(stock[index]);
    } else {
      res.status(404).json({ message: 'Stock item not found' });
    }
  } else if (req.method === 'DELETE') {
    const index = stock.findIndex((s) => s.id === parseInt(id));
    if (index !== -1) {
      stock.splice(index, 1);
      writeJSON('stock.json', stock);
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Stock item not found' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
