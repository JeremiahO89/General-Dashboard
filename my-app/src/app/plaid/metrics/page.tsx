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

// --- PIE CHART ---
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
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "#ffffff",
        boxShadow: "0 2px 12px rgba(1,87,155,0.08)",
      }}
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
        <ResponsiveContainer width="75%" height={300} minWidth={200}>
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
      {/* Legend at the very bottom, left-aligned and centered horizontally */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 2,
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

// --- BAR CHART ---
function ModernBarChartBox({
  data,
  accountTypes,
}: {
  data: any[];
  accountTypes: string[];
}) {
  // Calculate max value for scaling
  const allValues = data.flatMap(row => accountTypes.map(type => row[type] || 0));
  const maxValue = Math.max(...allValues, 1);
  const domainMax = Math.ceil(Math.max(maxValue * 1.1, maxValue + 100) / 100) * 100;

  // Calculate totals for legend
  const typeTotals: Record<string, number> = {};
  data.forEach(row => {
    accountTypes.forEach(type => {
      typeTotals[type] = (typeTotals[type] || 0) + (row[type] || 0);
    });
  });
  const total = Object.values(typeTotals).reduce((a, b) => a + b, 0);

  // Modern tooltip
  function CustomTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
      const entry = payload[0];
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
            boxShadow: "0 2px 12px rgba(1,87,155,0.08)",
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
            <b>${entry.value?.toLocaleString()}</b>
          </Typography>
        </Paper>
      );
    }
    return null;
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 4,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 0,
      }}
    >
      <Typography variant="h6" textAlign="center" gutterBottom>
        Balances by Bank & Type
      </Typography>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", // Left justify the chart
        }}
      >
        <ResponsiveContainer width="100%" height={320} minWidth={250}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
            barGap={10}
          >
            <XAxis
              type="number"
              tick={false} // <-- Hide X axis labels
              axisLine={false}
              tickLine={false}
              domain={[0, domainMax]}
              allowDataOverflow={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={60} // Reduce width so chart area is larger
              tick={{ fontWeight: 550, fontSize: 14 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {accountTypes.map((type, i) => (
              <Bar
                key={type}
                dataKey={type}
                fill={COLORS[i % COLORS.length]}
                maxBarSize={22} // thinner bars
                radius={[8, 8, 8, 8]}
                isAnimationActive={false}
                barSize={14} // thinner bars
              >
                <LabelList
                  dataKey={type}
                  position="right"
                  formatter={(v: number) => (v > 0 ? `$${v.toLocaleString()}` : "")}
                  style={{
                    fill: "#222",
                    fontWeight: 700,
                    fontSize: 15,
                    textShadow: "0 0 2px #fff",
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
        {/* Custom Legend below the chart, left-aligned and centered */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 340,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            mt: 2,
          }}
        >
          {accountTypes.map((type, i) => (
            <Box
              key={type}
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
                {type}: ${typeTotals[type]?.toLocaleString() ?? 0}{" "}
                ({total > 0 ? ((typeTotals[type] / total) * 100).toFixed(1) : 0}%)
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
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
        {/* Info Cards */}
        {[{
          label: "Total Balance",
          value: `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          color: "primary"
        }, {
          label: "Banks Connected",
          value: banks.length,
          color: "secondary"
        }, {
          label: "Account Types",
          value: accountTypes.length,
          color: "info"
        }, {
          label: "Total Accounts",
          value: accounts.length,
          color: "success"
        }].map((item, idx) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                bgcolor: "#ffffff",
                boxShadow: "0 2px 12px rgba(1,87,155,0.08)",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 0 }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
                  {item.label}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={item.color}
                  sx={{ fontSize: 28 }}
                >
                  {item.value}
                </Typography>
              </CardContent>
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
              minHeight: 420,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "#ffffff",
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
              bgcolor: "#ffffff",
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
