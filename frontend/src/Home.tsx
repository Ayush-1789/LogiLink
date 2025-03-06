import React from "react";
import * as yup from "yup";
import { Formik } from "formik";
import { useNavigate } from "react-router";

type ShipmentDimensions = {
  length: string;
  width: string;
  height: string;
};

export type Shipment = {
  origin: string;
  destination: string;
  weight: string;
  dimensions: ShipmentDimensions;
  priority: string;
  hazardous: boolean;
  perishable: boolean;
  value: string;
  description: string;
};

export default function Home() {
  const navigate = useNavigate();

  const schema: yup.SchemaOf<Shipment> = yup.object({
    origin: yup.string().required(),
    destination: yup.string().required(),
    weight: yup.string().required(),
    dimensions: yup.object({
      length: yup.string(),
      width: yup.string(),
      height: yup.string(),
    }),
    priority: yup.string(),
    hazardous: yup.boolean(),
    perishable: yup.boolean(),
    value: yup.string(),
    description: yup.string(),
  });

  return (
    <Formik
      className="form-container"
      validationSchema={schema}
      initialValues={{
        origin: "",
        destination: "",
        weight: "",
        dimensions: { length: "", width: "", height: "" },
        priority: "balanced", // Default priority
        hazardous: false,
        perishable: false,
        value: "",
        description: "",
      }}
      onSubmit={(data) => navigate("/results", { state: data })}
    >
      {(formikProps) => (
        <form noValidate onSubmit={formikProps.handleSubmit}>
          <div className="form-card">
            <h2 className="section-title">Shipment Details</h2>

            <div className="form-section">
              <div className="form-row two-columns">
                <div className="form-field">
                  <label htmlFor="origin">Origin</label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={formikProps.values.origin}
                    onChange={formikProps.handleChange}
                    placeholder="City, Country"
                    required
                    className="input-field"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="destination">Destination</label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formikProps.values.destination}
                    onChange={formikProps.handleChange}
                    placeholder="City, Country"
                    required
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-card">
            <h2 className="section-title">Cargo Specifications</h2>

            <div className="form-section">
              <div className="form-row two-columns">
                <div className="form-field">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formikProps.values.weight}
                    onChange={formikProps.handleChange}
                    min="0"
                    step="0.1"
                    required
                    className="input-field"
                    placeholder="0.0"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="value">Value (USD)</label>
                  <input
                    type="number"
                    id="value"
                    name="value"
                    value={formikProps.values.value}
                    onChange={formikProps.handleChange}
                    min="0"
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field full-width">
                  <label>Dimensions (cm)</label>
                  <div className="dimensions-container">
                    <div className="dimension-field">
                      <label htmlFor="length">Length</label>
                      <input
                        type="number"
                        id="length"
                        name="dimensions.length"
                        value={formikProps.values.dimensions.length}
                        onChange={formikProps.handleChange}
                        min="0"
                        className="input-field"
                        placeholder="0"
                      />
                    </div>
                    <div className="dimension-field">
                      <label htmlFor="width">Width</label>
                      <input
                        type="number"
                        id="width"
                        name="dimensions.width"
                        value={formikProps.values.dimensions.width}
                        onChange={formikProps.handleChange}
                        min="0"
                        className="input-field"
                        placeholder="0"
                      />
                    </div>
                    <div className="dimension-field">
                      <label htmlFor="height">Height</label>
                      <input
                        type="number"
                        id="height"
                        name="dimensions.height"
                        value={formikProps.values.dimensions.height}
                        onChange={formikProps.handleChange}
                        min="0"
                        className="input-field"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field full-width">
                  <label htmlFor="description">Cargo Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formikProps.values.description}
                    onChange={formikProps.handleChange}
                    rows={3}
                    className="input-field textarea"
                    placeholder="Brief description of your cargo"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field full-width checkbox-container">
                  <label className="checkbox-group-label">
                    Special Requirements
                  </label>
                  <div className="checkbox-group">
                    <div className="checkbox-field">
                      <input
                        type="checkbox"
                        id="hazardous"
                        name="hazardous"
                        checked={formikProps.values.hazardous}
                        onChange={formikProps.handleChange}
                      />
                      <label htmlFor="hazardous">Hazardous Materials</label>
                    </div>
                    <div className="checkbox-field">
                      <input
                        type="checkbox"
                        id="perishable"
                        name="perishable"
                        checked={formikProps.values.perishable}
                        onChange={formikProps.handleChange}
                      />
                      <label htmlFor="perishable">Perishable Goods</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-card">
            <h2 className="section-title">Shipping Preferences</h2>

            <div className="form-section">
              <div className="form-row">
                <div className="form-field full-width">
                  <label htmlFor="priority">Delivery Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formikProps.values.priority}
                    onChange={formikProps.handleChange}
                    className="input-field select-field"
                  >
                    <option value="cost">Cost-effective</option>
                    <option value="speed">Fastest delivery</option>
                    <option value="balanced">Balanced</option>
                    <option value="eco">Eco-friendly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Find Optimal Routes
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={formikProps.handleReset}
            >
              Clear Form
            </button>
          </div>
        </form>
      )}
    </Formik>
  );
}
