var Attributions = function(){

	var attributions = ['i','you','we'];
	var emotions = {
		'desirable' : {
			'success' : attributions.slice(0),
			'failure' : attributions.slice(0)
		},	
		'undesirable' : {
			'success' : attributions.slice(0),
			'failure' : attributions.slice(0)
		}
	};

	var rotate = function(array, positions){
		return array.concat(array.splice(0,positions+1));
	}

	var makeAttribution = function(attr){
		var dimensions = emotions[attr.des_attribution][attr.outcome]
		var finalAttribution = attr.des_attribution + '_' + attr.outcome + '_' + dimensions[0];
		// Rotating reactions
		emotions[attr.des_attribution][attr.outcome] = rotate(dimensions, 1);
		// load sound
		AUDIO.loadSound(finalAttribution);
		// Attach handler
		AUDIO.addFinishListener(finalAttribution, function(){
			$("body").removeClass("talking");
		});
		AUDIO.addStartListener(finalAttribution, function(){
			$("body").addClass("talking");
		});
		// play sound
		AUDIO.play(finalAttribution);
	}

	return {
		makeAttribution : makeAttribution
	}
}

var attributions = Attributions();