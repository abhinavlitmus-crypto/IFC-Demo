import React, { useRef, useState, useMemo, useLayoutEffect, useCallback } from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import { useMediaQuery, useTheme } from "@mui/material";
import { LineChart, lineClasses } from "@mui/x-charts/LineChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

// ---- Data ---------------------------------------------------------------
const DATA = {
  Urban: { nfhs4: 70.7, nfhs5: 99.43 },
  "Rural + Urban (Combined)": { nfhs4: 72.7, nfhs5: 96.65 },
  Rural: { nfhs4: 73.6, nfhs5: 95.44 },
};
const CHART_ORDER = ["Urban", "Rural + Urban (Combined)", "Rural"]; // top → bottom
const PANEL_ORDER = ["Rural", "Rural + Urban (Combined)", "Urban"]; // checkbox list

const COLOR4 = "#4f6d9e";
const COLOR5 = "#f28e2b";
const LINE_C = "#9a9a9a";
const TICK_TXT = "#8a8a8a";
const AXIS_C = "#bdbdbd";
const FADED = 0.18;

const SURVEYS = [
  { key: "nfhs4", label: "nfhs-4", color: COLOR4 },
  { key: "nfhs5", label: "nfhs-5", color: COLOR5 },
];

const cbSx = {
  p: "1px 6px 1px 0",
  color: "#4a7ba6",
  "&.Mui-checked": { color: "#2c6e9b" },
  "&.MuiCheckbox-indeterminate": { color: "#2c6e9b" },
};

const MARGIN = { top: 30, right: 90, bottom: 50, left: 210 };
const HEIGHT = 560;
const MIN_WIDTH = 600;
const X_MAX = 140;
const X_TICKS = [0, 20, 40, 60, 80, 100, 120, 140];

