import React, { useRef, useState, useMemo, useLayoutEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import { useMediaQuery, useTheme } from "@mui/material";
import { ScatterChart } from "@mui/x-charts/ScatterChart";
import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

// ---- Data ---------------------------------------------------------------
const DATA = {
  Urban: { nfhs4: 70.7, nfhs5: 99.43 },
  "Rural + Urban (Combined)": { nfhs4: 72.7, nfhs5: 96.65 },
  Rural: { nfhs4: 73.6, nfhs5: 95.44 },
};
const CHART_ORDER = ["Urban", "Rural + Urban (Combined)", "Rural"]; // top → bottom
const PANEL_ORDER = ["Rural", "Rural + Urban (Combined)", "Urban"]; // checkbox list

const COLOR4 = "#4e79a7";
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

// ---- Side panel ---------------------------------------------------------
function SidePanel({ selected, onToggle, onToggleAll, focus, onFocus }) {
  const allChecked = selected.length === PANEL_ORDER.length;
  const someChecked = selected.length > 0 && !allChecked;
  const rowSx = {
    display: "flex",
    alignItems: "center",
    fontSize: 13,
    color: "#333",
    cursor: "pointer",
    userSelect: "none",
  };
  return (
    <div style={{ width: 330, flexShrink: 0 }}>
      {/* Sector filter */}
      <div style={{ border: "1px solid #d9d9d9", padding: "8px 12px", marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "#5a5a5a", marginBottom: 4 }}>Sector</div>
        <label style={rowSx}>
          <Checkbox size="small" sx={cbSx} checked={allChecked} indeterminate={someChecked} onChange={onToggleAll} />
          (All)
        </label>
        {PANEL_ORDER.map((s) => (
          <label key={s} style={rowSx}>
            <Checkbox size="small" sx={cbSx} checked={selected.includes(s)} onChange={() => onToggle(s)} />
            {s}
          </label>
        ))}
      </div>

      {/* Survey highlight legend */}
      <div style={{ border: "1px solid #d9d9d9", padding: "8px 12px" }}>
        <div style={{ fontSize: 13, color: "#5a5a5a", marginBottom: 6 }}>Survey</div>
        {SURVEYS.map((s) => {
          const dim = focus && focus !== s.key;
          return (
            <div
              key={s.key}
              onClick={() => onFocus(s.key)}
              title="Click to highlight this survey"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "3px 6px",
                margin: "1px -6px",
                fontSize: 13,
                cursor: "pointer",
                userSelect: "none",
                borderRadius: 3,
                background: focus === s.key ? "#eef3f8" : "transparent",
                opacity: dim ? 0.4 : 1,
              }}
            >
              <span style={{ width: 13, height: 13, background: s.color, marginRight: 8 }} />
              <span style={{ fontWeight: focus === s.key ? 600 : 400 }}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Custom connecting-line overlay via ScatterChart's "overlay" slot ----
// MUI X Charts ScatterChart renders dots via series; we draw the dumbbell
// connector lines and value labels using the `axisContent` customisation
// slot pattern — specifically a custom SVG layer rendered inside the chart's
// <svg> via the `slots.overlay` escape hatch is NOT available on ScatterChart,
// so instead we use a composition approach:
//   1. ScatterChart renders the two dot series (nfhs4, nfhs5).
//   2. We wrap it in a `position: relative` container.
//   3. A second <svg> is absolutely positioned on top; it draws the
//      connecting lines AND value labels using computed pixel positions
//      that mirror the ScatterChart's internal scale.
// This is the idiomatic MUI X Charts "custom layer" pattern when you need
// to draw elements the library doesn't expose natively.

const MARGIN = { top: 30, right: 90, bottom: 50, left: 210 };
const HEIGHT = 560;
const MIN_WIDTH = 380;
const X_TICKS = [0, 20, 40, 60, 80, 100];

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
  const toggleAll = () =>
    setSelected((p) => (p.length === PANEL_ORDER.length ? [] : [...PANEL_ORDER]));
  const onFocus = (key) => setFocus((prev) => (prev === key ? null : key));

  const rows = useMemo(() => CHART_ORDER.filter((s) => selected.includes(s)), [selected]);

  const chartHeight = isMobile ? 420 : HEIGHT;
  const margin = isMobile ? { top: 30, right: 70, bottom: 50, left: 150 } : MARGIN;

  // Derived pixel coordinates (mirror ScatterChart's internal scale)
  const plotLeft = margin.left;
  const plotRight = width - margin.right;
  const plotTop = margin.top;
  const plotBottom = chartHeight - margin.bottom;
  const plotW = Math.max(1, plotRight - plotLeft);

  const xScale = (v) => plotLeft + (v / 100) * plotW;
  const rowH = (plotBottom - plotTop) / Math.max(rows.length, 1);
  const cy = (i) => plotTop + rowH * (i + 0.5);

  const surveyOp = (key) => (!focus || focus === key ? 1 : FADED);
  const lineOp = focus ? 0.3 : 1;

  // ScatterChart series: one per survey; y encodes the row index
  // We use yAxis as a numeric 0‥rows.length axis (hidden) and map
  // each sector row to a y value of i + 0.5, then hide the default
  // y-axis tick labels and draw our own sector labels in the overlay SVG.
  const series4 = useMemo(
    () => rows.map((sector, i) => ({ id: `${sector}-4`, x: DATA[sector].nfhs4, y: i })),
    [rows]
  );
  const series5 = useMemo(
    () => rows.map((sector, i) => ({ id: `${sector}-5`, x: DATA[sector].nfhs5, y: i })),
    [rows]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: 16,
        alignItems: "flex-start",
        fontFamily: "Arial, Helvetica, sans-serif",
        background: "#fff",
        color: "#333",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Chart area */}
      <div ref={containerRef} style={{ flex: 1, minWidth: 0, overflow: "hidden", position: "relative", width: "100%" }}>
        {/*
          ScatterChart from MUI X Charts:
          - xAxis: linear 0-100, provides gridlines + tick labels
          - yAxis: numeric 0..rows.length, hidden (we draw sector labels ourselves)
          - series: two scatter series (nfhs4 = blue, nfhs5 = orange)
          - margin: mirrors our MARGIN constant so pixel math stays in sync
          - disableAxisListener / skipAnimation keep it snappy
        */}
        <ScatterChart
          width={width}
          height={chartHeight}
          margin={margin}
          skipAnimation
          xAxis={[
            {
              min: 0,
              max: 100,
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
          series={[
            {
              type: "scatter",
              id: "nfhs4",
              label: "nfhs-4",
              data: series4,
              color: COLOR4,
              markerSize: 28, // reduced marker size for better layout
              opacity: surveyOp("nfhs4"),
            },
            {
              type: "scatter",
              id: "nfhs5",
              label: "nfhs-5",
              data: series5,
              color: COLOR5,
              markerSize: 28,
              opacity: surveyOp("nfhs5"),
            },
          ]}
          // Hide the built-in legend (we use our own SidePanel legend)
          legend={{ hidden: true }}
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

                {/* Connecting line */}
                <line
                  x1={x4}
                  x2={x5}
                  y1={y}
                  y2={y}
                  stroke={LINE_C}
                  strokeWidth={3}
                  opacity={lineOp}
                />

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

      {/* Side panel */}
      <div style={{ width: isMobile ? "100%" : 330, flexShrink: 0 }}>
        <SidePanel
          selected={selected}
          onToggle={toggle}
          onToggleAll={toggleAll}
          focus={focus}
          onFocus={onFocus}
        />
      </div>
    </div>
  );
}