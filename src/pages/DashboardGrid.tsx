
import DashboardBarChart from "../components/dashboard/DashboardBarChart"
import DashboardDumbellChart from "../components/dashboard/DashboardDumbellChart"
import DashboardSlopeChart from "../components/dashboard/DashboardSlopeChart"
import "./DashboardGrid.css"

export type ChartType = "line" | "slope" | "bar"

type Dataset = {
  id: string
  title: string
  color: string
  values: number[]
}

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021]

const DATASETS: Dataset[] = [
  { id: "fuel",       title: "Clean cooking fuel (%)",         color: "#4e79a7", values: [58, 61, 64, 68, 72, 76, 80] },
  { id: "electricity",title: "Electricity access (%)",         color: "#f0982d", values: [86, 88, 90, 92, 94, 96, 98] },
  { id: "water",      title: "Improved drinking water (%)",    color: "#59a14f", values: [70, 72, 74, 77, 80, 83, 86] },
  { id: "sanitation", title: "Improved sanitation (%)",        color: "#e15759", values: [42, 47, 53, 60, 66, 71, 76] },
  { id: "bank",       title: "Women with a bank account (%)",  color: "#b07aa1", values: [55, 62, 68, 74, 80, 85, 89] },
  { id: "insurance",  title: "Health insurance coverage (%)",  color: "#76b7b2", values: [30, 34, 39, 45, 52, 58, 64] },
]

// One shared y-scale keeps the small multiples visually comparable.
const Y_MAX =
  Math.ceil(Math.max(...DATASETS.flatMap((d) => d.values)) / 20) * 20

const HEIGHT = 172
const MARGIN = { left: 42, right: 14, top: 14, bottom: 28 }
const percent = (v: number) => `${v}%`

const chartSx = {
  "& .MuiChartsAxis-tickLabel": { fontSize: 10, fill: "#8a8a8a" },
  "& .MuiChartsGrid-line": { stroke: "#eef0f2" },
  "& .MuiChartsAxis-line": { stroke: "#d7dbe0" },
  "& .MuiChartsAxis-tick": { stroke: "#d7dbe0" },
}

function Panel({
  dataset,
  chartType,
}: {
  dataset: Dataset
  chartType: ChartType
}) {
  return (
    <div className="dash-panel">
      <h3 className="dash-panel__title">{dataset.title}</h3>

      {chartType === "bar" ? (
        <DashboardBarChart
          // height={HEIGHT}
          // values={dataset.values}
          // labels={YEARS.map(String)}
          // barColor={dataset.color}
        />
      ) : chartType === "slope" ? (
        <DashboardSlopeChart
          // height={HEIGHT}
          // values={dataset.values}
          // categories={YEARS}
          // color={dataset.color}
        />
      ) : (
        <DashboardDumbellChart
          // height={HEIGHT}
          // values={dataset.values}
          // categories={YEARS}
          // color={dataset.color}
        />
      )}
    </div>
  )
}

export default function DashboardGrid({
  chartType = "line",
}: {
  chartType?: ChartType
}) {
  return (
    <div className="dash-grid">
      {DATASETS.map((ds) => (
        <Panel key={ds.id} dataset={ds} chartType={chartType} />
      ))}
    </div>
  )
}
