import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Shipment } from "./Home";
import Map from "./Map";
import LocationWeather from "./LocationWeather";
import { DetailedRoute } from "./DetailedRoute";
import { Route } from "./api";

type RouteStats = {
  totalDistance: number;
  totalBorderCrossings: number;
};

export default function RouteDetails() {
  const location = useLocation();

  const shipmentDetails = location.state.shipmentDetails as Shipment;

  const selectedRoute = location.state.selectedRoute as Route;

  const navigate = useNavigate();

  const calculateRouteStats = (detailedRoutes: DetailedRoute[]): RouteStats => {
    let totalDistance = 0;
    let totalBorderCrossings = 0;

    detailedRoutes.forEach((segment) => {
      totalDistance += parseInt(segment.distance.replace(/,/g, ""));
      if (segment.borderCrossing) totalBorderCrossings += 1;
    });

    return { totalDistance, totalBorderCrossings };
  };

  function capitalize(str: string) {
    if (str.length === 0) return str; // Handle empty string
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="detailed-route-container">
      <h2>Detailed Route Information</h2>
      <div className="route-overview">
        <p className="route-summary">
          From <strong>{shipmentDetails.origin}</strong> to{" "}
          <strong>{shipmentDetails.destination}</strong>
        </p>
        <div style={{ width: "100%", height: "400px" }}>
          <Map route={selectedRoute} />
        </div>
        <div className="overview-cards">
          <div className="overview-card">
            <span className="overview-icon cost-icon"></span>
            <div className="overview-details">
              <span className="overview-label">Total Cost</span>
              <span className="overview-value">
                ${selectedRoute.data.total_cost.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="overview-card">
            <span className="overview-icon time-icon"></span>
            <div className="overview-details">
              <span className="overview-label">Transit Time</span>
              <span className="overview-value">
                {selectedRoute.data.total_time.toFixed(2)} days
              </span>
            </div>
          </div>
          <div className="overview-card">
            <span className="overview-icon distance-icon"></span>
            <div className="overview-details">
              <span className="overview-label">Total Distance</span>
              <span className="overview-value">
                {selectedRoute.data.total_distance.toFixed(2)} km
              </span>
            </div>
          </div>
          {/* New box for total emissions */}
          <div className="overview-card">
            <span className="overview-icon emissions-icon">🌿</span>
            <div className="overview-details">
              <span className="overview-label">Total Emissions</span>
              <span className="overview-value">
                {selectedRoute.data.total_emissions.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="route-timeline">
        {selectedRoute.data.segments.map((segment, index) => (
          <div key={index} className="timeline-segment">
            <div
              className={`timeline-point mode-${segment.mode.toLowerCase()}-point`}
            >
              <div className="timeline-point-icon"></div>
            </div>
            <div className="timeline-line">
              {index < selectedRoute.data.segments.length - 1 && (
                <div
                  className={`timeline-mode-line mode-${segment.mode.toLowerCase()}-line`}
                ></div>
              )}
            </div>
            <div className="timeline-card">
              <div className="timeline-header">
                <h3
                  className={`timeline-title mode-${segment.mode.toLowerCase()}-text`}
                >
                  {capitalize(segment.mode)} Transport
                </h3>
                <span className="timeline-subtitle">
                  {segment.start} → {segment.end}
                </span>
              </div>
              <div className="timeline-details">
                <div className="detail-group">
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">
                      {segment.time_hr.toFixed(2)} hours
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Distance:</span>
                    <span className="detail-value">
                      {segment.distance_km.toFixed(2)} km
                    </span>
                  </div>
                </div>

                {segment.coordinates && (
                  <div className="weather-section">
                    <LocationWeather
                      coords={segment.coordinates[0]}
                      location={segment.start}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="detailed-route-actions">
        <button
          className="secondary-button"
          onClick={() => navigate("/results", { state: shipmentDetails })}
        >
          Back to Route Options
        </button>
        <button className="primary-button">Book This Route</button>
      </div>
    </div>
  );
}
