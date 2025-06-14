import { useState, useEffect, useRef } from "react";
import { Paper, Box, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#A569BD", "#CD6155", "#5499C7", "#48C9B0"
];

type PieData = { name: string; value: number };

export default function ModernPieChartBox({
  title,
  data,
}: {
  title: string;
  data: PieData[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

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
        borderRadius: 4,
        height: "100%",
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "#fff",
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
