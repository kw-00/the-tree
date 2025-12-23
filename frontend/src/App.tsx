import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Playground from "./Playground"

export default function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {
          /* <Route path="/" element={<Navigate to="/login"/>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/dashboard" element={<Dashboard/>} /> */
          }
          <Route path="/" element={<Playground/>}/>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={true}/>
    </QueryClientProvider>
  )
}
