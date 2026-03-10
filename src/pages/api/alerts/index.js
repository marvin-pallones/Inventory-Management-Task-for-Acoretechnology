import { readJSON, writeJSON } from '@/lib/data';

/**
 * REORDER QUANTITY FORMULA:
 *
 * ReorderQty = max(0, (reorderPoint + (dailyVelocity * leadTimeDays)) - currentTotalStock)
 *
 * Where:
 * - currentTotalStock: Sum of quantity across all warehouses for this product
 * - reorderPoint: The product's configured reorder threshold
 * - dailyVelocity: Average daily transfer volume for this product (units/day),
 *   calculated from transfer history over the last 30 days
 * - leadTimeDays: Configurable lead time (default 7 days) representing how long
 *   a reorder takes to arrive
 *
 * EDGE CASES:
 * - New products with no transfer history: velocity = 0, so reorder qty = reorderPoint - currentStock
 * - Zero velocity: Same as above, just bring stock up to reorder point
 * - Stock already above threshold: reorder qty = 0 (max with 0 prevents negative)
 */

function calculateAlerts(leadTimeDays = 7) {
  const products = readJSON('products.json');
  const stock = readJSON('stock.json');
  const transfers = readJSON('transfers.json');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentTransfers = transfers.filter(
    t => t.status === 'completed' && new Date(t.createdAt) >= thirtyDaysAgo
  );

  const velocityMap = {};
  recentTransfers.forEach(t => {
    if (!velocityMap[t.productId]) velocityMap[t.productId] = 0;
    velocityMap[t.productId] += t.quantity;
  });

  Object.keys(velocityMap).forEach(pid => {
    velocityMap[pid] = velocityMap[pid] / 30;
  });

  return products.map(product => {
    const productStock = stock.filter(s => s.productId === product.id);
    const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
    const dailyVelocity = velocityMap[product.id] || 0;

    const stockRatio = product.reorderPoint > 0 ? totalQuantity / product.reorderPoint : 999;

    let status;
    if (stockRatio <= 0.5) status = 'critical';
    else if (stockRatio <= 1.0) status = 'low';
    else if (stockRatio >= 3.0) status = 'overstocked';
    else status = 'adequate';

    const targetStock = product.reorderPoint + (dailyVelocity * leadTimeDays);
    const reorderQuantity = Math.max(0, Math.ceil(targetStock - totalQuantity));

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      currentStock: totalQuantity,
      reorderPoint: product.reorderPoint,
      status,
      stockRatio: parseFloat(stockRatio.toFixed(2)),
      dailyVelocity: parseFloat(dailyVelocity.toFixed(2)),
      leadTimeDays,
      reorderQuantity,
      warehouseBreakdown: productStock.map(s => ({
        warehouseId: s.warehouseId,
        quantity: s.quantity,
      })),
    };
  });
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const leadTime = parseInt(req.query.leadTime) || 7;
    const alerts = calculateAlerts(leadTime);

    const alertTracking = readJSON('alerts.json');
    const enriched = alerts.map(alert => {
      const tracked = alertTracking.find(a => a.productId === alert.productId);
      return {
        ...alert,
        acknowledged: tracked ? tracked.acknowledged : false,
        acknowledgedAt: tracked ? tracked.acknowledgedAt : null,
        lastOrderedAt: tracked ? tracked.lastOrderedAt : null,
      };
    });

    return res.status(200).json(enriched);
  }

  if (req.method === 'POST') {
    const { productId, action } = req.body;

    if (!productId || !action) {
      return res.status(400).json({ message: 'productId and action are required' });
    }

    const alertTracking = readJSON('alerts.json');
    const existingIdx = alertTracking.findIndex(a => a.productId === parseInt(productId));

    const entry = existingIdx >= 0
      ? alertTracking[existingIdx]
      : { productId: parseInt(productId), acknowledged: false, acknowledgedAt: null, lastOrderedAt: null };

    if (action === 'acknowledge') {
      entry.acknowledged = true;
      entry.acknowledgedAt = new Date().toISOString();
    } else if (action === 'order') {
      entry.lastOrderedAt = new Date().toISOString();
      entry.acknowledged = true;
      entry.acknowledgedAt = entry.acknowledgedAt || new Date().toISOString();
    } else if (action === 'reset') {
      entry.acknowledged = false;
      entry.acknowledgedAt = null;
    }

    if (existingIdx >= 0) {
      alertTracking[existingIdx] = entry;
    } else {
      alertTracking.push(entry);
    }

    writeJSON('alerts.json', alertTracking);
    return res.status(200).json(entry);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