export default function DumbbellChart() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selected, setSelected] = useState([...PANEL_ORDER]);
  const [focus, setFocus] = useState(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(700);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(MIN_WIDTH, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toggle = (s) =>
    setSelected((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const onFocus = (key) => setFocus(key || null);

  const rows = useMemo(() => CHART_ORDER.filter((s) => selected.includes(s)), [selected]);

  // Keep the latest `rows` available to the (stable) tooltip component without
  // re-creating it on every render.
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // ---- Custom tooltip ---------------------------------------------------
  // The series encode each point's ROW INDEX as its y-value (positioning
  // trick), not the survey value — so the default axis tooltip prints those
  // positional indices and the gray connector series, which looks like the
  // "same value on different points". With trigger:"item" only the hovered
  // dot reports, and we look up the real value from DATA here. Connector
  // series (gray lines) are ignored so they never appear in the tooltip.
  const TooltipContent = useCallback((props) => {
    const { itemData, series } = props;
    const dataIndex = itemData?.dataIndex;
    if (dataIndex == null) return null;

    const id = series?.id;
    if (id !== "nfhs4" && id !== "nfhs5") return null; // skip gray connectors

    const sector = rowsRef.current[Math.floor(dataIndex / 2)];
    if (!sector) return null;

    const isN4 = id === "nfhs4";
    const value = isN4 ? DATA[sector].nfhs4 : DATA[sector].nfhs5;
    const color = isN4 ? COLOR4 : COLOR5;
    const label = isN4 ? "nfhs-4" : "nfhs-5";

    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #d9d9d9",
          borderRadius: 4,
          padding: "6px 10px",
          fontSize: 12,
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#333",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{sector}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, background: color, borderRadius: "50%" }} />
          <span>{label}</span>
          <span style={{ marginLeft: 14, fontWeight: 600 }}>{value.toFixed(2)}</span>
        </div>
      </div>
    );
  }, []);

  const chartHeight = isMobile ? 420 : HEIGHT;
  const margin = isMobile ? { top: 30, right: 70, bottom: 50, left: 150 } : MARGIN;

  // Derived pixel coordinates (mirror ScatterChart's internal scale)
  const plotLeft = margin.left;
  const plotRight = width - margin.right;
  const plotTop = margin.top;
  const plotBottom = chartHeight - margin.bottom;
  const plotW = Math.max(1, plotRight - plotLeft);

  const xScale = (v) => plotLeft + (v / X_MAX) * plotW;
  const rowH = (plotBottom - plotTop) / Math.max(rows.length, 1);
  const cy = (i) => plotTop + rowH * (i + 0.5);

  const surveyOp = (key) => (!focus || focus === key ? 1 : FADED);
  const lineOp = focus ? 0.3 : 1;

  const xValues = useMemo(
    () => rows.flatMap((sector) => [DATA[sector].nfhs4, DATA[sector].nfhs5]),
    [rows]
  );

  const series = useMemo(() => {
    const len = rows.length * 2;
    const blank = () => new Array(len).fill(null);

    const data4 = blank();
    const data5 = blank();
    rows.forEach((_, i) => {
      data4[2 * i] = i;
      data5[2 * i + 1] = i;
    });

    const connectorColor = lineOp < 1 ? "rgba(154, 154, 154, 0.3)" : LINE_C;
    const connectors = rows.map((sector, i) => {
      const data = blank();
      data[2 * i] = i;
      data[2 * i + 1] = i;
      return {
        type: "line",
        id: `connector-${sector}`,
        data,
        color: connectorColor,
        connectNulls: true,
        showMark: false,
        disableHighlight: true,
      };
    });

    return [
      ...connectors,
      {
        type: "line",
        id: "nfhs4",
        label: "nfhs-4",
        data: data4,
        color: COLOR4,
        showMark: true,
        disableHighlight: true,
      },
      {
        type: "line",
        id: "nfhs5",
        label: "nfhs-5",
        data: data5,
        color: COLOR5,
        showMark: true,
        disableHighlight: true,
      },
    ];
  }, [rows, lineOp]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "stretch",
        fontFamily: "Arial, Helvetica, sans-serif",
        background: "#fff",
        color: "#333",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          width: "100%",
          justifyContent: "flex-start",
        }}
      >
        <FormControl sx={{ minWidth: 280, flex: "1 1 280px" }} size="small">
          <InputLabel id="sector-select-label">Sector</InputLabel>
          <Select
            labelId="sector-select-label"
            multiple
            value={selected}
            input={<OutlinedInput label="Sector" />}
            renderValue={(selectedValues) => selectedValues.join(", ")}
            onChange={(event) => {
              const value = event.target.value;
              setSelected(typeof value === "string" ? value.split(",") : value);
            }}
          >
            {PANEL_ORDER.map((sector) => (
              <MenuItem key={sector} value={sector}>
                <Checkbox checked={selected.includes(sector)} />
                <ListItemText primary={sector} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180, flex: "0 1 180px" }} size="small">
          <InputLabel id="survey-select-label">Survey</InputLabel>
          <Select
            labelId="survey-select-label"
            value={focus || ""}
            label="Survey"
            onChange={(event) => onFocus(event.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {SURVEYS.map((survey) => (
              <MenuItem key={survey.key} value={survey.key}>
                {survey.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Chart area */}
      <div ref={containerRef} style={{ width: "100%", minWidth: 0, overflow: "hidden", position: "relative" }}>
        <LineChart
          width={width}
          height={chartHeight}
          margin={margin}
          skipAnimation
          xAxis={[
            {
              data: xValues,
              min: 0,
              max: X_MAX,
              tickNumber: X_TICKS.length,
              label: "Value",
              labelStyle: { fontSize: 13, fill: "#5a5a5a" },
              tickLabelStyle: { fontSize: 13, fill: TICK_TXT },
              tickSize: 0,
              // hide the built-in x-axis line because we draw the plot border in the overlay
              disableLine: true,
            },
          ]}
          yAxis={[
            {
              min: -0.5,
              max: rows.length - 0.5,
              // Hide all y-axis visuals — we draw sector labels in the overlay SVG
              tickLabelStyle: { display: "none" },
              tickSize: 0,
              disableLine: true,
              disableTicks: true,
            },
          ]}
          series={series}
          // Hide the built-in legend (we use our own SidePanel legend)
          legend={{ hidden: true }}
          // Per-item tooltip (not axis) so only the hovered dot reports its real value
          tooltip={{ trigger: "item" }}
          // Custom tooltip content that reads the real value from DATA
          slots={{ itemContent: TooltipContent }}
          // Grid lines: vertical only (horizontal handled by border rect in overlay)
          grid={{ vertical: true, horizontal: false }}
          sx={{
            // Vertical gridlines style
            "& .MuiChartsGrid-verticalLine": {
              stroke: "#ececec",
              strokeWidth: 1,
            },
            // X-axis tick labels
            [`& .${axisClasses.tickLabel}`]: {
              fontSize: "13px",
              fill: TICK_TXT,
            },
            // X-axis line
            "& .MuiChartsAxis-line": {
              stroke: AXIS_C,
            },
            // Connector lines drawn at the dumbbell's stroke width
            [`& .${lineClasses.line}`]: {
              strokeWidth: 3,
            },
            // Small fixed-size marks instead of giant scatter dots
            [`& .${lineClasses.mark}`]: {
              r: 7,
            },
            // Remove default tooltip marker (we label dots ourselves)
            "& .MuiChartsTooltip-root": {
              fontSize: "12px",
            },
          }}
        />

  
        <svg
          width={width}
          height={HEIGHT}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none", // clicks pass through to ScatterChart dots
          }}
        >
          {/* Plot border */}
          <rect
            x={plotLeft}
            y={plotTop}
            width={plotW}
            height={plotBottom - plotTop}
            fill="none"
            stroke={AXIS_C}
            strokeWidth={1}
          />

          {/* "Sector" header + funnel icon */}
          <text x={plotLeft - 78} y={plotTop - 12} fontSize={13} fontWeight="bold" fill="#5a5a5a">
            Sector
          </text>
          <g
            transform={`translate(${plotLeft - 30}, ${plotTop - 21})`}
            stroke="#8a8a8a"
            strokeWidth={1.2}
            fill="none"
          >
            <line x1={0} y1={0} x2={9} y2={0} />
            <line x1={1.5} y1={3} x2={7.5} y2={3} />
            <line x1={3} y1={6} x2={6} y2={6} />
          </g>

          {/* Per-row dumbbell elements */}
          {rows.map((sector, i) => {
            const d = DATA[sector];
            const y = cy(i);
            const x4 = xScale(d.nfhs4);
            const x5 = xScale(d.nfhs5);
            return (
              <g key={sector}>
                {/* Sector label (y-axis) */}
                <text x={plotLeft - 14} y={y + 4} fontSize={13} fill="#6e6e6e" textAnchor="end">
                  {sector}
                </text>

                {/* nfhs-4 value label (left of blue dot) */}
                <text
                  x={x4 - 11}
                  y={y + 5}
                  fontSize={14}
                  fill="#3b3b3b"
                  textAnchor="end"
                  opacity={surveyOp("nfhs4")}
                >
                  {d.nfhs4.toFixed(2)}
                </text>

                {/* nfhs-5 value label (right of orange dot) */}
                <text
                  x={x5 + 11}
                  y={y + 5}
                  fontSize={14}
                  fill="#3b3b3b"
                  textAnchor="start"
                  opacity={surveyOp("nfhs5")}
                >
                  {d.nfhs5.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}