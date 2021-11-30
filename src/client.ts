import "reflect-metadata";
import { Intents, Interaction, Message } from "discord.js";
import { Client } from "discordx";
import { dirname, importx } from "@discordx/importer";
import http from "http";
import express from "express";

process.on('SIGINT', () => {
	console.log('ok baiii');
	client.destroy();
});

if (process.env.KEEP_ALIVE == "true") {
	const app = express();
	app.get("/", (req, res) => {
		console.log(Date.now() + " Ping Received");
		res.sendStatus(200);
	});

	app.listen(process.env.PORT);

	setInterval(() => {
		http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
	}, 280000);
}

const client = new Client({
	simpleCommand: {
		prefix: "!",
	},
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
	// If you only want to use guild commands, uncomment this line
	botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
	silent: true,
});

client.once("ready", async () => {
	// init all application commands
	await client.initApplicationCommands({
		guild: { log: true },
		global: { log: true },
	});

	await client.initApplicationPermissions(true);

	console.log("Bot started");
});

client.on("interactionCreate", (interaction: Interaction) => {
	client.executeInteraction(interaction);
});

client.on("messageCreate", (message: Message) => {
	client.executeCommand(message);
});

async function run() {
	await importx(dirname(import.meta.url) + "/{events,commands}/**/*.{ts,js}");
	client.login(process.env.BOT_TOKEN!); // provide your bot token
}

run();
