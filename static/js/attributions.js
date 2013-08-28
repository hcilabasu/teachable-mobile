var Attributions = function(){

	var emotions = {
		'desirable' : {
			'success' : [{'dim':'i','attr':'pride'},{'dim':'you','attr':'gratitude'},{'dim':'we','attr':'pride'}], // Ability
			'failure' : [{'dim':'i','attr':'guilt'},{'dim':'you','attr':'frustration'},{'dim':'we','attr':'guilt'}] //  Effort
		},	
		'undesirable' : {
			'success' : [{'dim':'i','attr':'pride'},{'dim':'you','attr':'gratitude'},{'dim':'we','attr':'pride'}], // Effort, luck
			'failure' : [{'dim':'i','attr':'shame'},{'dim':'you','attr':'pity'},{'dim':'we','attr':'shame'}] // Lack of ability
		}
	};

	var rotate = function(array, positions){
		return array.concat(array.splice(0,positions+1));
	}

	var makeAttribution = function(attr){
		var dimensions = emotions[attr.des_attribution][attr.outcome]
		var finalAttribution = attr.des_attribution + '_' + attr.outcome + '_' + dimensions[0].dim;
		// Set facial expression
		$("body").removeClass().addClass(dimensions[0].attr);
		// Rotating reactions
		emotions[attr.des_attribution][attr.outcome] = rotate(dimensions, 1);
		// load sound
		AUDIO.loadSound(finalAttribution);
		// Attach handlers
		AUDIO.addStartListener(finalAttribution, function(){
			// When robot starts to speak
			$("body").addClass("talking");
		});
		AUDIO.addFinishListener(finalAttribution, function(){
			// When robot finishes speaking
			$("body").removeClass("talking");
			window.setTimeout(function(){
				$("body").removeClass().addClass("neutral");
			}, 3000);
		});
		// play sound
		AUDIO.play(finalAttribution);
	}

	return {
		makeAttribution : makeAttribution
	}
}

var attributions = Attributions();