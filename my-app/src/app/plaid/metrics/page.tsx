"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CircularProgress,
} from "@mui/material";
import api from "@/utils/api";
import type { Balance, PlaidAccountSummary } from "@/types/types";
import ModernPieChartBox from "@/components/ModernPieChart";
import ModernBarChartBox from "@/components/ModernBarChart";

type CompiledBalance = {
  bankName: string;
  accountType: string;
  balance: number;
};

const getToken = () => localStorage.getItem("token");

const aggregateBy = (list: CompiledBalance[], key: keyof CompiledBalance) => {
  return list.reduce((acc, item) => {
    const k = item[key];
    acc[k] = (acc[k] || 0) + item.balance;
    return acc;
  }, {} as Record<string, number>);
};

const prepareStackedBarData = (
  accounts: CompiledBalance[],
  banks: string[],
  accountTypes: string[]
) =>
  banks.map((bank) => {
    const row: Record<string, any> = { name: bank };
    accountTypes.forEach((type) => {
      const sum = accounts
        .filter((a) => a.bankName === bank && a.accountType === type)
        .reduce((s, a) => s + a.balance, 0);
      row[type] = sum;
    });
    return row;
  });

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<CompiledBalance[]>([]);
  const [institutions, setInstitutions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = getToken();

  const loadAccounts = async (token: string) => {
    try {
      const { data: balances } = await api.get<Balance[]>("/plaid/balances/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data: accountData } = await api.get<PlaidAccountSummary[]>("/plaid/accounts/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const uniqueInstitutionIds = Array.from(
        new Set(
          accountData
            .map((a) => a.institution_id)
            .filter((id): id is string => !!id && !institutions[id])
        )
      );

      const newInstitutions: Record<string, string> = {};
      await Promise.all(
        uniqueInstitutionIds.map(async (id) => {
          try {
            const { data } = await api.get<{ name: string }>(`/plaid/institution/info?institution_id=${id}`);
            newInstitutions[id] = data.name;
          } catch {
            newInstitutions[id] = id;
          }
        })
      );

      setInstitutions((prev) => ({ ...prev, ...newInstitutions }));

      const compiledBalanceList: CompiledBalance[] = balances.map((balance) => {
        const matchingAccount = accountData.find((a) => a.item_id === balance.item_id);
        const bankName = matchingAccount?.institution_id
          ? institutions[matchingAccount.institution_id] || newInstitutions[matchingAccount.institution_id] || "Unknown"
          : "Unknown";

        return {
          bankName,
          accountType: balance.subtype || "Unknown",
          balance: balance.current ?? 0,
        };
      });

      setAccounts(compiledBalanceList);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadAccounts(token).finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <Box p={4}>
        <Typography>Please log in to view your dashboard.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  let totalBalance = 0;
  let bankSet = new Set<string>();
  let accountTypeSet = new Set<string>();

  for (let i = 0; i < accounts.length; i++) {
    totalBalance += accounts[i].balance;
    bankSet.add(accounts[i].bankName);
    accountTypeSet.add(accounts[i].accountType);
  }

  const banks = Array.from(bankSet);
  const accountTypes = Array.from(accountTypeSet);

  const balancesByType = aggregateBy(accounts, "accountType");
  const balancesByBank = aggregateBy(accounts, "bankName");

  const pieTypeData = Object.entries(balancesByType).map(([name, value]) => ({ name, value }));
  const barData = prepareStackedBarData(accounts, banks, accountTypes);

  return (
    <Box p={4} minHeight="100vh" sx={{ bgcolor: "#e0f7fa" }}>
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        gutterBottom
        sx={{ color: "#01579b", mb: 4 }}
      >
        Dashboard Overview
      </Typography>

      <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
        {[
          {
            label: "Total Balance",
            value: `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            color: "primary"
          },
          {
            label: "Banks Connected",
            value: banks.length,
            color: "secondary"
          },
          {
            label: "Account Types",
            value: accountTypes.length,
            color: "info"
          },
          {
            label: "Total Accounts",
            value: accounts.length,
            color: "success"
          }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                bgcolor: "#ffffff",
                boxShadow: "0 2px 12px rgba(1,87,155,0.08)",
                minHeight: 100,
                py: 1.5,
                px: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color="textSecondary"
                sx={{ fontSize: 16, mb: 0.25 }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={item.color}
                sx={{ fontSize: 24 }}
              >
                {item.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 3,
              height: "100%",
              minHeight: 520,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "rgb(214, 212, 212)",
              boxShadow: "0 2px 12px rgba(1,87,155,0.08)",
            }}
          >
            <ModernPieChartBox title="Balances by Account Type" data={pieTypeData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 3,
              height: "100%",
              minHeight: 420,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "rgb(214, 212, 212)",
              boxShadow: "0 2px 12px rgba(1,87,155,0.08)",
            }}
          >
            <ModernBarChartBox data={barData} accountTypes={accountTypes} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
