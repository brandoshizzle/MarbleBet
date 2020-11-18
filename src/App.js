import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Dashboard from "./pages/Dashboard";
import Phone from "./pages/Phone";
import Home from "./pages/Home";
import "./milligram.min.css";
import "./App.css";
import Firebase from "firebase";
import config from "./config";

function App() {
	Firebase.initializeApp(config);
	const db = Firebase.database();

	return (
		<RecoilRoot>
			<Router>
				<Switch>
					<Route path="/:roomCode/dashboard" db={db}>
						<Dashboard />
					</Route>
					<Route path="/:roomCode" db={db}>
						<Phone />
					</Route>
					<Route path="/">
						<Home />
					</Route>
				</Switch>
			</Router>
		</RecoilRoot>
	);
}

export default App;
