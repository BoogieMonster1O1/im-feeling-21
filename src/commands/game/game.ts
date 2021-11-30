// @ts-ignore
import {Card, CardFace} from "./card.ts";
// @ts-ignore
import {getBestValue, is21, isBlackjack, isBust} from "./value-util.ts";
import {
	CommandInteraction,
	MessageActionRow,
	MessageButton,
	MessageComponent,
	MessageEmbed,
	MessageSelectMenu
} from "discord.js";
// @ts-ignore

import {
	double_down_button,
	double_down_disabed,
	hit_button,
	split_disabled,
	stand_button,
	surrender_button, surrender_disabled
// @ts-ignore
} from "../commands.ts";

export class Game {
	private readonly _hand: Hand;
	private readonly _cardFunction: () => Card;
	private readonly _dealersHand: Hand;
	private readonly _bet: number;
	private readonly _interaction: CommandInteraction;

	public constructor(cardFunction: () => Card, bet: number, interaction: CommandInteraction) {
		this._cardFunction = cardFunction;
		this._hand = new Hand(cardFunction);
		this._dealersHand = new Hand(cardFunction);
		this._bet = bet;
		this._interaction = interaction;
	}

	public get hand(): Hand {
		return this._hand;
	}

	public get dealersHand(): Hand {
		return this._dealersHand;
	}

	public get bet(): number {
		return this._bet;
	}

	public deal(): void {
		this._hand.hit(this._cardFunction());
		this._hand.hit(this._cardFunction());
		this._dealersHand.hit(this._cardFunction());
		this._dealersHand.hit(this._cardFunction());
	}

	public dealerHit(): void {
		while (this.dealersHand.getValuation() < 17) {
			this._dealersHand.hit(this._cardFunction());
		}
	}

	public get interaction(): CommandInteraction {
		return this._interaction;
	}

	public embed(full: boolean): MessageEmbed {
		const embed = new MessageEmbed();
		embed.setTitle("Blackjack");
		embed.setColor(0x000000);
		embed.setDescription(`You bet ${this.bet} marbles`);
		embed.addField("Your hand", `\`${this.hand.toString()}\` (${this.hand.getValuation()})`, true);
		if (full) {
			embed.addField("Dealers hand", `\`${this.dealersHand.toString()}\` (${this.dealersHand.getValuation()})`, true);
		} else {
			embed.addField("Dealers hand", `\`${this.dealersHand.cards[0].toString()} ?\``, true);
		}
		return embed;
	}

	public components(): MessageComponent[] {
		if (this.hand.cantMakeDecision()) {
			return [];
		}

		const arr = [
			{label: "Hit", value: "hit", description: "Hit and draw a card", emoji: "🃏"},
			{label: "Stand", value: "stand", description: "Reveal the dealers hand", emoji: "⤴️"},
		];
		if (this.hand.canDoubleDown()) {
			arr.push({label: "Double Down", value: "dd", description: "Double your bet, draw a card and stand", emoji: "💰"});
			arr.push({label: "Surrender", value: "surrender", description: "Give up half your bet and end the game", emoji: "↔️"});
		}
		if (this.hand.canSplit()) {
			arr.push({label: "Split", value: "split", description: "Split your hand into two hands", emoji: "💸"});
		}
		return [new MessageActionRow().setComponents(new MessageSelectMenu()
			.addOptions(arr)
			.setCustomId("actions"))];
	}
}

export class Hand {
	private readonly _cards: Card[] = [];
	private _doubleDown: boolean = false;
	private _stand: boolean = false;
	private readonly _cardFunction: () => Card;
	private _surrender: boolean = false;

	public constructor(cardFunction: () => Card, cards?: Card[]) {
		this._cardFunction = cardFunction;
		if (cards) {
			this._cards = cards;
		} else {
			this._cards.push(cardFunction());
			this._cards.push(cardFunction());
		}
	}

	public get cards(): Card[] {
		return this._cards;
	}

	protected addCard(card: Card): void {
		this._cards.push(card);
	}

	public getValuation(): number {
		return getBestValue(this._cards);
	}

	public isBlackjack(): boolean {
		return isBlackjack(this._cards);
	}

	public is21(): boolean {
		return is21(this._cards);
	}

	public isBust(): boolean {
		return isBust(this._cards);
	}

	public isDoubleDown(): boolean {
		return this._doubleDown;
	}

	public isStand(): boolean {
		return this._stand;
	}

	public isSoft(): boolean {
		return this._cards.some(card => card.face === CardFace.ACE);
	}

	surrender(): void {
		this._surrender = true;
	}

	public canSplit(): boolean {
		return this._cards.length === 2 && this._cards[0].face.value === this._cards[1].face.value;
	}

	public canDoubleDown(): boolean {
		return this._cards.length === 2;
	}

	public cantMakeDecision(): boolean {
		return this.isSurrender() || this.is21() || this.isBust() || this.isDoubleDown() || this.isStand();
	}

	public hit(card?: Card): void {
		this.addCard(card ?? this._cardFunction());
	}

	public stand(): void {
		this._stand = true;
	}

	public doubleDown(card: Card): void {
		this._doubleDown = true;
		this.hit(card);
	}

	public toString(): string {
		return this._cards.map(card => card.toString()).join(" ");
	}

	private isSurrender() {
		return this._surrender;
	}
}

export class SplitHand extends Hand {
	private readonly _otherHand: Hand;

	public constructor(cardFunction: () => Card, otherHand: Hand) {
		super(cardFunction);
		this._otherHand = otherHand;
	}

	public get otherHand(): Hand {
		return this._otherHand;
	}
}

export class Dealer extends Hand {
	public constructor(cardFunction: () => Card) {
		super(cardFunction);
	}

	public shouldHit(): boolean {
		return this.getValuation() < 17;
	}
}
