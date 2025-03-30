import { useNavigate, useParams } from "react-router";
import { actor } from "../components/auth";
import { useEffect, useState } from "react";
import feather from "feather-icons";
import { ReviewAggregation } from "../../../declarations/decent_review_backend/decent_review_backend.did";

import "./review.css";
import Header from "../components/header";
import { TailSpin } from "react-loader-spinner";
import { p } from "react-router/dist/development/fog-of-war-BaM-ohjc";

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
											fill: opinion == true ? "green" : "",
											stroke: "green",
										}),
									}}
								/>
								<span className="like-count">{reviews.likes.toString()}</span>

								<span
									dangerouslySetInnerHTML={{
										__html: feather.icons["thumbs-down"].toSvg({
											fill: opinion == true ? "red" : "",
											stroke: "red",
										}),
									}}
								/>
								<span className="like-count">
									{reviews.dislikes.toString()}
								</span>
							</div>
						</div>
						<div>
							{(reviews.categoryCount as number[]).map((count, i) => (
								<p key={i}>
									{getCategoryStringFromOpinionAndIndex(i < 4, i % 4)}
									{count}
								</p>
							))}
						</div>
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
														__html: review.opinion
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
									<NewCommentForm />
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
							callback={() => setShowPopupToReview(false)}
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

function NewCommentForm() {
	const [comment, setComment] = useState("");
	return (
		<form>
			<input
				type="text"
				required
				value={comment}
				onChange={(e) => setComment(e.target.value)}
			/>
			<button
				dangerouslySetInnerHTML={{ __html: feather.icons.send.toSvg() }}
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
				await actor.createNormalReview({
					url,
					opinion,
					categories: getSelectedCategories(),
				});
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
					borderRadius: "8px",
				}}
			>
				<p>¿Como calificarias esta pagina?</p>
				{Array(4).map((i) => (
					<div key={i}>
						<label>{getCategoryStringFromOpinionAndIndex(opinion, i)}</label>
						<input
							type="checkbox"
							value="on"
							onChange={(e) => {
								let tempCategories = categories;
								tempCategories[i] = e.target.value == "on";
								setCategories(tempCategories);
							}}
						/>
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
