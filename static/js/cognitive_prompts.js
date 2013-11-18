var CognitivePrompts = function(){


	var rotate = function(array, positions){
		return array.concat(array.splice(0,positions+1));
	}

	var makePrompt = function(prompt){
		console.log("lalala");
   		//Adding prompts variable to global variable
        // TEMPORARILY HARDCODING PROMPTS, SHOULD FIX THIS LATER
        var prompts = '[{"problem_num":540, "problem_state":"end", "orientation":"", "text":"In (4, 0), does the 4 tell me which way to move on the x-axis or on the y-axis?", "sound_file":"1.aiff"}, {"problem_num":540, "problem_state":"end", "orientation":"","text":"Neat! Now I know that the first number tells me to go east or west!", "sound_file":"2.aiff"}]';
        prompts = prompts.replace(/&#x27;/g, "'");
        prompts = JSON.parse(prompts);
        //,"I have a question. Is the x-axis the one that runs from the ast side of thcartesian plane to the west side of the cartesian plane?", "Oh, so right now I\'m facing east on the x-axis!", "I can\'t remember which way the y-axis goes! Do you? Can you point in the directions that I can move on the y-axis?", "Cool! I learned that the y-axis runs vertically across the cartesian plane!","I\'m trying to remember where all the x\'s are positive. Is it to the left or the right of the origin?", "Hmmm our x coordinate is 1. Does this mean we should move east or west?", "Where are the y\'s all positive? Is it below or above the origin?", "I forgot where the y\'s are all positive! Can you show me?","Hmmm our x coordinate is -2. Does this mean we should move east or west?", "If we walk south to the bottom of the cartesian plane, are the y\'s positive or negative?", " Where are the y\'s all negative? I have a feeling it is either below or above the origin...", "I forgot where the x\'s are all negative! Can you show me?", "Which number is they-coordinate, 0 or 2?", "Neat! Now I know that the second number tells me to go north or south!", "Hey can you show me where 2 is on the y-axis again?","I have a question. Is the y-axis the one that runs fro the north side of the cartesian plane to the south side of the cartesian plane?", "Oh, so right now I\'m facing north on the y-axis!", "I can\'t remember which way the x-axis goes! Do you? Can you point in the directions that I can move on the x-axis?", "Cool! I learned that the x-axis runs horizontally across the cartesian plane!","I\'m trying to remember where all the x\'s are positive. Is it to the left or the right or the origin?", "Hmmm our x coordinate is 2. Does this mean we should move east or west?", "If we walk south to the bottom of the cartesian plane, are the y\'s positive or negative?", "Where are the y\'s all negative? I have a feeling it is either below or above the origin...","Hmmm our x coordinate is -3. Does this mean we should move east or west?", "Where are the x\'s all positive? Is it below or above the origin?", "I forgot where the x\'s are all negative! Can you show me?"}]';

        console.log(prompts[currentPromptIndex].problem_num);
        console.log(prompt.number);
		if(prompts[currentPromptIndex].problem_num == prompt.number)
		{
		  //next prompt is associated with this problem
		  if(prompts[currentPromptIndex].problem_state == prompt.state)
		  {
		    //and is associated with the end of the problem, so we trigger cognitive prompt
		    // Set facial expression
			$("body").removeClass().addClass(prompt.emotion);
			// load sound
			AUDIO.setFile("promptSound", "/mobileinterface/static/audio/" + prompt.file);
			AUDIO.loadSound("promptSound");
			// Attach handlers
			AUDIO.addStartListener("promptSound", function(){
				// When robot starts to speak
				$("body").addClass("talking");
				$("#speech").text(APP.PROMPTS[APP.currentPromptIndex].text).fadeIn('slow');
			});
			AUDIO.addFinishListener("promptSound", function(){
				// When robot finishes speaking
				$("body").removeClass("talking");
				var time = Math.floor((Math.random()*5)+5)*1000;
				window.setTimeout(function(){
					$("body").removeClass().addClass("neutral");
					$("#speech").fadeOut('slow');
				}, time);
			});
			// play sound
			window.setTimeout(function(){
				AUDIO.play("promptSound");
			}, 6000);

			//increment prompt counter
			currentPromptIndex = currentPromptIndex + 1;

			}	
		}
	}

	return {
		makePrompt : makePrompt
	}
}

var cognitive_prompts = CognitivePrompts();