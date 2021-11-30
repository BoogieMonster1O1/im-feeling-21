import type { Card } from './card';

/**
 * Returns the value of a set of cards.
 *
 * <p>The value of ace is considered to be 1</p>
 *
 * @param cards The cards to get the value of.
 * @returns The value of the cards.
 */
export function absoluteValue(cards: Card[]) {
	return cards.reduce((sum, card) => sum + card.face.value, 0);
}

export function totalValuations(cards: Card[]): number[] {
	const values = absoluteValue(cards);
	const aces = cards.filter(card => card.face.value === 1);
	if (aces.length === 0) {
		return [values];
	}
	let values2 = values;
	const acesValues = aces.map(() => (values2 += 10));
	return [values, ...acesValues];
}

export function isBlackjack(hand: Card[]): boolean {
	return hand.length === 2 && totalValuations(hand).some(value => value === 21);
}

export function isBust(hand: Card[]): boolean {
	return totalValuations(hand).every(value => value > 21);
}

export function is21(hand: Card[]): boolean {
	return totalValuations(hand).some(value => value === 21);
}

export function getBestValue(cards: Card[]): number {
	const values = totalValuations(cards);
	const max = Math.max(...values);
	return max <= 21 ? max : values.some(it => it <= 21) ? Math.max(...values.filter(it => it <= 21)) : Math.min(...values);
}
