import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { App } from './components/App';

ReactDOM.render(
  <StrictMode>
    <BrowserRouter basename={window.location.pathname}>
      <App />
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
