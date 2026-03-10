// pages/api/warehouses/[id].js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { id } = req.query;
  const filePath = path.join(process.cwd(), 'data', 'warehouses.json');
  const jsonData = fs.readFileSync(filePath);
  let warehouses = JSON.parse(jsonData);

  if (req.method === 'GET') {
    const warehouse = warehouses.find((w) => w.id === parseInt(id));
    if (warehouse) {
      res.status(200).json(warehouse);
    } else {
      res.status(404).json({ message: 'Warehouse not found' });
    }
  } else if (req.method === 'PUT') {
    const index = warehouses.findIndex((w) => w.id === parseInt(id));
    if (index !== -1) {
      warehouses[index] = { ...warehouses[index], ...req.body, id: parseInt(id) };
      fs.writeFileSync(filePath, JSON.stringify(warehouses, null, 2));
      res.status(200).json(warehouses[index]);
    } else {
      res.status(404).json({ message: 'Warehouse not found' });
    }
  } else if (req.method === 'DELETE') {
    const index = warehouses.findIndex((w) => w.id === parseInt(id));
    if (index !== -1) {
      warehouses.splice(index, 1);
      fs.writeFileSync(filePath, JSON.stringify(warehouses, null, 2));
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Warehouse not found' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

