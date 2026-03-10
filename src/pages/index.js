import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Skeleton,
  Button,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

const CHART_COLORS = ['#2e7d32', '#00897b', '#43a047', '#66bb6a', '#a5d6a7', '#1b5e20'];

function KpiCard({ icon, title, value, subtitle, color = 'primary.main' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.9,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      }),
      fetch('/api/warehouses').then(res => {
        if (!res.ok) throw new Error('Failed to fetch warehouses');
        return res.json();
      }),
      fetch('/api/stock').then(res => {
        if (!res.ok) throw new Error('Failed to fetch stock');
        return res.json();
      }),
    ])
      .then(([productsData, warehousesData, stockData]) => {
        setProducts(productsData);
        setWarehouses(warehousesData);
        setStock(stockData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading dashboard data: {error}
      </Alert>
    );
  }

  // Calculate metrics
  const totalValue = stock.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.unitCost * item.quantity : 0);
  }, 0);

  const totalUnits = stock.reduce((sum, s) => sum + s.quantity, 0);

  const inventoryOverview = products.map(product => {
    const productStock = stock.filter(s => s.productId === product.id);
    const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
    const stockRatio = product.reorderPoint > 0 ? totalQuantity / product.reorderPoint : 999;
    let status = 'adequate';
    if (stockRatio <= 0.5) status = 'critical';
    else if (stockRatio <= 1) status = 'low';
    else if (stockRatio >= 3) status = 'overstocked';
    return { ...product, totalQuantity, status, stockRatio };
  });

  const lowStockCount = inventoryOverview.filter(i => i.status === 'critical' || i.status === 'low').length;

  // Chart data: stock by warehouse
  const warehouseChartData = warehouses.map(wh => {
    const whStock = stock.filter(s => s.warehouseId === wh.id);
    const totalQty = whStock.reduce((sum, s) => sum + s.quantity, 0);
    const totalVal = whStock.reduce((sum, s) => {
      const p = products.find(pr => pr.id === s.productId);
      return sum + (p ? p.unitCost * s.quantity : 0);
    }, 0);
    return { name: wh.name.split(' ')[0], units: totalQty, value: parseFloat(totalVal.toFixed(2)) };
  });

  // Category breakdown for pie chart
  const categoryMap = {};
  inventoryOverview.forEach(item => {
    if (!categoryMap[item.category]) categoryMap[item.category] = 0;
    categoryMap[item.category] += item.totalQuantity;
  });
  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const statusColor = {
    critical: 'error',
    low: 'warning',
    adequate: 'success',
    overstocked: 'info',
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>Dashboard</Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Grid item xs={12} sm={6} md={i <= 3 ? 4 : 6} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}><Skeleton variant="rounded" height={300} /></Grid>
          <Grid item xs={12} md={4}><Skeleton variant="rounded" height={300} /></Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            GreenSupply Co. Inventory Overview
          </Typography>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            icon={<CategoryIcon sx={{ color: 'white', fontSize: 28 }} />}
            title="Total Products"
            value={products.length}
            subtitle={`${new Set(products.map(p => p.category)).size} categories`}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            icon={<WarehouseIcon sx={{ color: 'white', fontSize: 28 }} />}
            title="Warehouses"
            value={warehouses.length}
            subtitle="Active locations"
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            icon={<AttachMoneyIcon sx={{ color: 'white', fontSize: 28 }} />}
            title="Total Inventory Value"
            value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${totalUnits.toLocaleString()} total units`}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <KpiCard
            icon={<InventoryIcon sx={{ color: 'white', fontSize: 28 }} />}
            title="Total Stock Units"
            value={totalUnits.toLocaleString()}
            subtitle={`Across ${warehouses.length} warehouses`}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <KpiCard
            icon={<WarningAmberIcon sx={{ color: 'white', fontSize: 28 }} />}
            title="Low Stock Alerts"
            value={lowStockCount}
            subtitle={lowStockCount > 0 ? 'Products need attention' : 'All products stocked'}
            color={lowStockCount > 0 ? 'warning.main' : 'success.main'}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Inventory by Warehouse</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warehouseChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#2e7d32" />
                <YAxis yAxisId="right" orientation="right" stroke="#00897b" />
                <Tooltip formatter={(value, name) => [name === 'value' ? `$${value.toLocaleString()}` : value.toLocaleString(), name === 'value' ? 'Value' : 'Units']} />
                <Legend />
                <Bar yAxisId="left" dataKey="units" fill="#2e7d32" name="Units" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="value" fill="#00897b" name="Value ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Stock by Category</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Inventory Overview Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Inventory Overview</Typography>
          <Button variant="outlined" size="small" component={Link} href="/alerts">
            View Alerts
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Total Stock</TableCell>
                <TableCell align="right">Reorder Point</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell>Stock Level</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryOverview.map((item) => {
                const fillPercent = Math.min((item.totalQuantity / (item.reorderPoint * 3)) * 100, 100);
                const itemValue = item.totalQuantity * item.unitCost;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{item.sku}</Typography>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">{item.totalQuantity.toLocaleString()}</TableCell>
                    <TableCell align="right">{item.reorderPoint.toLocaleString()}</TableCell>
                    <TableCell align="right">${itemValue.toFixed(2)}</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <LinearProgress
                        variant="determinate"
                        value={fillPercent}
                        color={item.status === 'critical' ? 'error' : item.status === 'low' ? 'warning' : 'success'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        color={statusColor[item.status]}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
