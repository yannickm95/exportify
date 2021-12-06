import 'core-js/stable';

import 'react-toastify/dist/ReactToastify.css';
import './index.scss';
import './helpers/icons';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import App from 'components/App';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);
