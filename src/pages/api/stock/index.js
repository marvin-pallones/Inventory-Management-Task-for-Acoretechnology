// pages/api/stock/index.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'stock.json');
  const jsonData = fs.readFileSync(filePath);
  let stock = JSON.parse(jsonData);

  if (req.method === 'GET') {
    res.status(200).json(stock);
  } else if (req.method === 'POST') {
    const newStock = req.body;
    newStock.id = stock.length ? Math.max(...stock.map(s => s.id)) + 1 : 1;
    stock.push(newStock);
    fs.writeFileSync(filePath, JSON.stringify(stock, null, 2));
    res.status(201).json(newStock);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

