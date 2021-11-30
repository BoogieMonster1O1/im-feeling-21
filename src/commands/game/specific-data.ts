// @ts-ignore
import {Game} from "./game.ts";
import {CommandInteraction, Interaction, MessageEmbed} from "discord.js";
// @ts-ignore
import {Card, generateDecks, shuffle} from "./card.ts";

export class GuildSpecificData {
	private readonly _id: string;
	private _channel: string;
	private _locked: boolean = false;
	private readonly _id2userSpecificData: Map<string, UserSpecificData>;
	private deck: Card[] = [];

	public constructor(id: string, channel: string) {
		this._id = id;
		this._channel = channel;
		this._id2userSpecificData = new Map<string, UserSpecificData>();
		this.shuffleAndReset();
	}

	public get id(): string {
		return this._id;
	}

	public get channel(): string {
		return this._channel;
	}

	public set channel(channel: string) {
		this._channel = channel;
	}

	public get locked(): boolean {
		return this._locked;
	}

	public set locked(locked: boolean) {
		this._locked = locked;
	}

	public get id2userSpecificData(): Map<string, UserSpecificData> {
		return this._id2userSpecificData;
	}

	public card(): Card {
		return this.deck.pop();
	}

	public cards(): number {
		return this.deck.length
	}

	public shuffleAndReset(): void {
		this.deck = shuffle(generateDecks(1));
	}

	public cardFunction(interaction: Interaction): () => Card {
		return () => {
			if (this.deck.length < 2) {
				this.shuffleAndReset();
				interaction.channel!.send("Reset deck");
			}
			return this.card();
		}
	}

	// Return the user specific data for the given user id. Create it if it doesn't exist.
	public getUserSpecificData(userId: string): UserSpecificData {
		if (!this._id2userSpecificData.has(userId)) {
			this._id2userSpecificData.set(userId, new UserSpecificData(userId, new Statistics()));
		}
		return this._id2userSpecificData.get(userId)!;
	}

}

export class UserSpecificData {
	private _marbles: number = 0;
	private _game?: Game;
	private _stats: Statistics;
	private _id: string;

	constructor(id: string, stats: Statistics, game?: Game) {
		this._stats = stats;
		this._game = game;
		this._id = id;
	}

	public incMarbles(by: number): void {
		this._marbles += by;
	}

	public decMarbles(by: number): boolean {
		if (this._marbles >= by) {
			this._marbles -= by;
			return true;
		}
		return false;
	}

	public hasGame(): boolean {
		return this._game;
	}

	public createGame(cardFunction: () => Card, bet: number, interaction: CommandInteraction) {
		this._game = new Game(cardFunction, bet, interaction);
	}

	public get marbles(): number {
		return this._marbles;
	}

	public get game(): Game {
		return this._game!;
	}

	public set game(game: Game) {
		this._game = game;
	}

	public get stats(): Statistics {
		return this._stats;
	}

	public get id(): string {
		return this._id;
	}
}

export class Statistics {
	private _games: number = 0;
	private _wins: number = 0;
	private _losses: number = 0;
	private _draws: number = 0;
	private _doubleDowns: number = 0;
	private _doubleDownWins: number = 0;
	private _doubleDownLosses: number = 0;
	private _doubleDownDraws: number = 0;
	private _blackjacks: number = 0;
	private _splits: number = 0;
	private _stands: number = 0;
	private _hits: number = 0;
	private _busts: number = 0;
	private _insurances: number = 0;
	private _insuranceWins: number = 0;
	private _insuranceLosses: number = 0;
	private _surrenders: number = 0;
	private _marblesBet: number = 0;
	private _marblesWon: number = 0;
	private _marblesLost: number = 0;

	public incGames(): void {
		this._games++;
	}

	public incWins(): void {
		this._wins++;
	}

	public incLosses(): void {
		this._losses++;
	}

	public incDraws(): void {
		this._draws++;
	}

