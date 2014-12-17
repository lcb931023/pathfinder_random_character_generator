// Dear future developer, sorry for style inconsistency
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
        var ina=false;
        for(var i=0;i<list.length;i++)
        {
            if(list[i]===target){ina=true;}
        }
        return ina;
    }
		// HELPER
    // Inclusive min, exclusive max
		var randomInt = function(min, max){
			return Math.floor(Math.random() * (max - min) ) + min;
		};
    var compareNumbers = function compareNumbers(a,b) {
      return a - b;
    };

    this.generate = function generate($http) {

      this.curLevel = Math.floor(Math.random() * 20 ) + 1;


      // Data independent data
      this.gender = (Math.random() > 0.5) ? "male" : "female";

      // From Races
      this.race = raceJson.races[randomInt(0, raceJson.races.length)];
      this.name = this.race.names[this.gender][randomInt(0, this.race.names[this.gender].length)];
      this.height = this.race.height[this.gender + "base"] +
                    diceParser.roll(this.race.height[this.gender + "mod"]);
      this.weight = this.race.weight[this.gender + "base"] +
                    diceParser.roll(this.race.weight[this.gender + "mod"]);
      this.ability_racialMods =
      {
        "str":0, "dex":0, "con":0, "int":0, "wis":0, "cha":0,
      };
      var pAbility = this.race.ability;
      // Assign mods from json to attributes of ability_racialMods
        // ugh vocabulary
      for(var i = 0; i < pAbility.length; i++){
        var tKey = Object.keys(pAbility[i]);
        this.ability_racialMods[tKey] = pAbility[i][tKey];
      }

      // From Classes
      this.class = classJson.Classes[randomInt(0, classJson.Classes.length)];
      this.shared = sharedJson;

      this.alignment = this.class.alignments[randomInt(0, this.class.alignments.length)];

      // Abilities
      var scores = [diceParser.roll("3d6"), diceParser.roll("3d6"), 
                    diceParser.roll("3d6"), diceParser.roll("3d6"), 
                    diceParser.roll("3d6"), diceParser.roll("3d6")];
      scores = scores.sort(compareNumbers);

      this.abilityScores = {};
      this.abilityScores.str = -1;
      this.abilityScores.dex = -1;
      this.abilityScores.con = -1;
      this.abilityScores.int = -1;
      this.abilityScores.wis = -1;
      this.abilityScores.cha = -1;

      var archetype = this.class.archetypes_list[
                      randomInt(0, this.class.archetypes_list.length)];   
 
      //fill in the archetype specified ones first
      for (key in this.class.archetypes[archetype])
        this.abilityScores[
            this.class.archetypes[archetype][key]] = scores.pop();

      while (scores.length > 0)//get the remaining ones
      {
        var ability = this.shared.abilities[
randomInt(0, this.shared.abilities.length)].key;
        if (this.abilityScores[ability] == -1)
          this.abilityScores[ability] = scores.pop();
      }

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
    this.abilityMods = function abilityMods() {
      return {"str": Math.floor((this.abilityScores.str+
                            this.ability_racialMods.str-10)/2), 
              "dex": Math.floor((this.abilityScores.dex+
                            this.ability_racialMods.dex-10)/2), 
              "con": Math.floor((this.abilityScores.con+
                            this.ability_racialMods.con-10)/2), 
              "int": Math.floor((this.abilityScores.int+
                            this.ability_racialMods.int-10)/2), 
              "wis": Math.floor((this.abilityScores.wis+
                            this.ability_racialMods.wis-10)/2), 
              "cha": Math.floor((this.abilityScores.cha+
                            this.ability_racialMods.cha-10)/2)};
      console.log()
    }
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
        tLevel.abilityScores = {};
        angular.copy(this.abilityScores, tLevel.abilityScores);
        //free feats
        tLevel.freefeats_total = Math.floor((i+2)/2);//todo:fighter
        for (var trait in this.traits)
          if (this.traits[trait].name == "Bonus Feat")
            tLevel.freefeats_total += 1;

        //skill ranks
        tLevel.skillRanks = angular.copy(this.skillRanks);
        tLevel.skillRanks_total =
                  i*(this.class.skillrank+this.abilityMods().int);
        tLevel.skillRanks_used = 0;

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

    // Fires everytime the Levels after curLevel needs recalculate
    this.updateLevels = function updateLevels(callback) {
      var iLevel = $scope.character.curLevel - 1;
      // Only recalculate the current level and levels above it
      for (var i = iLevel; i < $scope.character.levels.length; i++) {
        callback(i);
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
      $scope.character.skillRanks_total =
            $scope.character.levels[iLevel].skillRanks_total;
      $scope.character.skillRanks = angular.copy($scope.character.levels[iLevel].skillRanks);
      $scope.character.skillRanks_used = $scope.character.levels[iLevel].skillRanks_used;
      $scope.character.skillranks_max = $scope.character.levels[iLevel].skillranks_max;

      $scope.character.hp = $scope.character.levels[iLevel].hp;

      // Ability scores and the related
      $scope.character.abilitypoints_used = $scope.character.levels[iLevel].abilitypoints_used;
      $scope.character.abilityScores = angular.copy($scope.character.levels[iLevel].abilityScores);
    };

    this.addAbilityPoints = function addAbilityPoints(pAbilityName) {
      $scope.character.updateLevels(function(i){
        $scope.character.levels[i].abilityScores[pAbilityName] ++;
        $scope.character.levels[i].abilitypoints_used ++;
      });
      $scope.character.updateCharacterFromLevels();
    }
    this.skill_up = function skill_up(skill_name) {
      $scope.character.updateLevels(function(i){
          $scope.character.levels[i].skillRanks[skill_name] ++;
          $scope.character.levels[i].skillRanks_used ++;

          if (!$scope.character.classSkills[skill_name])
              $scope.character.levels[i].skillRanks_used ++;
      });
      $scope.character.updateCharacterFromLevels();
    }
  }]);
