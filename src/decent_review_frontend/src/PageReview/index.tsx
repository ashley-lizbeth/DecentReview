import { useNavigate, useParams } from "react-router";
import { actor } from "../components/auth";
import { useEffect, useState } from "react";
import feather from "feather-icons";
import { ReviewAggregation } from "../../../declarations/decent_review_backend/decent_review_backend.did";

import "./review.css";
import Header from "../components/header";
import { TailSpin } from "react-loader-spinner";

export default function PageReview() {
	const navigate = useNavigate();
	const params = useParams<{ url: string }>();

	const [reviews, setReviews] = useState<ReviewAggregation | null>(null);
	const [opinion, setOpinion] = useState<null | boolean>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isPremium, setIsPremium] = useState(false);

	const [showPopupToReview, setShowPopupToReview] = useState(false);

	useEffect(() => {
		async function fetchReviews() {
			if (!params.url || reviews) return;
			const fetchedReviews = await actor.obtainReviewsOf(params.url);
			setReviews(fetchedReviews);
		}

		async function fetchPreviousReview() {
			if (!params.url) return;
			const opinion = await actor.getReviewOf(params.url);
			setOpinion(opinion.length == 1 ? opinion[0] : null);
		}

		async function fetchIdentity() {
			const loggedIn = (await actor.whoAmI()).isAnonymous();
			setIsLoggedIn(loggedIn);

			if (!loggedIn) return;

			const status = await actor.isPremium();
			setIsPremium(status);
		}

		fetchReviews();
		fetchPreviousReview();
		fetchIdentity();
	}, []);

	function getCategoryCount(): number[] {
		if (!reviews) return [];

		let counts: number[] = [];
		reviews.categoryCount.forEach((count, i) => {
			counts[i] = count;
		});
		return counts;
	}

	const url = params.url;
	if (!url) {
		navigate("/");
		return;
	}

	return (
		<main>
			<Header />
			{reviews ? (
				<div className="main-container">
					<div className="review-container">
						<div className="review-header">
							<h1 className="review-page-title">Reseñas</h1>
						</div>
						<div className="review-info">
							<p>
								<strong>Página:</strong> {url}
							</p>
						</div>

						<div className="review-actions">
							<div>
								<button
									onClick={async (e) => {
										e.preventDefault();
										setOpinion(true);
										setShowPopupToReview(true);
									}}
									dangerouslySetInnerHTML={{
										__html: feather.icons["thumbs-up"].toSvg({
											fill: opinion === true ? "green" : "white",
											stroke: opinion === true ? "black" : "green",
										}),
									}}
									disabled={!isLoggedIn || opinion == true}
								/>
								<span className="like-count">{reviews.likes.toString()}</span>

								<button
									onClick={async (e) => {
										e.preventDefault();
										setOpinion(false);
										setShowPopupToReview(true);
									}}
									dangerouslySetInnerHTML={{
										__html: feather.icons["thumbs-down"].toSvg({
											fill: opinion === false ? "red" : "white",
											stroke: opinion === false ? "black" : "red",
										}),
									}}
									disabled={!isLoggedIn || opinion == false}
								/>
								<span className="like-count">
									{reviews.dislikes.toString()}
								</span>
							</div>
							{isLoggedIn ? (
								<></>
							) : (
								"Inicia sesion con tu Internet Identity para dejar una reseña"
							)}
						</div>
						<ul className="review-categories">
							{getCategoryCount().map((count, i) => {
								if (count == 0) return <></>;

								return (
									<li key={i}>
										{getCategoryStringFromOpinionAndIndex(i < 4, i % 4)}:{" "}
										{count}
									</li>
								);
							})}
						</ul>
					</div>

					<div className="reviews-container">
						<h2>Comentarios: </h2>

						<div className="reviews-list">
							{reviews.comments.length == 0 ? (
								<p>No hay comentarios disponibles</p>
							) : (
								reviews.comments.map((review) => (
									<>
										<div className="review-item">
											<p>
												<span
													style={{ marginRight: 10 }}
													dangerouslySetInnerHTML={{
														__html:
															review.opinion == true
																? feather.icons["thumbs-up"].toSvg({
																		fill: "green",
																  })
																: feather.icons["thumbs-down"].toSvg({
																		fill: "red",
																  }),
													}}
												/>
												{review.comment}
											</p>
										</div>
									</>
								))
							)}
						</div>
						<div>
							{isPremium ? (
								opinion != null ? (
									<NewCommentForm
										url={url}
										opinion
										callback={() => navigate(0)}
									/>
								) : (
									<p>Para comentar, por favor primero opina</p>
								)
							) : (
								<p>Deseas comentar algo? Unete al programa Premium!</p>
							)}
						</div>
					</div>

					{showPopupToReview ? (
						<NormalReviewModal
							opinion={opinion ?? false}
							url={url}
							callback={() => {
								setShowPopupToReview(false);
								navigate(0);
							}}
						/>
					) : (
						<></>
					)}
				</div>
			) : (
				<span className="loading-spinner">
					<TailSpin color="blue" height={200} width={200} />
				</span>
			)}
		</main>
	);
}

