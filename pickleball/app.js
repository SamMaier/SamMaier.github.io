const BYE = "__bye__"
function generateSchedule(players, courts, rounds) {
    const realPlayers = players.length;
    let partners = assignPartners(players, rounds);
    const breaks = assignBreaks(partners, rounds, realPlayers, courts);
    partners = cleanupPartners(partners, breaks);
    const opponents = assignOpponents(partners);
    const schedule = assignCourts(opponents, courts);
    return { schedule, breaks };
}

function assignBreaks(partners, numRounds, numPlayers, numCourts) {
    // Since we are doing a round robin, we must assign breaks in the following fashion:
    // Imagine a regular polygon (square, pentagon, hexagon, etc) which has the number of 
    // vertices that we have players on break, with its base sitting "flat" at the bottom.
    // The "bottom" is the opposite side to the pairing with the fixed location.
    // So, if we have 4 courts (16 players on), and 21 players, we have 21-16=5 players on break.
    // We then imagine a pentagon, with a vertex directly at the top (spot 1), and then jump 1/5
    // the way around the circle. Since this is not continuous, and partners must be on break
    // together, we only go halway around and pull the partners of the people selected.
    //
    // Also, in the even number of players case, since player 0 is fixed, we must swap them out
    // with the first person taking their N+2th break.
    //
    // So, for the 20 player case, we'd create a square. We'd go 1/8 the way down (2 spots)
    // (19 person circle) to the #3 spot. We'd then go 1/4 the way down (3 spots) to the #8 spot.
    // These are paired with the #18 and #13 spots.
    //
    // Now, this is the theory. Since we've already been handed the partners, we can do this
    // more simply by just removing certain partner locations from the array each time.

    const numOnBreak = numPlayers - (numCourts * 4);
    const even = numPlayers % 2 == 0;
    let breakLocations = [];
    const locationsToSkip = numPlayers / numOnBreak;
    let startingSpot = 0;
    if (even) {
        startingSpot = locationsToSkip/2;
    }
    for (let i = 0; i < numOnBreak / 2; i++) {
        breakLocations.push(Math.round(startingSpot + (i * locationsToSkip)));
    }
    
    const stationaryPlayer = partners[0][0][0];
    let breaks = [];
    let playerBreaks = {};
    playerBreaks[stationaryPlayer] = 0;
    for (let round = 0; round < numRounds; round++) {
        let selectedPairings = [];
        for (let i = 0; i < breakLocations.length; i++) {
            selectedPairings.push(partners[round][breakLocations[i]]);
        }
        if (even) {
            let alreadySwapped = false;
            for (let i = 0; i < selectedPairings.length; i++) {
                for (let j = 0; j < 2; j++) {
                    if (playerBreaks[selectedPairings[i][j]] > playerBreaks[stationaryPlayer]) {
                        console.log("Swapping round " + round + " " + selectedPairings[i] + " for " + partners[round][0]);
                        // We gotta swap this pairing with stationary player
                        selectedPairings[i] = partners[round][0];
                        alreadySwapped = true;
                        break;
                    }
                }
                if (alreadySwapped) {
                    break;
                }
            }
        }
        let selectedBreaks = [];
        for (let i = 0; i < selectedPairings.length; i++) {
            for (let j = 0; j < 2; j++) {
                let p = selectedPairings[i][j];
                selectedBreaks.push(p);
                if (!(p in playerBreaks)) {
                    playerBreaks[p] = 0;
                }
                playerBreaks[p] += 1;
            }
        }

        breaks[round] = selectedBreaks;
    }
    let min = 100000;
    let max = 0;
    for (let p in playerBreaks) {
        if (p == BYE) { continue; }
        if (playerBreaks[p] > max) {
            max = playerBreaks[p];
        }
        if (playerBreaks[p] < min) {
            min = playerBreaks[p];
        }
    }
    if (min + 2 <= max) {
        console.log("BAD BREAK ASSIGNMENT");
        console.log(playerBreaks);
    }
    return breaks;
}

function assignPartners(players, numRounds) {
    // Round robin scheduler. The first position is always stationary. The first position is always
    // a bye for an odd number of players.
    let stationary = BYE;
    let ps = [...players]; // Copy so we can check players later
    if (players.length % 2 == 0) {
        stationary = ps.pop();
    }
    let partners = [];
    for (let r = 0; r < numRounds; r++) {
        // Pair up
        currentPairings = [[stationary, ps.at(-1)]];
        for (let i = 0; i < ((ps.length -1) / 2); i++) {
            // Stupid JS doesn't allow negative index but at() does.
            currentPairings.push([ps[i], ps.at(-2-i)]);
        }

        partners[r] = currentPairings;
        // Rotate
        ps.unshift(ps.pop());
    }
    // Just a check to print out
    for (let i in players) {
        let p = players[i]
        let prevPartners = []
        for (let round = 0; round < numRounds; round++) {
           for (let j in partners[round]) {
               pair = partners[round][j]
               if (pair.includes(p)) {
                   let partner = pair[0];
                   if (pair[0] === p) {
                       partner = pair[1];
                   }
                   if (prevPartners.includes(partner)) {
                       console.log("Repeated pairing at round " + round + " - " + p + " & " + partner);
                   } else {
                       prevPartners.push(partner);
                   }
               }
           }
        }
    }
    return partners;
}

function cleanupPartners(partners, breaks) {
    let retVal = [];
    for (let r in partners) {
        roundBreak = new Set(breaks[r]);
        retVal.push(partners[r].filter(p => !roundBreak.has(p[0])));
    }
    return retVal;
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
