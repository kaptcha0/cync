import nodeCron from 'node-cron'
import { Client } from "@notionhq/client";
import { markdownToBlocks } from '@tryfabric/martian';
import fetch from 'cross-fetch'
import ICalParser from 'ical-js-parser';

const notion = new Client({
	auth: process.env.NOTION_KEY
})

const calendarId = process.env.NOTION_CALENDAR_ID
const settingsId = process.env.NOTION_SETTINGS_ID

const calendars: {
	[key: string]: {
		name: string,
		url: string
	}
} = {}

function parseDesc(desc: string) {
	let res = unescape(desc)
	res = res.replaceAll('\\n', '\n')

	return res
}

export async function sync() {
	if (!calendarId)
		throw new Error("NOTION_CALENDAR_ID is not defined in the environment variables")

	console.log("[sync] Synchronizing...")

	for (let id in calendars) {
		const { name, url } = calendars[id]

		// Pull iCal from Google Calendar
		const res = await fetch(url)
		const ical = await res.text()

		// Parse iCal
		const json = ICalParser.toJSON(ical)

		for (let [i, ev] of json.events.entries()) {
			console.log(`[sync] Doing ${i + 1}/${json.events.length}`)
			let start = ev.dtstart.value
			let tz = ev.dtstart.timezone
			let end = ev.dtend ? ev.dtend.value : null
			let { summary, description, uid } = ev

			const exists = async (id: string | undefined) => {
				const res = await notion.databases.query({
					database_id: calendarId,
					filter: {
						property: "ID",
						rich_text: {
							equals: id as string
						}
					}
				})

				return res.results.length > 0
			}

			// Skip if it already exists
			if (await exists(uid)) {
				continue
			}

			const rt = description ? parseDesc(description) : ""

			const children = markdownToBlocks(rt)

			const properties = {
				Event: {
					title: [
						{
							type: "text",
							text: {
								content: summary as string
							}
						}
					]
				},
				Calendar: {
					type: "select",
					select: { name }
				},
				Date: {
					type: "date",
					date: {
						start,
						end,
						time_zone: tz
					}
				},
				ID: {
					rich_text: [
						{
							type: "text",
							text: {
								content: ev.uid
							}
						}
					]
				},
				URL: {
					type: "url",
					url: ev.url
				}
			}

			await notion.pages.create({
				children,
				parent: {
					type: "database_id",
					database_id: calendarId
				},
				properties
			})
		}
	}

	console.log("[sync] Done.")
}

export async function setup() {
	if (!settingsId)
		throw new Error("NOTION_SETTINGS_ID is not defined in the environment variables")

	const res = await notion.databases.query({
		database_id: settingsId
	})

	for (let result of res.results) {
		let urlProp = result.properties["URL"].id
		let nameProp = result.properties["Name"].id

		const name = (
			await notion.pages.properties.retrieve({
				page_id: result.id,
				property_id: nameProp
			})
		).results[0].title.plain_text

		const url = (
			await notion.pages.properties.retrieve({
				page_id: result.id,
				property_id: urlProp
			})
		).url

		calendars[result.id] = { name, url }
	}

	await sync()
}

// Run every 7 minutes and 30 seconds
export const job = nodeCron.schedule("30 7 * * * *", async () => {
	status.message = "Synchronizing"
	console.log("[CRON] Synchronizing Google Calendar and Notion...")
	await setup()
	await sync()
	console.log("[CRON] Finished.\n")
	status.messages = "Synchronized"
})

// Status info to be displayed on server
export const status = {
	code: 200,
	message: 'OK'
}