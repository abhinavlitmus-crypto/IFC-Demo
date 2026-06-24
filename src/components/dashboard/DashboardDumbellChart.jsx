import * as React from 'react';
import Box from '@mui/material/Box';
import { ChartsDataProviderPro } from '@mui/x-charts-pro/ChartsDataProviderPro';
import { ChartsSurface } from '@mui/x-charts-pro/ChartsSurface';
import { ChartsXAxis } from '@mui/x-charts-pro/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts-pro/ChartsYAxis';
import { ChartsGrid } from '@mui/x-charts-pro/ChartsGrid';
import { ChartsLegend } from '@mui/x-charts-pro/ChartsLegend';
import { useXScale, useYScale } from '@mui/x-charts-pro/hooks';
import demoData from '../../data/demo.json';

const SUB_INDICATOR = 'Households using clean fuel for cooking (%)';
const SECTOR_ORDER = ['Urban', 'Rural + Urban (Combined)', 'Rural'];
const SURVEY_COLORS = {
  'nfhs-4': '#4472C4',
  'nfhs-5': '#ED7D31',
};

function buildRows() {
  return SECTOR_ORDER.map((sector) => {
    const points = demoData
      .filter((d) => d.sub_indicator === SUB_INDICATOR && d.sector === sector)
      .map((d) => ({ survey: d.survey, value: d.value }));
    return { sector, points };
  });
}

function Dumbbells({ rows }) {
  const xScale = useXScale('value-axis');
  const yScale = useYScale('sector-axis');

  return (
    <g>
      {rows.map(({ sector, points }) => {
        if (points.length === 0) {
          return null;
        }
        const y = yScale(sector) + yScale.bandwidth() / 2;
        const placed = points
          .map((p) => ({ ...p, x: xScale(p.value) }))
          .sort((a, b) => a.x - b.x);
        const left = placed[0];
        const right = placed[placed.length - 1];

        return (
          <g key={sector}>
            {placed.length > 1 && (
              <line x1={left.x} y1={y} x2={right.x} y2={y} stroke="#9e9e9e" strokeWidth={2} />
            )}
            {placed.map((p) => (
              <circle key={p.survey} cx={p.x} cy={y} r={5} fill={SURVEY_COLORS[p.survey]} />
            ))}
            {placed.map((p) => {
              const isLeft = p.x === left.x && left.x !== right.x;
              const isRight = p.x === right.x && left.x !== right.x;
              const anchor = isLeft ? 'end' : isRight ? 'start' : 'middle';
              const dx = isLeft ? -10 : isRight ? 10 : 0;
              return (
                <text
                  key={`label-${p.survey}`}
                  x={p.x + dx}
                  y={y - 10}
                  textAnchor={anchor}
                  fontSize="0.8rem"
                  fill="#444"
                >
                  {p.value.toFixed(2)}
                </text>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

export default function DashboardDumbellChart() {
  const rows = React.useMemo(buildRows, []);

  return (
    <Box sx={{ width: '100%' }}>
      <ChartsDataProviderPro
        height={420}
        series={[
          { type: 'scatter', id: 'nfhs-4', data: [], label: 'nfhs-4', color: SURVEY_COLORS['nfhs-4'] },
          { type: 'scatter', id: 'nfhs-5', data: [], label: 'nfhs-5', color: SURVEY_COLORS['nfhs-5'] },
        ]}
        xAxis={[
          {
            id: 'value-axis',
            scaleType: 'linear',
            min: 0,
            max: 100,
            label: 'Value',
            position: 'bottom',
            tickNumber: 6,
          },
        ]}
        yAxis={[
          {
            id: 'sector-axis',
            scaleType: 'band',
            data: SECTOR_ORDER,
            label: 'Sector',
            position: 'left',
            width: 220,
          },
        ]}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <ChartsLegend />
        </Box>
        <ChartsSurface>
          <ChartsGrid vertical />
          <Dumbbells rows={rows} />
          <ChartsXAxis axisId="value-axis" />
          <ChartsYAxis axisId="sector-axis" />
        </ChartsSurface>
      </ChartsDataProviderPro>
    </Box>
  );
}
