import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';

export default function EditWarehouse() {
  const [warehouse, setWarehouse] = useState({ name: '', location: '', code: '' });
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetch(`/api/warehouses/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setWarehouse(data);
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    setWarehouse({ ...warehouse, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/warehouses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(warehouse),
    });
    if (res.ok) {
      router.push('/warehouses');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>Edit Warehouse</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <TextField margin="normal" required fullWidth label="Warehouse Code" name="code" value={warehouse.code} onChange={handleChange} />
          <TextField margin="normal" required fullWidth label="Warehouse Name" name="name" value={warehouse.name} onChange={handleChange} />
          <TextField margin="normal" required fullWidth label="Location" name="location" value={warehouse.location} onChange={handleChange} />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button type="submit" fullWidth variant="contained" color="primary">Update Warehouse</Button>
            <Button fullWidth variant="outlined" component={Link} href="/warehouses">Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
