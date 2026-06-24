import React, { useState } from "react"
import { FormControl, InputLabel, Select, MenuItem, Card } from "@mui/material"
import "./IfcDemoPage.css"
import SectorBarChart from "../components/BarChart"
import DumbbellChart from "../components/SimpleLineChart"
import SlopeChart from "../components/SlopeChart"
import BlogPanel from "../components/BlogPanel"
import LineOverview from "../components/LineChart.component"
// import LineOverview from "../components/LineChart.component"

const THEMES = [
  "Household Welfare, Infrastructure & Essential Costs",
]

const STATES = [
  "Andhra Pradesh",
]

export const IfcDemoPage = () => {
  const [active, setActive] = useState("type1")
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [selectedState, setSelectedState] = useState(STATES[0])

  return (
    <div className="ifc-page">

      <Card
        sx={{
          width: "100%",
          maxWidth: "1280px",
          padding: "20px",
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "stretch",
          justifyContent: "flex-start",
          elevation: 2,
          boxShadow: "0 6px 20px rgba(16, 24, 40, 0.08)",
          background: "#fff",
        }}
      >

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <FormControl sx={{ minWidth: 300, flex: "1 1 300px" }} size="small">
            <InputLabel id="theme-select-label">Theme</InputLabel>
            <Select
              labelId="theme-select-label"
              value={selectedTheme}
              label="Theme"
              onChange={(e) => setSelectedTheme(e.target.value)}
            >
              {THEMES.map((theme) => (
                <MenuItem key={theme} value={theme}>
                  {theme}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 280, flex: "1 1 280px" }} size="small">
            <InputLabel id="state-select-label">State</InputLabel>
            <Select
              labelId="state-select-label"
              value={selectedState}
              label="State"
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {STATES.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Card>

      <Card
        sx={{
          width: "100%",
          maxWidth: "1280px",
          padding: "20px",
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "stretch",
          justifyContent: "flex-start",
          elevation: 2,
          boxShadow: "0 6px 20px rgba(16, 24, 40, 0.08)",
          background: "#fff",
        }}
      >
        <h1>NFHS</h1>

        <div className="ifc-content">
          <div className="ifc-side">
            <BlogPanel onCtaClick={() => setActive("type1")} />
          </div>

          <div className="ifc-card">
            <h1 className="ifc-heading">
              {/* {selectedTheme} */} Households using clean fuel for cooking
            </h1>

            <div className="ifc-tabs" role="tablist" aria-label="Chart types">
              <button
                role="tab"
                aria-selected={active === "type1"}
                className={`ifc-tab ${active === "type1" ? "active" : ""}`}
                onClick={() => setActive("type1")}
              >
                Line Chart
              </button>

              <button
                role="tab"
                aria-selected={active === "type2"}
                className={`ifc-tab ${active === "type2" ? "active" : ""}`}
                onClick={() => setActive("type2")}
              >
                Slope Chart
              </button>

              <button
                role="tab"
                aria-selected={active === "type3"}
                className={`ifc-tab ${active === "type3" ? "active" : ""}`}
                onClick={() => setActive("type3")}
              >
                Bar Chart
              </button>
            </div>

            <div className="ifc-chart-area">
              {/* {active === "type1" && <DumbbellChart />} */}
              {active === "type1" && <LineOverview />}
              {active === "type2" && <SlopeChart />}
              {active === "type3" && <SectorBarChart />}
            </div>
          </div>
        </div>

      </Card>
    </div>
  )
}