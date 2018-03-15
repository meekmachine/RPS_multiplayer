var config = {
  apiKey: "AIzaSyA44GOVLOLOYqps5KjAhG5ysEvnGg5iyTA",
  authDomain: "t-rider-111808.firebaseapp.com",
  databaseURL: "https://t-rider-111808.firebaseio.com",
  projectId: "t-rider-111808",
  storageBucket: "t-rider-111808.appspot.com",
  messagingSenderId: "140188153152"
};

firebase.initializeApp(config);


// Function to capitalize usernames
String.prototype.capitalize = function(name){
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var database = firebase.database(),
    chatData = database.ref("/chat"),
    playersRef = database.ref("players"),
    currentTurnRef = database.ref("turn"),
    username = "Guest",
    currentPlayers = null,
    currentTurn = null,
    playerNum = false,
    playerOneExists = false,
    playerTwoExists = false,
    playerOneData = null,
    playerTwoData = null;



//////////////////////////////////
/////////////////////////////////
// /// Form Utilties
///////////////////////////////
var validateForm = function(form){
  return !!getFieldValue(form);
}

var getFieldValue = function(form){
  return $(form).find("input").eq(0).val();
}

var resetForm = function(form){
  $("input", form).val("");
}

//////////////////////////////////
/////////////////////////////////
// /// Firebase Getters and Setters
///////////////////////////////
var setPlayerData = function(snapshot){
  playerOneData = snapshot.child("1").val();
  playerTwoData = snapshot.child("2").val();
  playerOneExists = snapshot.child("1").exists();
  playerTwoExists = snapshot.child("2").exists();
  currentPlayers = snapshot.numChildren();
}
var sendMessage = function(message, username){
  chatData.push({
    name: username,
    message: message,
    time: firebase.database.ServerValue.TIMESTAMP,
    idNum: playerNum
  });
}
var sendChoice = function(choice){
  database.ref("/players/" + playerNum).child("choice").set(choice);
}
var sendNewPlayer = function(username){
  var ref = database.ref("/players/" + playerNum);
  ref.set({
    name: username,
    wins: 0,
    losses: 0,
  });
  return ref;
}
var sendTurnUpdate = function(){
  currentTurnRef.transaction(function(turn) {
      return turn + 1;
  });
}
var getChatRefference = function(){
  return database.ref("/chat/" + Date.now());
}

var sendChatDisconnectMessage = function(chatRef){
  chatRef.onDisconnect().set({
    name: username,
    time: firebase.database.ServerValue.TIMESTAMP,
    message: "has disconnected.",
    idNum: 0
  });
}
var sendStartGame = function(snapshot) {

  if (currentPlayers < 2) {
    // set turn to 1, which starts the game
    currentTurnRef.set(1);
  }
}

//////////////////////////////////
/////////////////////////////////
// /// UI Updates
///////////////////////////////
var updateChoice = function(choice, id){
  $("#player" + playerNum + " ul").empty();
  $("#player" + playerNum + "chosen").text(choice);
}
var updateChoices = function(){
  $("#player1-chosen").text(playerOneData.choice);
  $("#player2-chosen").text(playerTwoData.choice);
}
var updateOptions = function(){
  $("#current-turn").html("<h2>It's Your Turn!</h2>");
  $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
}
var displayPlayer = function(id, data){
  if(!data.exists()){
   updateWaitingForPlayer(id);
  } else {
    updatePlayerInfo(id, data.val());
  }
}
var scrollToMessage = function(){
  $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
}
var updateChats = function(snapshot){
  $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>" + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
}

var updateHighlightPlayer= function(id){
  $("#player1, #player2").css("border", "1px solid black");
  $("#player" +id ).css("border", "2px solid yellow");
}

var updatePlayerInfo = function(id, data){
    $("#player"+id+"-name").text(data.name);
    $("#player"+id+"-wins").text("Wins: " + data.wins);
    $("#player"+id+"-losses").text("Losses: " + data.losses);
}
var updateWaitingForPlayer = function(id){
    $("#player"+id+"-name").text("Waiting for Player " + id);
    $("#player"+id+"-wins").empty();
    $("#player"+id+"-losses").empty();
}
var updateWinner = function(){
   $("#result").html("<h2>" + name + "</h2><h2>Wins!</h2>");
}
var updateWaitingToChoose = function(){
  $("#current-turn").html("<h2>Waiting for " + playerOneData.name + " to choose.</h2>");
}
var updateWaitingForJoin = function(){
  $("#player1 ul, #player2 ul")
      .css("border", "1px solid black")
      .find("ul")
        .empty();
  $("#current-turn").html("<h2>Waiting for another player to join.</h2>");
}
var updateWelcomeUser = function(username, playerNum){
  // Remove name input box and show current player number.
  $("#swap-zone").html("<h2>Hi " + username + "! You are Player " + playerNum + "</h2>");
}


//////////////////////////////////
/////////////////////////////////
// /// Game Logic
///////////////////////////////

var checkGame = function(a, b){
  return a % 3 === (b + 1) % 3; 
}


var handleTie = function(){
  
}

// Function to get in the game
var getInGame = function() {
  // For adding disconnects to the chat with a unique id (the date/time the user entered the game)
  // Needed because Firebase's '.push()' creates its unique keys client side,
  // so you can't ".push()" in a ".onDisconnect"
  if (currentPlayers > 1){
    return handleFullGame();
  }
  
  playerNum = playerOneExists ? 2 : 1 ;
  var chatRef = getChatRefference(),
      playerRef = sendNewPlayer(username);
      
  playerRef.onDisconnect().remove();

    // If a user disconnects, set the current turn to 'null' so the game does not continue
  currentTurnRef.onDisconnect().remove();
    // Send disconnect message to chat with Firebase server generated timestamp and id of '0' to denote system message
  sendChatDisconnectMessage(chatRef);
  
  updateWelcomeUser(username, playerNum);

}

// Game logic - Tried to space this out and make it more readable. Displays who won, lost, or tie game in result div.
// Increments wins or losses accordingly.
var gameLogic = function(player1choice, player2choice) {  
  var RPS = ["Rock", "Paper", "Scissors"];
  var a = RPS.indexOf(player1choice),
      b = RPS.indexOf(player2choice);
  
  if (player1choice ===  player2choice) {
    return hanldeTie();
  } else if (checkGame(a, b)){
    handleWin(1, playerOneData.name);
  } else {
    handleWin(2, playerTwoData.name);
  }
  
}




//////////////////////////////////
/////////////////////////////////
// /// Event Handlers
///////////////////////////////
var handleError = function(message){
  alert(message);
}

var handleUserChoice = function(target) {
  var choice = $(this).text();
  sendChoice(choice);
  sendTurnUpdate();
  updateChoice(choice);
}

var handleChatDisconnect = function(){
  //handleError("The person has disconnected");
}
var handleChatPush = function(snapshot) {
  // If idNum is 0, then its a disconnect message and displays accordingly
  // If not - its a user chat message
  if (snapshot.val().idNum === 0) {
    //handleChatDisconnect();
    return;
  }
  updateChats(snapshot);
  scrollToMessage();
}
var handleUsernameSubmit = function(event) {
  event.preventDefault();
  if (!validateForm(this)) { 
    handleError("Please enter a message");
    return; 
  }
  username = $("#username", this).val().capitalize();
  getInGame();
}
var handleChatSubmit = function(event) {
  event.preventDefault();
  if (!validateForm(this)) { 
    handleError("Please enter a message");
    return; 
  }
  sendMessage(getFieldValue(this), username);
  resetForm(this);
}

var handlePlayerPush = function(snapshot) {
  // length of the 'players' array
  setPlayerData(snapshot);
  displayPlayer(1, snapshot.child("1"));
  displayPlayer(2, snapshot.child("2"));
}

var handleTurnPush = function(snapshot) {

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
    return updateWaitingForJoin();
  }
  //Since we are all here...
  //Highlight Current Player
  updateHighlightPlayer(currentTurn);
  
  //it's your turn!
  if (currentTurn === playerNum) {
    return updateOptions();
  }
  //Otherwise it's your opponent's turn -- If they have arrived by now
  return updateWaitingToChoose( (playerNum > 1 ? playerTwoData : playerOneData).name );
  
}

var handleWin = function(id, name) {
  updateWinner();
  updateChoices();
  playersRef.child("" + id).child("wins").set(playerOneData.wins + 1);
  playersRef.child("" + (id < 2 ? 2 : 1)).child("losses").set(playerTwoData.losses + 1);
}

var handleFullGame = function(){
  alert("Sorry, Game Full! Try Again Later!");
}




//////////////////////////////////
/////////////////////////////////
// /// Bind Event Handlers
///////////////////////////////

// Start button - takes username and tries to get user in game
$("form").eq(0).submit(handleUsernameSubmit);

$("form").eq(1).submit(handleChatSubmit);

// Click event for dynamically added <li> elements
$("#player1, #player2").on("click", "li", handleUserChoice);


// Update chat on screen when new message detected - ordered by 'time' value
chatData.orderByChild("time").on("child_added", handleChatPush);

// Tracks changes in key which contains player objects
playersRef.on("value", handlePlayerPush);

// Detects changes in current turn key
currentTurnRef.on("value", handleTurnPush);

// When a player joins, checks to see if there are two players now. If yes, then it will start the game.
playersRef.on("child_added", sendStartGame);
