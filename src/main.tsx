import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/auth/AuthContext";
import { UnitProvider } from "@/providers/UnitContext";

import App from "./App";
import "./index.css";

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UnitProvider>
          <App />
        </UnitProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);