import React from "react";
import "./App.css";
import Homepage from "./views/home";
import { Toaster } from "./components/ui/toaster";

function App() {
	return (
		<div className="">
			<Homepage />
			<Toaster />
		</div>
	);
}

export default App;
