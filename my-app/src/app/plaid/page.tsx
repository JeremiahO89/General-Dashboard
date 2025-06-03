"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { usePlaidLink } from "react-plaid-link";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

const getToken = () => localStorage.getItem("token");

export default function BankLinker() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[] | null>(null);
  const [institutions, setInstitutions] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  const getInstitutionName = async (id: string) => {
    if (institutions[id]) return institutions[id];
    try {
      const { data } = await api.get(`/plaid/institution/info?institution_id=${id}`);
      setInstitutions(prev => ({ ...prev, [id]: data.name }));
      return data.name;
    } catch {
      return id;
    }
  };

  const loadAccounts = async () => {
    try {
      const { data:balances } = await api.get("/plaid/balances/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data:account_data } = await api.get("/plaid/accounts/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      for (const acct of balances) {
        const matchingAccount = account_data.find(
          (a: any) => a.item_id === acct.item_id
        );

        if (matchingAccount?.institution_id) {
          await getInstitutionName(matchingAccount.institution_id);
        }
      }

      setAccounts(balances);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const createLinkToken = async () => {
    try {
      const { data } = await api.post("/plaid/create_link_token", null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLinkToken(data.link_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const handleSuccess = async (public_token: string) => {
    try {
      await api.post("/plaid/exchange_public_token", { public_token }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await api.post("/plaid/balances/update_all", null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadAccounts();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: handleSuccess,
    onExit: (err) => err && setError(`Plaid exited: ${err.display_message || err.error_message}`),
  });

  useEffect(() => {
    if (token) {
      loadAccounts();
      createLinkToken();
    }
  }, [token]);

  if (!token) {
    return (
      <Box p={4}>
        <Typography>Please log in to connect bank accounts.</Typography>
        <Button variant="contained" onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" minHeight="100vh" p={2} bgcolor="#e0f7fa">
      <Paper sx={{ p: 4, width: 720 }}>
        <Box textAlign="center" mb={3}>
          <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 1 }}>
            <AccountBalanceIcon />
          </Avatar>
          <Typography variant="h5">Connect Your Bank</Typography>
        </Box>

        {error && <Typography color="error">{error}</Typography>}

        <Button onClick={open} disabled={!ready || !linkToken} variant="contained" fullWidth sx={{ mb: 3 }}>
          {ready ? "Link a Bank Account" : <CircularProgress size={20} />}
        </Button>

        {accounts?.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bank</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map(acct => (
                <TableRow key={acct.account_id}>
                  <TableCell>{institutions[acct.institution_id] || "Unknown"}</TableCell>
                  <TableCell>{acct.subtype}</TableCell>
                  <TableCell>${acct.current?.toFixed(2) ?? "0.00"}</TableCell>
                  <TableCell>{acct.last_updated ? new Date(acct.last_updated).toLocaleString() : ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
