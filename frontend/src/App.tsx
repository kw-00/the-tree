import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Dashboard from "./app/pages/dashboard/Dashboard"
import Play from "./app/pages/Play"

export default function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/play"/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/play" element={<Play/>}/>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={true}/>
    </QueryClientProvider>
  )
}
