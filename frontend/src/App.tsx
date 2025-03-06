import React from "react";
import "./App.css";
import { Outlet } from "react-router";

function App() {
  return (
    <div className="shipping-app">
      <header>
        <h1>LogiRoute Optimizer</h1>
        <p>Find the optimal shipping route for your cross-border cargo</p>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
