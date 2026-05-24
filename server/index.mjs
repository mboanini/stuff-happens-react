// imports
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import dayjs from 'dayjs'
import {validationResult} from 'express-validator';

import CardDao from './dao/cardDao.mjs';
import UserDao from './dao/userDao.mjs';
import GameDao from './dao/gameDao.mjs';
import CardInGameDao from './dao/cardInGameDao.mjs';  
import RoundDao from './dao/roundDao.mjs';

// Init express
const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use('/static', express.static('public'));

// Cors
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true,
}
app.use(cors(corsOptions));

const userDao = new UserDao();

// Passport
passport.use(new LocalStrategy(
  {
    usernameField: 'email',       
    passwordField: 'password'     
  },
  async function verify(email, password, cb) {
  const user = await userDao.getUser(email, password);
  if (!user) {
    return cb(null, false, { message: 'Incorrect email or password.' });
  }
  return cb(null, user);
}))

// Serialize user
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

// Deserialize user
passport.deserializeUser(function (user,  cb) {
    return cb(null, user);
})

// MIDDLEWARE

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({error: 'Not authorized'});
}

const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({error: errors.array().map((e) => `${e.msg}`).join(",")});
    }
    return next();
}

// Session
app.use(session({
    secret: 'web app exam',
    resave: false,
    saveUninitialized: false,
}));
// Init Passport to use sessions
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

/* ROUTES */
const cardDao = new CardDao();
const gameDao = new GameDao();
const cardInGameDao = new CardInGameDao();
const roundDao = new RoundDao();

