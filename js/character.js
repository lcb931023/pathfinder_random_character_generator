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

		// HELPER
    // Inclusive min, exclusive max
		var randomInt = function(min, max){
			return Math.floor(Math.random() * (max - min) ) + min;
		};

    this.generate = function generate($http) {

      this.curLevel = Math.floor(Math.random() * 20 ) + 1;

      // Placeholder Values
      this.str = diceParser.roll("3d6");
      this.dex = diceParser.roll("3d6");
      this.con = diceParser.roll("3d6");
      this.int = diceParser.roll("3d6");
      this.wis = diceParser.roll("3d6");
      this.cha = diceParser.roll("3d6");


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


      // Skills
      this.skillRank = this.attributeMods.int + this.class.skillrank; //how many skill points you get per level
      this.skills = [];
      this.skills = this.class.Skills.slice();//gives an array

      // [TODO] necessary refinements for skill?
      // [TODO] Feat
      this.feats = [];
      this.feats = this.race.bonusfeats.slice();
      //racial feats are available to the player,
      //but not given to them by default
      this.freefeats = 0;//(this.level+1)/2
      this.restrictedfeats = []

			// Skills and Feat
			this.skillRank = this.attributeMods.int + this.class.skillrank;
			this.skills = [];
			var skillBuffer = [];
			skillBuffer = this.class.Skills.slice();
			// Number of skill cannot exceed amount of choices
			var skillAmount = (skillBuffer.length>this.skillRank) ? this.skillRank : skillBuffer.length;
			for (var i=0; i<skillAmount; i++) {
				var iSkill = randomInt(0, skillBuffer.length);
				this.skills.push(skillBuffer.splice(iSkill, 1)[0]);
			}
			// [TODO] necessary refinements for skill?
			// [TODO] Feat

      // Traits
      this.traits = [];
      this.traits = this.race.traits.slice();

      this.generateLevels();
      this.applyLevel(this.curLevel);
    };

    // Initiate all 20 levels with the current attributes
    this.generateLevels = function generateLevels() {
      this.levels = [];
      for (var i = 0; i < 20; i ++) {
        var tLevel = {};
        //saves
        tLevel.fortsaves = this.class.fortsaves[i];
        tLevel.refsaves = this.class.refsaves[i];
        tLevel.willsaves = this.class.willsaves[i];
        //ability points
        //free feats
        //available skill ranks
        //spells per day
        //spells known
        //hit points
        //todo: feats and traits granted by class per level
        this.levels.push(tLevel);
      }
    };

    // Fires everytime the Level needs recalculate
    // easiest way is to fire it for every level change
    // and every manual field change
    this.updateLevels = function updateLevels() {
      // Do tha calculation
      // apply back to character
      this.applyLevel(this.curlevel);
    };

    // Apply the level of choice to character's object variables,
    // so view can access them without worrying about the level
    this.applyLevel = function applyLevel(pLevel) {
      var iLevel = pLevel - 1;
      this.fortsaves = this.levels[iLevel].fortsaves;
      this.refsaves = this.levels[iLevel].refsaves;
      this.willsaves = this.levels[iLevel].willsaves;
    };
  }]);
