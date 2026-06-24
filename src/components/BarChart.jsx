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
import { BarChart } from "@mui/x-charts/BarChart";
import { useDrawingArea, useYScale } from "@mui/x-charts/hooks";

const DATA = {
  "nfhs-4": [
    {
      id: "Rural",
      label: "Rural",
      color: "#4e79a7",
      value: 49.7,
    },
    {
      id: "Combined",
      label: "Rural + Urban (Combined)",
      color: "#f19335",
      value: 62.0,
    },
    {
      id: "Urban",
      label: "Urban",
      color: "#d35e5f",
      value: 89.7,
    },
  ],

  "nfhs-5": [
    {
      id: "Rural",
      label: "Rural",
      color: "#4e79a7",
      value: 77.91,
    },
    {
      id: "Combined",
      label: "Rural + Urban (Combined)",
      color: "#f19335",
      value: 83.62,
    },
    {
      id: "Urban",
      label: "Urban",
      color: "#d35e5f",
      value: 96.57,
    },
  ],
};

const Y_MAX = 105;

function Overlay({ sectors }) {
  const { left, top, width, height } = useDrawingArea();
  const yScale = useYScale();

  const plotBottom = top + height;
  const headerTop = top - 52;

  const count = sectors.length;

  const centers = sectors.map(
    (_, i) => left + ((i * 2 + 1) * width) / (count * 2)
  );

  const dividers = [];

  for (let i = 1; i < count; i++) {
    dividers.push(left + (i * width) / count);
  }

  return (
    <g
      style={{ pointerEvents: "none" }}
      fontFamily="Arial, Helvetica, sans-serif"
    >
      <line
        x1={left}
        x2={left + width}
        y1={top}
        y2={top}
        stroke="#d0d0d0"
        strokeWidth={1}
      />

      {dividers.map((x, i) => (
        <line
          key={i}
          x1={x}
          x2={x}
          y1={headerTop}
          y2={plotBottom}
          stroke="#e4e4e4"
          strokeWidth={1}
        />
      ))}

      {sectors.map((sector, index) => (
        <text
          key={sector.id}
          x={centers[index]}
          y={top - 22}
          textAnchor="middle"
          fontSize={14}
          fill={sector.color}
        >
          {sector.label}
        </text>
      ))}

      {sectors.map((sector, index) => {
        const cy = yScale(sector.value);

        if (cy == null) return null;

        return (
          <text
            key={`value-${sector.id}`}
            x={centers[index]}
            y={cy - 12}
            textAnchor="middle"
            fontSize={14}
            fill="#4a4a4a"
          >
            {sector.value.toFixed(2)}
          </text>
        );
      })}
    </g>
  );
}

export default function SectorBarChart({ height = 620 }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sector, setSector] = React.useState("all");
  const [survey, setSurvey] = React.useState("nfhs-4");

  const sectors =
    sector === "all"
      ? DATA[survey]
      : DATA[survey].filter((item) => {
          if (sector === "rural") return item.id === "Rural";
          if (sector === "urban") return item.id === "Urban";
          if (sector === "combined") return item.id === "Combined";
          return true;
        });

  const chartHeight = isMobile ? 420 : height;

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
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            flex: "1 1 0",
          }}
        >
          <Box sx={{ minWidth: 220, flex: "1 1 220px" }}>
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
                <MenuItem value="combined">Rural + Urban (Combined)</MenuItem>
                <MenuItem value="urban">Urban</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 180, flex: "1 1 180px" }}>
            <Typography
              sx={{
                fontSize: 14,
                mb: 1,
                color: "#444",
              }}
            >
              Survey
            </Typography>

            <FormControl fullWidth size="small">
              <Select
                value={survey}
                onChange={(e) => setSurvey(e.target.value)}
              >
                <MenuItem value="nfhs-4">nfhs-4</MenuItem>
                <MenuItem value="nfhs-5">nfhs-5</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            flex: "1 1 260px",
          }}
        >
          {sectors.map((item) => (
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

      {/* Chart Area */}
      <Box sx={{ flex: 1, width: "100%" }}>
        <Typography
          align="center"
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: "#5a5a5a",
            py: 1,
          }}
        >
          Sector / {survey}
        </Typography>

        <BarChart
          height={chartHeight}
          margin={{
            left: isMobile ? 40 : 48,
            right: isMobile ? 20 : 16,
            top: 60,
            bottom: 40,
          }}
          series={[
            {
              id: "value",
              data: sectors.map((s) => s.value),
            },
          ]}
          xAxis={[
            {
              id: "sector",
              data: sectors.map((s) => s.id),
              scaleType: "band",
              categoryGapRatio: 0.3,
              valueFormatter: () => survey,
              colorMap: {
                type: "ordinal",
                values: sectors.map((s) => s.id),
                colors: sectors.map((s) => s.color),
              },
            },
          ]}
          yAxis={[
            {
              min: 0,
              max: Y_MAX,
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
            "& .MuiChartsAxis-line": {
              stroke: "#bdbdbd",
            },
            "& .MuiChartsAxis-tick": {
              stroke: "#bdbdbd",
            },
            "& .MuiChartsAxis-tickLabel": {
              fill: "#8a8a8a",
              fontSize: 13,
            },
            "& .MuiChartsAxis-label": {
              fill: "#5a5a5a",
            },
            "& .MuiChartsGrid-line": {
              stroke: "#ececec",
            },
          }}
        >
          <Overlay sectors={sectors} />
        </BarChart>
      </Box>
    </Box>
  );
}