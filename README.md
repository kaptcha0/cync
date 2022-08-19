# Cync
> Pronounced "sync"

Cync is a simple WIP that syncs iCal files pulled from the internet to a Notion database.
A goal will be to add 2-way compatibility, but from the calendar to Notion is OK for now.

## Notion Requirements
2 Databases with read/write access given to the integration:

1. Calendar
	- Text field called `Event`
	- Select field called `Calendar`
	- Date field called `Date`
	- Text field called `ID`
	- URL field called `URL`
2. Settings
	- Text field called `Name`
	- URL field called `URL`

## Required Environment Variables
- `NOTION_CALENDAR_ID`
	- Holds the ID for the Notion database that will be acting as Notion's calendars

- `NOTION_SETTINGS_ID`
	- Holds settings for the integration:
		1. Name of the calendar
	  2. URL of the iCal

- `NOTION_KEY`
	- Holds the Notion integration token

See [the Notion docs](https://developers.notion.com/docs/getting-started) for help on these variables.