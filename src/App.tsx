import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CommentSystem from './components/CommentSystem'
import EmbedPage from './pages/EmbedPage'
import AdminPage from './pages/AdminPage'
import SupabaseSetup from './pages/SupabaseSetup'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<CommentSystem />} />
          <Route path="/embed" element={<EmbedPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/setup" element={<SupabaseSetup />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
