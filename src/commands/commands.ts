import {
	Discord, Permission, SelectMenuComponent,
	Slash,
	SlashChoice,
	SlashGroup,
	SlashOption
} from "discordx";
import {
	ButtonInteraction,
	CommandInteraction, GuildMember, Interaction, Message,
	MessageEmbed, SelectMenuInteraction
} from "discord.js";
// @ts-ignore
import {GuildSpecificData, UserSpecificData} from "./game/specific-data.ts";
// @ts-ignore
import { client } from "../client.ts";

@Discord()
abstract class SelectHandlers {
	@SelectMenuComponent("actions")
	public select(interaction: SelectMenuInteraction) {
		const usd = Main.getGuildSpecificData(interaction.guild!.id).getUserSpecificData(interaction.user.id);
		if (!usd.hasGame()) {
			interaction.reply({content: "You don't have a game running!", ephemeral: true});
			return;
		}
		if (interaction.values![0] === "surrender") {
			// noinspection DuplicatedCode
			const ret = (usd.game.bet / 2).toFixed(0)
			usd.incMarbles(Number(ret));
			usd.game.hand.surrender();
			usd.stats.incSurrenders();
			usd.stats.incLosses();
			usd.stats.incMarblesLost(Math.ceil(usd.game.bet / 2));
			interaction.update({embeds: [usd.game.embed(true).setDescription(`You surrendered! The dealer has kept half your bet and you have been returned ${ret} marbles`).setColor("#FF7F00")], components: usd.game.components()});
			usd.game = undefined;
			return;
		} else if (interaction.values[0] === "stand") {
			usd.game.hand.stand();
			usd.game.dealerHit();
			usd.stats.incStands();
			const embed = usd.game.embed(true);
			if (usd.game.dealersHand.isBust()) {
				embed.setDescription(`You stood! The dealer has busted! You have won ${usd.game.bet} marbles!`);
				embed.setColor("#00FF00");
				usd.incMarbles(usd.game.bet * 2);
				usd.stats.incMarblesWon(usd.game.bet);
				usd.stats.incWins();
			} else if (usd.game.hand.getValuation() > usd.game.dealersHand.getValuation()) {
				embed.setDescription(`You stood! You have won ${usd.game.bet} marbles!`);
				embed.setColor("#00FF00");
				usd.incMarbles(usd.game.bet * 2);
				usd.stats.incMarblesWon(usd.game.bet);
				usd.stats.incWins();
			} else if (usd.game.hand.getValuation() === usd.game.dealersHand.getValuation()){
				embed.setDescription(`You stood! You have tied with the dealer! You can keep ${usd.game.bet} marbles!`);
				embed.setColor("#FFFF00");
				usd.incMarbles(usd.game.bet);
				usd.stats.incDraws();
			} else if (usd.game.dealersHand.isBlackjack()) {
				embed.setDescription(`You stood! The dealer has blackjack! You have lost ${usd.game.bet} marbles!`);
				embed.setColor("#FF0000");
				usd.stats.incMarblesLost(usd.game.bet);
				usd.stats.incLosses();
			} else if (usd.game.hand.getValuation() < usd.game.dealersHand.getValuation()) {
				embed.setDescription(`You stood! You have lost ${usd.game.bet} marbles!`);
				embed.setColor("#FF0000");
				usd.stats.incMarblesLost(usd.game.bet);
				usd.stats.incLosses();
			}
			interaction.update({embeds: [embed], components: []});
			usd.game = undefined;
			return;
		} else if (interaction.values[0] === "hit") {
			usd.game.hand.hit();
			usd.stats.incHits();
			if (usd.game.hand.isBust()) {
				const embed = usd.game.embed(true);
				embed.setDescription(`You hit! You have busted! You have lost ${usd.game.bet} marbles!`);
				embed.setColor("#FF0000");
				interaction.update({embeds: [embed], components: []});
				usd.stats.incMarblesLost(usd.game.bet);
				usd.game = undefined;
				usd.stats.incBusts();
				usd.stats.incLosses();
				return;
			} else if (usd.game.hand.is21()) {
				const embed = usd.game.embed(true);
				embed.setDescription(`You hit! You have 21! You have won ${usd.game.bet} marbles!`);
				embed.setColor("#00FF00");
				interaction.update({embeds: [embed], components: []});
				usd.incMarbles(usd.game.bet * 2);
				usd.stats.incMarblesWon(usd.game.bet);
				usd.stats.incWins();
				usd.game = undefined;
				return;
			}
			interaction.update({embeds: [usd.game.embed(false)], components: usd.game.components()});
			return;
		} else if (interaction.values[0] === "double") {
			if (usd.marbles < usd.game.bet) {
				interaction.reply({content: "You don't have enough marbles to double down!", ephemeral: true});
				return;
			}
			usd.game.hand.doubleDown();
			usd.game.dealerHit();
			usd.decMarbles(usd.game.bet);
			usd.stats.incMarblesBet(usd.game.bet);
			usd.stats.incDoubleDowns();
			const embed = usd.game.embed(true);
			if (usd.game.dealersHand.isBust()) {
				embed.setDescription(`You doubled down! The dealer has busted! You have won ${usd.game.bet * 2} marbles!`);
				embed.setColor("#00FF00");
				usd.incMarbles(usd.game.bet * 4);
				usd.stats.incMarblesWon(usd.game.bet * 2);
				usd.stats.incWins();
				usd.stats.incDoubleDownWins();
			} else if (usd.game.hand.isBust()) {
				embed.setDescription(`You doubled down! You have busted! You lost ${usd.game.bet * 2} marbles!`);
				embed.setColor("#FF0000");
				usd.stats.incMarblesLost(usd.game.bet * 2);
				usd.stats.incLosses();
				usd.stats.incDoubleDownLosses();
				usd.stats.incBusts();
			} else if (usd.game.hand.getValuation() > usd.game.dealersHand.getValuation()) {
				embed.setDescription(`You doubled down! You have won ${usd.game.bet * 2} marbles!`);
				embed.setColor("#00FF00");
				usd.incMarbles(usd.game.bet * 4);
				usd.stats.incMarblesWon(usd.game.bet * 2);
				usd.stats.incWins();
				usd.stats.incDoubleDownWins();
			} else if (usd.game.hand.getValuation() === usd.game.dealersHand.getValuation()){
				embed.setDescription(`You doubled down! You have tied with the dealer! You can keep ${usd.game.bet * 2} marbles!`);
				embed.setColor("#FFFF00");
				usd.incMarbles(usd.game.bet * 2);
				usd.stats.incDraws();
				usd.stats.incDoubleDownDraws();
			} else if (usd.game.dealersHand.isBlackjack()) {
				embed.setDescription(`You doubled down! The dealer has blackjack! You have lost ${usd.game.bet * 2} marbles!`);
				embed.setColor("#FF0000");
				usd.stats.incMarblesLost(usd.game.bet * 2);
				usd.stats.incLosses();
				usd.stats.incDoubleDownLosses();
			} else if (usd.game.hand.getValuation() < usd.game.dealersHand.getValuation()) {
				embed.setDescription(`You doubled down! You have lost ${usd.game.bet * 2} marbles!`);
				embed.setColor("#FF0000");
				usd.stats.incMarblesLost(usd.game.bet * 2);
				usd.stats.incLosses();
				usd.stats.incDoubleDownLosses();
			}
			interaction.update({embeds: [embed], components: []});
			usd.game = undefined;
		}

		let editedTimestamp: number | null = SelectHandlers.getEditedTimestamp(interaction);

		if (usd.game != undefined) {
			setTimeout(() => {
				if (SelectHandlers.getEditedTimestamp(interaction) == editedTimestamp) {
					const embed = usd.game.embed(true);
					embed.setColor("#FF0000");
					embed.setDescription(`Timed out! The dealer has kept your bet! You have lost ${usd.game.bet} marbles`);
					usd.stats.incLosses();
					usd.stats.incMarblesLost(usd.game.bet);
					usd.game = undefined;
				}
			}, 60000);
		}
	}

