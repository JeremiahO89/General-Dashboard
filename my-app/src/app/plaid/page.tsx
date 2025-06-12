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
import { loadUserAccounts } from "./bank_loader";

import type {
  CreateLinkTokenResponse,
  ExchangeTokenResponse,
} from "@/types/types";

type CompiledBalance = {
  bankName: string;
  accountType: string;
  balance: number;
  dateCreated: string;
};

const getToken = () => localStorage.getItem("token");

export default function BankLinker() {
  const router = useRouter();
  const token = getToken();

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<CompiledBalance[] | null>(null);
  const [institutions, setInstitutions] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [updatingBalances, setUpdatingBalances] = useState(false);

  const createLinkToken = async () => {
    try {
      const { data } = await api.post<CreateLinkTokenResponse>(
        "/plaid/create_link_token",
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLinkToken(data.link_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const updateBalances = async () => {
    setUpdatingBalances(true);
    setError(null);
    try {
      await api.post(
        "/plaid/balances/update_all",
        null,
        {
          params: { force: forceUpdate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await loadUserAccounts(token!, setAccounts, setInstitutions, setError, institutions);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setUpdatingBalances(false);
    }
  };

  const handleSuccess = async (public_token: string) => {
    try {
      await api.post<ExchangeTokenResponse>(
        "/plaid/exchange_public_token",
        { public_token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await api.post("/plaid/balances/update_all", null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadUserAccounts(token!, setAccounts, setInstitutions, setError, institutions);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: handleSuccess,
    onExit: (err) =>
      err && setError(`Plaid exited: ${err.display_message || err.error_message}`),
  });

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready]);

  const handleButtonClick = async () => {
    await createLinkToken();
  };

  useEffect(() => {
    if (token) {
      loadUserAccounts(token, setAccounts, setInstitutions, setError, institutions);
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

        <Button
          onClick={handleButtonClick}
          disabled={!token}
          variant="contained"
          fullWidth
          sx={{ mb: 3 }}
        >
          Link a Bank Account
        </Button>

        {accounts && accounts.length > 0 && (
          <>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Button
                onClick={updateBalances}
                disabled={updatingBalances}
                variant="outlined"
              >
                {updatingBalances ? <CircularProgress size={20} /> : "Refresh Balances"}
              </Button>
              <label>
                <input
                  type="checkbox"
                  checked={forceUpdate}
                  onChange={(e) => setForceUpdate(e.target.checked)}
                  style={{ marginRight: "0.5rem" }}
                />
                Force update
              </label>
            </Box>

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
                {accounts.map((acct, index) => (
                  <TableRow key={index}>
                    <TableCell>{acct.bankName}</TableCell>
                    <TableCell>{acct.accountType}</TableCell>
                    <TableCell>${acct.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      {acct.dateCreated.split(", ").map((part, i) => (
                        <div key={i}>{part}</div>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Paper>
    </Box>
  );
}
