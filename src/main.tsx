import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "@/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initTheme } from "@/hooks/useTheme";

// Applied before the first paint so the page never flashes the wrong theme.
initTheme();

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root was not found in index.html");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
