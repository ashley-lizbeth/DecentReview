import { AuthClient } from "@dfinity/auth-client";
import {
	createActor,
	decent_review_backend,
} from "../../../declarations/decent_review_backend";
import { HttpAgent } from "@dfinity/agent";

export let actor = decent_review_backend;

export default async function LoginWithInternetIdentity() {
	let authClient = await AuthClient.create();

	// start the login process and wait for it to finish
	await new Promise((resolve) => {
		authClient.login({
			identityProvider: process.env.II_URL,
			allowPinAuthentication: true,
			onSuccess: resolve,
		});
	});

	// At this point we're authenticated, and we can get the identity from the auth client:
	const identity = authClient.getIdentity();
	// Using the identity obtained from the auth client, we can create an agent to interact with the IC.
	const agent = await HttpAgent.create({ identity });
	// Using the interface description of our webapp, we create an actor that we use to call the service methods.
	actor = createActor(process.env.BACKEND_CANISTER_ID!, {
		agent,
	});
}
