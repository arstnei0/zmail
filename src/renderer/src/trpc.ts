import { createTRPCProxyClient } from "@trpc/client"
import type { AppRouter } from "../../main/trpc"
import { ipcLink } from "electron-trpc/renderer"

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [ipcLink()],
})
