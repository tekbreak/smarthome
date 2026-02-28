import { StrictMode } from "react";
import { Provider } from "react-redux";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./app/global.css";

import App from "./app/app";
import { store } from "./app/state/store";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
