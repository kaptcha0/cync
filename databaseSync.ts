import nodeCron from 'node-cron'
import { Client } from "@notionhq/client";

const notion = new Client({
	auth: process.env.NOTION_SYNC
})

const calendar = process.env.NOTION_DATABASE_ID

const sync = async () => {
	// Pull iCal from Google Calendar
	// Parse iCal
	// Add items to Notion if not already there (compare using UID value in iCal event)
}

// Run every 10 minutes
export const job = nodeCron.schedule("* 10 * * * *", async () => {
	console.log("[CRON] Synchronizing Google Calendar and Notion...")
	await sync()
	console.log("[CRON] Finished.\n")
})

export const setup = async () => {
	/*
		Create a Notion DB that stores configuration info with the following columns:
			- Calendar name
				- iCal URL
	*/
}

// Status info to be displayed on server
export const status = {
	code: 200,
	message: 'OK'
}