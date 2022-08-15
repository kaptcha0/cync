import http from 'http'
import { job, setup, status } from './databaseSync'

// Needed for keep-alive functionality on free repl.
const server = http.createServer((_, res) => {
	res.writeHead(status.code)
	res.end(status.message)
})

server.listen(0, '0.0.0.0', async () => {
	const addr = server.address()


	console.log("[SETUP] Setting up settings databases in Notion...")
	await setup()
	console.log("[SETUP] Notion settings database setup\n")

	console.log("[SETUP] Starting cron job")
	job.start()
	console.log('[SETUP] Cron job started successfully\n')

	console.log(`[SERVER] Listening on ${addr.address}:${addr.port}`)
})