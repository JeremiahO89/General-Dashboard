"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext"; // Adjust the import if needed

export default function Navbar() {
  const { user } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgb(48, 47, 47)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgb(0, 0, 0)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          <Typography
            variant="h6"
            fontWeight="bold"
            color="inherit"
            sx={{ letterSpacing: 2 }}
          >
            Dashboard
          </Typography>
        </Box>
        <Box>
          <Button component={Link} href="/" color="inherit" sx={{ mx: 1 }}>
            Home
          </Button>
          <Button component={Link} href="/plaid" color="inherit" sx={{ mx: 1 }}>
            plaid
          </Button>
          <Button component={Link} href="/budgeting" color="inherit" sx={{ mx: 1 }}>
            Budget
          </Button>
          <Button component={Link} href="/about" color="inherit" sx={{ mx: 1 }}>
            About
          </Button>
          {user ? (
            <Button component={Link} href="/login" color="inherit" sx={{ mx: 1 }}>
              Profile
            </Button>
          ) : (
            <Button component={Link} href="/login" color="inherit" sx={{ mx: 1 }}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
