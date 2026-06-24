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

// Real categories used for labels / scale lookups
const CATEGORIES = ["nfhs-4", "nfhs-5"];

const X_AXIS_DATA = ["", "nfhs-4", "nfhs-5", ""];

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
const MARK_R = 11;

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
          const labelX = isLeft ? cx : cx + MARK_R + 8;
          const labelY = isLeft ? cy + MARK_R + 18 : cy + 5;
          const anchor = isLeft ? "middle" : "start";

          return (
            <g key={`${s.id}-${i}`}>
              {/* Uniform filled circle marker (matches reference image) */}
              <circle
                cx={cx}
                cy={cy}
                r={MARK_R}
                fill={s.color}
                stroke="#fff"
                strokeWidth={1.5}
              />
              <text
                x={labelX}
                y={labelY}
                fontSize={14}
                fill={VALUE_TXT}
                textAnchor={anchor}
              >
                {val.toFixed(2)}
              </text>
            </g>
          );
        })
      )}
    </g>
  );
}

export default function DashboardSlopeChart({ height = 560 }) {
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
            right: isMobile ? 60 : 70,
            top: 20,
            bottom: 40,
          }}
          series={filteredSeries.map((s) => ({
            id: s.id,
            label: s.label,
            // Pad with nulls to align with the inset (padded) x-axis. The line
            // is still drawn only between the two real points.
            data: [null, s.data[0], s.data[1], null],
            color: s.color,
            curve: "linear",
            showMark: false, // we draw our own uniform circle markers
            connectNulls: false,
          }))}
          xAxis={[
            {
              data: X_AXIS_DATA,
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