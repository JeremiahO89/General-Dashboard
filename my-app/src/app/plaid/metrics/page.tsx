"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import api from "@/utils/api";
import type { Balance, PlaidAccountSummary } from "@/types/types";

type CompiledBalance = {
  bankName: string;
  accountType: string;
  balance: number;
};

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#A569BD", "#CD6155", "#5499C7", "#48C9B0"
];

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
    const row: Record<string, any> = { name: bank }; // Changed from bank -> name
    accountTypes.forEach((type) => {
      const sum = accounts
        .filter((a) => a.bankName === bank && a.accountType === type)
        .reduce((s, a) => s + a.balance, 0);
      row[type] = sum;
    });
    return row;
  });

// Modern Pie Chart: No labels on slices, legend only
function ModernPieChartBox({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  // Calculate total for percent in legend
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Responsive ring sizing based on container size
  function getRadii(containerWidth: number) {
    if (containerWidth < 300) return { inner: 55, outer: 100 };
    return { inner: 70, outer: 115 };
  }

  const [containerWidth, setContainerWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      if (boxRef.current) {
        setContainerWidth(boxRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { inner, outer } = getRadii(containerWidth);

  // Custom Tooltip for modern look
  function CustomTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";
      return (
        <Paper
          elevation={6}
          sx={{
            px: 2,
            py: 1,
            bgcolor: "#fff",
            borderRadius: 2,
            minWidth: 120,
            border: `2px solid ${entry.color}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
          }}
        >
          <Box display="flex" alignItems="center" mb={0.5}>
            <Box
              sx={{
                width: 14,
                height: 14,
                bgcolor: entry.color,
                borderRadius: "4px",
                mr: 1,
                flexShrink: 0,
              }}
            />
            <Typography variant="subtitle2" fontWeight={700}>
              {entry.name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            <b>${entry.value.toLocaleString()}</b> ({percent}%)
          </Typography>
        </Paper>
      );
    }
    return null;
  }

  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 0,
      }}
      elevation={4}
    >
      <Typography variant="h6" gutterBottom align="center" sx={{ width: "100%" }}>
        {title}
      </Typography>
      <Box
        ref={boxRef}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <ResponsiveContainer width="60%" height={300} minWidth={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={inner}
              outerRadius={outer}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      {/* Legend at the bottom, closer to the ring */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: -2, // Move legend closer to the ring
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 340,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {data.map((entry, i) => (
            <Box
              key={entry.name}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: COLORS[i % COLORS.length],
                  borderRadius: "4px",
                  mr: 1,
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "#222",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  flexGrow: 1,
                }}
              >
                {entry.name}: ${entry.value.toFixed(0)}{" "}
                ({total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%)
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

// Modern Horizontal Bar Chart: Grouped by account type, value labels at end
function ModernBarChartBox({
  data,
  accountTypes,
}: {
  data: any[];
  accountTypes: string[];
}) {
  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 0,
      }}
      elevation={4}
    >
      <Typography variant="h6" gutterBottom textAlign="center">
        Balances by Bank & Type
      </Typography>
      <ResponsiveContainer width="100%" height={300} minWidth={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={(v) => `$${v}`}
            domain={[0, "dataMax + 500"]}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontWeight: 600 }}
          />
          <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
          <Legend />
          {accountTypes.map((type, i) => (
            <Bar
              key={type}
              dataKey={type}
              fill={COLORS[i % COLORS.length]}
              maxBarSize={32}
              radius={[6, 6, 6, 6]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey={type}
                position="right"
                formatter={(v: number) => (v > 0 ? `$${v.toFixed(0)}` : "")}
                style={{
                  fill: "#222",
                  fontWeight: 700,
                  fontSize: 14,
                  textShadow: "0 0 2px #fff",
                }}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

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
    <Box p={4} minHeight="100vh" sx={{ bgcolor: "#f0f2f5" }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Dashboard Overview
      </Typography>

      <Grid container spacing={4} justifyContent="center" sx={{ mb: 5 }}>
        <Grid item xs={12} sm={4} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" color="textSecondary">
                Total Balance
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                ${totalBalance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" color="textSecondary">
                Banks Connected
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {banks.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" color="textSecondary">
                Account Types
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {accountTypes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" color="textSecondary">
                Total Accounts
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {accounts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={6}>
          <ModernPieChartBox title="Balances by Account Type" data={pieTypeData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ModernBarChartBox data={barData} accountTypes={accountTypes} />
        </Grid>
      </Grid>
    </Box>
  );
}
