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
    let breakCounts = new Array(numPlayers).fill(0);
    let breaks = Array.from({ length: numRounds }, () => []);
    let lastRoundBreaks = [];

    for (let round = 0; round < numRounds; round++) {
        let potentialBreaks = players.filter(p => !lastRoundBreaks.includes(p));
        potentialBreaks.sort((a, b) => breakCounts[players.indexOf(a)] - breakCounts[players.indexOf(b)]);

        let selectedBreaks = potentialBreaks.slice(0, numBreaksPerRound);
        breaks[round] = selectedBreaks;
        lastRoundBreaks = selectedBreaks;

        selectedBreaks.forEach(player => {
            breakCounts[players.indexOf(player)]++;
        });
    }
    return breaks;
}

function assignPartners(players, breaks) {
    let partners = [];
    let pastPartners = {};
    players.forEach(p => pastPartners[p] = []);

    for (let round = 0; round < breaks.length; round++) {
        let playingThisRound = players.filter(p => !breaks[round].includes(p));
        let roundPartners = [];
        let pairedPlayers = new Set();

        playingThisRound.forEach(player => {
            if (!pairedPlayers.has(player)) {
                let potentialPartners = playingThisRound.filter(p =>
                    p !== player &&
                    !pairedPlayers.has(p) &&
                    !pastPartners[player].includes(p)
                );

                if (potentialPartners.length > 0) {
                    let partner = potentialPartners[0];
                    roundPartners.push([player, partner]);
                    pastPartners[player].push(partner);
                    pastPartners[partner].push(player);
                    pairedPlayers.add(player);
                    pairedPlayers.add(partner);
                }
            }
        });
        partners.push(roundPartners);
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