function NewCommentForm({
	opinion,
	url,
	callback,
}: {
	opinion: boolean;
	url: string;
	callback: () => void;
}) {
	const [comment, setComment] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				setIsUploading(true);
				await actor.createPremiumReview({
					comment: comment,
					opinion: opinion,
					url: url,
				});
				setIsUploading(false);
				callback();
			}}
		>
			<input
				type="text"
				required
				value={comment}
				onChange={(e) => setComment(e.target.value)}
			/>
			<button
				dangerouslySetInnerHTML={{ __html: feather.icons.send.toSvg() }}
				disabled={isUploading}
			/>
		</form>
	);
}

function NormalReviewModal({
	opinion,
	url,
	callback,
}: {
	opinion: boolean;
	url: string;
	callback: () => void;
}) {
	const [categories, setCategories] = useState<boolean[]>([
		false,
		false,
		false,
		false,
	]);

	const [isUploading, setIsUploading] = useState(false);
	function getSelectedCategories(): bigint[] {
		let selected: bigint[] = [];
		categories.forEach((value, i) => {
			if (value) selected.push(BigInt(i));
		});
		return selected;
	}

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				setIsUploading(true);
				await actor.createNormalReview({
					url,
					opinion,
					categories: getSelectedCategories(),
				});
				setIsUploading(false);
				callback();
			}}
			style={{
				position: "absolute",
				display: "flex",
				width: "100svw",
				height: "100svh",
				justifyItems: "center",
				alignItems: "center",
			}}
		>
			<div
				style={{
					padding: "10px",
					backgroundColor: "white",
					borderRadius: "8px",
				}}
			>
				{isUploading ? (
					<TailSpin color="green" />
				) : (
					<>
						<p>¿Como calificarias esta pagina?</p>
						{[0, 1, 2, 3].map((i) => (
							<div key={i}>
								<input
									type="checkbox"
									value="on"
									onChange={(e) => {
										let tempCategories = categories;
										tempCategories[i] = e.target.value == "on";
										setCategories(tempCategories);
									}}
								/>
								<label>
									{getCategoryStringFromOpinionAndIndex(opinion, i)}
								</label>
							</div>
						))}
						<br />
						<div
							style={{
								width: "100%",
								justifyContent: "center",
								marginBottom: "5px",
							}}
						>
							<button style={{ padding: "5px", borderRadius: "4px" }}>
								Calificar
							</button>
						</div>
					</>
				)}
			</div>
		</form>
	);
}

function getCategoryStringFromOpinionAndIndex(
	opinion: boolean,
	categoryIndex: number
): string {
	if (opinion) {
		if (categoryIndex == 0) return "Original";
		if (categoryIndex == 1) return "Informativa";
		if (categoryIndex == 2) return "Muy interesante";
		if (categoryIndex == 3) return "Util";
	} else {
		if (categoryIndex == 0) return "No original";
		if (categoryIndex == 1) return "Desinformativa";
		if (categoryIndex == 2) return "Poco interesante";
		if (categoryIndex == 3) return "Poco util";
	}

	return "";
}
