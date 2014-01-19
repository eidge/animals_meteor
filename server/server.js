
////////// Server only logic //////////

Meteor.methods({
  start_new_game: function () {
    // create a new game w/ fresh board
    var game_id = Games.insert({animal: Animals.find().fetch()[Math.floor(Animals.find().count()*Math.random())],clock: 120});

    // move everyone who is ready in the lobby to the game
    Players.update({game_id: null, idle: false, name: {$ne: ''}},
                   {$set: {game_id: game_id}},
                   {multi: true});
    // Save a record of who is in the game, so when they leave we can
    // still show them.
    var p = Players.find({game_id: game_id},
                         {fields: {_id: true, name: true}}).fetch();
    Games.update({_id: game_id}, {$set: {players: p}});


    var tips = _.map(Games.findOne(game_id).animal, function(value, index) {
        return value;
    });

    var n_tip = 2;

    var tips_array = [];

    // Present a guess
    var guess_interval = Meteor.setInterval(function(){
      tips_array.push(tips[n_tip]);
      Games.update({_id: game_id}, {$set: {tips: tips_array}});
      n_tip += 1;
    }, 3000);

    // wind down the game clock
    var clock = 60;
    var interval = Meteor.setInterval(function () {
      clock -= 1;
      Games.update(game_id, {$set: {clock: clock}});

      // end of game
      if (clock === 0 || Guesses.find({game_id: game_id, state: "good"}).count() ) {
        // stop the clock
        Meteor.clearInterval(interval);
        Meteor.clearInterval(guess_interval);
        clock = 0;
        Games.update(game_id, {$set: {clock: clock}});

      }
    }, 1000);



    return game_id;
  },


  keepalive: function (player_id) {
    check(player_id, String);
    Players.update({_id: player_id},
                  {$set: {last_keepalive: (new Date()).getTime(),
                          idle: false}});
  },
});

Meteor.setInterval(function () {
  var now = (new Date()).getTime();
  var idle_threshold = now - 70*1000; // 70 sec
  var remove_threshold = now - 60*60*1000; // 1hr

  Players.update({last_keepalive: {$lt: idle_threshold}},
                 {$set: {idle: true}});

  // XXX need to deal with people coming back!
  // Players.remove({$lt: {last_keepalive: remove_threshold}});

}, 30*1000);