// GET /api/game/:gameId - Get a game by ID
app.get('/api/game/:gameId', isLoggedIn, async (req, res) => {
  const gameId = parseInt(req.params.gameId, 10);
  if (isNaN(gameId)) {
    return res.status(400).json({ error: 'Invalid game ID' });
  }

  try {
    const game = await gameDao.getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const cardsInGame = await cardInGameDao.getCardsInGame(gameId);
    const numberOfCards = await cardInGameDao.getNumberOfCardsInGame(gameId);
    const cardsInGameWithDetails = await cardInGameDao.getCardsInGameWithDetails(gameId);

    res.json({
      ...game,
      cards: cardsInGameWithDetails,
      numberOfCards
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/games - Add a new game
app.post('/api/games', isLoggedIn, checkValidation, async (req, res) => {
  const userId = req.user.id;
  
  if (!userId) {
    console.log('User ID is missing in the request');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const allCards = await cardDao.getAllCards();

    const startingCards = allCards.sort(() => 0.5 - Math.random()).slice(0, 3);
    startingCards.sort((a, b) => a.badLuckIndex - b.badLuckIndex);

    const gameId = await gameDao.addGame(userId);
    for (const card of startingCards) {
      await cardInGameDao.addCardInGame(gameId, card.cardId, 1, 0);
    }

    res.status(201).json({ 
      gameId,
      cards: startingCards.map(c => ({
        cardId: c.cardId,
        name: c.name,
        image: c.image,
        badLuckIndex: c.badLuckIndex
      }))
    });


  } catch (error) {
    console.error('Error adding game:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/demoGame - Start a demoGame
app.post('/api/demoGame', async (req, res) => {
  try {
    const allCards = await cardDao.getAllCards();

    const shuffled = allCards.sort(() => 0.5 - Math.random()).slice(0,4);

    const startingCards = shuffled.slice(0, 3).sort((a, b) => a.badLuckIndex - b.badLuckIndex);
    const currentCard = shuffled[3];

    res.status(201).json({
      cards: startingCards.map(c => ({
        cardId: c.cardId,
        name: c.name,
        image: c.image,
        badLuckIndex: c.badLuckIndex
      })),
      currentCard: {
        cardId: currentCard.cardId,
        name: currentCard.name,
        image: currentCard.image,
        badLuckIndex: currentCard.badLuckIndex
      }
    });

    } catch (error) {
      console.error('Error in demo game:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/games/:gameId/round - Add a new round
app.post('/api/games/:gameId/round', isLoggedIn, async (req, res) => {
  const gameId = req.params.gameId;

  const lastRound = await roundDao.getLastRoundByGame(gameId);
  if (lastRound && lastRound.result === 'in-progress') {
    const card = await cardDao.getCardById(lastRound.cardId);
    return res.json({ cardId: card.cardId, name: card.name, image: card.image });
  }

  const usedCards = await cardInGameDao.getCardsInGame(gameId);
  const usedIds = usedCards.map(c => c.cardId);
  const newCard = await cardDao.getCardExcludingUsedIds(usedIds)

  if (!newCard) return res.status(404).json({ error: 'No more cards' });

  const { cardId, name, image } = newCard;
  const startTime = dayjs().toISOString();

  await roundDao.addRound(gameId, cardId, usedCards.length-2, 'in-progress', null, startTime)

  res.json({ cardId, name, image });
});

// GET /api/games/:gameID/round/current
app.get('/api/games/:gameId/round/current', isLoggedIn, async (req, res) => {
  const gameId = req.params.gameId;
  const round = await roundDao.getLastRoundByGame(gameId);
  if (!round) return res.status(404).json({ error: 'No round found' });

  const roundDuration = 30;
  const startTime = dayjs(round.startTime);
  const now = dayjs();
  const elapsed = now.diff(startTime, 'second');
  const timeLeft = Math.max(0, roundDuration - elapsed);

  res.json({ timeLeft });
});

app.post('/api/games/:gameId/round/timeout', isLoggedIn, async (req, res) => {
  const gameId = parseInt(req.params.gameId);
  const lastRound = await roundDao.getLastRoundByGame(gameId);
  
  if (!lastRound || lastRound.result !== 'in-progress') {
    return res.status(400).json({ error: 'No round in progress' });
  }

  await roundDao.updateResult(lastRound.roundId, 'lost');
  await roundDao.updatePosition(lastRound.roundId, null);

  await cardInGameDao.addCardInGame(gameId, lastRound.cardId, 0, lastRound.roundNumber);

  res.json({ result: 'lost' });
});

// POST /api/games/:gameId/guess - Guess the card
app.post('/api/games/:gameId/guess', isLoggedIn, async (req, res) => {
  const gameId = parseInt(req.params.gameId);
  const { cardId, position } = req.body;
  
  const currentCards = await cardInGameDao.getCardsWonInGame(gameId);

  const cardToGuess = await cardDao.getCardById(cardId);

  let numberOfCardsWon = await cardInGameDao.getNumberOfCardsWonInGame(gameId);

  let correctPos = currentCards.findIndex(c => c.badLuckIndex > cardToGuess.badLuckIndex);
  if (correctPos === -1) correctPos = numberOfCardsWon;
  correctPos = correctPos + 1;

  const lastRound = await roundDao.getLastRoundByGame(gameId);

  let result;
  if (position == correctPos) {
    result = 'won';
    // Add card 
    await roundDao.updateResult(lastRound.roundId, result)
    await roundDao.updatePosition(lastRound.roundId, position)

    await cardInGameDao.addCardInGame(gameId, cardId, 1, lastRound.roundNumber)
    
    numberOfCardsWon = numberOfCardsWon + 1;
    if (numberOfCardsWon === 6) {
      await gameDao.updateGameStatus(gameId, result);
      return res.json({ result: 'win', card: cardToGuess });
    }

    return res.json({ result: 'correct', card: cardToGuess });
  } else {
    result = 'lost';
    await cardInGameDao.addCardInGame(gameId, cardId, 0, lastRound.roundNumber)
    
    await roundDao.updateResult(lastRound.roundId, result)
    await roundDao.updatePosition(lastRound.roundId, position)

    const errors = await cardInGameDao.getNumberOfCardsLostInGame(gameId);
    if (errors === 3) {
      await gameDao.updateGameStatus(gameId, 'lost');
      return res.json({ result: 'lose' });
    }

    return res.json({ result: 'wrong' });
  }
});

// GET /api/games/history - Get the history
app.get('/api/games/history', isLoggedIn, async (req, res) => {
  try {
    const games = await gameDao.getUserGameHistory(req.user.id);
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving history"})
  }
})

// Authentication route

// POST /api/login 
app.post('/api/login', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            return res.status(401).send(info);
        }
        // session management
        req.login(user, (err) => {
            if (err)
                return next(err);
            return res.status(201).json(req.user);
        })
    })(req, res, next);
});

// GET /api/login/session -- is the user still logged in?
app.get('/api/login/session', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({error: 'Unauthorized'});
    }
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
    req.logout(() => {
        res.end();
    });
});

// Activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});