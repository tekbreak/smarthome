import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./state/store";
import App from "./app";

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );

describe("App", () => {
  it("should render successfully", () => {
    const { baseElement } = renderWithProviders(<App />);
    expect(baseElement).toBeTruthy();
  });

  it("should render the home dashboard with content", () => {
    const { baseElement } = renderWithProviders(<App />);
    expect(baseElement.querySelector("div")).toBeTruthy();
  });
});
