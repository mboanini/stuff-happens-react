const SERVER_URL = 'http://localhost:3001/api';
export const API = {};


{ /* Authentication API */ }

API.login = async (credentials) => {
    const response = await fetch(SERVER_URL + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        let errorMessage = "Login failed";
        try {
            const err = await response.json();
            errorMessage = err.message || errorMessage;
        } catch {
            errorMessage = await response.text(); // fallback se non è JSON
        }
        throw new Error(errorMessage);
    }
}

API.isLoggedIn = async () => {
    const response = await fetch(SERVER_URL + '/login/session', {
        credentials: 'include'
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        return null;
    } 
}

API.logout = async () => {
    const response = await fetch(SERVER_URL + '/logout', {
        method: 'POST',
        credentials: 'include'
    });
    if (response.ok) {
        return true;
    } else {
        const errDetails = await response.text();
        throw new Error(errDetails);
    }
}

{ /* Game API */ }

API.startGame = async (userId) => {
    const response = await fetch(SERVER_URL + '/games', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({userId: userId}),
    });
    if (!response.ok) throw new Error("Failed to start game");
    return await response.json();
}

API.startDemoGame = async () => {
    const response = await fetch(SERVER_URL + '/demoGame', {
        method: 'POST',
    });
    if (!response.ok) throw new Error("Failed to start Demo game");
    return await response.json();
}

API.getGame = async (gameId) => {
    const response = await fetch(SERVER_URL + `/game/${gameId}`, {
        credentials: 'include'
    });
    if (response.ok) {
        const gameData = await response.json();
        return gameData;
    } else {
        const errDetails = await response.text();
        throw new Error(errDetails);
    }
}

API.getNextCard = async(gameId) => {
    const response = await fetch(SERVER_URL + `/games/${gameId}/round`, {
        method: 'POST',
        credentials: 'include'
    })
    if(!response.ok) throw new Error('No more cards');
    return await response.json();
}

API.guessCard = async (gameId, cardId, position) => {
    const response = await fetch(SERVER_URL + `/games/${gameId}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ cardId, position }),
    });
    if (!response.ok) throw new Error('Guess failed');
    return await response.json();
};

API.getTimeLeft = async (gameId) => {
    const response = await fetch(`http://localhost:3001/api/games/${gameId}/round/current`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('No round found');
    return await response.json();
};

API.roundTimeout = async (gameId) => {
    const response = await fetch(`http://localhost:3001/api/games/${gameId}/round/timeout`, {
        method: 'POST',
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Timeout update failed');
    return await response.json();
};

{ /* History API */ }
API.getUserGameHistory = async() => {
    const response = await fetch(SERVER_URL + `/games/history`, {
        credentials: "include"
    });
    if(!response.ok) {
        throw new Error(await response.text());
    }
    return await response.json();
}

