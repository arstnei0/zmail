import z from "zod"
import { initTRPC } from "@trpc/server"
import * as dotenv from "dotenv"
import { getGmailClient } from "./gmail"
import { CreateContextOptions } from "electron-trpc/main"
dotenv.config()

export const createContext = async (opts: CreateContextOptions) => {
	const gmail = await getGmailClient()
	return { gmail }
}

const t = initTRPC.context<typeof createContext>().create({ isServer: true })

const procedure = t.procedure.use(
	t.middleware(async ({ ctx, next }) => {
		const gmail = await getGmailClient()
		return next({
			ctx: {
				gmail,
			},
		})
	})
)

export const router = t.router({
	messages: t.router({
		all: procedure.query(async ({ ctx: { gmail } }) => {
			console.log("WTF")
			console.log(gmail)
		}),
	}),
})

export type AppRouter = typeof router
