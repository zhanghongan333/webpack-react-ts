import React from 'react'
import ReactDOM from 'react-dom/client'
// import { createRoot } from 'react-dom/client'
import App from './App'

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
const a = 111
console.log('NODE_ENV', process.env.NODE_ENV)
console.log('BASE_ENV', process.env.BASE_ENV)
