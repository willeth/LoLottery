// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

contract LoLottery {

    event gameCreated(uint _numberOfPlayers, uint _ticketPrice);
    event newPlayer(address newPlayer, uint currentNumberOfPlayers);
    event gameClosed();
    event winnerFound(address winner, uint prize);

    struct LotteryGame {

        address payable [] players;
        uint ticketPrice;
        uint numberOfPlayers;

    }


    struct Player{

        uint currentLevel;
        uint numberOfGamesPlayed;
        uint totalWinnings;
        bool playerBanned;
        
    }

    mapping(address => Player) public PlayersMapping;

    LotteryGame public game;






    bool public gameReady = false;
    bool gameInProgress = false;
    address payable owner;
    uint random1;
    uint random2;
    address payable final1;
    address payable final2;
    uint nonce = 0;
    address payable winner;
    uint public gameNumber = 0;
    address payable public lastWinner;

    constructor () {

        owner = payable(msg.sender);

    }

    function newGame (uint _numberOfPlayers, uint _ticketPrice) public {

            require(gameInProgress==false, "another game already in progress");

            require(msg.sender == owner, "Must be owner to create new game");

            lastWinner = winner;
            gameNumber ++;
            gameInProgress = true;
            game.ticketPrice = _ticketPrice;
            game.numberOfPlayers = _numberOfPlayers;
        

            emit gameCreated(_numberOfPlayers, _ticketPrice);

    }


    function enterGame () public payable {

        require(gameInProgress==true);
        require(msg.value == game.ticketPrice, "Please Send Exact Ticket Price");
        require(game.players.length < game.numberOfPlayers, "Game finished");
        game.players.push(payable(msg.sender));

        emit newPlayer(payable(msg.sender), game.players.length);

        if(game.players.length == game.numberOfPlayers) {
            
            gameReady = true;
            emit gameClosed();
        
        }

    }

    function playGame() public {

        require(msg.sender == owner, "only owner can call this function");
        require(game.players.length == game.numberOfPlayers, "Game Not Full");
        require(gameReady == true, "Game Not Full");

        //uint  middlePlayerAddressAsInt = uint(keccak256(abi.encodePacked(level1Game.players[level1Game.players.length * 50 / 100])));
        
        random1 = randomNumber() % game.numberOfPlayers;
        random2 = randomNumber() % game.numberOfPlayers;
        
        
        //random2 = (uint(keccak256(abi.encodePacked(middlePlayerAddressAsInt, randomNumber())))) % game.numberOfPlayers;

       
        
        final1 = game.players[random1];
        final2 = game.players[random2]; 

        uint random3 = randomNumber()%2;

        if(random3 == 0){
            winner = final1;
        }

        else if (random3 ==1){
            winner = final2;
        }
        
        uint prizeFund = game.ticketPrice*game.numberOfPlayers-game.ticketPrice;
        emit winnerFound(winner, prizeFund);
        winner.transfer(prizeFund);
        owner.transfer(game.ticketPrice);

        resetGame();

        
    }

    function randomNumber() internal returns (uint) {
        uint randomnumber = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % 900;
        randomnumber = randomnumber + 100;
        nonce++;
        return randomnumber;
    }

    function resetGame() internal {
        
        gameInProgress = false;
        gameReady = false;
        delete game.players;

    }

    function getPlayerByIndex (uint index) public view returns (address){

        uint lengthOfPlayers = game.players.length;

        require(index < lengthOfPlayers, "must be valid index");

        return game.players[index];

    }

    function getCurrentNumberOfPlayers() public view returns(uint){

        return game.players.length;

    }


}