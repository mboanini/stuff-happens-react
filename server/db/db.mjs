import sqlite3 from 'sqlite3';

// Opening the database
const database_path = "./db/";
const db = new sqlite3.Database(database_path + "db.sqlite", (err) => { 
    if (err) throw err; 
});

// Creating tables if they do not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS user (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    saltedPassword TEXT,
    salt TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS card (
    cardId INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    image TEXT,
    badLuckIndex REAL UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS game (
    gameId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    status TEXT NOT NULL CHECK (status IN ('in-progress', 'won', 'lost')),
    startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES user(userId)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS round (
    roundId INTEGER PRIMARY KEY AUTOINCREMENT,
    gameId INTEGER,
    cardId INTEGER,
    roundNumber INTEGER NOT NULL,
    result TEXT, -- 'won' or 'lost'
    position INTEGER,
    startTime DATETIME,
    FOREIGN KEY(gameId) REFERENCES game(gameId),
    FOREIGN KEY(cardId) REFERENCES card(cardId)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cardInGame (
    gameId INTEGER,
    cardId INTEGER,
    outcome INTEGER,
    wonInRound INTEGER,
    PRIMARY KEY (gameId, cardId),
    FOREIGN KEY(gameId) REFERENCES game(gameId),
    FOREIGN KEY(cardId) REFERENCES card(cardId)
  )`);
});

const sqlCards = "SELECT COUNT(*) as count FROM card";
db.get(sqlCards, (err, row) => {
  if(err)
    throw err;
  if (row.count === 0) {
    const cards = [
      { name: 'Your roommate wakes you up at 6 a.m. on the only day you could sleep in', image: 'card1.png', badLuckIndex: 1.0 },
      { name: 'Your roommate watches TV series at full volume while you are studying', image: 'card2.png', badLuckIndex: 2.0 },
      { name: 'Your roommate doesn’t talk to you or even say hello', image: 'card3.png', badLuckIndex: 3.0},
      { name: 'Your roommate and his girlfriend argue while you are all having dinner. ', image: 'card4.png', badLuckIndex: 4.0 },
      { name: 'You realize you forgot your robe after showering', image: 'card5.png', badLuckIndex: 5.5 },
      { name: 'You’ve just woken up, but your roommate won’t stop talking—you just want quiet', image: 'card6.png', badLuckIndex: 7.0 },
      { name: 'You are so caught up in exams that you survive on canned tuna for a week', image: 'card7.png', badLuckIndex: 8.5 },
      { name: 'You forget your keys and no one answers the intercom or the phone', image: 'card8.png', badLuckIndex: 10.0 },
      { name: 'The washing machine gets stuck with your clothes inside', image: 'card9.png', badLuckIndex: 11.5 },
      { name: 'The kitchen utensils are vanishing', image: 'card10.png', badLuckIndex:  13.0 },
      { name: 'The toilet paper runs out... and you are home alone', image: 'card11.png', badLuckIndex: 14.5 },
      { name: 'Your roommate offers to cook for everyone and burns everything', image: 'card12.png', badLuckIndex:  16.0 },
      { name: 'Your roommate accidentally sends a voice message trash-talking you', image: 'card13.png', badLuckIndex: 17.5 },
      { name: 'Open a bottle of Coca Cola, shaken up by your roommate, and end up all sticky', image: 'card14.png', badLuckIndex: 19.0 },
      { name: 'The landlord comes for an inspection and finds total chaos', image: 'card15.png', badLuckIndex: 21.0 },
      { name: 'Your roommate and his girlfriend make out while you are in the kitchen', image: 'card16.png', badLuckIndex: 23.0 },
      { name: 'Your roommate never does any cleaning', image: 'card17.png', badLuckIndex: 25.0 },
      { name: 'Your roommate uses the microwave to dry his shoes', image: 'card18.png', badLuckIndex: 27.5 },
      { name: 'Your roommate gets sick and infects everyone the day before your exam', image: 'card19.png', badLuckIndex: 29.0 },
      { name: 'Your roommate changes the Wi-Fi password and refuses to give it to you ', image: 'card20.png', badLuckIndex: 31.0 },
      { name: 'Your roommate turns on everything, and the power keeps going out', image: 'card21.png', badLuckIndex: 33.0 },
      { name: 'Your roommate steals food from the fridge without asking', image: 'card22.png', badLuckIndex: 35.0 },
      { name: 'Your roommate wears your clothes without asking', image: 'card23.png', badLuckIndex: 37.0 },
      { name: 'Your roommate accidentally uses your toothbrush', image: 'card24.png', badLuckIndex: 41.0 },
      { name: 'You discover they are using your shampoo and refilling it with water', image: 'card25.png', badLuckIndex: 43.0 },
      { name: 'Your roommate leaves the fridge open all night', image: 'card26.png', badLuckIndex: 45.0 },
      { name: 'Your roommate throws a party during exam season without warning', image: 'card27.png', badLuckIndex: 47.0 },
      { name: 'Ant infestation in the kitchen', image: 'card28.png', badLuckIndex: 49.5 },
      { name: 'The toilet pipe bursts', image: 'card29.png', badLuckIndex: 52.0 },
      { name: 'Your roommate leaves the front door wide open all night', image: 'card30.png', badLuckIndex: 54.5 },
      { name: 'Your roommate spills oil, cleans barely, and you slip walking in.', image: 'card31.png', badLuckIndex: 57.0 },
      { name: 'Your roommate never washes the dishes and leaves them there for days', image: 'card32.png', badLuckIndex: 59.0 },
      { name: 'A creepy stranger rings the intercom asking to come in while you are alone', image: 'card33.png', badLuckIndex: 61.5 },
      { name: 'You forget the bathroom door open and your roommate’s friend walks in', image: 'card34.png', badLuckIndex: 64.0 },
      { name: 'Your roommate leaves for a week, and the fridge fills with rotten food', image: 'card35.png', badLuckIndex: 66.5 },
      { name: 'You walk into the house and find your roommate naked', image: 'card36.png', badLuckIndex: 69.0 },
      { name: 'You desperately need the bathroom but it is occupied', image: 'card37.png', badLuckIndex: 71.0 },
      { name: 'Your roommate gets a ferret without telling you. You are allergic', image: 'card38.png', badLuckIndex: 73.5 },
      { name: 'Your roommate smokes inside despite you asking him not to', image: 'card39.png', badLuckIndex: 75.0 },
      { name: 'Your roommate turns off the heating to save bills, and you freeze', image: 'card40.png', badLuckIndex:  76.0 },
      { name: 'The cat of your roommate pees on your bed', image: 'card41.png', badLuckIndex:  78.5 },
      { name: 'You return after 20 days to a stinky, bug-filled house from ignored trash', image: 'card42.png', badLuckIndex:  81.0 },
      { name: 'There’s no hot water for a week, so you have to take freezing showers', image: 'card43.png', badLuckIndex: 83.5 },
      { name: 'You find dirty socks in the fridge', image: 'card44.png', badLuckIndex: 86.0 },
      { name: 'Your roommate organizes an esoteric ritual in the living room', image: 'card45.png', badLuckIndex: 88.5 },
      { name: 'The bathroom ceiling collapses due to a leak the agency never fixed', image: 'card46.png', badLuckIndex: 91.0 },
      { name: 'There’s a mouse in the house. Your roommate refuses to get rid of it', image: 'card47.png', badLuckIndex:  93.0 },
      { name: 'You find out your roommate rented your room on Airbnb while you were away', image: 'card48.png', badLuckIndex:  96.0 },
      { name: 'Your roommate skips rent, you get evicted, and end up sleeping in your car', image: 'card49.png', badLuckIndex:  98.0 },
      { name: 'You are cooking and accidentally start a fire in the house', image: 'card50.png', badLuckIndex: 100.0 },
    ]
    const stmt = db.prepare(`INSERT INTO card (name, image, badLuckIndex) VALUES (?, ?, ?)`);
    for (const card of cards) {
      stmt.run(card.name, card.image, card.badLuckIndex);
    }
    stmt.finalize();
    console.log("Default cards created");
  }
});

export default db;
