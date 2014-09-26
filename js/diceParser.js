angular.module('diceParser', [])
	.factory('diceParser', function(){
		var roll = function (notation) {
			var regex = /(\d+)d(\d*)\*?(\d+)?\+?(\d+)?/;
			var splitted = notation.match(regex);
			// first item in res array is the full match; the rest are the parenthesized elements
			// if an element doesn't exist, it'll be a null element in the array
			var diceAmount = parseInt(splitted[1]);
			var diceValue = parseInt(splitted[2]);
			var multiplier = parseInt(splitted[3]);
			var addition = parseInt(splitted[4]);
			
			var result = 0;
			for (var i=0; i<diceAmount; i++ )
			{
				result += Math.floor(Math.random() * diceValue ) + 1;
			}
			if(multiplier) result *= multiplier;
			if(addition) result += addition;
			return result;
		};
		
		return {
			roll: roll,
		};
});