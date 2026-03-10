// pages/api/warehouses/index.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'warehouses.json');
  const jsonData = fs.readFileSync(filePath);
  let warehouses = JSON.parse(jsonData);

  if (req.method === 'GET') {
    res.status(200).json(warehouses);
  } else if (req.method === 'POST') {
    const newWarehouse = req.body;
    newWarehouse.id = warehouses.length ? Math.max(...warehouses.map(w => w.id)) + 1 : 1;
    warehouses.push(newWarehouse);
    fs.writeFileSync(filePath, JSON.stringify(warehouses, null, 2));
    res.status(201).json(newWarehouse);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

