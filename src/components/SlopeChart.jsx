import React from "react";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useXScale, useYScale } from "@mui/x-charts/hooks";

const CATEGORIES = ["nfhs-4", "nfhs-5"];

const ALL_SERIES = [
  {
    id: "rural",
    label: "Rural",
    color: "#4e79a7",
    data: [49.7, 77.91],
  },
  {
    id: "combined",
    label: "Rural + Urban (Combined)",
    color: "#f0982d",
    data: [62.0, 83.62],
  },
  {
    id: "urban",
    label: "Urban",
    color: "#d35e5f",
    data: [89.7, 96.57],
  },
];

const VALUE_TXT = "#3b3b3b";

function ValueLabels({ series }) {
  const xScale = useXScale();
  const yScale = useYScale();

  return (
    <g style={{ pointerEvents: "none" }}>
      {series.flatMap((s) =>
        s.data.map((val, i) => {
          const cx = xScale(CATEGORIES[i]);
          const cy = yScale(val);

          if (cx == null || cy == null) return null;

          const isLeft = i === 0;
          const xOffset = isLeft ? -18 : 18;

          return (
            <text
              key={`${s.id}-${i}`}
              x={isLeft ? cx + xOffset : cx + xOffset}
              y={cy + 5}
              fontSize={14}
              fill={VALUE_TXT}
            >
              {val.toFixed(2)}
            </text>
          );
        })
      )}
    </g>
  );
}

export default function SlopeChart({ height = 560 }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sector, setSector] = React.useState("all");

  const filteredSeries =
    sector === "all"
      ? ALL_SERIES
      : ALL_SERIES.filter((item) => item.id === sector);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Box sx={{ minWidth: 240, flex: "1 1 240px" }}>
          <Typography
            sx={{
              fontSize: 14,
              mb: 1,
              color: "#444",
            }}
          >
            Sector
          </Typography>

          <FormControl fullWidth size="small">
            <Select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            >
              <MenuItem value="all">(All)</MenuItem>
              <MenuItem value="rural">Rural</MenuItem>
              <MenuItem value="combined">
                Rural + Urban (Combined)
              </MenuItem>
              <MenuItem value="urban">Urban</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            flex: "1 1 320px",
          }}
        >
          {filteredSeries.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: "#f8f9fb",
              }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  backgroundColor: item.color,
                }}
              />
              <Typography variant="body2">{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ flex: 1, width: "100%" }}>
        <Typography
          align="center"
          sx={{
            mb: 1,
            color: "#555",
            fontSize: 15,
          }}
        >
          Survey
        </Typography>

        <LineChart
          height={isMobile ? 420 : height}
          margin={{
            left: isMobile ? 70 : 60,
            right: isMobile ? 50 : 60,
            top: 20,
            bottom: 40,
          }}
          series={filteredSeries.map((s) => ({
            id: s.id,
            label: s.label,
            data: s.data,
            color: s.color,
            curve: "linear",
            showMark: true,
          }))}
          xAxis={[
            {
              data: CATEGORIES,
              scaleType: "point",
            },
          ]}
          yAxis={[
            {
              min: 0,
              max: 100,
              tickMinStep: 10,
              label: "Value",
            },
          ]}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
          sx={{
            "& .MuiMarkElement-root": {
              r: 10,
              stroke: "#fff",
              strokeWidth: 2,
            },
            "& .MuiLineElement-root": {
              strokeWidth: 3,
            },
            "& .MuiChartsGrid-line": {
              stroke: "#ececec",
            },
          }}
        >
          <ValueLabels series={filteredSeries} />
        </LineChart>
      </Box>

    </Box>
  );
}