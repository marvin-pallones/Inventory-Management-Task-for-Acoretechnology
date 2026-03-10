import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  TextField,
  MenuItem,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { exportToCSV, exportToPDF } from '@/utils/export';

export default function Stock() {
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/stock').then(res => res.json()),
      fetch('/api/products').then(res => res.json()),
      fetch('/api/warehouses').then(res => res.json()),
    ]).then(([stockData, productsData, warehousesData]) => {
      setStock(stockData);
      setProducts(productsData);
      setWarehouses(warehousesData);
    });
  };

  const getProduct = (productId) => products.find(p => p.id === productId);
  const getWarehouse = (warehouseId) => warehouses.find(w => w.id === warehouseId);

  const getProductName = (productId) => {
    const product = getProduct(productId);
    return product ? `${product.name} (${product.sku})` : 'Unknown';
  };

  const getWarehouseName = (warehouseId) => {
    const warehouse = getWarehouse(warehouseId);
    return warehouse ? `${warehouse.name} (${warehouse.code})` : 'Unknown';
  };

  const filtered = stock.filter(item => {
    const product = getProduct(item.productId);
    const matchesSearch = search === '' ||
      (product && (product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())));
    const matchesWarehouse = warehouseFilter === 'all' || item.warehouseId === parseInt(warehouseFilter);
    return matchesSearch && matchesWarehouse;
  });

  const exportColumns = [
    { label: 'Product', accessor: (r) => getProductName(r.productId) },
    { label: 'Warehouse', accessor: (r) => getWarehouseName(r.warehouseId) },
    { label: 'Quantity', accessor: 'quantity' },
  ];

  const handleClickOpen = (id) => {
    setSelectedStockId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStockId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/stock/${selectedStockId}`, { method: 'DELETE' });
      if (res.ok) {
        setStock(stock.filter((item) => item.id !== selectedStockId));
        handleClose();
      }
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">Stock Levels</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export CSV">
            <IconButton onClick={() => exportToCSV(filtered, exportColumns, 'stock-levels')} aria-label="export CSV">
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export PDF">
            <IconButton onClick={() => exportToPDF(filtered, exportColumns, 'stock-levels', 'Stock Levels Report')} aria-label="export PDF">
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" color="primary" component={Link} href="/stock/add">
            Add Stock Record
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search by product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ minWidth: 250 }}
            aria-label="Search stock"
          />
          <TextField
            select
            size="small"
            label="Warehouse"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Warehouses</MenuItem>
            {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </TextField>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{getProductName(item.productId)}</TableCell>
                <TableCell>{getWarehouseName(item.warehouseId)}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton color="primary" component={Link} href={`/stock/edit/${item.id}`} size="small" aria-label="Edit stock record">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleClickOpen(item.id)} size="small" aria-label="Delete stock record">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {stock.length === 0 ? 'No stock records available.' : 'No records match your filters.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Stock Record</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this stock record? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
