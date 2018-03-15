

// Function to capitalize usernames
String.prototype.capitalize = function(name){
  return this.charAt(0).toUpperCase() + this.slice(1);
}

requirejs.config({
    appDir: ".",
    baseUrl: "scripts",
    paths: { 
        /* Load jquery from google cdn. On fail, load local file. */
        'jquery': ['https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min', 'libs/jquery-min'],
        /* Load bootstrap from cdn. On fail, load local file. */
        'bootstrap': ['https://netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min.', 'libs/bootstrap-min'],
        
        'firebase': ['https://www.gstatic.com/firebasejs/3.1.0/firebase', 'libs/firebase']
    },
    shim: {
        /* Set bootstrap dependencies (just jQuery) */
        'bootstrap' : ['jquery'],
        'firebase': {
                  exports: 'firebase'
              }
    }
});


require(['handlers', 'db', 'ui'], function(handle, db, ui){

  //////////////////////////////////
  /////////////////////////////////
  // /// Bind Event Handlers
  ///////////////////////////////

  // Start button - takes username and tries to get user in game
  ui.usernameForm.submit(handle.usernameSubmit);
  ui.chatForm.submit(handle.chatSubmit);

  // Click event for dynamically added <li> elements
  ui.players.on("click", "li", handle.userChoice);

  // Update chat on screen when new message detected - ordered by 'time' value
  db.chatData.orderByChild("time").on("child_added", handle.chatPush);

  // Tracks changes in key which contains player objects
  db.playersRef.on("value", handle.playerPush);

  // Detects changes in current turn key
  db.currentTurnRef.on("value", handle.turnPush);

  // When a player joins, checks to see if there are two players now. If yes, then it will start the game.
  db.playersRef.on("child_added", db.sendStartGame);
  
})

