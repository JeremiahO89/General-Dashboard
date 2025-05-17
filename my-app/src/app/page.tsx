import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from 'next/link';

export default function Home() {
  return (
    <Box component="main" flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
      <Typography variant="h3" fontWeight="bold" mb={2}>
        Welcome to your Dashboard
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Use the navigation above to explore the app.
      </Typography>
    </Box>
  );
}
