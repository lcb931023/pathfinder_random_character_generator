// main
var testVar;

$(document).ready(function() {
  
  $('#btn_generate').click(function (event) {
    event.preventDefault();
    console.log("Character Generated!");
    // generate and change DOM
    generateChar();
  });
  
});

function generateChar() {
  $.getJSON("./json/races.json", function(json) {
    testVar = json.races; // debugging
    console.log(testVar);
    // [TODO] Reorganize these attributes into a "character" object that carries them.
    // Race
    var pRace = json.races[Math.floor(Math.random() * json.races.length)];
    $('#data-race').html(pRace.name);
    // Rolled Attributes
    // [TODO] Use info from class.json to replace placeholder randoms
    $('#data-str-score').html(Math.floor(Math.random() * 10) + 10);
    $('#data-dex-score').html(Math.floor(Math.random() * 10) + 10);
    $('#data-con-score').html(Math.floor(Math.random() * 10) + 10);
    $('#data-int-score').html(Math.floor(Math.random() * 10) + 10);
    $('#data-wis-score').html(Math.floor(Math.random() * 10) + 10);
    $('#data-cha-score').html(Math.floor(Math.random() * 10) + 10);
    // Mod Attributes
    var attributeMods = 
        {
          "str":0,
          "dex":0,
          "con":0,
          "int":0,
          "wis":0,
          "cha":0,
        };
    var pAbility = pRace.ability;
    // Assign mods from json to attributes of attributeMods
      // ugh vocabulary
    for(var i = 0; i < pAbility.length; i++){
      var tKey = Object.keys(pAbility[i]);
      attributeMods[tKey] = pAbility[i][tKey];
    }
    
    $('#data-str-mod').html(attributeMods.str);
    $('#data-dex-mod').html(attributeMods.dex);
    $('#data-con-mod').html(attributeMods.con);
    $('#data-int-mod').html(attributeMods.int);
    $('#data-wis-mod').html(attributeMods.wis);
    $('#data-cha-mod').html(attributeMods.cha);
  });
}

//race 
//class
//ability
  //HP, armor class, and the six attrs
//skills
//feets