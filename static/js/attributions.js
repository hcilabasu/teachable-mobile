var Attributions = function() {
	var PROBLEMS = {};

	var rotate = function(array, positions){
		return array.concat(array.splice(0,positions+1));
	}

	/**************************************************************** 
	* Opens dialogue to display attribution text and plays 
	* audio file associated with current attribution
	****************************************************************/
	var makeAttribution = function(attr) {
		var audioFile; 
		var formattedAudioFile;
		var audioFileLength; 
		//Adrin added the 2 log lines
		// log("In makeAttribution.....");
		// log(JSON.stringify(attr));
		// Set facial expression
		$("body").removeClass().addClass(attr.emotion);
		// format audio file location string
		audioFile = "/mobileinterface/static/audio/" + attr.file;
		audioFileLength = audioFile.length - 5;
		formattedAudioFile = audioFile.substring(0, audioFileLength) + ".mp3";
		//load sound
		AUDIO.setFile("attributionSound", formattedAudioFile);
		AUDIO.loadSound("attributionSound");
		// Attach handlers
		AUDIO.addStartListener("attributionSound", function(){
			// When robot starts to speak
			$("body").addClass("talking");
			$("#speech").text(attr.message).fadeIn('slow');
			
		});
		AUDIO.addFinishListener("attributionSound", function(){
			// When robot finishes speaking
			$("body").removeClass("talking");
			var time = Math.floor((Math.random()*5)+5)*1000;
			window.setTimeout(function(){
				//$("body").removeClass().addClass("neutral");
				//$("#speech").fadeOut('slow');
			}, time);

		});
		// play sound
		window.setTimeout(function(){
			AUDIO.play("attributionSound");
		}, 2500);
	}

	/**************************************************************** 
	* Closes current dialogue displaying prompt text and stops audio
	* file associated with current attribution 
	*****************************************************************/
	/*var hidePromptDialog = function() {
		var incremented = false;

		//REMOVE THE PROMPTS
		$("body").removeClass().addClass("neutral");
		$("#speech").fadeOut('slow');
		});
	}*/

	return {
		makeAttribution : makeAttribution
	}
}

var attributions = Attributions();