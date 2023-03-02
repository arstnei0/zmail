<script lang="ts">
	import { trpc } from "./trpc"

	;(async () => {
		console.log(await trpc.messages.all.query())
	})()
</script>
