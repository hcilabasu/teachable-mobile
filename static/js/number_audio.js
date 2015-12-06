var NumberAudio = function(){

	/*
	 @param file: file that will be played
	 @param emotion (optional): emotion to displayed
	 @param message (optional): message to be displayed together with the audio
	 @param delay: delay before the message is played 
	 */
	var speak = function(type, file, coordinate){

		// Adjust file name
		if(type === "number"){
			// Quinn is supposed to say a number
			if(file[0] === "-") // This condition is important to avoid replacing - on the coordinates
				file = file.replace("-", "Neg");
		} else if(type === "coordinate") {
			// Quinn is supposed to say the verbose coordinate message
			file = ("positions/coord" + coordinate.x) + coordinate.y;
		}
		// format audio file location string
		audioFile = "/mobileinterface/static/audio/numbers/" + file + ".mp3";

		//load sound
		AUDIO.setFile("attributionSound", audioFile);
		AUDIO.loadSound("attributionSound");
		
		// Attach handlers
		AUDIO.addStartListener("attributionSound", function(){
			// When robot starts to speak
			$("body").addClass("talking");
			// Remove listener
			this.removeEventListener('play', arguments.callee, false);
		});

		(function(){
			var localCoordinate = coordinate;

			AUDIO.addFinishListener("attributionSound", function(){
				// When robot finishes speaking
				$("body").removeClass("talking");
				// Remove listener
				this.removeEventListener('ended', arguments.callee, false);
			});
		}());
		// Play audo
		AUDIO.play("attributionSound");
	};

	var sayNumber = function(type, number, coordinate){
		speak(type, number, coordinate);
	};


	return {
		sayNumber : sayNumber
	};

}

var number_audio = NumberAudio();