	private static getEditedTimestamp(interaction: SelectMenuInteraction) {
		return interaction.message instanceof Message ? interaction.message.editedTimestamp : Number(interaction.message.edited_timestamp);
	}
}

@Discord()
abstract class Main {
	public static id2GuildSpecificData: Map<string, GuildSpecificData> = new Map();

	public static getGuildSpecificData(guildId: string): GuildSpecificData {
		if (!this.id2GuildSpecificData.has(guildId)) {
			this.id2GuildSpecificData.set(guildId, new GuildSpecificData());
		}
		return this.id2GuildSpecificData.get(guildId);
	}

	public static checkWrongChannel(interaction: CommandInteraction | undefined): boolean {
		if (Main.getGuildSpecificData(interaction?.guildId!).locked) {
			interaction?.reply({content: "The casino is locked.", ephemeral: true});
			return true;
		}
		return false;
	}

	@Slash("deal")
	public deal(@SlashOption("bet", { description: "number of marbles to bet" , required: true}) bet: number, interaction: CommandInteraction) {
		if (Main.checkWrongChannel(interaction)) return;
		if (bet <= 0) {
			interaction.reply("Dont be daft, bet a positive number of marbles");
			return;
		}
		const usd = Main.getGuildSpecificData(interaction.guild!.id).getUserSpecificData(interaction.user.id);
		if (usd.marbles === 0) {
			interaction.reply("Dont be daft, you have no marbles. Get a few with `/marbles`");
			return;
		} else if (!usd.decMarbles(bet)) {
			interaction.reply("Dont be daft, you dont have enough marbles. Get a few with `/marbles`");
			return;
		} else if (usd.hasGame()) {
			interaction.reply("Dont be daft, you already have a game in progress. Finish it.");
			return;
		}
		interaction.deferReply().then(() => {
			usd.createGame(Main.getGuildSpecificData(interaction.guild!.id).cardFunction(interaction), bet, interaction);
			usd.stats.incGames();
			usd.stats.incMarblesBet(bet);
			if (usd.game.hand.isBlackjack()) {
				usd.stats.incBlackjacks();
				if (!usd.game.dealersHand.isBlackjack()) {
					interaction.followUp({embeds:[usd.game.embed(true)
							.setColor("#00FF00")
							.setDescription(`You have blackjack! You have won ${(usd.game.bet * 3.0/2).toFixed(0)} marbles!`)], components: usd.game.components()});
					usd.stats.incWins();
					usd.incMarbles(Number((bet * 1.5).toFixed(0)));
					usd.stats.incMarblesWon(Number((bet * 1.5).toFixed(0)));
				} else {
					interaction.followUp({embeds:[usd.game.embed(true)
							.setColor("#FFFF00")
							.setDescription(`You have blackjack! You have tied with the dealer! You can keep ${usd.game.bet} marbles!`)], components: usd.game.components()});
					usd.stats.incDraws();
				}
				usd.incMarbles(bet);
				usd.game = undefined;
			} else {
				interaction.followUp({embeds: [usd.game.embed()], components: usd.game.components()}).then(r => {
					setTimeout(() => {
						let timestamp = r instanceof Message ? r.editedTimestamp : Number(r.edited_timestamp);
						if (timestamp == null && usd.game.interaction == interaction && usd.game.hand != undefined) {
							// noinspection DuplicatedCode
							const ret = (usd.game.bet / 2).toFixed(0)
							usd.incMarbles(Number(ret));
							usd.game.hand.surrender();
							usd.stats.incSurrenders();
							usd.stats.incLosses();
							usd.stats.incMarblesLost(Math.ceil(usd.game.bet / 2));
							interaction.editReply({embeds: [usd.game.embed(true)
									.setColor("#FF7F00")
									.setDescription(`Timed out! The dealer has kept half your bet and you have been returned ${ret} marbles!`)], components: usd.game.components()});
							usd.game = undefined;
						}
					}, 60000);
				});
			}
		});
	}

