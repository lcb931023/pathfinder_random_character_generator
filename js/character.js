angular.module('character', [])
  .controller('CharacterController', function($scope, $http) {

    $http.get('json/races.json')
      .then(function(res){
        this.raceJson = res.data;
      }
    );

    this.generate = function generate($http) {

      // Placeholder Values
      this.str = Math.floor(Math.random() * 10) + 10;
      this.dex = Math.floor(Math.random() * 10) + 10;
      this.con = Math.floor(Math.random() * 10) + 10;
      this.int = Math.floor(Math.random() * 10) + 10;
      this.wis = Math.floor(Math.random() * 10) + 10;
      this.cha = Math.floor(Math.random() * 10) + 10;
      // From Races
      
      this.race = raceJson.races[Math.floor(Math.random() * raceJson.races.length)];
        
      this.attributeMods =
      {
        "str":0,
        "dex":0,
        "con":0,
        "int":0,
        "wis":0,
        "cha":0,
      };
      var pAbility = this.race.ability;
      // Assign mods from json to attributes of attributeMods
        // ugh vocabulary
      for(var i = 0; i < pAbility.length; i++){
        var tKey = Object.keys(pAbility[i]);
        this.attributeMods[tKey] = pAbility[i][tKey];
      }

      // From Classes
    };

  });
