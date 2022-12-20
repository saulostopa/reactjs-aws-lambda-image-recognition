import React from 'react';
import ReactDOM from 'react-dom/client';
// import * as ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Odometer from './routes/odometer';
import VehicleDocument from './routes/vehicle-document';
import DriverLicense from './routes/driver-license';
import LicensePlate from './routes/license-plate';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="odometer" element={<Odometer />}>
          <Route index element={<main>Odometer</main>} />
        </Route>
        <Route path="vehicle-document" element={<VehicleDocument />}>
          <Route index element={<main>Vehicle Document</main>} />
        </Route>
        <Route path="driver-license" element={<DriverLicense />}>
          <Route index element={<main>Driver License</main>} />
        </Route>
        <Route path="license-plate" element={<LicensePlate />}>
          <Route index element={<main>License Plate</main>} />
        </Route>
        <Route
          path="*"
          element={
            <main style={{ padding: '1rem' }}>
              <p>There's nothing here!</p>
            </main>
          }
        />
      </Route>
    </Routes>
  </BrowserRouter>
);