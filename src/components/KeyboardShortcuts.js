import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Chip,
  Box,
} from '@mui/material';

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Show keyboard shortcuts' },
  { keys: ['G', 'D'], description: 'Go to Dashboard' },
  { keys: ['G', 'P'], description: 'Go to Products' },
  { keys: ['G', 'W'], description: 'Go to Warehouses' },
  { keys: ['G', 'S'], description: 'Go to Stock Levels' },
  { keys: ['G', 'T'], description: 'Go to Transfers' },
  { keys: ['G', 'A'], description: 'Go to Alerts' },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const [pendingG, setPendingG] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let gTimeout;

    const handler = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      // Ctrl+K: Show shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        return;
      }

      // G + key navigation
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        setPendingG(true);
        clearTimeout(gTimeout);
        gTimeout = setTimeout(() => setPendingG(false), 1000);
        return;
      }

      if (pendingG) {
        setPendingG(false);
        clearTimeout(gTimeout);
        const navMap = { d: '/', p: '/products', w: '/warehouses', s: '/stock', t: '/transfers', a: '/alerts' };
        if (navMap[e.key]) {
          e.preventDefault();
          router.push(navMap[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(gTimeout);
    };
  }, [pendingG, router]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Keyboard Shortcuts</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableBody>
            {shortcuts.map((s, i) => (
              <TableRow key={i}>
                <TableCell sx={{ border: 0 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {s.keys.map((k, j) => (
                      <span key={j}>
                        <Chip label={k} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
                        {j < s.keys.length - 1 && <Typography component="span" variant="body2" sx={{ mx: 0.3 }}>+</Typography>}
                      </span>
                    ))}
                  </Box>
                </TableCell>
                <TableCell sx={{ border: 0 }}>
                  <Typography variant="body2">{s.description}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
