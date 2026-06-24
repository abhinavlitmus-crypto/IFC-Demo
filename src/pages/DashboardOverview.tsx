import { useState } from "react"
import "./IfcDemoPage.css"
import DashboardGrid from "./DashboardGrid"

export const DashboardOverview = () => {
  const [active, setActive] = useState("type1")

  return (
    <div className="ifc-page">

          <div className="ifc-card">
            <h1 className="ifc-heading">NFHS DATA</h1>

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
              {/* All dashboard tabs now use compact custom chart cards */}
              {active === "type1" && <DashboardGrid chartType="line" />}
              {active === "type2" && <DashboardGrid chartType="slope" />}
              {active === "type3" && <DashboardGrid chartType="bar" />}
            </div>
          </div>
    </div>
  )
}