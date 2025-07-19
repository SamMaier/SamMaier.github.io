function generateSchedule(players, courts, rounds) {
    const breaks = assignBreaks(players, rounds, courts);
    const partners = assignPartners(players, breaks);
    const opponents = assignOpponents(partners);
    const schedule = assignCourts(opponents, courts);
    return { schedule, breaks };
}

function assignBreaks(playerNames, numRounds, numCourts) {
    let players = [...playerNames];
    const numPlayers = players.length;
    const playersPerCourt = 4;
    const numPlayersOnCourts = numCourts * playersPerCourt;
    const numBreaksPerRound = numPlayers - numPlayersOnCourts;
    let breaks = Array.from({ length: numRounds }, () => []);

    let prevBreaker = numPlayers;
    for (let round = 0; round < numRounds; round++) {
        let selectedBreaks = players.slice(prevBreaker, prevBreaker + numBreaksPerRound);
        let wraparound = prevBreaker + numBreaksPerRound - numPlayers;
        if (wraparound > 0) {
            selectedBreaks.push(...players.slice(0, wraparound));
        }
        breaks[round] = selectedBreaks;
        prevBreaker = (prevBreaker + numBreaksPerRound) % numPlayers
    }
    return breaks;
}

function assignPartners(players, breaks) {
    // This algorithm is highly biased towards 7 rounds with 4 courts, since this produces 7 unique divisors
    let numPlaying = players.length - breaks[0].length;
    let divisors = new Set();
    // numplaying can be assumed to be even
    for (let divisor = 1; divisor <= numPlaying/2; divisor++) {
        if (numPlaying % (divisor*2) == 0) {
            divisors.add(divisor);
            divisors.add(numPlaying-divisor);
        }
    }
    divisors = Array.from(divisors);
    let partners = [];

    for (let round = 0; round < breaks.length; round++) {
        let playingThisRound = players.filter(p => !breaks[round].includes(p));
        let roundPartners = [];
        let curDivisor = divisors[round % divisors.length];
        let effectiveDivisor = Math.min(curDivisor, numPlaying - curDivisor);
        for (let pairing = 0; pairing < playingThisRound.length/2; pairing++) {
            let p1 = Math.floor(pairing / effectiveDivisor) * 2 * effectiveDivisor + (pairing % effectiveDivisor);
            let p2 = (p1 + curDivisor) % numPlaying;
            roundPartners.push([playingThisRound[p1], playingThisRound[p2]]);
        }
        partners.push(roundPartners);
    }
    // Just a check to print out
    for (let i in players) {
        let p = players[i]
        let prevPartners = []
        for (let round = 0; round < breaks.length; round++) {
           for (let j in partners[round]) {
               pair = partners[round][j]
               if (pair.includes(p)) {
                   let partner = pair[0];
                   if (pair[0] === p) {
                       partner = pair[1];
                   }
                   if (prevPartners.includes(partner)) {
                       console.log("Pairing at round " + round + " - " + p + " & " + partner);
                   } else {
                       prevPartners.push(partner);
                   }
               }
           }
        }
    }
    return partners;
}

function assignOpponents(partners) {
    let opponents = [];
    let pastOpponents = {};
    partners.forEach(round => round.flat().forEach(p => pastOpponents[p] = []));

    for (let round = 0; round < partners.length; round++) {
        let roundPartners = partners[round];
        let roundOpponents = [];
        let matchedPairs = new Set();

        roundPartners.forEach(pair1 => {
            if (!matchedPairs.has(pair1)) {
                let potentialOpponents = roundPartners.filter(pair2 =>
                    pair1 !== pair2 &&
                    !matchedPairs.has(pair2)
                );

                if (potentialOpponents.length > 0) {
                    let bestOpponent = potentialOpponents[0]; // Simplified selection
                    roundOpponents.push([pair1, bestOpponent]);
                    matchedPairs.add(pair1);
                    matchedPairs.add(bestOpponent);
                }
            }
        });
        opponents.push(roundOpponents);
    }
    return opponents;
}

function assignCourts(opponents, numCourts) {
    let schedule = [];
    let lastCourt = {};

    for (let round = 0; round < opponents.length; round++) {
        let games = opponents[round];
        let roundSchedule = new Array(numCourts).fill(null);
        let assignedGames = new Set();

        for (let court = 0; court < numCourts; court++) {
            let potentialGames = games.filter(game => !assignedGames.has(game));
            if (potentialGames.length > 0) {
                let bestGame = potentialGames.find(game => {
                    return !game.flat().some(player => lastCourt[player] === court);
                }) || potentialGames[0];

                roundSchedule[court] = bestGame.flat();
                assignedGames.add(bestGame);
                bestGame.flat().forEach(player => lastCourt[player] = court);
            }
        }
        schedule.push(roundSchedule);
    }
    return schedule;
}
