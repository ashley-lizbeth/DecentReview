import { NavLink, useNavigate } from "react-router";
import feather from "feather-icons";
import "./header.css";
import { useState } from "react";
import LoginWithInternetIdentity from "./auth";

export default function Header() {
	const [query, setQuery] = useState("");
	const navigate = useNavigate();

	return (
		<header className="p-3 bg-dark text-white position-fixed top-0 w-100 shadow">
			<div className="container">
				<div className="d-flex flex-wrap align-items-center justify-content-between">
					<a href="/">
						<svg className="bi me-2" width="40" height="20" role="img"></svg>
					</a>

					<ul className="nav">
						<li>
							<NavLink to={"/"}>DecentReviews</NavLink>
						</li>

						<li>
							<form
								className="a1"
								onSubmit={(e) => {
									e.preventDefault();
									navigate(`/review/${query}`);
								}}
							>
								<input
									type="search"
									className="form-control-header"
									placeholder="Search page"
									aria-label="Search"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
								/>
								<button
									dangerouslySetInnerHTML={{
										__html: feather.icons.search.toSvg(),
									}}
								/>
							</form>
						</li>
					</ul>

					<div className="text-end">
						<button
							type="button"
							className="btn btn-outline-light me-2"
							onClick={async (e) => {
								e.preventDefault();
								await LoginWithInternetIdentity();
							}}
						>
							Iniciar sesion
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}
