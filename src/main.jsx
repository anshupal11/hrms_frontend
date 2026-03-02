import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3200,
          style: {
            background: 'white',
            color: '#3d3935',
            border: '1px solid #ddd9d3',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontFamily: "'Instrument Sans', sans-serif",
            padding: '10px 14px',
            boxShadow: '0 4px 16px rgb(26 23 20 / 0.10), 0 1px 4px rgb(26 23 20 / 0.07)',
          },
          success: {
            iconTheme: { primary: '#1a6640', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#c1392b', secondary: 'white' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
