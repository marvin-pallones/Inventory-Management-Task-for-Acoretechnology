// pages/api/stock/[id].js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { id } = req.query;
  const filePath = path.join(process.cwd(), 'data', 'stock.json');
  const jsonData = fs.readFileSync(filePath);
  let stock = JSON.parse(jsonData);

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
      fs.writeFileSync(filePath, JSON.stringify(stock, null, 2));
      res.status(200).json(stock[index]);
    } else {
      res.status(404).json({ message: 'Stock item not found' });
    }
  } else if (req.method === 'DELETE') {
    const index = stock.findIndex((s) => s.id === parseInt(id));
    if (index !== -1) {
      stock.splice(index, 1);
      fs.writeFileSync(filePath, JSON.stringify(stock, null, 2));
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Stock item not found' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