	@Slash("marbles")
	public marbles(@SlashOption("count", { description: "number of marbles to get", required: false }) count?: number, interaction?: CommandInteraction) {
		if (Main.checkWrongChannel(interaction)) return;
		if (interaction == null) {
			return;
		}
		if (count != undefined) {
			if (count <= 0) {
				interaction.reply("Dont be daft, you can't get negative marbles");
				return;
			} else {
				Main.getGuildSpecificData(interaction.guild!.id).getUserSpecificData(interaction.user.id).incMarbles(count);
				interaction.reply(`Added ${count} marbles. You now have ${Main.getGuildSpecificData(interaction.guild!.id).getUserSpecificData(interaction.user.id).marbles} marbles`);
			}
		} else {
			interaction.reply(`You have ${Main.getGuildSpecificData(interaction.guild!.id).getUserSpecificData(interaction.user.id).marbles} marbles.`);
		}
	}

	@Slash("shoe")
	public shoeCount(interaction: CommandInteraction) {
		if (Main.checkWrongChannel(interaction)) return;
		interaction.reply(`The shoe has ${Main.getGuildSpecificData(interaction.guild!.id).cards()} cards.`);
	}

	@Slash("shuffle")
	public shuffle(interaction: CommandInteraction) {
		if (Main.checkWrongChannel(interaction)) return;
		Main.getGuildSpecificData(interaction.guild!.id).shuffleAndReset();
		interaction.reply({content: "Shuffled the deck", ephemeral: true});
	}

	@Slash("stats", { description: "Shows the stats of the current user in the current casino" })
	public stats(
		@SlashChoice("All", "all")
		@SlashChoice("Less", "less")
		@SlashOption("kind", { description: "The quantity of data to show", required: false })
			kind: string,
		interaction: CommandInteraction) {
		if (Main.checkWrongChannel(interaction)) return;
		const p = interaction.deferReply();
		const usd = Main.getGuildSpecificData(interaction.guild!.id).getUserSpecificData(interaction.user.id);
		const stats = kind === "all" ? usd.stats.extendedEmbed : usd.stats.embed;
		p.then(() => {
			interaction.followUp({embeds: [
					stats
						.setTitle("Statistics")
						.setTimestamp()
						.setFooter(`Requested by ${interaction.user.username}#${interaction.user.discriminator}`, interaction.user.avatarURL()!)
				]});
		});
	}
}

