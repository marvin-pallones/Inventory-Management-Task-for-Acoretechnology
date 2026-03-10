import fs from 'fs';
import path from 'path';

/**
 * ATOMIC TRANSFER APPROACH:
 *
 * To ensure data integrity, the transfer operation follows a "write-ahead" pattern:
 *
 * 1. Read current stock data into memory
 * 2. Validate the transfer (sufficient stock, valid warehouses/products)
 * 3. Create a transfer record with status "pending" and write it FIRST
 * 4. Compute the new stock state entirely in memory
 * 5. Write the updated stock file in a single atomic operation
 * 6. Update the transfer status to "completed"
 *
 * If the process crashes between steps 3 and 5, the transfer record exists as "pending"
 * but stock was never modified — no inconsistency. On recovery, pending transfers can be
 * retried or cancelled. The stock file is written in one fs.writeFileSync call, so it's
 * either fully written or not written at all (at the OS level for typical file sizes).
 *
 * This is the best we can do with JSON file storage. A real production system would use
 * database transactions (BEGIN/COMMIT/ROLLBACK).
 */

const dataDir = path.join(process.cwd(), 'data');
const transfersPath = path.join(dataDir, 'transfers.json');
const stockPath = path.join(dataDir, 'stock.json');
const productsPath = path.join(dataDir, 'products.json');
const warehousesPath = path.join(dataDir, 'warehouses.json');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const transfers = readJSON(transfersPath);
    return res.status(200).json(transfers);
  }

  if (req.method === 'POST') {
    const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = req.body;

    // Validation
    if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (fromWarehouseId === toWarehouseId) {
      return res.status(400).json({ message: 'Source and destination warehouses must be different' });
    }

    const transferQty = parseInt(quantity);
    if (isNaN(transferQty) || transferQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    // Validate product and warehouses exist
    const products = readJSON(productsPath);
    const warehouses = readJSON(warehousesPath);
    const product = products.find(p => p.id === parseInt(productId));
    const fromWarehouse = warehouses.find(w => w.id === parseInt(fromWarehouseId));
    const toWarehouse = warehouses.find(w => w.id === parseInt(toWarehouseId));

    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!fromWarehouse) return res.status(404).json({ message: 'Source warehouse not found' });
    if (!toWarehouse) return res.status(404).json({ message: 'Destination warehouse not found' });

    // Read stock and find the source record
    let stockData = readJSON(stockPath);
    const sourceStock = stockData.find(
      s => s.productId === parseInt(productId) && s.warehouseId === parseInt(fromWarehouseId)
    );

    if (!sourceStock || sourceStock.quantity < transferQty) {
      const available = sourceStock ? sourceStock.quantity : 0;
      return res.status(400).json({
        message: `Insufficient stock. Available: ${available}, Requested: ${transferQty}`,
      });
    }

    // Step 1: Create transfer record as "pending" (write-ahead)
    const transfers = readJSON(transfersPath);
    const transferId = transfers.length > 0 ? Math.max(...transfers.map(t => t.id)) + 1 : 1;
    const transfer = {
      id: transferId,
      productId: parseInt(productId),
      fromWarehouseId: parseInt(fromWarehouseId),
      toWarehouseId: parseInt(toWarehouseId),
      quantity: transferQty,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    transfers.push(transfer);
    writeJSON(transfersPath, transfers);

    // Step 2: Compute new stock state in memory
    // Deduct from source
    sourceStock.quantity -= transferQty;

    // Add to destination (create record if none exists)
    let destStock = stockData.find(
      s => s.productId === parseInt(productId) && s.warehouseId === parseInt(toWarehouseId)
    );

    if (destStock) {
      destStock.quantity += transferQty;
    } else {
      const newId = stockData.length > 0 ? Math.max(...stockData.map(s => s.id)) + 1 : 1;
      stockData.push({
        id: newId,
        productId: parseInt(productId),
        warehouseId: parseInt(toWarehouseId),
        quantity: transferQty,
      });
    }

    // Step 3: Write stock atomically (single write)
    writeJSON(stockPath, stockData);

    // Step 4: Mark transfer as completed
    transfer.status = 'completed';
    transfer.completedAt = new Date().toISOString();
    writeJSON(transfersPath, transfers);

    return res.status(201).json(transfer);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
