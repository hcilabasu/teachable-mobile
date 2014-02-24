var CognitivePrompts = function(){


	var rotate = function(array, positions){
		return array.concat(array.splice(0,positions+1));
	}

	var doPromptAction = function(name, info, condition)
	{
		if(name == "skipPrompts")
		{
			skipPrompts(info)
		}
		else if(name == "makePrompt")
		{
			makePrompt(info,condition)
		}
		else if(name == "hidePromptDialog")
		{
			hidePromptDialog()
		}
		else if(name == "timecheck")
		{
			timeprompt(info)
		}
	}
	var timeprompt = function(info)
	{
	   var newtime = new Date().getTime();
	   var newminute = newtime.getMinutes();
	   if (newminute - firstminute > 2)
	   {
	      displayTriggeredPrompt(prompt);
	   }
	}
	var skipPrompts = function(problem){
		// TEMPORARILY HARDCODING PROMPTS, SHOULD FIX THIS LATER
        var prompts = '[ {"problem_num":540, "problem_state":"end", "orientation":"", "text":"Are you ready to teach me geometry?", "sound_file":"0.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"beg", "orientation":"", "text":"In (4, 0), does the 4 tell me which way to move on the x-axis or on the y-axis?", "sound_file":"1.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"end", "orientation":"","text":"Neat! Now I know that the first number tells me to go left or right on the x-axis!", "sound_file":"2.aiff", "another_prompt":"true"}, {"problem_num":541, "problem_state":"end", "orientation":"", "text":"Hey can you show me where 4 is on the x-axis again?", "sound_file":"3.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"beg", "orientation":"", "text":"I have a question. Is the x-axis the one that runs left to right?", "sound_file":"4.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"mid", "orientation":"180", "text":"I turned so now I\'m facing left on the x-axis!", "sound_file":"5.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"I can\'t remember which way the y-axis goes! Do you? Can you walk along the y-axis for me?", "sound_file":"6.aiff", "another_prompt":"true"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"Cool! I learned that the y-axis runs from top to bottom across the cartesian plane!", "sound_file":"7.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"I’m trying to remember where all the x’s are positive. Is it to the left or the right of the y-axis?", "sound_file":"8.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"Hmmm our x coordinate is 1. Does this mean we should move left or right along the x-axis?", "sound_file":"9.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"Where are the y’s all positive? Is it below or above the x-axis?", "sound_file":"10.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"I forgot something... Can you walk around the area where the y’s are all positive?", "sound_file":"11.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"beg", "orientation":"", "text":"coordinate is -2. Does this mean we should move left or right along the x-axis?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"I have a feeling the y\'s are all negative below the x-axis…", "sound_file":"12.aiff", "another_prompt":"true"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"If we walk to the bottom edge of the cartesian plane, are the y’s positive or negative?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"end", "orientation":"", "text":"I forgot where the x’s are all negative! Can you show me?", "sound_file":"12.aiff", "another_prompt":"false"}]';
        prompts = prompts.replace(/&#x27;/g, "'");
        prompts = JSON.parse(prompts);

        if(problem.number == -1)
        {
        	//simply refreshing current problem, skip back beginning prompt?
        }
        else
        {
        	//changing problem number, update prompt index accordingly
	        localProblemIndex = problem.number + 540;
			currentPromptIndex = 0;
			while(prompts[currentPromptIndex].problem_num < localProblemIndex)
			{
				currentPromptIndex = currentPromptIndex + 1;
			}
		}
	}

	var makePrompt = function(prompt, condition){
		// TEMPORARILY HARDCODING PROMPTS, SHOULD FIX THIS LATER
        var prompts = '[ {"problem_num":540, "problem_state":"end", "orientation":"", "text":"Are you ready to teach me geometry?", "sound_file":"0.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"beg", "orientation":"", "text":"In (4, 0), does the 4 tell me which way to move on the x-axis or on the y-axis?", "sound_file":"1.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"end", "orientation":"","text":"Neat! Now I know that the first number tells me to go left or right on the x-axis!", "sound_file":"2.aiff", "another_prompt":"true"}, {"problem_num":541, "problem_state":"end", "orientation":"", "text":"Hey can you show me where 4 is on the x-axis again?", "sound_file":"3.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"beg", "orientation":"", "text":"I have a question. Is the x-axis the one that runs left to right?", "sound_file":"4.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"mid", "orientation":"180", "text":"I turned so now I\'m facing left on the x-axis!", "sound_file":"5.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"I can\'t remember which way the y-axis goes! Do you? Can you walk along the y-axis for me?", "sound_file":"6.aiff", "another_prompt":"true"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"Cool! I learned that the y-axis runs from top to bottom across the cartesian plane!", "sound_file":"7.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"I’m trying to remember where all the x’s are positive. Is it to the left or the right of the y-axis?", "sound_file":"8.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"Hmmm our x coordinate is 1. Does this mean we should move left or right along the x-axis?", "sound_file":"9.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"Where are the y’s all positive? Is it below or above the x-axis?", "sound_file":"10.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"I forgot something... Can you walk around the area where the y’s are all positive?", "sound_file":"11.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"beg", "orientation":"", "text":"coordinate is -2. Does this mean we should move left or right along the x-axis?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"I have a feeling the y\'s are all negative below the x-axis…", "sound_file":"12.aiff", "another_prompt":"true"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"If we walk to the bottom edge of the cartesian plane, are the y’s positive or negative?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"end", "orientation":"", "text":"I forgot where the x’s are all negative! Can you show me?", "sound_file":"12.aiff", "another_prompt":"false"}]';
        prompts = prompts.replace(/&#x27;/g, "'");
        prompts = JSON.parse(prompts);
        var trigger = true;
        promptsFinished = false;

        //if we just transitioned from problem state "end" to problem state "beg", increment  
        //mobile problem number index
        if(prompt.state == "beg")
        {
        	//sometimes we will encounter consecutive prompts with problem state "beg"
        	if(!begLast)
        	{
        		localProblemIndex = localProblemIndex + 1;
        		begLast = true;

        		//delay next prompt to allow time for robot rese
        		//window.setTimeout(function(){
  				//checkForSecondPrompt(solutionStatus, "end", problemNumber);
  				//}, 17000);
        	}
        }
        else
        {
        	begLast = false;
        }

        //check trigger criteria
        if(prompt.trigger == "hit")
        {
        	console.log("1");
			if(prompts[currentPromptIndex].problem_num == localProblemIndex)//prompt.number)
			{	
			    //next prompt is associated with this problem
			    if(prompts[currentPromptIndex].problem_state == prompt.state || (prompts[currentPromptIndex].problem_state == "mid" && prompt.state == "end"))
			    {
			    	console.log("2");
				    // and is associated with current problem state OR the student's procedure skipped mid-problem prompt triggers
				    // so check for special mid-problem case
				    if(prompt.state == "mid")
				    {
				    	if(prompts[currentPromptIndex].orientation != prompt.angle)
				    	{
				    		trigger = false;
				    	}

				    }
				    else if(prompt.state == "end")
				    {
				    	//skip mid-problem prompts in the case student did not trigger them
				    	while(prompts[currentPromptIndex].problem_state == "mid")
				    	{
				    		currentPromptIndex = currentPromptIndex +1;
				    	}
				    }


				    if(trigger)
				    {
				    	console.log("3");
					    displayTriggeredPrompt(prompt, condition);
					}
				}	
			}
		}
	}

	var hidePromptDialog = function() {
		var incremented = false;

		//REMOVE THE PROMPTS
		$("body").removeClass().addClass("neutral");
		$("#speech").fadeOut('slow');
		$("#record").fadeOut('slow', function(){
			// removing dismiss class only after done fading
			$("#record").removeClass('dismiss');
		});

		//increment prompt counter (IMPROVE LATER, WORKS BUT IT'S WEIRD)
		if(!incremented)
		{
			currentPromptIndex = currentPromptIndex + 1;
			//incremented = true;
		}

		if(!promptsFinished && prompts[currentPromptIndex-1].another_prompt == "true")
		{
			displayTriggeredPrompt(prompt);
			promptsFinished = true;
		}
	}

	var displayTriggeredPrompt = function(prompt, condition) {
		// TEMPORARILY HARDCODING PROMPTS, SHOULD FIX THIS LATER
        var prompts = '[ {"problem_num":540, "problem_state":"end", "orientation":"", "text":"Are you ready to teach me geometry?", "sound_file":"0.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"beg", "orientation":"", "text":"In (4, 0), does the 4 tell me which way to move on the x-axis or on the y-axis?", "sound_file":"1.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"end", "orientation":"","text":"Neat! Now I know that the first number tells me to go left or right on the x-axis!", "sound_file":"2.aiff", "another_prompt":"true"}, {"problem_num":541, "problem_state":"end", "orientation":"", "text":"Hey can you show me where 4 is on the x-axis again?", "sound_file":"3.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"beg", "orientation":"", "text":"I have a question. Is the x-axis the one that runs left to right?", "sound_file":"4.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"mid", "orientation":"180", "text":"I turned so now I\'m facing left on the x-axis!", "sound_file":"5.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"I can\'t remember which way the y-axis goes! Do you? Can you walk along the y-axis for me?", "sound_file":"6.aiff", "another_prompt":"true"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"Cool! I learned that the y-axis runs from top to bottom across the cartesian plane!", "sound_file":"7.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"I’m trying to remember where all the x’s are positive. Is it to the left or the right of the y-axis?", "sound_file":"8.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"Hmmm our x coordinate is 1. Does this mean we should move left or right along the x-axis?", "sound_file":"9.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"Where are the y’s all positive? Is it below or above the x-axis?", "sound_file":"10.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"I forgot something... Can you walk around the area where the y’s are all positive?", "sound_file":"11.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"beg", "orientation":"", "text":"coordinate is -2. Does this mean we should move left or right along the x-axis?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"I have a feeling the y\'s are all negative below the x-axis…", "sound_file":"12.aiff", "another_prompt":"true"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"If we walk to the bottom edge of the cartesian plane, are the y’s positive or negative?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"end", "orientation":"", "text":"I forgot where the x’s are all negative! Can you show me?", "sound_file":"12.aiff", "another_prompt":"false"}]';
        prompts = prompts.replace(/&#x27;/g, "'");
        prompts = JSON.parse(prompts);
	var firsttime = new Date().getTime();
        var firstminute = firsttime.getMinutes();
        var incremented = false;
        recordClickCount = 0;
		// Set facial expression
		$("body").removeClass().addClass(prompt.emotion);
		// load sound
		console.log("/mobileinterface/static/audio/" + prompts[currentPromptIndex].sound_file);
		AUDIO.setFile("promptSound", "/mobileinterface/static/audio/" + prompts[currentPromptIndex].sound_file);
		AUDIO.loadSound("promptSound");
		// Attach handlers
		console.log(condition);
		AUDIO.addStartListener("promptSound", function(){
			// When robot starts to speak
			$("body").addClass("talking");
			$("#speech").text(prompts[currentPromptIndex].text).fadeIn('slow');
			log("", {"type":"prompt","parameter":prompts[currentPromptIndex].text, "initial" : "", "final" : ""});

			if(condition !== "Mobile")
			{
				console.log("a")
				$("#record").text('REC');
				$("#record").fadeIn('slow');
				$("#record").off('click');
				$("#record").click(function() {

					//increment click count
									         					recordClickCount = recordClickCount + 1;

					if(recordClickCount == 1) 
					{
						//on first click, add border to show Quinn is "recording"
						// $("#record").css("background-image","url(../images/stop.png)");
						$("#record").addClass('stop');
						$("#record").text('STOP');
					}
					if(recordClickCount == 2) 
					{
						//on second click, remove border to show Quinn is NOT "recording"
						//$("#record").css({"outline":"#FF0000 dotted"});								
						//change to dismiss button
						$("#record").removeClass('stop').addClass('dismiss');
						$("#record").text('DONE');

					}
					if(recordClickCount >= 3)
					{
						//on third click, reset and remove prompts
						recordClickCount = 0;
						//REMOVE THE PROMPTS
						$("body").removeClass().addClass("neutral");
						$("#speech").fadeOut('slow');
						$("#record").fadeOut('slow', function(){
							// removing dismiss class only after done fading
							$("#record").removeClass('dismiss');
						});

						//increment prompt counter (IMPROVE LATER, WORKS BUT IT'S WEIRD)
						if(!incremented)
						{
							currentPromptIndex = currentPromptIndex + 1;
							//incremented = true;
						}

						//check for second prompt at current state
						if(!promptsFinished && prompts[currentPromptIndex-1].another_prompt == "true")
						{
							$("#record").off('click');
							displayTriggeredPrompt(prompt);
							promptsFinished = true;
						}
						$("#record").off('click');
					}
				});
			}
			else
			{
				console.log("b");
				$("#record").addClass('dismiss');
				$("#record").text('Done');
				$("#record").fadeIn('slow');
				$("#record").off('click');
				console.log("c");
				$("#record").click(function() {
					console.log("d");
					$("body").removeClass().addClass("neutral");
					$("#speech").fadeOut('slow');
					$("#record").fadeOut('slow', function(){
						// removing dismiss class only after done fading
						$("#record").removeClass('dismiss');
					});

					//increment prompt counter (IMPROVE LATER, WORKS BUT IT'S WEIRD)
					if(!incremented)
					{
						currentPromptIndex = currentPromptIndex + 1;
						//incremented = true;
					}

					//check for second prompt at current state
					if(!promptsFinished && prompts[currentPromptIndex-1].another_prompt == "true")
					{
						$("#record").off('click');
						displayTriggeredPrompt(prompt);
						promptsFinished = true;
					}
					
					$("#record").off('click');
				});
				
				
			}

		});

		AUDIO.addFinishListener("promptSound", function(){
			// When robot finishes speaking
			$("body").removeClass("talking");
		});
		// play sound
		window.setTimeout(function(){
			AUDIO.play("promptSound");
		}, 3000);

		console.log("prompt: " + currentPromptIndex + ", problem: " + localProblemIndex);

		// TODO separate into a function
		$.ajax({
			url: 'robot/prompt_was_made'
		});
		
	}

	return {
		doPromptAction : doPromptAction
	}
}

var cognitive_prompts = CognitivePrompts();
