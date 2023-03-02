import { google } from "googleapis"
import { authorize } from "./oauth"

const getAuthClient = async () => {
	return await authorize()
}

let authClient: Awaited<ReturnType<typeof getAuthClient>>
let gmailClient: ReturnType<(typeof google)["gmail"]>
export const getGmailClient = async () => {
	if (!authClient) authClient = await getAuthClient()
	if (!gmailClient)
		gmailClient = google.gmail({ auth: authClient, version: "v1" })

	return gmailClient
}