	public incDoubleDowns(): void {
		this._doubleDowns++;
	}

	public incDoubleDownWins(): void {
		this._doubleDownWins++;
	}

	public incDoubleDownLosses(): void {
		this._doubleDownLosses++;
	}

	public incDoubleDownDraws(): void {
		this._doubleDownDraws++;
	}

	public incBlackjacks(): void {
		this._blackjacks++;
	}

	public incSplits(): void {
		this._splits++;
	}

	public incStands(): void {
		this._stands++;
	}

	public incHits(): void {
		this._hits++;
	}

	public incBusts(): void {
		this._busts++;
	}

	public incInsurances(): void {
		this._insurances++;
	}

	public incInsuranceWins(): void {
		this._insuranceWins++;
	}

	public incInsuranceLosses(): void {
		this._insuranceLosses++;
	}

	public incSurrenders(): void {
		this._surrenders++;
	}

	public incMarblesBet(by: number): void {
		this._marblesBet += by;
	}

	public incMarblesWon(by: number): void {
		this._marblesWon += by;
	}

	public incMarblesLost(by: number): void {
		this._marblesLost += by;
	}

	public get games(): number {
		return this._games;
	}

	public get wins(): number {
		return this._wins;
	}

	public get losses(): number {
		return this._losses;
	}

	public get draws(): number {
		return this._draws;
	}

	public get winrate(): number {
		return this._wins / this._games;
	}

	public get lossrate(): number {
		return this._losses / this._games;
	}

	public get drawrate(): number {
		return this._draws / this._games;
	}

	public get winratePercent(): string {
		return (this.winrate * 100).toFixed(2);
	}

	public get lossratePercent(): string {
		return (this.lossrate * 100).toFixed(2);
	}

	public get drawratePercent(): string {
		return (this.drawrate * 100).toFixed(2);
	}

	public get doubleDowns(): number {
		return this._doubleDowns;
	}

	public get doubleDownWins(): number {
		return this._doubleDownWins;
	}

	public get doubleDownLosses(): number {
		return this._doubleDownLosses;
	}

	public get doubleDownDraws(): number {
		return this._doubleDownDraws;
	}

	public get doubleDownWinrate(): number {
		return this._doubleDownWins / this._doubleDowns;
	}

	public get doubleDownLossrate(): number {
		return this._doubleDownLosses / this._doubleDowns;
	}

	public get doubleDownDrawrate(): number {
		return this._doubleDownDraws / this._doubleDowns;
	}

	public get doubleDownWinratePercent(): string {
		return (this.doubleDownWinrate * 100).toFixed(2);
	}

	public get doubleDownLossratePercent(): string {
		return (this.doubleDownLossrate * 100).toFixed(2);
	}

	public get doubleDownDrawratePercent(): string {
		return (this.doubleDownDrawrate * 100).toFixed(2);
	}

	public get blackjacks(): number {
		return this._blackjacks;
	}

	public get splits(): number {
		return this._splits;
	}

	public get stands(): number {
		return this._stands;
	}

	public get hits(): number {
		return this._hits;
	}

	public get busts(): number {
		return this._busts;
	}

	public get blackjackrate(): number {
		return this._blackjacks / this._games;
	}

	public get insurances(): number {
		return this._insurances;
	}

	public get insuranceWins(): number {
		return this._insuranceWins;
	}

	public get insuranceLosses(): number {
		return this._insuranceLosses;
	}

	public get insuranceWinrate(): number {
		return this._insuranceWins / this._insurances;
	}

	public get insuranceLossrate(): number {
		return this._insuranceLosses / this._insurances;
	}

	public get insuranceWinratePercent(): string {
		return (this.insuranceWinrate * 100).toFixed(2);
	}

	public get insuranceLossratePercent(): string {
		return (this.insuranceLossrate * 100).toFixed(2);
	}

	public get surrenders(): number {
		return this._surrenders;
	}

