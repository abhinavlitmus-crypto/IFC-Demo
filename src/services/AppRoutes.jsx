import { createBrowserRouter } from 'react-router-dom'
import { IfcDemoPage } from '../pages/IfcDemoPage'
// import DashboardGrid from '../pages/DashboardGrid'
import { DashboardOverview } from '../pages/DashboardOverview'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <IfcDemoPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardOverview />,
  },
])
