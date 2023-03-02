import opn from "open"
import { createServer } from "http"
import { OAuth2Client } from "google-auth-library"
import { prisma } from "./db"

export const authorize = (): Promise<OAuth2Client> => {
	return new Promise(async (resolve, reject) => {
		const credential = await prisma.credential.findUnique({
			where: { id: 0 },
		})
		const client = new OAuth2Client({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		})

		if (credential) {
			client.credentials = { ...{ ...credential, id: undefined } } as any
			resolve(client)
		} else {
			const redirectUrl = new URL("http://localhost:9375")
			const server = createServer(async (req, res) => {
				try {
					const url = new URL(req.url!, "http://localhost:3000")
					if (url.pathname !== redirectUrl.pathname) {
						res.end("Invalid callback URL")
						return
					}
					const searchParams = url.searchParams
					if (searchParams.has("error")) {
						res.end("Authorization rejected.")
						reject(new Error(searchParams.get("error")!))
						return
					}
					if (!searchParams.has("code")) {
						res.end("No authentication code provided.")
						reject(new Error("Cannot read authentication code."))
						return
					}

					const code = searchParams.get("code")
					const { tokens } = await client.getToken({
						code: code!,
						redirect_uri: redirectUrl.toString(),
					})
					client.credentials = tokens
					await prisma.credential.create({
						data: {
							...tokens,
						},
					})
					resolve(client)
					res.end("Success! You can close this now.")
				} catch (e) {
					reject(e)
				} finally {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					server.close()
				}
			})
			server.listen(9375, () => {
				const url = client.generateAuthUrl({
					scope: ["https://mail.google.com/"],
					access_type: "offline",
					redirect_uri: redirectUrl.href,
				})
				opn(url)
			})
		}
	})
}
