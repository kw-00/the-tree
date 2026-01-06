import "./app/layout/layout.css"
import "./app/theme/theme.ts"
import "./import-tailwind.css"

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import Dashboard from "./app/pages/dashboard/Dashboard"
import Settings from "./app/pages/settings/Settings.tsx"

export default function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard"/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/settings" element={<Settings/>}/>
        </Routes>
      </BrowserRouter>
      {/* <ReactQueryDevtools initialIsOpen={true}/> */}
    </QueryClientProvider>
  )
}
