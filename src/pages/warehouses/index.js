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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = () => {
    fetch('/api/warehouses')
      .then((res) => res.json())
      .then((data) => setWarehouses(data));
  };

  const handleClickOpen = (id) => {
    setSelectedWarehouseId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedWarehouseId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/warehouses/${selectedWarehouseId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWarehouses(warehouses.filter((warehouse) => warehouse.id !== selectedWarehouseId));
        handleClose();
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Warehouses</Typography>
        <Button variant="contained" color="primary" component={Link} href="/warehouses/add">
          Add Warehouse
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell>{warehouse.code}</TableCell>
                <TableCell>{warehouse.name}</TableCell>
                <TableCell>{warehouse.location}</TableCell>
                <TableCell>
                  <IconButton color="primary" component={Link} href={`/warehouses/edit/${warehouse.id}`} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleClickOpen(warehouse.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {warehouses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No warehouses available.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Warehouse</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this warehouse? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
