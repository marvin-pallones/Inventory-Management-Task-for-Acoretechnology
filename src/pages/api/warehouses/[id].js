import { readJSON, writeJSON } from '@/lib/data';

export default function handler(req, res) {
  const { id } = req.query;
  let warehouses = readJSON('warehouses.json');

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
      writeJSON('warehouses.json', warehouses);
      res.status(200).json(warehouses[index]);
    } else {
      res.status(404).json({ message: 'Warehouse not found' });
    }
  } else if (req.method === 'DELETE') {
    const index = warehouses.findIndex((w) => w.id === parseInt(id));
    if (index !== -1) {
      warehouses.splice(index, 1);
      writeJSON('warehouses.json', warehouses);
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Warehouse not found' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
