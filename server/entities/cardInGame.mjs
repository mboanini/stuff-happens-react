export default function CardInGame (gameId, cardId, outcome, wonInRound) {
    this.gameId = gameId;
    this.cardId = cardId;
    this.outcome = outcome;
    this.wonInRound = wonInRound;
}