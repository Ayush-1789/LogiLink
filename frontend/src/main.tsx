import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./Home.js";
import Results from "./Results.js";
import RouteDetails from "./RouteDetails.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Home />} />
          <Route path="results" element={<Results />} />
          <Route path="details" element={<RouteDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
