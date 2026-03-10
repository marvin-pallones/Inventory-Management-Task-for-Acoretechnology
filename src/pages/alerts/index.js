import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Snackbar,
  Tooltip,
  IconButton,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const statusConfig = {
  critical: { color: 'error', icon: <ErrorIcon fontSize="small" />, label: 'Critical' },
  low: { color: 'warning', icon: <WarningAmberIcon fontSize="small" />, label: 'Low Stock' },
  adequate: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Adequate' },
  overstocked: { color: 'info', icon: <InfoIcon fontSize="small" />, label: 'Overstocked' },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadTime, setLeadTime] = useState(7);
  const [filter, setFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAlerts = (lt) => {
    setLoading(true);
    fetch(`/api/alerts?leadTime=${lt}`)
      .then(r => r.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts(leadTime);
  }, [leadTime]);

  const handleAction = async (productId, action) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action }),
      });
      if (res.ok) {
        const actionLabels = { acknowledge: 'Alert acknowledged', order: 'Marked as ordered', reset: 'Alert reset' };
        setSnackbar({ open: true, message: actionLabels[action], severity: 'success' });
        fetchAlerts(leadTime);
      }
    } catch {
      setSnackbar({ open: true, message: 'Action failed', severity: 'error' });
    }
  };

  const filtered = filter === 'all'
    ? alerts
    : filter === 'action_needed'
      ? alerts.filter(a => (a.status === 'critical' || a.status === 'low') && !a.acknowledged)
      : alerts.filter(a => a.status === filter);

  const criticalCount = alerts.filter(a => a.status === 'critical').length;
  const lowCount = alerts.filter(a => a.status === 'low').length;
  const adequateCount = alerts.filter(a => a.status === 'adequate').length;
  const overstockedCount = alerts.filter(a => a.status === 'overstocked').length;

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
        Low Stock Alerts & Reorder
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Monitor inventory levels and manage reorder recommendations
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Critical', count: criticalCount, color: 'error.main', bgColor: 'error.lighter' },
          { label: 'Low Stock', count: lowCount, color: 'warning.main', bgColor: 'warning.lighter' },
          { label: 'Adequate', count: adequateCount, color: 'success.main', bgColor: 'success.lighter' },
          { label: 'Overstocked', count: overstockedCount, color: 'info.main', bgColor: 'info.lighter' },
        ].map((item) => (
          <Grid item xs={6} md={3} key={item.label}>
            <Card
              sx={{ cursor: 'pointer', border: filter === item.label.toLowerCase().replace(' ', '_') ? 2 : 0, borderColor: item.color }}
              onClick={() => setFilter(prev => prev === item.label.toLowerCase().replace(' stock', '') ? 'all' : item.label.toLowerCase().replace(' stock', ''))}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" fontWeight={700} sx={{ color: item.color }}>
                  {item.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">All Products</MenuItem>
              <MenuItem value="action_needed">Action Needed</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="low">Low Stock</MenuItem>
              <MenuItem value="adequate">Adequate</MenuItem>
              <MenuItem value="overstocked">Overstocked</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Lead Time (days)"
              type="number"
              inputProps={{ min: 1, max: 90 }}
              value={leadTime}
              onChange={(e) => setLeadTime(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Alert severity="info" sx={{ py: 0.5 }}>
              Showing {filtered.length} of {alerts.length} products
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Current Stock</TableCell>
              <TableCell align="right">Reorder Point</TableCell>
              <TableCell align="right">
                <Tooltip title="Average daily units transferred (last 30 days)">
                  <span>Velocity/Day</span>
                </Tooltip>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Recommended reorder quantity based on reorder point, velocity, and lead time">
                  <span>Reorder Qty</span>
                </Tooltip>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((alert) => {
              const config = statusConfig[alert.status];
              return (
                <TableRow key={alert.productId}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{alert.productName}</Typography>
                    <Typography variant="caption" color="text.secondary">{alert.sku}</Typography>
                  </TableCell>
                  <TableCell>{alert.category}</TableCell>
                  <TableCell align="right">
                    <Typography
                      fontWeight={alert.status === 'critical' ? 700 : 400}
                      color={alert.status === 'critical' ? 'error' : 'inherit'}
                    >
                      {alert.currentStock.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{alert.reorderPoint.toLocaleString()}</TableCell>
                  <TableCell align="right">{alert.dailyVelocity.toFixed(1)}</TableCell>
                  <TableCell align="right">
                    {alert.reorderQuantity > 0 ? (
                      <Chip label={alert.reorderQuantity.toLocaleString()} color="warning" size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={config.icon}
                      label={config.label}
                      color={config.color}
                      size="small"
                      variant="outlined"
                    />
                    {alert.acknowledged && (
                      <Chip label="Ack" size="small" sx={{ ml: 0.5 }} />
                    )}
                    {alert.lastOrderedAt && (
                      <Chip label="Ordered" color="primary" size="small" sx={{ ml: 0.5 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {(alert.status === 'critical' || alert.status === 'low') && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {!alert.acknowledged && (
                          <Tooltip title="Acknowledge alert">
                            <IconButton size="small" color="primary" onClick={() => handleAction(alert.productId, 'acknowledge')}>
                              <DoneAllIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Mark as ordered">
                          <IconButton size="small" color="success" onClick={() => handleAction(alert.productId, 'order')}>
                            <ShoppingCartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {alert.acknowledged && (
                          <Tooltip title="Reset alert">
                            <IconButton size="small" color="warning" onClick={() => handleAction(alert.productId, 'reset')}>
                              <RestartAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No alerts matching the current filter</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formula Documentation */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Reorder Quantity Formula</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', mb: 1 }}>
          ReorderQty = max(0, (ReorderPoint + DailyVelocity x LeadTimeDays) - CurrentStock)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Daily Velocity</strong> is calculated from the average daily transfer volume over the last 30 days.
          For new products with no transfer history, velocity defaults to 0, so the formula simply brings stock up to the reorder point.
          The lead time (currently {leadTime} days) accounts for how long a reorder takes to arrive, ensuring coverage during the waiting period.
        </Typography>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
