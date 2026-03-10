import { useState, useEffect, useCallback } from 'react';
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
  TableSortLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { exportToCSV, exportToPDF } from '@/utils/export';

const columns = [
  { label: 'SKU', accessor: 'sku' },
  { label: 'Name', accessor: 'name' },
  { label: 'Category', accessor: 'category' },
  { label: 'Unit Cost', accessor: (r) => `$${r.unitCost.toFixed(2)}` },
  { label: 'Reorder Point', accessor: 'reorderPoint' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    fetchProducts();
  }, []);

  // Keyboard shortcut: Ctrl+N to add new product
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        window.location.href = '/products/add';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const fetchProducts = () => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  const categories = [...new Set(products.map(p => p.category))];

  const filtered = products
    .filter(p => {
      const matchesSearch = search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleClickOpen = (id) => {
    setSelectedProductId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProductId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${selectedProductId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((product) => product.id !== selectedProductId));
        handleClose();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">Products</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export CSV">
            <IconButton onClick={() => exportToCSV(filtered, columns, 'products')} aria-label="export CSV">
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export PDF">
            <IconButton onClick={() => exportToPDF(filtered, columns, 'products', 'Products Report')} aria-label="export PDF">
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" color="primary" component={Link} href="/products/add">
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
            sx={{ minWidth: 250 }}
            aria-label="Search products"
          />
          <TextField
            select
            size="small"
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel active={sortField === 'sku'} direction={sortField === 'sku' ? sortDir : 'asc'} onClick={() => handleSort('sku')}>
                  SKU
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'name'} direction={sortField === 'name' ? sortDir : 'asc'} onClick={() => handleSort('name')}>
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'category'} direction={sortField === 'category' ? sortDir : 'asc'} onClick={() => handleSort('category')}>
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel active={sortField === 'unitCost'} direction={sortField === 'unitCost' ? sortDir : 'asc'} onClick={() => handleSort('unitCost')}>
                  Unit Cost
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel active={sortField === 'reorderPoint'} direction={sortField === 'reorderPoint' ? sortDir : 'asc'} onClick={() => handleSort('reorderPoint')}>
                  Reorder Point
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell align="right">${product.unitCost.toFixed(2)}</TableCell>
                <TableCell align="right">{product.reorderPoint}</TableCell>
                <TableCell>
                  <Tooltip title="Edit product">
                    <IconButton color="primary" component={Link} href={`/products/edit/${product.id}`} size="small" aria-label={`Edit ${product.name}`}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete product">
                    <IconButton color="error" onClick={() => handleClickOpen(product.id)} size="small" aria-label={`Delete ${product.name}`}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {products.length === 0 ? 'No products available.' : 'No products match your filters.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this product? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
