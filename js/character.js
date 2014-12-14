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

    $http.get('json/shared.json')
      .then(function(res){
        this.sharedJson = res.data;
      }
    );
    function inArray(target, list)
    {
        var inArray=false;
        for(var i=0;i<list.length;i++)
        {
            if(list[i]===target){inArray=true;}
        }
        return inArray;
    };
		// HELPER
    // Inclusive min, exclusive max
		var randomInt = function(min, max){
			return Math.floor(Math.random() * (max - min) ) + min;
		};

    this.generate = function generate($http) {

      this.curLevel = Math.floor(Math.random() * 20 ) + 1;

      // Placeholder Values
      this.attributeScores = {};
      this.attributeScores.str = diceParser.roll("3d6");
      this.attributeScores.dex = diceParser.roll("3d6");
      this.attributeScores.con = diceParser.roll("3d6");
      this.attributeScores.int = diceParser.roll("3d6");
      this.attributeScores.wis = diceParser.roll("3d6");
      this.attributeScores.cha = diceParser.roll("3d6");


      // Data independent data
      this.gender = (Math.random() > 0.5) ? "male" : "female";

      // From Races
      this.race = raceJson.races[randomInt(0, raceJson.races.length)];
      this.name = this.race.names[this.gender][randomInt(0, this.race.names[this.gender].length)];
      this.height = this.race.height[this.gender + "base"] +
                    diceParser.roll(this.race.height[this.gender + "mod"]);
      this.weight = this.race.weight[this.gender + "base"] +
                    diceParser.roll(this.race.weight[this.gender + "mod"]);
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
      this.shared = sharedJson;


      // [TODO] necessary refinements for skill?
      // [TODO] Feat
      this.feats = [];
      this.feats = this.race.bonusfeats.slice();
      //racial feats are available to the player,
      //but not given to them by default - only bonus feats are
      this.restrictedfeats = [];

			// Skills
			this.classSkills = {};
			this.skillRanks = {};
			var tclassSkills = this.class.Skills.slice();//gives an array

			// put in dictionary
			for (var i=0; i<this.shared.skills.length; i++) {
        var key = this.shared.skills[i].name;
				this.classSkills[key] = inArray(key, tclassSkills);
				this.skillRanks[key] = 0;
			}
			// [TODO] necessary refinements for skill?
			// [TODO] Feat

      // Traits
      this.traits = [];
      this.traits = this.race.traits.slice();

      this.generateLevels();
      this.updateCharacterFromLevels();
    };

    // Initiate all 20 levels with the current attributes
    this.generateLevels = function generateLevels() {
      $scope.character.levels = [];
      for (var i = 0; i < 20; i ++) {
        var tLevel = {};
        //saves
        tLevel.fortsaves = this.class.fortsaves[i];
        tLevel.refsaves = this.class.refsaves[i];
        tLevel.willsaves = this.class.willsaves[i];
        //BAB
        tLevel.BAB = this.shared.BAB[this.class.BAB][i];
        //ability points
        tLevel.abilitypoints_total = Math.floor((i+1)/4);
        tLevel.abilitypoints_used = 0;
        // Copy an object instead of referencing it
        tLevel.attributeScores = {};
        angular.copy(this.attributeScores, tLevel.attributeScores);
        //free feats
        tLevel.freefeats_total = Math.floor((i+2)/2);//todo:fighter,human

        //skill ranks
        tLevel.skillranks = this.skillRanks;
        tLevel.skillranks_total =
                  i*(this.class.skillrank+this.attributeMods.int);
        tLevel.skillranks_used = 0;

        tLevel.skillranks_max = i+4;
        tLevel.skillranks_crossclass_max = Math.floor((i+4)/2);

        //spells per day
        //spells known

        //hit points
        if (i == 0) { tLevel.hp = diceParser.roll_max("1"+this.class.Hit);}
        else
        {
          tLevel.hp = $scope.character.levels[i-1].hp +
                      diceParser.roll("1"+this.class.Hit);
        }

        //todo: feats and traits granted by class per level

        $scope.character.levels.push(tLevel);
      }
    };

    // Fires everytime the Level needs recalculate
    this.updateLevels = function updateLevels() {
      var iLevel = $scope.character.curLevel - 1;
      // Only recalculate the current level and levels above it
      for (var i = iLevel; i < $scope.character.levels.length; i++) {
        // Copy the object so we don't create a reference
        angular.copy($scope.character.attributeScores, $scope.character.levels[i].attributeScores);
        $scope.character.levels[i].abilitypoints_used = $scope.character.abilitypoints_used;
      }
    };

    // Apply the level of choice to character's object variables,
    this.updateCharacterFromLevels = function updateCharacterFromLevels() {
      var iLevel = $scope.character.curLevel - 1;
      $scope.character.fortsaves = $scope.character.levels[iLevel].fortsaves;
      $scope.character.refsaves = $scope.character.levels[iLevel].refsaves;
      $scope.character.willsaves = $scope.character.levels[iLevel].willsaves;

      $scope.character.BAB = $scope.character.levels[iLevel].BAB;

      $scope.character.abilitypoints_total =
            $scope.character.levels[iLevel].abilitypoints_total;
      $scope.character.freefeats_total =
            $scope.character.levels[iLevel].freefeats_total;
      $scope.character.skillranks_total =
            $scope.character.levels[iLevel].skillranks_total;
      $scope.character.skillranks = $scope.character.levels[iLevel].skillranks;
      $scope.character.skillranks_used = $scope.character.levels[iLevel].skillranks_used;

      $scope.character.hp = $scope.character.levels[iLevel].hp;

      // Ability scores and the related
      $scope.character.abilitypoints_used = $scope.character.levels[iLevel].abilitypoints_used;
      angular.copy($scope.character.levels[iLevel].attributeScores, $scope.character.attributeScores);
    };

    this.addAbilityPoints = function addAbilityPoints(pAbilityName) {
      for (var i = 0; i < $scope.character.levels.length; i++) {
        console.log($scope.character.levels[i].attributeScores);
      }
      $scope.character.attributeScores[pAbilityName] ++;
      $scope.character.abilitypoints_used ++;
      $scope.character.updateLevels();
      for (var i = 0; i < $scope.character.levels.length; i++) {
        console.log($scope.character.levels[i].attributeScores);
      }
    }
    this.skill_up = function skill_up(skill_name) {
      var l = $scope.character.curLevel - 1;

      $scope.character.levels[l].skillranks[skill_name] ++;
      $scope.character.levels[l].skillranks_used ++;
      $scope.character.updateLevels();
    }
  }]);
