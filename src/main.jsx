import React from "react";
import { createRoot } from "react-dom/client";
import InvoiceTool from "./InvoiceTool.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <InvoiceTool />
  </React.StrictMode>
);
