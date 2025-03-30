import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import Home from "./Home";
import PageReview from "./PageReview";
import Header from "./components/header";

import "./index.scss";

ReactDOM.createRoot(
	document.getElementById("root") as ReactDOM.Container
).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/review/:url" element={<PageReview />} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);
