var NumberAudio = function(){

	/*
	 @param file: file that will be played
	 @param emotion (optional): emotion to displayed
	 @param message (optional): message to be displayed together with the audio
	 @param delay: delay before the message is played 
	 */
	var speak = function(file){

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

		AUDIO.addFinishListener("attributionSound", function(){
			// When robot finishes speaking
			$("body").removeClass("talking");
			// Remove listener
			this.removeEventListener('ended', arguments.callee, false);
		});
		// Play audo
		AUDIO.play("attributionSound");
	};

	var sayNumber = function(number){
		speak(number);
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