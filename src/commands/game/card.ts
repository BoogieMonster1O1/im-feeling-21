export class CardFace {
	public static readonly VALUES: CardFace[] = [];
	public static readonly ACE = new CardFace(1, 'Ace', 'A');
	public static readonly TWO = new CardFace(2, 'Two');
	public static readonly THREE = new CardFace(3, 'Three');
	public static readonly FOUR = new CardFace(4, 'Four');
	public static readonly FIVE = new CardFace(5, 'Five');
	public static readonly SIX = new CardFace(6, 'Six');
	public static readonly SEVEN = new CardFace(7, 'Seven');
	public static readonly EIGHT = new CardFace(8, 'Eight');
	public static readonly NINE = new CardFace(9, 'Nine');
	public static readonly TEN = new CardFace(10, 'Ten');
	public static readonly JACK = new CardFace(10, 'Jack', 'J');
	public static readonly QUEEN = new CardFace(10, 'Queen', 'Q');
	public static readonly KING = new CardFace(10, 'King', 'K');
	private readonly _value: number;
	private readonly _name: string;
	private readonly _shortName: string;

	private constructor(value: number, name: string, shortName?: string) {
		this._value = value;
		this._name = name;
		this._shortName = shortName || String(value);
		CardFace.VALUES.push(this);
	}

	public get value() {
		return this._value;
	}

	public get name() {
		return this._name;
	}

	public get shortName() {
		return this._shortName;
	}
}

export class Suit {
	public static readonly VALUES: Suit[] = [];
	public static readonly HEARTS = new Suit('Hearts', '\u2665');
	public static readonly SPADES = new Suit('Spades', '\u2660');
	public static readonly DIAMONDS = new Suit('Diamonds', '\u2666');
	public static readonly CLUBS = new Suit('Clovers', '\u2663');
	private readonly _name: string;
	private readonly _symbol: string;

	private constructor(name: string, symbol: string) {
		this._name = name;
		this._symbol = symbol;
		Suit.VALUES.push(this);
	}

	public get name() {
		return this._name;
	}

	public get symbol() {
		return this._symbol;
	}
}

export class Card {
	private readonly _face: CardFace;
	private readonly _suit: Suit;

	public constructor(face: CardFace, suit: Suit) {
		this._face = face;
		this._suit = suit;
	}

	public get face() {
		return this._face;
	}

	public get suit() {
		return this._suit;
	}

	public toString() {
		return this._suit.symbol + this._face.shortName;
	}
}

export function generateSuit(suit: Suit) {
	const arr: Card[] = [];
	for (const face of CardFace.VALUES) {
		arr.push(new Card(face, suit));
	}
	return arr;
}

export function generateDeck(): Card[] {
	const arr: Card[] = [];
	for (const suit of Suit.VALUES) {
		arr.push(...generateSuit(suit));
	}
	return arr;
}

export function generateDecks(count: number): Card[] {
	const arr: Card[] = [];
	for (let i = count; i > 0; i--) {
		arr.push(...generateDeck());
	}
	return arr;
}

export function shuffle(arr: Card[]): Card[] {
	const newArr = [...arr];
	for (let i: number = newArr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArr[i], newArr[j]] = [newArr[j], newArr[i]];
	}
	return newArr;
}
