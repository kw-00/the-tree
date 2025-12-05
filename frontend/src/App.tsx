import Dashboard from '@/features/dashboard/Dashboard'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Provider } from './components/ui/provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login"/>} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage/>} />
            <Route path="/dashboard" element={<Dashboard/>} />
          </Routes>
        </BrowserRouter>
      </Provider>
      <ReactQueryDevtools initialIsOpen={true}/>
    </QueryClientProvider>
  )
}
