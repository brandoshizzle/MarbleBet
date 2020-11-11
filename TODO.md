# The Plan

### Phone

-   Shows betting options and current username
-   Upon logging in, sends a POST to the server to add the room, user to the list of users in that room
-   Clicking "Place Bet" sends POST to server with room, username, and betting data

### Dashboard

-   When first loaded, GET stored room data from server
-   Socket.IO connection
    -   When a new user joins
        -   Update local user data
    -   Updates when user places a bet
        -   Update local user data
-   Way for host to enter round results
-   Calculate new totals and POST them to the server
    -   Reset current bets to 0
-   Reset button that sets all users to 0 points

### Server

-   POST endpoint: get username and sends it to dashboard
    -   Generate new bets, points for user
    -   Add to database
    -   Save database
    -   Send socket update to dashboard
-   POST endpoint: get player's bet
    -   Add to database
    -   Send socket update to dashboard
    -   Save database
-   POST endpoint: get new player totals after results
    -   Set current bets to 0
    -   Add to database
    -   Save database
-   GET endpoint: send room info to dashboard
-   POST endpoint: reset all user info for a room
-   GET endpoint: check if room exists
