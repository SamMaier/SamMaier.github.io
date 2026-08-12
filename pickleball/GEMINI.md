# Picleball schedule generator

This is a basic webapp to generate a schedule for one night of casual pickleball plays.

## Technical aspects
This is done in a simple 3 file webapp, using app.js, index.html, and style.css. There are
absolutely no frameworks used, just vanilla JavaScript (no TypeScript), HTML, and CSS.

## The constraints
There are a variable number of players (at least 16 minimum), with some number of courts. Every
court hosts 4 players every single round, and there are a variable number of rounds.

The idea is, for inputs sized appropriately, to have no parter repetitions, to not have
consecutive breaks, and for no player to have 2 more breaks than another player.

The algorithm, with lower priority, should also attempt to have no opponent repetitions, and no
players should play back-to-back on the same court.

In practice, this application is typically used for 16-20 people, with 7 rounds, and 4 courts,
so if you must make tradeoffs for different input sizes, optimize around these numbers.

## The algorithm
This is all implemented in app.js. We use the numbers `N` people, `K` courts, and `M` rounds.

First, we assign the breaks, with a function called
`assignBreaks`. It takes as parameters the name list, as well as the number of rounds (M).  It then
creates M arrays, and populates each array with a randomized selection of people, where the number
of people selected is `N-(4*K)` (all the people who don't fit on the courts). This repeats M times,
and the list of people to select from is managed such that:

1. Everyone gets assigned a break before anyone gets two, then everyone is assigned a second break 
   before the anyone is assigned a third, and so on.
2. Nobody who was selected last round can get assigned this round.
 
Second, we assign parters for each round, with a function called `assignPartners`. It takes as
parameters the name list, and the list of break lists. It then assigns partners for the M rounds,
where no person has the same partner twice.

Next, we assign opponents, with a function called `assignOpponents`. It takes as parameters the list
of partern pairings. It matches up pairs of partners, minimizing the number of times any given person
plays the same person.

Finally, we assign courts. We assign games to have nobody on the same court twice in a row. If this
is impossible, we minimize the amount this occurs.

The final output should be a MxKx4 array, where we have M rounds, and within each round, there are
K courts, and within each court there are 4 players.
