import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Route } from "./Route";
import getMockRoutes from "./mockRoutes";

type Filter = "all" | "land" | "sea" | "air";

export default function Results() {
  const shipmentDetails = useLocation().state;

  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const routeOptions = getMockRoutes(shipmentDetails);

  const navigate = useNavigate();

  const showRouteDetails = (route: Route) => {
    navigate("/details", { state: { shipmentDetails, selectedRoute: route } });
  };

  // Get filtered and organized routes
  const getFilteredRoutes = () => {
    if (activeFilter === "all") {
      return routeOptions;
    } else if (activeFilter === "air") {
      return routeOptions.filter(
        (route) => route.modes.length === 1 && route.modes.includes("Air"),
      );
    } else if (activeFilter === "sea") {
      return routeOptions.filter(
        (route) => route.modes.length === 1 && route.modes.includes("Sea"),
      );
    } else if (activeFilter === "land") {
      return routeOptions.filter(
        (route) => route.modes.length === 1 && route.modes.includes("Land"),
      );
    } else {
      return routeOptions;
    }
  };

  // Get featured routes (fastest and most cost-effective) based on current filter
  const getFeaturedRoutes = () => {
    // First, get the filtered routes based on the active filter
    const filteredRoutes = getFilteredRoutes();

    // From the filtered routes, find the fastest option
    const fastest = filteredRoutes.reduce<Route | null>(
      (fastestRoute, currentRoute) => {
        if (
          !fastestRoute ||
          currentRoute.transitTime < fastestRoute.transitTime
        ) {
          return currentRoute;
        }
        return fastestRoute;
      },
      null,
    );

    // From the filtered routes, find the most cost-effective option
    const costEffective = filteredRoutes.reduce<Route | null>(
      (cheapestRoute, currentRoute) => {
        if (!cheapestRoute || currentRoute.cost < cheapestRoute.cost) {
          return currentRoute;
        }
        return cheapestRoute;
      },
      null,
    );

    // If the fastest and most cost-effective are the same, just return one
    if (fastest && costEffective && fastest.id === costEffective.id) {
      return [{ ...fastest, category: "speed" }]; // Use one with speed category
    }

    // Modify the categories to ensure proper display
    const result: Route[] = [];

    if (fastest) {
      result.push({ ...fastest, category: "speed" });
    }

    if (costEffective) {
      result.push({ ...costEffective, category: "cost" });
    }

    return result;
  };

  // Get regular routes (exclude featured ones) based on current filter
  const getRegularRoutes = () => {
    // First, get all routes that match the current filter
    const filteredRoutes = getFilteredRoutes();

    // Get the IDs of the featured routes
    const featuredRoutes = getFeaturedRoutes();
    const featuredIds = featuredRoutes.map((r) => r.id);

    // Return all filtered routes that aren't featured
    return filteredRoutes.filter((r) => !featuredIds.includes(r.id));
  };

  return (
    <div className="results-container">
      <h2>Recommended Route Options</h2>
      <p className="route-summary">
        From <strong>{shipmentDetails.origin}</strong> to{" "}
        <strong>{shipmentDetails.destination}</strong>
      </p>

      <div className="route-filters">
        <button
          className={`filter-button ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          <span className="filter-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
            </svg>
          </span>
          All Routes
        </button>
        <button
          className={`filter-button ${activeFilter === "air" ? "active" : ""}`}
          onClick={() => setActiveFilter("air")}
        >
          <span className="filter-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
            </svg>
          </span>
          Air Only
        </button>
        <button
          className={`filter-button ${activeFilter === "sea" ? "active" : ""}`}
          onClick={() => setActiveFilter("sea")}
        >
          <span className="filter-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 17H6a3 3 0 0 1-3-3V4"></path>
              <path d="M18 17v.01"></path>
              <path d="M18 13v.01"></path>
              <path d="M14 13v.01"></path>
              <path d="M10 13v.01"></path>
              <path d="M6 13v.01"></path>
              <path d="M3 7v.01"></path>
              <path d="M15 7h4.5L21 9h-4.5"></path>
            </svg>
          </span>
          Sea Only
        </button>
        <button
          className={`filter-button ${activeFilter === "land" ? "active" : ""}`}
          onClick={() => setActiveFilter("land")}
        >
          <span className="filter-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="15" height="13"></rect>
              <polyline points="16 8 20 8 23 11 23 16 16 16 16 8"></polyline>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </span>
          Land Only
        </button>
      </div>

      {/* Featured routes section (fastest and most cost-effective) */}
      {getFeaturedRoutes().length > 0 && (
        <div className="route-result-section">
          <h3 className="route-section-title">Recommended Options</h3>
          <div className="route-options">
            {getFeaturedRoutes().map((route) => (
              <div
                key={route.id}
                className={`route-card featured featured-${route.category}`}
              >
                <div className="route-header">
                  <h3>
                    {route.category === "speed"
                      ? "Fastest Option"
                      : route.category === "cost"
                        ? "Most Cost-Effective"
                        : `Option ${route.id}`}
                  </h3>
                  <div className="route-modes">
                    {route.modes.map((mode, index) => (
                      <span
                        key={index}
                        className={`mode-tag mode-${mode.toLowerCase()}`}
                      >
                        {mode}
                        {index < route.modes.length - 1 && (
                          <span className="mode-arrow">→</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="route-details">
                  <div className="detail-item">
                    <span className="detail-label">Estimated Cost:</span>
                    <span className="detail-value">
                      ${route.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Transit Time:</span>
                    <span className="detail-value">
                      {route.transitTime} days
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Border Crossings:</span>
                    <span className="detail-value">
                      {route.borderCrossings}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">CO2 Emissions:</span>
                    <span className="detail-value">{route.co2Emissions}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Reliability:</span>
                    <span className="detail-value">{route.reliability}</span>
                  </div>
                </div>

                <button
                  className="select-route-button"
                  onClick={() => showRouteDetails(route)}
                >
                  View Detailed Route
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other routes section */}
      {getRegularRoutes().length > 0 && (
        <div className="route-result-section">
          <h3 className="route-section-title">Alternative Options</h3>
          <div className="route-options">
            {getRegularRoutes().map((route) => (
              <div key={route.id} className="route-card">
                <div className="route-header">
                  <h3>Option {route.id}</h3>
                  <div className="route-modes">
                    {route.modes.map((mode, index) => (
                      <span
                        key={index}
                        className={`mode-tag mode-${mode.toLowerCase()}`}
                      >
                        {mode}
                        {index < route.modes.length - 1 && (
                          <span className="mode-arrow">→</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="route-details">
                  <div className="detail-item">
                    <span className="detail-label">Estimated Cost:</span>
                    <span className="detail-value">
                      ${route.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Transit Time:</span>
                    <span className="detail-value">
                      {route.transitTime} days
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Border Crossings:</span>
                    <span className="detail-value">
                      {route.borderCrossings}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">CO2 Emissions:</span>
                    <span className="detail-value">{route.co2Emissions}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Reliability:</span>
                    <span className="detail-value">{route.reliability}</span>
                  </div>
                </div>

                <button
                  className="select-route-button"
                  onClick={() => showRouteDetails(route)}
                >
                  View Detailed Route
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {getFilteredRoutes().length === 0 && (
        <div className="no-results">
          <p>
            No routes found for the selected filter. Try a different option.
          </p>
        </div>
      )}

      <button className="back-button" onClick={() => navigate("/")}>
        Back to Form
      </button>
    </div>
  );
}
