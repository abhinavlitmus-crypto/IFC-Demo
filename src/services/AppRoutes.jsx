import { createBrowserRouter } from 'react-router-dom'
import { IfcDemoPage } from '../pages/IfcDemoPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <IfcDemoPage />,
  },
])
