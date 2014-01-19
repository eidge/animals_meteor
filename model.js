Animals = new Meteor.Collection('animals');

Players = new Meteor.Collection('players');

Games = new Meteor.Collection('games');

Guesses = new Meteor.Collection('guesses');

Meteor.methods({
  score_guess: function (guess_id) {
    var ge = Guesses.findOne({_id: guess_id});
    var ga = Games.findOne({_id: ge.game_id});

    if(ge && ga && Meteor.isServer){
      if(ge.word.toLowerCase() == ga.animal.name.toLowerCase()){
        Games.update(ga._id, {$set: {winners: [ge.player_id]}});
        Guesses.update(ge._id, {$set: {state: 'good'}});
      }
      else{
        Guesses.update(ge._id, {$set: {state: 'bad'}});
      }
    }
  }
});


if (Meteor.isServer) {
  // publish all the non-idle players.
  Meteor.publish('players', function () {
    return Players.find({idle: false});
  });

  // publish single games
  Meteor.publish('games', function (id) {
    check(id, String);
    return Games.find({_id: id});
  });

  Meteor.publish('guesses', function (id) {
    check(id, String);
    return Guesses.find({game_id: id});
  });

}