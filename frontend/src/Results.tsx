import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { getRoutes, Route } from "./api";
import { Shipment } from "./Home";
import Spinner from "./Spinner";
const WEIGHT_LIMITS = {
  Air: 45000, // 45,000 kg per ULD
  Sea: 20000 * 1000, // 20,000 TEU (assuming 1 TEU ~= 1000 kg)
  Land: 25000, // 25,000 kg per truckload
};
export default function Results() {
  const location = useLocation();
  const shipmentDetails = location.state as Shipment;
  const navigate = useNavigate();
  const [weightWarnings, setWeightWarnings] = useState<{
    [key: string]: boolean;
  }>({});
  // Extract priority directly from shipmentDetails for easy access
  const priority = shipmentDetails?.priority || "balanced";

  const [isLoading, setIsLoading] = useState(false);

  const [allRouteOptions, setAllRouteOptions] = useState<Route[]>([]);
  useEffect(() => {
    if (shipmentDetails?.weight) {
      const weight = parseFloat(shipmentDetails.weight);
      const warnings: { [key: string]: boolean } = {};

      // Check each transportation mode
      Object.entries(WEIGHT_LIMITS).forEach(([mode, limit]) => {
        warnings[mode] = weight > limit;
      });

      setWeightWarnings(warnings);
    }
  }, [shipmentDetails?.weight]);

  const onLoad = async () => {
    setIsLoading(true);

    const routes = await getRoutes(
      shipmentDetails.origin,
      shipmentDetails.destination,
      shipmentDetails.priority,
      shipmentDetails.goodsType,
      shipmentDetails.weight,
    );

    setAllRouteOptions(routes);

    setIsLoading(false);
  };

  useEffect(() => {
    onLoad();
  }, []);

  // Filter routes based on priority selected in the Home page
  const priorityFilteredRoutes = React.useMemo(() => {
    // Apply the priority filter
    if (priority === "cost") {
      // Sort by cost (lowest first)
      return [...allRouteOptions].sort(
        (a, b) => a.data.total_cost - b.data.total_cost,
      );
    } else if (priority === "speed") {
      // Sort by transit time (fastest first)
      return [...allRouteOptions].sort(
        (a, b) => a.data.total_time - b.data.total_time,
      );
    } else if (priority === "eco") {
      // Sort by emissions (lowest first)
      return [...allRouteOptions].sort(
        (a, b) =>
          Number(a.data.total_emissions) - Number(b.data.total_emissions),
      );
    } else {
      // For "balanced" - use a combined score
      return [...allRouteOptions].sort((a, b) => {
        // Normalize values between 0-1
        const maxCost = Math.max(
          ...allRouteOptions.map((r) => r.data.total_cost),
        );
        const maxTime = Math.max(
          ...allRouteOptions.map((r) => r.data.total_time),
        );

        // Calculate balanced score (lower is better)
        const scoreA =
          (a.data.total_cost / maxCost) * 0.5 +
          (a.data.total_time / maxTime) * 0.5;
        const scoreB =
          (b.data.total_cost / maxCost) * 0.5 +
          (b.data.total_time / maxTime) * 0.5;

        return scoreA - scoreB;
      });
    }
  }, [allRouteOptions, priority]);

  // Get recommended routes (top 3)
  const getRecommendedRoutes = () => {
    return priorityFilteredRoutes.slice(0, 3);
  };

  // Get additional routes (everything after top 3)
  const getAdditionalRoutes = () => {
    return priorityFilteredRoutes.slice(3);
  };

  // Navigate to detailed route view
  const showRouteDetails = (route: Route) => {
    navigate("/details", { state: { shipmentDetails, selectedRoute: route } });
  };

  // Get the priority label for UI display
  const getPriorityLabel = () => {
    switch (priority) {
      case "cost":
        return "Cost-Effective";
      case "speed":
        return "Fastest";
      case "eco":
        return "Eco-Friendly";
      default:
        return "Balanced";
    }
  };

  // Get the priority emoji/icon
  const getPriorityIcon = () => {
    switch (priority) {
      case "cost":
        return "💰"; // Money bag for cost-effective
      case "speed":
        return "⚡"; // Lightning for speed
      case "eco":
        return "🌿"; // Leaf for eco-friendly
      default:
        return "⚖️"; // Balance scale for balanced
    }
  };

  // Format transit time to days and hours
  const formatTransitTime = (hours: number) => {
    if (hours < 24) {
      return `${Math.floor(hours)} hours`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return remainingHours > 0
      ? `${days} days ${remainingHours} hrs`
      : `${days} days`;
  };

  // Check if any transportation mode has a weight warning
  const hasWeightWarning = Object.values(weightWarnings).some(
    (warning) => warning,
  );

  return (
    <div className="results-container">
      {/* Weight Warning Banner */}
      {hasWeightWarning && (
        <div className="weight-warning-banner">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            <strong>Weight limit exceeded.</strong> Updated to a higher capacity
            cargo. Extra costs are included.
          </div>
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : priorityFilteredRoutes.length > 0 ? (
        <div className="routes-content">
          {/* Top 3 Recommendations Section */}
          <section className="route-section recommended-section">
            <div className="top-recommendations-header">
              <div className="header-badge">Top 3 Recommended Routes</div>

              <p className="recommendation-description">
                These routes are optimized for{" "}
                {getPriorityLabel().toLowerCase()} based on your preferences
              </p>
            </div>

            <div className="recommended-routes-grid">
              {getRecommendedRoutes().map((route, index) => (
                <div
                  key={index}
                  className={`route-card recommended rank-${index + 1}`}
                  onClick={() => showRouteDetails(route)}
                >
                  <div className="recommendation-badge">
                    #{index + 1} Recommended
                  </div>
                  <div className="route-card-inner">
                    <div className="card-main-info">
                      <div className="transport-modes">
                        {route.data.modes.map((mode, idx) => (
                          <span
                            key={idx}
                            className={`mode-tag mode-${mode.toLowerCase()}`}
                          >
                            {mode === "Air"
                              ? "✈️"
                              : mode === "Sea"
                                ? "🚢"
                                : "🚚"}{" "}
                            {mode}
                          </span>
                        ))}
                      </div>

                      <div className="route-path-display">
                        <div className="path-endpoint">
                          {shipmentDetails?.origin}
                        </div>
                        <div className="path-arrow">→</div>
                        <div className="path-endpoint">
                          {shipmentDetails?.destination}
                        </div>
                      </div>
                    </div>

                    <div className="key-metrics">
                      <div className="metric primary">
                        <span className="metric-emphasis">
                          {priority === "cost"
                            ? "₹" + route.data.total_cost.toFixed(2)
                            : priority === "speed"
                              ? formatTransitTime(route.data.total_time)
                              : priority === "eco"
                                ? `${route.data.total_emissions.toFixed(2)} kg CO₂`
                                : "₹" + route.data.total_cost.toFixed(2)}
                        </span>
                        <span className="metric-label-primary">
                          {getPriorityLabel()} Option
                        </span>
                      </div>

                      <div className="metrics-secondary">
                        <div className="metric">
                          <span className="metric-icon">💰</span>
                          <span className="metric-value">
                            ₹{route.data.total_cost.toFixed(2) || "N/A"}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-icon">⏱️</span>
                          <span className="metric-value">
                            {formatTransitTime(route.data.total_time)}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-icon">🌿</span>
                          <span className="metric-value">
                            {route.data.total_emissions
                              ? `${route.data.total_emissions.toFixed(2)} kg`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button className="details-button">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="section-divider">
            <span className="divider-text">Additional Options</span>
          </div>

          {getAdditionalRoutes().length > 0 && (
            <section className="route-section additional-section">
              <div className="additional-routes-list">
                {getAdditionalRoutes().map((route, index) => (
                  <div
                    key={index}
                    className="route-card alternative"
                    onClick={() => showRouteDetails(route)}
                  >
                    <div className="alt-route-content">
                      <div className="alt-route-main">
                        <div className="alt-route-header">
                          <h3 className="alt-route-name">{index}</h3>
                          <div className="alt-route-modes">
                            {route.data.modes.map((mode, index) => (
                              <span
                                key={index}
                                className={`mode-tag mode-${mode.toLowerCase()}`}
                              >
                                {mode}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="alt-route-metrics">
                          <div className="alt-metric-item">
                            <span className="alt-metric-icon">💰</span>
                            <div className="alt-metric-detail">
                              <span className="alt-metric-value">
                                ₹
                                {route.data.total_cost?.toLocaleString() ||
                                  "N/A"}
                              </span>
                              <span className="alt-metric-label">Cost</span>
                            </div>
                          </div>
                          <div className="alt-metric-item">
                            <span className="alt-metric-icon">⏱️</span>
                            <div className="alt-metric-detail">
                              <span className="alt-metric-value">
                                {formatTransitTime(route.data.total_time)}
                              </span>
                              <span className="alt-metric-label">
                                Transit Time
                              </span>
                            </div>
                          </div>
                          <div className="alt-metric-item">
                            <span className="alt-metric-icon">🌿</span>
                            <div className="alt-metric-detail">
                              <span className="alt-metric-value">
                                {route.data.total_emissions
                                  ? `${route.data.total_emissions} kg`
                                  : "N/A"}
                              </span>
                              <span className="alt-metric-label">
                                CO₂ Emissions
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="alt-route-visual">
                        <div className="alt-route-path">
                          <div className="alt-route-origin">
                            {shipmentDetails?.origin}
                          </div>
                          <div className="alt-route-line">
                            {route.data.modes.map((mode, idx) => (
                              <span
                                key={idx}
                                className={`alt-route-icon mode-${mode.toLowerCase()}`}
                              >
                                {mode === "Air"
                                  ? "✈️"
                                  : mode === "Sea"
                                    ? "🚢"
                                    : "🚚"}
                              </span>
                            ))}
                          </div>
                          <div className="alt-route-destination">
                            {shipmentDetails?.destination}
                          </div>
                        </div>
                      </div>

                      <div className="alt-route-action">
                        <button className="alt-details-button">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="no-routes-container">
          <div className="no-routes-content">
            <div className="no-routes-icon">🔍</div>
            <h3 className="no-routes-title">No Routes Found</h3>
            <p className="no-routes-message">
              No routes are available for your shipment details. Please try
              different parameters.
            </p>
            <button className="back-button" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
