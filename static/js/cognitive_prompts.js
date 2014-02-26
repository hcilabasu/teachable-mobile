var current_problem_object = {};
var TEST_SESSION_JSON;

//A function to store the session information in a Global Variable!!! That's bad.
function storeTestSessionInformation(data) {
    TEST_SESSION_JSON = JSON.parse(data);
}

var CognitivePrompts = function() {
	var rotate = function(array, positions){
		return array.concat(array.splice(0,positions+1));
	}

	var doPromptAction = function(name, info, condition)
	{
		if(name == "skipPrompts")
		{
			//skipPrompts(info)
		}
		else if(name == "makePrompt")
		{
			//makePrompt(info,condition)
		}
		else if(name == "hidePromptDialog")
		{
			hidePromptDialog()
		}
		else if(name == "timecheck")
		{
			timeprompt(info)
		}
		else if(name == "randomizePrompts")
		{
			randomizePrompts()
		}
	}

	var randomizePrompts = function() {
		//var prompts = [ ["prompt 1", "prompt 2", "prompt 3", "prompt 4", "prompt 5"], ["prompt 11", "prompt 12", "prompt 13", "prompt 14", "prompt 15"], ["prompt 21", "prompt 22", "prompt 23", "prompt 24", "prompt 25"], ["prompt 31", "prompt 32", "prompt 33", "prompt 34", "prompt 35"], ["prompt 41", "prompt 42", "prompt 43", "prompt 44", "prompt 45"] ];
		var num_prompts = prompts[0].length - 1;
		var num_misconceptions = prompts.length - 1;
		var cur_misconception = num_misconceptions;
		var ordered_prompts = new Array();

		console.log("randomizing!");

		//randomize prompt order within each misconception
		while(cur_misconception !== 0)
		{
			prompts[cur_misconception] = shuffle(prompts[cur_misconception]);
			cur_misconception -= 1;
		}

		console.log("still randomizing!");
		//create a prompt order, alternating between each misconception
		var cur_index = 0;
		var cur_prompt = num_prompts;
		cur_misconception = num_misconceptions;
		while(cur_prompt !== 0)
		{
			while(cur_misconception !== 0)
			{
				ordered_prompts[cur_index] = prompts[cur_misconception][cur_prompt];
				console.log(ordered_prompts[cur_index]);
				cur_misconception -= 1;
			}
			cur_misconception = num_misconceptions;
			cur_prompt -= 1;
		}
		console.log("done randomizing");
	}

	var shuffle = function(array) {
		var currentIndex = array.length;
		var tempValue;
		var randomIndex;

		while(0 !== currentIndex)
		{
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			tempValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = tempValue;
		}

		return array;
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

/*
	var skipPrompts = function(problem) {
		// TEMPORARILY HARDCODING PROMPTS, SHOULD FIX THIS LATER
        var prompts = '[ {"problem_num":540, "problem_state":"end", "orientation":"", "text":"Are you ready to teach me geometry?", "sound_file":"0.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"beg", "orientation":"", "text":"In (4, 0), does the 4 tell me to move on the x-axis or on the y-axis?", "sound_file":"1.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"mid", "orientation":"","text":"Come over here and see the point I plotted at x equals 4 and y equals 0.", "sound_file":"2.aiff", "another_prompt":"true"}, {"problem_num":541, "problem_state":"end_correct", "orientation":"", "text":"Neat! Now I know that the first number tells me to go left or right on the x-axis!", "sound_file":"3.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"end_correct", "orientation":"", "text":"Hey can you show me where 4 is on the x-axis again?", "sound_file":"4_correct.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"end_incorrect", "orientation":"", "text":"Hey can you stand where 4 is on the x-axis", "sound_file":"4_incorrect.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"I can\'t remember which way the y-axis goes! Do you? Can you walk along the y-axis for me?", "sound_file":"6.aiff", "another_prompt":"true"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"Cool! I learned that the y-axis runs from top to bottom across the cartesian plane!", "sound_file":"7.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"I’m trying to remember where all the x’s are positive. Is it to the left or the right of the y-axis?", "sound_file":"8.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"Hmmm our x coordinate is 1. Does this mean we should move left or right along the x-axis?", "sound_file":"9.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"Where are the y’s all positive? Is it below or above the x-axis?", "sound_file":"10.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"I forgot something... Can you walk around the area where the y’s are all positive?", "sound_file":"11.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"beg", "orientation":"", "text":"coordinate is -2. Does this mean we should move left or right along the x-axis?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"I have a feeling the y\'s are all negative below the x-axis…", "sound_file":"12.aiff", "another_prompt":"true"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"If we walk to the bottom edge of the cartesian plane, are the y’s positive or negative?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"end", "orientation":"", "text":"I forgot where the x’s are all negative! Can you show me?", "sound_file":"12.aiff", "another_prompt":"false"}]';
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
        var prompts = '[ {"problem_num":540, "problem_state":"end", "orientation":"", "text":"Are you ready to teach me geometry?", "sound_file":"0.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"beg", "orientation":"", "text":"In (4, 0), does the 4 tell me to move on the x-axis or on the y-axis?", "sound_file":"1.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"mid", "orientation":"","text":"Come over here and see the point I plotted at x equals 4 and y equals 0.", "sound_file":"2.aiff", "another_prompt":"true"}, {"problem_num":541, "problem_state":"end_correct", "orientation":"", "text":"Neat! Now I know that the first number tells me to go left or right on the x-axis!", "sound_file":"3.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"end_correct", "orientation":"", "text":"Hey can you show me where 4 is on the x-axis again?", "sound_file":"4_correct.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"end_incorrect", "orientation":"", "text":"Hey can you stand where 4 is on the x-axis", "sound_file":"4_incorrect.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"I can\'t remember which way the y-axis goes! Do you? Can you walk along the y-axis for me?", "sound_file":"6.aiff", "another_prompt":"true"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"Cool! I learned that the y-axis runs from top to bottom across the cartesian plane!", "sound_file":"7.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"I’m trying to remember where all the x’s are positive. Is it to the left or the right of the y-axis?", "sound_file":"8.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"Hmmm our x coordinate is 1. Does this mean we should move left or right along the x-axis?", "sound_file":"9.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"Where are the y’s all positive? Is it below or above the x-axis?", "sound_file":"10.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"I forgot something... Can you walk around the area where the y’s are all positive?", "sound_file":"11.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"beg", "orientation":"", "text":"coordinate is -2. Does this mean we should move left or right along the x-axis?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"I have a feeling the y\'s are all negative below the x-axis…", "sound_file":"12.aiff", "another_prompt":"true"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"If we walk to the bottom edge of the cartesian plane, are the y’s positive or negative?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"end", "orientation":"", "text":"I forgot where the x’s are all negative! Can you show me?", "sound_file":"12.aiff", "another_prompt":"false"}]';
        prompts = prompts.replace(/&#x27;/g, "'");
        prompts = JSON.parse(prompts);
        var trigger = true;
        promptsFinished = false;

        //if we just transitioned from problem state "end" to problem state "beg", increment  
        //mobile problem number index
        if(prompt.state == "beg")
        {
        	//sometimes we will encounter consecutive prompts with problem state "beg"
        	if(!begLast) {
        		localProblemIndex = localProblemIndex + 1;
        		begLast = true;

        		//delay next prompt to allow time for robot rese
        		//window.setTimeout(function(){
  				//checkForSecondPrompt(solutionStatus, "end", problemNumber);
  				//}, 17000);
        	}
        }
        else {
        	begLast = false;
        }

        //check trigger criteria
        if(prompt.trigger == "hit")
        {
        	console.log(prompts[currentPromptIndex].problem_num + " " + localProblemIndex);
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
				    else if(prompt.state == "end_correct" || prompt.state == "end_incorrect" || prompt.state == "end")
				    {
				    	if(prompt.state == "end_incorrect")
				    	{
				    		currentPromptIndex = 4;
				    	}
				    	if(prompt.state == "end_correct")
				    	{
				    		currentPromptIndex = 2;
				    	}
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
	*/

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
        /*var prompts = '[ {"problem_num":540, "problem_state":"end", "orientation":"", "text":"Are you ready to teach me geometry?", "sound_file":"0.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"beg", "orientation":"", "text":"In (4, 0), does the 4 tell me to move on the x-axis or on the y-axis?", "sound_file":"1.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"mid", "orientation":"","text":"Come over here and see the point I plotted at x equals 4 and y equals 0.", "sound_file":"2.aiff", "another_prompt":"true"}, {"problem_num":541, "problem_state":"end_correct", "orientation":"", "text":"Neat! Now I know that the first number tells me to go left or right on the x-axis!", "sound_file":"3.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"end_correct", "orientation":"", "text":"Hey can you show me where 4 is on the x-axis again?", "sound_file":"4_correct.aiff", "another_prompt":"false"}, {"problem_num":541, "problem_state":"end_incorrect", "orientation":"", "text":"Hey can you stand where 4 is on the x-axis", "sound_file":"4_incorrect.aiff", "another_prompt":"false"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"I can\'t remember which way the y-axis goes! Do you? Can you walk along the y-axis for me?", "sound_file":"6.aiff", "another_prompt":"true"}, {"problem_num":542, "problem_state":"end", "orientation":"", "text":"Cool! I learned that the y-axis runs from top to bottom across the cartesian plane!", "sound_file":"7.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"I’m trying to remember where all the x’s are positive. Is it to the left or the right of the y-axis?", "sound_file":"8.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"beg", "orientation":"", "text":"Hmmm our x coordinate is 1. Does this mean we should move left or right along the x-axis?", "sound_file":"9.aiff", "another_prompt":"false"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"Where are the y’s all positive? Is it below or above the x-axis?", "sound_file":"10.aiff", "another_prompt":"true"}, {"problem_num":543, "problem_state":"end", "orientation":"", "text":"I forgot something... Can you walk around the area where the y’s are all positive?", "sound_file":"11.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"beg", "orientation":"", "text":"coordinate is -2. Does this mean we should move left or right along the x-axis?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"I have a feeling the y\'s are all negative below the x-axis…", "sound_file":"12.aiff", "another_prompt":"true"}, {"problem_num":544, "problem_state":"mid", "orientation":"270", "text":"If we walk to the bottom edge of the cartesian plane, are the y’s positive or negative?", "sound_file":"12.aiff", "another_prompt":"false"}, {"problem_num":544, "problem_state":"end", "orientation":"", "text":"I forgot where the x’s are all negative! Can you show me?", "sound_file":"12.aiff", "another_prompt":"false"}]';
        prompts = prompts.replace(/&#x27;/g, "'");
        prompts = JSON.parse(prompts);
        */
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
			
			var datum;
			$.ajax({url : REQUEST_DATA_FROM_MOBILE,
					success: function(datum) {console.dir("DATA FROM MOBILE!!!" + datum);
												var tmpArray = datum.split('@@@', 2);
												current_problem_object = JSON.parse(tmpArray[0]);
												current_problem_object["problemNumber"] = Number(tmpArray[1]) + 1;
												},
					async : false});

			log("", {"type":"prompt","parameter":prompts[currentPromptIndex].text, "initial" : "", "final" : "", 
				"problem number" : current_problem_object.problemNumber, "problem desc" : current_problem_object.text, "problem id" : current_problem_object.id});

			if(condition == "Mobile")
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
