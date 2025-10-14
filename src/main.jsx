// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const baseName = import.meta.env.BASE_URL || '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Suspense>
    <BrowserRouter basename={baseName}>
      <App />
    </BrowserRouter>
  </Suspense>,
)