	public get surrenderrate(): number {
		return this._surrenders / this._games;
	}

	public get surrenderratePercent(): string {
		return (this.surrenderrate * 100).toFixed(2);
	}

	public get marblesBet(): number {
		return this._marblesBet;
	}

	public get marblesWon(): number {
		return this._marblesWon;
	}

	public get marblesLost(): number {
		return this._marblesLost;
	}

	public get embed(): MessageEmbed {
		return new MessageEmbed()
			.addField("Games", `You have played ${this.games} games`, false)
			.addField("Wins", `You have won ${this.wins} games (${this.winratePercent}%)`, true)
			.addField("Losses", `You have lost ${this.losses} games (${this.lossratePercent}%)`, true)
			.addField("Draws", `You have drawn ${this.draws} games (${this.drawratePercent}%)`, true);
	}

	public get extendedEmbed(): MessageEmbed {
		return this.embed
			.addField("Double Downs", `You have played ${this.doubleDowns} double downs with a win rate of ${this.doubleDownWinratePercent}, ${this.doubleDownWins} wins, ${this.doubleDownLosses} losses and ${this.doubleDownDraws} draws`, false)
			.addField("Blackjacks", `You have had ${this.blackjacks} blackjacks. You have had a blackjack ${this.blackjackrate * 100}% of the time`, false)
			.addField("Splits", `You have had ${this.splits} splits`, false)
			.addField("Stands", `You have stood ${this.stands} times`, false)
			.addField("Hits", `You have hit ${this.hits} times`, false)
			.addField("Busts", `You have busted ${this.busts} times`, false)
			.addField("Insurance", `You have had ${this.insurances} insurances with a win rate of ${this.insuranceWinratePercent}, ${this.insuranceWins} wins and ${this.insuranceLosses} losses`, false)
			.addField("Surrenders", `You have surrendered ${this.surrenders} times. You surrender ${this.surrenderratePercent} of the time`, false)
			.addField("Marbles", `You have bet ${this.marblesBet} marbles and won ${this.marblesWon} marbles and lost ${this.marblesLost} marbles`, false);
	}

	public toJSON() : any {
		return {
			_games: this._games,
			_wins: this._wins,
			_losses: this._losses,
			_draws: this._draws,
			_doubleDowns: this._doubleDowns,
			_doubleDownWins: this._doubleDownWins,
			_doubleDownLosses: this._doubleDownLosses,
			_doubleDownDraws: this._doubleDownDraws,
			_blackjacks: this._blackjacks,
			_splits: this._splits,
			_stands: this._stands,
			_hits: this._hits,
			_busts: this._busts,
			_insurances: this._insurances,
			_insuranceWins: this._insuranceWins,
			_insuranceLosses: this._insuranceLosses,
			_surrenders: this._surrenders,
			_marblesBet: this._marblesBet,
			_marblesWon: this._marblesWon,
			_marblesLost: this._marblesLost
		};
	}

	public static fromJSON(json: any): Statistics {
		const stats = new Statistics();
		stats._games = json._games;
		stats._wins = json._wins;
		stats._losses = json._losses;
		stats._draws = json._draws;
		stats._doubleDowns = json._doubleDowns;
		stats._doubleDownWins = json._doubleDownWins;
		stats._doubleDownLosses = json._doubleDownLosses;
		stats._doubleDownDraws = json._doubleDownDraws;
		stats._blackjacks = json._blackjacks;
		stats._splits = json._splits;
		stats._stands = json._stands;
		stats._hits = json._hits;
		stats._busts = json._busts;
		stats._insurances = json._insurances;
		stats._insuranceWins = json._insuranceWins;
		stats._insuranceLosses = json._insuranceLosses;
		stats._surrenders = json._surrenders;
		stats._marblesBet = json._marblesBet;
		stats._marblesWon = json._marblesWon;
		stats._marblesLost = json._marblesLost;
		return stats;
	}
}
