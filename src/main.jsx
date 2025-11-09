import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/output.css";
import App from "./App.jsx";

import AppDataContextProvider from "./context/AppDataContext";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<AppDataContextProvider>
			<App />
		</AppDataContextProvider>
	</StrictMode>
);