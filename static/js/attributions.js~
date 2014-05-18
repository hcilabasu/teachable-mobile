//Added by Abha to show incorrect message
var plotpoint;
var sign;
var flip;
var offbyone;
var counter = 0;
//Function to get message arrays from index.html
function sendarray(plotpointparam, signparam, flipparam, offbyoneparam )
{ plotpoint = plotpointparam;
  sign = signparam;
  flip = flipparam;
  offbyone = offbyoneparam; 
}

var Attributions = function() {
	var PROBLEMS = {};

	var rotate = function(array, positions){
		return array.concat(array.splice(0,positions+1));
	}

	/*
	 Acknowledgment messages. Each string corresponds to a file name. 
	 */
	var acks = ["ok", "cool", "allright", "soundsgood", "thanks"];

	/*
	 @param file: file that will be played
	 @param emotion (optional): emotion to displayed
	 @param message (optional): message to be displayed together with the audio
	 @param delay: delay before the message is played 
	 */
	var speak = function(file, emotion, message, delay, removeExtension){
		if(emotion){
			$("body").removeClass().addClass(emotion);
		}
		// format audio file location string
		audioFile = "/mobileinterface/static/audio/" + file;
		// checks if the original extension should be removed
		if(removeExtension === true){
			audioFileLength = audioFile.length - 5;
			audioFile = audioFile.substring(0, audioFileLength) + ".mp3";
		}
		//load sound
		AUDIO.setFile("attributionSound", audioFile);
		AUDIO.loadSound("attributionSound");
		// Attach handlers
		AUDIO.addStartListener("attributionSound", function(){
			// When robot starts to speak
			$("body").addClass("talking");
			// Display the message if there is one
			if(message !== undefined){
				$("#speech").text(message).fadeIn('slow');
			}
			// Remove listener
			this.removeEventListener('play', arguments.callee, false);
		});
		AUDIO.addFinishListener("attributionSound", function(){
			// When robot finishes speaking
			$("body").removeClass("talking");
			// Remove listener
			this.removeEventListener('ended', arguments.callee, false);
		});
		// play sound
		window.setTimeout(function(){
			AUDIO.play("attributionSound");
		}, delay);
	};

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
		if(attributionFinished == true && cognitivePromptFinished == true)
		{

			console.log("Playing attribution message......." + attr.number);
			if(attr.number != "540")
			{
				if(attr.emotion == "sad" || attr.emotion == "sadder" && attr.error == "PlotPoint")
				{
				   if(counter == plotpoint.length)
				   {
				      counter = 0;
				   }
				   var soundfile = "plotpoint" +counter+".aiff";
				   speak(// Make robot speak
					soundfile.sound_file,
					attr.emotion,
					plotpoint[counter].text,
					2500,
					true
				        ); counter++; 
				}
				else if(attr.emotion == "sad" || attr.emotion == "sadder" && attr.error == "Sign")
				{
				   if(counter == sign.length)
				   {
				      counter = 0;
				   }
				   var soundfile = "sign" +counter+".aiff";
				   speak(// Make robot speak
					soundfile.sound_file,
					attr.emotion,
					sign[counter].text,
					2500,
					true
				        ); counter++; 
				}
				else if(attr.emotion == "sad" || attr.emotion == "sadder" && attr.error == "Flip")
				{
				   if(counter == flip.length)
				   {
				      counter = 0;
				   }
				   var soundfile = "flip" +counter+".aiff";
				   speak(// Make robot speak
					soundfile.sound_file,
					attr.emotion,
					flip[counter].text,
					2500,
					true
				        ); counter++; 
				}
				else if(attr.emotion == "sad" || attr.emotion == "sadder" && attr.error == "Offbyone")
				{
				   if(counter == offbyone.length)
				   {
				      counter = 0;
				   }
				   var soundfile = "offbyone" +counter+".aiff";
				   speak(// Make robot speak
					soundfile.sound_file,
					attr.emotion,
					offbyone[counter].text,
					2500,
					true
				        ); counter++; 
				}
				else { // Make robot speak
				speak(
					attr.file,
					attr.emotion,
					attr.message,
					2500,
					true
				); }

				var datum;
				$.ajax({url : REQUEST_DATA_FROM_MOBILE,
					success: function(datum) {console.dir("DATA FROM MOBILE!!!" + datum);
												var tmpArray = datum.split('@@@', 2);
												current_problem_object = JSON.parse(tmpArray[0]);
												current_problem_object["problemNumber"] = Number(tmpArray[1]) + 1;
												},
					async : false});

				log("", {"type":"attribution","parameter":attr.message, "initial" : "", "final" : "", 
				"problem number" : current_problem_object.problemNumber, "problem desc" : current_problem_object.text, "problem id" : current_problem_object.id});
			}
			else
			{
				// Making robot speak
				speak(
					"trainingAttr",
					attr.emotion,
					"Cool! You worked hard learning how to use TAG.",
					2500,
					true 					
				);

				var datum;
				$.ajax({url : REQUEST_DATA_FROM_MOBILE,
					success: function(datum) {console.dir("DATA FROM MOBILE!!!" + datum);
												var tmpArray = datum.split('@@@', 2);
												current_problem_object = JSON.parse(tmpArray[0]);
												current_problem_object["problemNumber"] = Number(tmpArray[1]) + 1;
												},
					async : false});

				log("", {"type":"attribution","parameter":"Cool! You worked hard learning how to use TAG.", "initial" : "", "final" : "", 
				"problem number" : current_problem_object.problemNumber, "problem desc" : current_problem_object.text, "problem id" : current_problem_object.id});
			}
		}
	}

	var makeAck = function(){
		// Selecting ack message
		var ack = acks[Math.floor(Math.random() * acks.length)] + ".mp3";
		// Making robot speak
		speak(
			ack,
			undefined,
			undefined,
			0,
			false
		);
	};

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
		makeAttribution : makeAttribution,
		makeAck : makeAck
	}
}

var attributions = Attributions();
