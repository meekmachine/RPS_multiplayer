define(['db', 'ui', 'util/form'], function(db, ui, form){
  
  var username = "Guest",
      currentPlayers = null,
      currentTurn = null,
      playerNum = false;
  

  //////////////////////////////////
  /////////////////////////////////
  // /// Game Logic
  ///////////////////////////////

  var checkGame = function(a, b){
    return a % 3 === (b + 1) % 3; 
  }

  // Function to get in the game
  var getInGame = function() {
    // For adding disconnects to the chat with a unique id (the date/time the user entered the game)
    // Needed because Firebase's '.push()' creates its unique keys client side,
    // so you can't ".push()" in a ".onDisconnect"
    if (currentPlayers > 1){
      return handleFullGame();
    }
   
    var chatRef = db.getChatRef();
    
    playerNum = db.playerOneExists ? 2 : 1 ;
    db.sendNewPlayer(username, playerNum);
      // If a user disconnects, set the current turn to 'null' so the game does not continue
    db.currentTurnRef.onDisconnect().remove();
      // db.send disconnect message to chat with Firebase server generated timestamp and id of '0' to denote system message
    db.sendChatDisconnectMessage(chatRef);
  
    ui.updateWelcomeUser(username, playerNum);

  }

  // Game logic - Tried to space this out and make it more readable. Displays who won, lost, or tie game in result div.
  var win = function(id, name) {
    ui.updateWinner(name);
    ui.updateChoices(db.playerOneData.choice, db.playerTwoData.choice);
    db.sendScore();
  }
  var tie = function(){
    alert("Tie");
  }
  
  // Increments wins or losses accordingly.
  var gameLogic = function(player1choice, player2choice) {  
    var RPS = ["Rock", "Paper", "Scissors"];
    var a = RPS.indexOf(player1choice),
        b = RPS.indexOf(player2choice);
  
    if (player1choice ===  player2choice) {
      return tie();
    } else if (checkGame(a, b)){
      win(1, playerOneData.name);
    } else {
      win(2, playerTwoData.name);
    } 
  }
  
  //////////////////////////////////
  /////////////////////////////////
  // /// Event Handlers
  ///////////////////////////////

  this.fullGame = function(){
    alert("Sorry, Game Full! Try Again Later!");
  }
  
  this.error = function(message){
    alert(message);
  }

  this.userChoice = function(target) {
    var choice = $(this).text();
    db.sendChoice(choice, playerNum);
    db.sendTurnUpdate();
    ui.updateChoice(choice, playerNum);
  }

  this.chatDisconnect = function(){
    //handleError("The person has disconnected");
  }
  this.chatPush = function(snapshot) {
    // If idNum is 0, then its a disconnect message and displays accordingly
    // If not - its a user chat message
    if (snapshot.val().idNum === 0) {
      //handleChatDisconnect();
      return;
    }
    ui.updateChats(snapshot);
    scrollToMessage();
  }
  this.usernameSubmit = function(event) {
    event.preventDefault();
    if (!form.validate(this)) { 
      handleError("Please enter a message");
      return; 
    }
    username = $("#username", this).val().capitalize();
    getInGame();
  }
  this.chatSubmit = function(event) {
    event.preventDefault();
    if (!form.validate(this)) { 
      handleError("Please enter a message");
      return; 
    }
    db.sendMessage(form.getValue(this), username);
    form.reset(this);
  }

  this.playerPush = function(snapshot) {
    // length of the 'players' array
    db.setPlayerData(snapshot);
    ui.updatePlayer(1, snapshot.child("1"));
    ui.updatePlayer(2, snapshot.child("2"));
  }



  this.turnPush = function(snapshot) {

    // Gets current turn from snapshot
    currentTurn = snapshot.val();
  
    // Don't do the following unless you're logged in
    if (!playerNum) {
      return;
    }
  
    if (currentTurn > 2) {
      // Where the game win logic takes place then resets to turn 1
      return gameLogic(playerOneData.choice, playerTwoData.choice);
    }
    // your Opponent isn't here yet
    if (!currentTurn){
      return ui.updateWaitingForJoin();
    }
    //Since we are all here...
    //Highlight Current Player
    updateHighlightPlayer(currentTurn);

    //it's your turn!
    if (currentTurn === playerNum) {
      return ui.updateOptions(playerNum);
    }
    //Otherwise it's your opponent's turn -- If they have arrived by now
    return ui.updateWaitingToChoose( (playerNum > 1 ? db.playerTwoData : db.playerOneData).name );
  
  }
  return this;
})