@SlashGroup("minor")
@Discord()
export abstract class MinorRules {
	public createEmbed(): MessageEmbed {
	return new MessageEmbed()
			.setColor("#0099ff")
			.setTitle("Minor Rules")
			.addField("Payout", "Regular wins pay `1:1`", true)
			.addField("Blackjack Payout", "Blackjack pays `3:2`", true)
			.addField("Insurance Payout", "Insurance pays `2:1`", true)
			.addField("Decks", "A shoe has two decks", true).addField("Double Down", "Doubling down does not depend on the value of the hand", false)
			.addField("Split", "Splitting can only be done on the first two cards", false)
			.addField("Surrender", "Surrendering can only be done before any decisions are made", false)
			.addField("Shuffling", "The players are notified when the shoe is shuffled", false)
			.addField("Dealing Hitting", "The dealer hits until they reach any 17", false)
			.addField("Ties", "Ties are pushed", false)
			.addField("Timing out", "Games time out after 60 seconds and are automatically surrendered/lost (whichever applicable)", false)
			.setTimestamp()
			.setDescription("These rules vary by casino and are thus mentioned here to avoid confusion")
	}

	@Slash("rules")
	public rules(interaction: CommandInteraction) {
		if (Main.checkWrongChannel(interaction)) return;
		interaction.deferReply().then(() => {
			interaction.followUp({embeds: [this.createEmbed()
					.setFooter(`Requested by ${interaction.user.username}#${interaction.user.discriminator}`, interaction.user.avatarURL()!)
				]});
		});
	}
}

@SlashGroup("admin")
@Discord()
export abstract class AdminCommands {
	private async checkPerm(interaction: CommandInteraction) {
		let valid = false;
		await interaction.guild!.members.fetch(interaction.user!.id).then(member => {
			if (!(member.permissions.has("MANAGE_GUILD") || member.permissions.has("ADMINISTRATOR"))) {
				interaction.followUp({content: "You do not have permission to use this command", ephemeral: true});
				valid = false;
			} else {
				valid = true;
			}
		});
		return valid;
	}

	@Slash("lock")
	public async lock(interaction: CommandInteraction) {
		await interaction.deferReply({ephemeral: true});
		if (await this.checkPerm(interaction)) {
			Main.getGuildSpecificData(interaction.guild!.id).locked = true;
			interaction.followUp("Casino is now locked");
		}
	}

	@Slash("unlock")
	public async unlock(interaction: CommandInteraction) {
		await interaction.deferReply({ephemeral: true});
		if (await this.checkPerm(interaction)) {
			Main.getGuildSpecificData(interaction.guild!.id).locked = false;
			interaction.followUp("Casino is now unlocked");
		}
	}

	@Slash("setmarbles")
	public async setMarbles(
		@SlashOption("amount", { description: "The quantity of marbles to set", required: true })
			amount: number,
		@SlashOption("member", { description: "The person whose marbles are to be set", required: true })
			member: GuildMember,
		interaction: CommandInteraction
	) {
		await interaction.deferReply({ephemeral: true});
		if (await this.checkPerm(interaction)) {
			Main.getGuildSpecificData(interaction.guild!.id).getUserSpecificData(member.id).marbles = amount;
			interaction.followUp(`<@${member.user.id}> now has ${amount} marbles`);
		}
	}

	@Slash("addmarbles")
	public async addmarbles(
		@SlashOption("amount", { description: "The quantity of marbles to add", required: true })
			amount: number,
		@SlashOption("member", { description: "The person whose marbles are to be added to", required: true })
			member: GuildMember,
		interaction: CommandInteraction
	) {
		await interaction.deferReply({ephemeral: true});
		if (await this.checkPerm(interaction)) {
			let act = Math.max(Main.getGuildSpecificData(interaction.guild!.id).getUserSpecificData(member.id).marbles + amount, 0);
			Main.getGuildSpecificData(interaction.guild!.id).getUserSpecificData(member.id).marbles = act;
			interaction.followUp(`<@${member.user.id}> now has ${act} marbles`);
		}
	}
}

@Discord()
@SlashGroup("superadmin")
@Permission(false)
@Permission({ id: "699945276156280893", type: "USER", permission: true })
@Permission({ id: "684428788481917044", type: "USER", permission: true })
export abstract class SuperAdminCommands {
	@Slash("stop")
	public stop(interaction: CommandInteraction) {
		performStopSequence(interaction);
	}
}

export async function performStopSequence(interaction?: CommandInteraction) {
	await interaction?.reply({content: "Stopping...", ephemeral: true});
	client.destroy();
}
