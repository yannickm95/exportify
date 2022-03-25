import 'core-js/stable';

import './helpers/icons';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import App from 'components/App';
import loadFonts from './assets/fontLoader';

loadFonts();

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);
