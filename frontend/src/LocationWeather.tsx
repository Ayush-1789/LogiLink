import React from "react";
import { useWeather } from "./Weather";

export default function LocationWeather({ coords, location }) {
  const { weatherData, loading, error } = useWeather(coords[0], coords[1]);

  if (!coords) return null;

  return (
    <div className="location-weather">
      <h4 className="weather-location-title">
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
          <path d="M8 5.4A4 4 0 0 1 12 4a4 4 0 0 1 4 1.4"></path>
          <path d="M4 10h.01"></path>
          <path d="M20 10h.01"></path>
          <path d="M12 14a6 6 0 0 0-6-6h-.01a6 6 0 0 0-6 6h12.01A6 6 0 0 0 18 8h-.01a6 6 0 0 0-6 6"></path>
        </svg>
        Current Weather at {location}
      </h4>

      {loading ? (
        <div className="weather-loading">Loading weather data...</div>
      ) : error ? (
        <div className="weather-error">Weather data unavailable</div>
      ) : weatherData ? (
        <div className="weather-data-grid">
          <div className="weather-data-item">
            <span className="weather-data-label">Temperature</span>
            <span className="weather-data-value">
              {weatherData.current.temperature2m}°C
            </span>
          </div>

          <div className="weather-data-item">
            <span className="weather-data-label">Rain</span>
            <span className="weather-data-value">
              {weatherData.current.rain} mm
            </span>
          </div>

          {weatherData.current.showers > 0 && (
            <div className="weather-data-item">
              <span className="weather-data-label">Showers</span>
              <span className="weather-data-value">
                {weatherData.current.showers} mm
              </span>
            </div>
          )}

          {weatherData.current.snowfall > 0 && (
            <div className="weather-data-item">
              <span className="weather-data-label">Snowfall</span>
              <span className="weather-data-value">
                {weatherData.current.snowfall} cm
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="weather-error">No weather data available</div>
      )}
    </div>
  );
}
