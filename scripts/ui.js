define(['jquery'], function($){
  //////////////////////////////////
  /////////////////////////////////
  // /// UI Updates
  ///////////////////////////////
  
  //Private Methods
  
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
  
  //Public Props
  
  this.usernameForm = $("form").eq(0);
  
  this.chatForm = $("form").eq(1);
  
  this.players = $("#player1, #player2");
  
  //Public Method
  
  this.updateChoice = function(choice, id){
    $("#player" + id + " ul").empty();
    $("#player" + id+ "chosen").text(choice);
  }
  
  this.updateChoices = function(a, b){
    $("#player1-chosen").text(a);
    $("#player2-chosen").text(b);
  }
  
  this.updateOptions = function(id){
    $("#current-turn").html("<h2>It's Your Turn!</h2>");
    $("#player" + id + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
  }
  
  this.updatePlayer = function(id, data){
    if(!data.exists()){
     updateWaitingForPlayer(id);
    } else {
    updatePlayerInfo(id, data.val());
    }
  }
  
  this.scrollToMessage = function(){
    $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
  }
  
  this.updateChats = function(snapshot){
    $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>" + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }

  this.updateHighlightPlayer= function(id){
    $("#player1, #player2").css("border", "1px solid black");
    $("#player" +id ).css("border", "2px solid yellow");
  }

  this.updateWinner = function(name){
     $("#result").html("<h2>" + name + "</h2><h2>Wins!</h2>");
  }
  
  this.updateWaitingToChoose = function(name){
    $("#current-turn").html("<h2>Waiting for " + playerOneData.name + " to choose.</h2>");
  }
  
  this.updateWaitingForJoin = function(){
    $("#player1 ul, #player2 ul")
        .css("border", "1px solid black")
        .find("ul")
          .empty();
    $("#current-turn").html("<h2>Waiting for another player to join.</h2>");
  }
  
  this.updateWelcomeUser = function(username, playerNum){
    // Remove name input box and show current player number.
    $("#swap-zone").html("<h2>Hi " + username + "! You are Player " + playerNum + "</h2>");
  }
  
  return this;
  
});