import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./md3/md3-theme.css";

import "@material/web/textfield/outlined-text-field.js";
import "@material/web/button/filled-button.js";

import "@material/web/labs/navigationbar/navigation-bar.js";
import "@material/web/labs/navigationtab/navigation-tab.js";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
