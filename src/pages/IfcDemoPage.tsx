import React, { useState } from "react"
import "./IfcDemoPage.css"
import SectorBarChart from "../components/BarChart"
import DumbbellChart from "../components/SimpleLineChart"
import SlopeChart from "../components/SlopeChart"

export const IfcDemoPage = () => {
  const [active, setActive] = useState("type1")

  return (
    <div className="ifc-page">
      <div className="ifc-card">
        <h1 className="ifc-heading">House Welfare And Cooking</h1>

        <div className="ifc-tabs" role="tablist" aria-label="Chart types">
          <button
            role="tab"
            aria-selected={active === "type1"}
            className={`ifc-tab ${active === "type1" ? "active" : ""}`}
            onClick={() => setActive("type1")}
          >
            type1
          </button>

          <button
            role="tab"
            aria-selected={active === "type2"}
            className={`ifc-tab ${active === "type2" ? "active" : ""}`}
            onClick={() => setActive("type2")}
          >
            type2
          </button>

          <button
            role="tab"
            aria-selected={active === "type3"}
            className={`ifc-tab ${active === "type3" ? "active" : ""}`}
            onClick={() => setActive("type3")}
          >
            type3
          </button>
        </div>

        <div className="ifc-chart-area">
          {active === "type1" && <DumbbellChart />}
          {active === "type2" && <SlopeChart />}
          {active === "type3" && <SectorBarChart />}
        </div>
      </div>
    </div>
  )
}




// export const IfcDemoPage = () => {
//   return (
//     <div><DumbbellChart /></div>
//   )
// }

