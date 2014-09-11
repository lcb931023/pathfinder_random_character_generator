// main
var testVar;

$( document ).ready(function() {
  
  $('#btn_generate').click(function (event) {
    event.preventDefault();
    console.log("blablabal");
    // generate and change DOM
    generateChar();
  });
  
});

function generateChar() {
  $.getJSON("./json/races.json", function(json) {
    testVar = json.races; // debugging
    console.log(testVar);
    // [TODO] make these attributes into a "character" object that carries them.
    var pRace = json.races[Math.floor(Math.random() * json.races.length)];
    
    $('#data-race').html(pRace.name);
    
  });
}

//race 
//class
//ability
  //HP, armor class, and the six attrs
//skills
//feets