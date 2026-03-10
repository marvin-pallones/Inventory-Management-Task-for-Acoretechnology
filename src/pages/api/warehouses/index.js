import { readJSON, writeJSON } from '@/lib/data';

export default function handler(req, res) {
  let warehouses = readJSON('warehouses.json');

  if (req.method === 'GET') {
    res.status(200).json(warehouses);
  } else if (req.method === 'POST') {
    const newWarehouse = req.body;
    newWarehouse.id = warehouses.length ? Math.max(...warehouses.map(w => w.id)) + 1 : 1;
    warehouses.push(newWarehouse);
    writeJSON('warehouses.json', warehouses);
    res.status(201).json(newWarehouse);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
