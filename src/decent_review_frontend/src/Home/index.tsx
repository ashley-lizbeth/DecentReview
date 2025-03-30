import "./home.css";
import Header from "../components/header";

function Home() {
	return (
		<main>
			<Header />
			<div id="container">
				<div id="header-container"></div>

				<div className="clearfix"></div>

				<section id="content">
					<article className="Reviews">
						<h2>Top reviews this week</h2>

						<hr />

						<p>La pagina mas polemica del momento</p>

						<div className="review-item">
							<img
								src="Images/Telcel.png"
								alt="Telcel Review"
								width="100"
								style={{ borderRadius: "10px", marginRight: "10px" }}
							/>

							<div className="review-text">
								<h4>Telcel: Problemas de conexión</h4>

								<p>
									Usuarios reportan fallos constantes en la red 5G de Telcel.
									¿Qué está pasando?
								</p>

								<a href="review.html" className="read-more">
									Leer más
								</a>
							</div>
						</div>

						<div className="review-item">
							<img
								src="Images/Netflix.png"
								alt="Netflix Review"
								width="100"
								style={{ borderRadius: "10px", marginRight: "10px" }}
							/>

							<div className="review-text">
								<h4>Netflix: Nueva política de precios</h4>

								<p>
									Netflix aumenta sus precios nuevamente, causando controversia
									entre los usuarios.
								</p>

								<a href="review.html" className="read-more">
									Leer más
								</a>
							</div>
						</div>
					</article>
				</section>

				<aside>
					<h3>Other reviews</h3>

					<hr />

					<p>Otras paginas populares</p>

					<ul>
						<li>
							<a href="index.html">Netflix</a>

							<p className="platform-desc">
								Plataforma líder en streaming de series y películas.
							</p>
						</li>

						<li>
							<a href="index.html">HBO</a>

							<p className="platform-desc">
								Contenido premium con series aclamadas.
							</p>
						</li>

						<li>
							<a href="index.html">Prime Video</a>

							<p className="platform-desc">
								Streaming de Amazon con contenido exclusivo.
							</p>
						</li>
					</ul>
				</aside>

				<footer>
					<hr />

					<div className="footer-content">
						<p>By DecentReview © 2025</p>

						<div className="footer-links">
							<a href="contact.html">Contacto</a>

							<a href="https://twitter.com">Twitter</a>

							<a href="https://facebook.com">Facebook</a>
						</div>
					</div>
				</footer>
			</div>
		</main>
	);
}

export default Home;
