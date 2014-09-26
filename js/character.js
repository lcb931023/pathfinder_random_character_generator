angular.module('character', ['diceParser'])
  .controller('CharacterController', ['diceParser', '$scope', '$http', function(diceParser, $scope, $http) {

    $http.get('json/races.json')
      .then(function(res){
        this.raceJson = res.data;
      }
    );
		$http.get('json/classes.json')
      .then(function(res){
        this.classJson = res.data;
      }
    );
	
		// helper. Inclusive min, exclusive max
		var randomInt = function(min, max){
			return Math.floor(Math.random() * (max - min) ) + min;
		};
	
    this.generate = function generate($http) {

      // Placeholder Values
      this.str = randomInt(10, 21);
      this.dex = randomInt(10, 21);
      this.con = randomInt(10, 21);
      this.int = randomInt(10, 21);
      this.wis = randomInt(10, 21);
      this.cha = randomInt(10, 21);
			// Data independent data
			this.gender = (Math.random() > 0.5) ? "male" : "female";
			
      // From Races
      this.race = raceJson.races[randomInt(0, raceJson.races.length)];
			this.name = this.race.names[this.gender][randomInt(0, this.race.names[this.gender].length)];
			this.height = this.race.height[this.gender + "base"] + diceParser.roll(this.race.height[this.gender + "mod"]);
			this.weight = this.race.weight[this.gender + "base"] + diceParser.roll(this.race.weight[this.gender + "mod"]);
      this.attributeMods =
      {
        "str":0, "dex":0, "con":0, "int":0, "wis":0, "cha":0,
      };
      var pAbility = this.race.ability;
      // Assign mods from json to attributes of attributeMods
        // ugh vocabulary
      for(var i = 0; i < pAbility.length; i++){
        var tKey = Object.keys(pAbility[i]);
        this.attributeMods[tKey] = pAbility[i][tKey];
      }

      // From Classes
			this.class = classJson.Classes[randomInt(0, classJson.Classes.length)];
			
    };

  }]);
