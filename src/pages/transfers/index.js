import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SendIcon from '@mui/icons-material/Send';

export default function Transfers() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
      fetch('/api/stock').then(r => r.json()),
      fetch('/api/transfers').then(r => r.json()),
    ]).then(([p, w, s, t]) => {
      setProducts(p);
      setWarehouses(w);
      setStock(s);
      setTransfers(t);
      setLoading(false);
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getAvailableStock = () => {
    if (!form.productId || !form.fromWarehouseId) return null;
    const record = stock.find(
      s => s.productId === parseInt(form.productId) && s.warehouseId === parseInt(form.fromWarehouseId)
    );
    return record ? record.quantity : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setSnackbar({ open: true, message: 'Transfer completed successfully!', severity: 'success' });
        setForm({ productId: '', fromWarehouseId: '', toWarehouseId: '', quantity: '', notes: '' });
        fetchData();
      } else {
        setSnackbar({ open: true, message: data.message || 'Transfer failed', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Network error. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getProductName = (id) => {
    const p = products.find(pr => pr.id === id);
    return p ? p.name : 'Unknown';
  };

  const getWarehouseName = (id) => {
    const w = warehouses.find(wh => wh.id === id);
    return w ? w.name : 'Unknown';
  };

  const available = getAvailableStock();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Stock Transfers
      </Typography>

      <Grid container spacing={3}>
        {/* Transfer Form */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SwapHorizIcon color="primary" />
              <Typography variant="h6">New Transfer</Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                select
                label="Product"
                name="productId"
                value={form.productId}
                onChange={handleChange}
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name} ({p.sku})</MenuItem>
                ))}
              </TextField>

              <TextField
                margin="normal"
                required
                fullWidth
                select
                label="From Warehouse"
                name="fromWarehouseId"
                value={form.fromWarehouseId}
                onChange={handleChange}
              >
                {warehouses.map((w) => (
                  <MenuItem key={w.id} value={w.id}>{w.name} ({w.code})</MenuItem>
                ))}
              </TextField>

              <TextField
                margin="normal"
                required
                fullWidth
                select
                label="To Warehouse"
                name="toWarehouseId"
                value={form.toWarehouseId}
                onChange={handleChange}
              >
                {warehouses
                  .filter(w => w.id !== parseInt(form.fromWarehouseId))
                  .map((w) => (
                    <MenuItem key={w.id} value={w.id}>{w.name} ({w.code})</MenuItem>
                  ))}
              </TextField>

              {available !== null && (
                <Alert severity={available > 0 ? 'info' : 'warning'} sx={{ mt: 1 }}>
                  Available stock at source: <strong>{available}</strong> units
                </Alert>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                inputProps={{ min: 1, max: available || undefined }}
                value={form.quantity}
                onChange={handleChange}
                error={available !== null && parseInt(form.quantity) > available}
                helperText={
                  available !== null && parseInt(form.quantity) > available
                    ? 'Exceeds available stock'
                    : ''
                }
              />

              <TextField
                margin="normal"
                fullWidth
                label="Notes (optional)"
                name="notes"
                multiline
                rows={2}
                value={form.notes}
                onChange={handleChange}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting || !form.productId || !form.fromWarehouseId || !form.toWarehouseId || !form.quantity}
                startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ mt: 2 }}
              >
                {submitting ? 'Processing...' : 'Execute Transfer'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Transfer History */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Transfer History</Typography>
            <Divider sx={{ mb: 2 }} />
            {transfers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SwapHorizIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">No transfers yet</Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>To</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...transfers].reverse().map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          {new Date(t.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>{getProductName(t.productId)}</TableCell>
                        <TableCell>{getWarehouseName(t.fromWarehouseId)}</TableCell>
                        <TableCell>{getWarehouseName(t.toWarehouseId)}</TableCell>
                        <TableCell align="right">{t.quantity}</TableCell>
                        <TableCell>
                          <Chip
                            label={t.status}
                            color={t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
