import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { GoogleAuthProvider } from './context/GoogleAuthContext'
import { AppProvider } from './context/AppContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleAuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </GoogleAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
