import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Workspace from "./workspace";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode><Workspace /></StrictMode>,
);
