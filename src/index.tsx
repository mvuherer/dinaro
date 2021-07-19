import React from 'react';
import ReactDOM from 'react-dom';
import { Container, Row, Col } from 'react-bootstrap';

import App from './App';
import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <React.StrictMode>
    <Container>
      <Row className="justify-content-center p-5">
        <Col md="6">
          <App />
          <canvas id="barcode" className="w-100" />
        </Col>
      </Row>
    </Container>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
