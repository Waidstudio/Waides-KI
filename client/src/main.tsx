import { createRoot } from "react-dom/client";
import StaticGitHubPage from "./StaticGitHubPage";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

if (import.meta.env.VITE_STATIC_SITE === "true") {
  root.render(<StaticGitHubPage />);
} else {
  import("./App").then(({ default: App }) => {
    root.render(<App />);
  });
}
