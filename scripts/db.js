define(['firebase'], function(firebase){
  //Private Variable
  var config = {
    apiKey: "AIzaSyA44GOVLOLOYqps5KjAhG5ysEvnGg5iyTA",
    authDomain: "t-rider-111808.firebaseapp.com",
    databaseURL: "https://t-rider-111808.firebaseio.com",
    projectId: "t-rider-111808",
    storageBucket: "t-rider-111808.appspot.com",
    messagingSenderId: "140188153152"
  };

  firebase.initializeApp(config);


  //Private Variable
  var database = firebase.database();
  
  // Public Properties
  this.chatData = database.ref("/chat"),
  this.playersRef = database.ref("players"),
  this.currentTurnRef = database.ref("turn");
  
  //Public Mehtods`
  this.setPlayerData = function(snapshot){
    this.playerOneData = snapshot.child("1").val();
    this.playerTwoData = snapshot.child("2").val();
    this.playerOneExists = snapshot.child("1").exists();
    this.playerTwoExists = snapshot.child("2").exists();
    this.currentPlayers = snapshot.numChildren();
  }
  
  this.sendMessage = function(message, username){
    this.chatData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP
    });
  }
  
  this.sendChoice = function(choice, playerNum){
    database.ref("/players/" + playerNum).child("choice").set(choice);
  }
  
  this.sendNewPlayer = function(username, playerNum){
    var ref = database.ref("/players/" + playerNum);
    ref.set({
      name: username,
      wins: 0,
      losses: 0,
    });
    ref.onDisconnect().remove();
  }
  
  this.sendScore = function(id){
    this.playersRef.child("" + id).child("wins").set(this.playerOneData.wins + 1);
    this.playersRef.child("" + (id < 2 ? 2 : 1)).child("losses").set(this.playerTwoData.losses + 1);
  }
  
  this.sendTurnUpdate = function(){
    currentTurnRef.transaction(function(turn) {
        return turn + 1;
    });
  }
  
  this.getChatRef = function(){
    return database.ref("/chat/" + Date.now());
  }

  this.sendChatDisconnectMessage = function(chatRef){
    chatRef.onDisconnect().set({
      name: username,
      time: firebase.database.ServerValue.TIMESTAMP,
      message: "has disconnected.",
      idNum: 0
    });
  }
  
  this.sendStartGame = function(snapshot) {

    if (this.currentPlayers > 0) {
      // set turn to 1, which starts the game
      this.currentTurnRef.set(1);
    }
  }
  
  return this;
})
