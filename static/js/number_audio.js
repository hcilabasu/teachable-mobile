var NumberAudio = function(){

	/*
	 @param file: file that will be played
	 @param emotion (optional): emotion to displayed
	 @param message (optional): message to be displayed together with the audio
	 @param delay: delay before the message is played 
	 */
	var speak = function(file, coordinate){

		// Adjust file name
		if(file[0] === "-") // This condition is important to avoid replacing - on the coordinates
			file = file.replace("-", "Neg");

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

				if(localCoordinate !== undefined){
					var coordFile = ("positions/coord" + localCoordinate.x) + localCoordinate.y;
					speak(coordFile);
				}
			});
		}());
		// Play audo
		AUDIO.play("attributionSound");
	};

	var sayNumber = function(number, coordinate){
		speak(number, coordinate);
	};

	var sayCoordinate = function(coordinate){
		alert("Coordinate" + coordinate);
	};

	return {
		sayNumber : sayNumber,
		sayCoordinate : sayCoordinate
	};

}

var number_audio = NumberAudio();