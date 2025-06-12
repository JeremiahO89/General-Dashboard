"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

function LinkTab(props: any) {
  // MUI Tab + Next.js Link wrapper
  return <Tab component={Link} {...props} />;
}

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const showPlaidSubheader = pathname?.startsWith("/plaid");

const tabs = [
  { label: "Accounts", href: "/plaid" },
  { label: "Metrics", href: "/plaid/metrics" },  
  { label: "Transactions", href: "/plaid/transactions" },
  { label: "History", href: "/plaid/history" },
];

  // Determine which tab is active by pathname
  const currentTabIndex = tabs.findIndex((tab) => tab.href === pathname);

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: "#121212",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #222",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 2, sm: 4 },
          py: 1,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          color="primary.main"
          sx={{ letterSpacing: 3, cursor: "default" }}
        >
          Dashboard
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            component={Link}
            href="/"
            color="inherit"
            sx={{ textTransform: "none", fontWeight: "600" }}
          >
            Home
          </Button>
          <Button
            component={Link}
            href="/plaid"
            color="inherit"
            sx={{ textTransform: "none", fontWeight: "600" }}
          >
            Plaid
          </Button>
          <Button
            component={Link}
            href="/budgeting"
            color="inherit"
            sx={{ textTransform: "none", fontWeight: "600" }}
          >
            Budget
          </Button>
          <Button
            component={Link}
            href="/about"
            color="inherit"
            sx={{ textTransform: "none", fontWeight: "600" }}
          >
            About
          </Button>
          {user ? (
            <Button
              component={Link}
              href="/login"
              color="secondary"
              variant="outlined"
              sx={{ textTransform: "none", fontWeight: "600" }}
            >
              Profile
            </Button>
          ) : (
            <Button
              component={Link}
              href="/login"
              color="secondary"
              variant="contained"
              sx={{ textTransform: "none", fontWeight: "600" }}
            >
              Login
            </Button>
          )}
        </Stack>
      </Toolbar>

      {showPlaidSubheader && (
        <Tabs
          value={currentTabIndex === -1 ? false : currentTabIndex}
          centered
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            bgcolor: "#1e1e1e",
            minHeight: 40,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "600",
              fontSize: "0.9rem",
              px: 3,
            },
          }}
        >
          {tabs.map(({ label, href }) => (
            <LinkTab key={href} label={label} href={href} />
          ))}
        </Tabs>
      )}
    </AppBar>
  );
}
