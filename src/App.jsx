import LoanSimulation  from "./pages/guest/LoanSimulation";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/loan-simulation" element={<LoanSimulation />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
