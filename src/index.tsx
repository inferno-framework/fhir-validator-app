import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { App } from './components/App';

const BASE_PATH = new URL(document.baseURI).pathname;

ReactDOM.render(
  <StrictMode>
    <BrowserRouter basename={BASE_PATH}>
      <App />
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
