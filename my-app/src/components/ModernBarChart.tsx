import { Paper, Box, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#A569BD", "#CD6155", "#5499C7", "#48C9B0"
];

type BarChartBoxProps = {
  data: any[];
  accountTypes: string[];
};

export default function ModernBarChartBox({ data, accountTypes }: BarChartBoxProps) {
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
            maxWidth: 200,
            wordWrap: "break-word",
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
              }}
            />
            <Typography variant="subtitle2" fontWeight={700} noWrap>
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
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >
      <Typography variant="h6" textAlign="center" sx={{ mb: 1 }}>
        Balances by Bank & Type
      </Typography>
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "flex-end" }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 20, bottom: 10 }}
              barGap={data.length <= 1 ? 0 : 20}
            >
              <XAxis
                dataKey="name"
                tick={{
                  fontWeight: 600,
                  fontSize: 13,
                  wordBreak: "break-word",
                }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <Tooltip content={<CustomTooltip />} />
              {accountTypes.map((type, i) => (
                <Bar
                  key={type}
                  dataKey={type}
                  fill={COLORS[i % COLORS.length]}
                  maxBarSize={40}
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey={type}
                    position="top"
                    content={({ x = 0, y = 0, value }) => {
                      if (!value || Number(value) <= 0) return null;
                      const label = `$${value.toLocaleString()}`;
                      const fontSize = label.length > 10 ? 10 : 12;

                      return (
                        <text
                          x={x}
                          y={y - 10}
                          fill="#222"
                          fontWeight={700}
                          fontSize={fontSize}
                          textAnchor="middle"
                          style={{ textShadow: "0 0 2px #fff" }}
                        >
                          {label}
                        </text>
                      );
                    }}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
}
