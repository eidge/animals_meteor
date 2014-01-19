// Utility Functions

var player = function () {
  return Players.findOne(Session.get('player_id'));
};

var game = function () {
  var me = player();
  return me && me.game_id && Games.findOne(me.game_id);
};

Handlebars.registerHelper('eq', function(a,b) {
  return a == b;
});

// Lobby

Template.lobby.show = function () {
  // only show lobby if we're not in a game
  return !game();
};

Template.lobby.waiting = function () {
  var players = Players.find({_id: {$ne: Session.get('player_id')},
                              name: {$ne: ''},
                              game_id: {$exists: false}});

  return players;
};

Template.lobby.count = function () {
  var players = Players.find({_id: {$ne: Session.get('player_id')},
                              name: {$ne: ''},
                              game_id: {$exists: false}});

  return players.count();
};

Template.lobby.disabled = function () {
  var me = player();
  if (me && me.name)
    return '';
  return 'disabled="disabled"';
};


Template.lobby.events({
  'keyup input#myname': function (evt) {
    var name = $('#lobby input#myname').val().trim();
    Players.update(Session.get('player_id'), {$set: {name: name}});
  },
  'click button.startgame': function () {
    Meteor.call('start_new_game');
  }
});

// Guess Box

Template.scratchpad.show = function () {
  return game() && game().clock > 0;
};

Template.scratchpad.events({
  'click button, keyup input': function (evt) {
    var textbox = $('#scratchpad input');
    // if we clicked the button or hit enter
    if ((evt.type === "click" || (evt.type === "keyup" && evt.which === 13))
        && textbox.val()) {
      var guess_id = Guesses.insert({player_id: Session.get('player_id'),
                                  game_id: game() && game()._id,
                                  word: textbox.val().toUpperCase(),
                                  state: 'pending'});
      Meteor.call('score_guess', guess_id);
      textbox.val('');
      textbox.focus();
    }
  }
});

Template.scores.show = function () {
  return !!game();
};

Template.scores.show_answer = function() {
  return game() && game().clock == 0;
}

Template.scores.players = function () {
  return game() && game().players;
};

Template.player.winner = function () {
  var g = game();
  if (g.winners && _.include(g.winners, this._id))
    return 'winner';
  return '';
};

Template.player.total_score = function () {
  var words = Guesses.find({game_id: game() && game()._id,
                          player_id: this._id});

  var score = 0;
  words.forEach(function (word) {
    if (word.score)
      score += word.score;
  });
  return score;
};

Template.scores.correct = function(){
  return game() && game().animal.name;
};

Template.guesses.guesses = function(){
  console.log(this._id);
  return Guesses.find({player_id: this._id});
};

Template.postgame.show = function () {
  return game() && game().clock === 0;
};

Template.postgame.events({
  'click button': function (evt) {
    Players.update(Session.get('player_id'), {$set: {game_id: null}});
  }
});

// Board

Template.board.tips = function() {
  var g = game();

  if(g){
    var tips = [];

    if(g.tips && g.tips[0] == 1)
      tips.push("It's hairy!");
    else if(g.tips && g.tips[0] == 0)
      tips.push("It's hairless");

    if(g.tips && g.tips[1] == 1)
      tips.push("Has feathers!");
    else if(g.tips && g.tips[1] == 0)
      tips.push("No feathers on this one!");

    if(g.tips && g.tips[2] == 1)
      tips.push("It was born in an egg!");
    else if(g.tips && g.tips[2] == 0)
      tips.push("It wasn't born from an egg!");

    if(g.tips && g.tips[3] == 1)
      tips.push("It's mamma gives it milk!");
    else if(g.tips && g.tips[3] == 0)
      tips.push("It doesn't drink milk!");

    if(g.tips && g.tips[4] == 1)
      tips.push("It flyes!");
    else if(g.tips && g.tips[4] == 0)
      tips.push("It cannot fly!");

    if(g.tips && g.tips[5] == 1)
      tips.push("It spends a long time on the water!");
    else if(g.tips && g.tips[5] == 0)
      tips.push("It lives on the land!");

    if(g.tips && g.tips[6] == 1)
      tips.push("It is a predator!");
    else if(g.tips && g.tips[6] == 0)
      tips.push("It doesn't eat other animals!");

    if(g.tips && g.tips[7] == 1)
      tips.push("It has teeth!");
    else if(g.tips && g.tips[7] == 0)
      tips.push("It has no teeth!");

    if(g.tips && g.tips[8] == 1)
      tips.push("It has a backbone!");
    else if(g.tips && g.tips[8] == 0)
      tips.push("It has no backbone!");

    if(g.tips && g.tips[9] == 1)
      tips.push("It has lungs!");
    else if(g.tips && g.tips[9] == 0)
      tips.push("It has no lungs!");

    if(g.tips && g.tips[10] == 1)
      tips.push("It's venomous!");
    else if(g.tips && g.tips[10] == 0)
      tips.push("No venom on this one!");

    if(g.tips && g.tips[11] == 1)
      tips.push("It has fins!");
    else if(g.tips && g.tips[11] == 0)
      tips.push("No fins on this one!");

    if(g.tips && g.tips[12] == 1)
      tips.push("It has " + g.tips[12] + " legs!");
    else if(g.tips && g.tips[12] == 0)
      tips.push("It has no legs!");

    if(g.tips && g.tips[13] == 1)
      tips.push("It's got a tail!");
    else if(g.tips && g.tips[13] == 0)
      tips.push("No tail on this one!");

    if(g.tips && g.tips[14] == 1)
      tips.push("It's domestic!");
    else if(g.tips && g.tips[14] == 0)
      tips.push("It's not domestic!");

    if(g.tips && g.tips[15] == 1)
      tips.push("It's about the size of a cat!");
  }

  return g && tips;
};

Template.board.clock = function () {
  var clock = game() && game().clock;

  if (!clock || clock === 0)
    return;

  // format into M:SS
  var min = Math.floor(clock / 60);
  var sec = clock % 60;
  return min + ':' + (sec < 10 ? ('0' + sec) : sec);
};

// Initialization

Meteor.startup(function () {
  // Allocate a new player id.
  //
  // XXX this does not handle hot reload. In the reload case,
  // Session.get('player_id') will return a real id. We should check for
  // a pre-existing player, and if it exists, make sure the server still
  // knows about us.
  var player_id = Players.insert({name: '', idle: false});
  Session.set('player_id', player_id);

  // subscribe to all the players, the game i'm in, and all
  // the words in that game.
  Deps.autorun(function () {
    Meteor.subscribe('players');

    if (Session.get('player_id')) {
      var me = player();
      if (me && me.game_id) {
        Meteor.subscribe('games', me.game_id);
        Meteor.subscribe('guesses', me.game_id);
      }
    }
  });

  // send keepalives so the server can tell when we go away.
  //
  // XXX this is not a great idiom. meteor server does not yet have a
  // way to expose connection status to user code. Once it does, this
  // code can go away.
  Meteor.setInterval(function() {
    if (Meteor.status().connected)
      Meteor.call('keepalive', Session.get('player_id'));
  }, 20*1000);
});