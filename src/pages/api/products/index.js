import { readJSON, writeJSON } from '@/lib/data';

export default function handler(req, res) {
  let products = readJSON('products.json');

  if (req.method === 'GET') {
    res.status(200).json(products);
  } else if (req.method === 'POST') {
    const newProduct = req.body;
    newProduct.id = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push(newProduct);
    writeJSON('products.json', products);
    res.status(201).json(newProduct);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
