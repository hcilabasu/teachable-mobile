var current_problem_object = {};
var PROBLEMS = {};
var TEST_SESSION_JSON;
var ordered_abstract_prompts = new Array();
var ordered_action_prompts = new Array();
var ordered_prompts = new Array();
var firsttotaltime = -1;
var firsthour = 0;
var firstminute = 0;
var firstsec = 0;
var condition = 'Virtual';
var promptsRandomized = false;
var minutesThreshold = 2; // Sets how long the system waits before displaying another prompt
//Added by Abha to show incorrect message
var Nomoveonxplus;
var Nomoveonxminus;
var Nomoveonyplus;
var Nomoveonyminus;
var plotpoint;
var signx;
var signy;
var flip;
var offbyonex;
var Offbyoney;
var firstquad;
var secondquad;
var thirdquad;
var fourthquad;
var flipmove;
var xwrong;
var ywrong;
var counter = 0;
//Function to get message arrays from index.html
function sendarray(Nomoveonxplusparam, Nomoveonxminusparam, Nomoveonyplusparam, Nomoveonyminusparam, plotpointparam, signxparam, signyparam, flipparam, offbyoneparamx, offbyoneparamy, firstquadparam, secondquadparam, thirdquadparam, fourthquadparam, flipmoveparam, xwrongparam, ywrongparam )
{ 
  Nomoveonxplus = Nomoveonxplusparam;
  Nomoveonxminus = Nomoveonxminusparam;
  Nomoveonyplus = Nomoveonyplusparam;
  Nomoveonyminus = Nomoveonyminusparam;
  plotpoint = plotpointparam;
  signx = signxparam;
  signy = signyparam;
  flip = flipparam;
  offbyonex = offbyoneparamx;
  offbyoney = offbyoneparamy; 
  firstquad = firstquadparam;
  secondquad = secondquadparam;
  thirdquad = thirdquadparam;
  fourthquad = fourthquadparam;
  flipmove = flipmoveparam;
  xwrong = xwrongparam;
  ywrong = ywrongparam;
}

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
			//Added by Abha to show incorrect prompt
			incorrectPrompt(info);
			//makePrompt(info,condition)
		}
		else if(name == "hidePromptDialog")
		{
			hidePromptDialog();
		}
		else if(name == "timecheck")
		{
			timeprompt(info);
		}
		else if(name == "randomizePrompts")
		{
			randomizePrompts(info);
		}
	}

	/**************************************************************** 
	* Randomizes the order of prompts at the beginning of
	* each session
	****************************************************************/
	var randomizePrompts = function(problem) {
		var num_prompts = prompts[0].length - 1;
		var num_misconceptions = prompts.length - 1;
		var cur_misconception = num_misconceptions;

		console.log("Beginning prompt randomization...");

		//determine if subject is using virtual condition OR mobile/physical conditions
		var datum;
		$.ajax({url : REQUEST_SESSION_DATA,
				success: function(datum) {console.dir("SESSION DATA" + datum);
											var tmpArray = datum.split(',', 3);
											condition = tmpArray[0];
											condition = condition.substring(24, condition.length-2);
											console.log(tmpArray[0] + " " + condition);
											},
				async : false});


		//randomize prompt order within each misconception
		while(cur_misconception !== 0)
		{
			if(condition !== "Virtual")
			{
				console.log("bad");
				prompts[cur_misconception] = shuffle(prompts[cur_misconception]);
			}
			else
			{
				console.log("good");
				abstractPrompts[cur_misconception] = shuffle(abstractPrompts[cur_misconception]);
			}
			cur_misconception -= 1;
		}

		//create a prompt order, alternating between each misconception
		var cur_index = 0;
		var cur_prompt = num_prompts;
		cur_misconception = num_misconceptions;
		//set the first cognitive prompt to be the training prompt (unless just performed system reset)
		console.log("@@@@@" + problem.number);
		if(problem.number == "540")
		{
			ordered_prompts[cur_index] = {"text":"Are you ready to teach me geometry?", "sound_file":"training.mp3"};
			cur_index += 1;
		}

		while(cur_prompt !== 0)
		{
			while(cur_misconception !== 0)
			{
				if(condition !== "Virtual")
				{
					ordered_prompts[cur_index] = prompts[cur_misconception][cur_prompt];
				}
				else
				{
					ordered_prompts[cur_index] = abstractPrompts[cur_misconception][cur_prompt];
				}
				cur_index += 1;
				cur_misconception -= 1;
			}
			cur_misconception = num_misconceptions;
			cur_prompt -= 1;
		}
		console.log("Prompt randomization complete!");
		promptsRandomized = true;
	}

	/****************************************************************
	* Helper function for randomization process - shuffles
	* values within an array
	****************************************************************/
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

	/**************************************************************** 
	* Checks if enough time has elapsed since last prompt was 
	* displayed (2 minutes)
	****************************************************************/
	var timeprompt = function(info)
	{
	   var newtime = new Date();
	   var newhour = newtime.getHours();
       	   var newhourinmin = newhour * 60;
	   var newminute = newtime.getMinutes();
	   var newsec = newtime.getSeconds();
           var newsecinmin = newsec/60;
           var newtotaltime = newhourinmin + newminute + newsecinmin;
       if (firsthour == 0 && firstminute == 0 && firstsec == 0 )
	   {
	    	//console.log("Time: " + newhour + ":" + newminute + ":" + newsec);
       }
       else
	   {
	      	//console.log("first Time: " + firsthour + ":" + firstminute + ":" + firstsec + "New Time: " + newhour + ":" + newminute + ":" + newsec);
	   }

	   attributionFinished = true;  
	   if (info.firstProblem == false){
		   if(firsttotaltime == -1)
		   {
		   		//no cognitive prompts have been displayed yet, go ahead a show prompt
		   		displayTriggeredPrompt(prompt);
		   }
		   else if (newtotaltime < firsttotaltime)
		   {
	            var minutesPerDay = 24*60; 
	            var result = minutesPerDay - firsttotaltime;  // Minutes till midnight
	            result += newtotaltime; // Minutes in the next day 
		        if (result >= minutesThreshold)
		        {
		      	    //check if it's been at least 2 minutes since last prompt shown, if so then show prompt
		    	    displayTriggeredPrompt(prompt);
	            }
	        }
		   else if (newtotaltime - firsttotaltime >= minutesThreshold)
		   {
		       //check if it's been at least 2 minutes since last prompt shown, if so then show prompt
		    	displayTriggeredPrompt(prompt);
	        }
	    }
	}


	/**************************************************************** 
	* Closes current dialogue displaying prompt text and stops audio
	* file associated with current prompt
	*****************************************************************/
	var hidePromptDialog = function() {
		var incremented = false;

		//REMOVE THE PROMPTS
		$("body").removeClass().addClass("neutral");
		$("#speech").fadeOut('slow');
		$("#record").fadeOut('slow', function(){
			// removing dismiss class only after done fading
			$("#record").removeClass('dismiss');
		});

		cognitivePromptFinished = true;
	}
	


	/**************************************************************** 
	* Opens dialogue to display prompt text and plays audio
	* file associated with current prompt
	****************************************************************/
	var displayTriggeredPrompt = function(prompt) {
	    var firsttime = new Date();
	    var firsthourinmin = firsthour * 60;
	    var firstsecinmin = firstsec/60;
	    var incremented = false;
	    cognitivePromptFinished = false;

	    if(currentPromptIndex == 0 && prompt.number == "540")
	    {
	    	currentPromptIndex++;
	    }

	    if(promptsRandomized == true) {

	    //update the interface on the student iPod
	    $.ajax({
	        url: SET_COGNITIVE_TRIGGERED + "?data=" + JSON.stringify({"type":"setcognitivetrigger"}),
	        async: false,
	        success: function() {
	            console.dir("Sending message to student iPod that cognitive prompt has been triggered.....");
	        }
	    });

	    firsthour = firsttime.getHours();
	    firstminute = firsttime.getMinutes();
	    firstsec = firsttime.getSeconds();   
	    firsttotaltime = firsthourinmin + firstminute + firstsecinmin; 

	    recordClickCount = 0;
		// Set facial expression
		$("body").removeClass().addClass("neutral");
		// load sound
		console.log("?????" + currentPromptIndex);
		console.log("/mobileinterface/static/audio/" + ordered_prompts[currentPromptIndex].sound_file);

		AUDIO.setFile("promptSound", "/mobileinterface/static/audio/" + ordered_prompts[currentPromptIndex].sound_file);
		AUDIO.loadSound("promptSound");
		// Attach handlers
		AUDIO.addStartListener("promptSound", function(){
			// When robot starts to speak
			$("body").addClass("talking");
			$("#speech").text(ordered_prompts[currentPromptIndex].text).fadeIn('slow');
			var datum;
			$.ajax({url : REQUEST_DATA_FROM_MOBILE,
					success: function(datum) {console.dir("DATA FROM MOBILE!!!" + datum);
												var tmpArray = datum.split('@@@', 2);
												current_problem_object = JSON.parse(tmpArray[0]);
												current_problem_object["problemNumber"] = Number(tmpArray[1]) + 1;
												},
					async : false});

			log("", {"type":"prompt","parameter":ordered_prompts[currentPromptIndex].text, "initial" : "", "final" : "", 
				"problem number" : current_problem_object.problemNumber, "problem desc" : current_problem_object.text, "problem id" : current_problem_object.id});

			
		});

		AUDIO.addFinishListener("promptSound", finListener = function(){
			// When robot finishes speaking
			$("body").removeClass("talking");

			//increment prompt counter
			currentPromptIndex = currentPromptIndex + 1;
			//if student has seen all of the prompts, start repeating
			if(currentPromptIndex == ordered_prompts.length)
			{
				currentPromptIndex = 1;
			}
			AUDIO.removeFinishListener("promptSound", finListener);
		});


		// play sound
		window.setTimeout(function(){
			AUDIO.play("promptSound");
		}, 3000);

		console.log("prompt: " + currentPromptIndex + ", problem: " + localProblemIndex);
		}
	}

	/**************************************************************** 
	* Opens dialogue to display incorrect prompt text and plays audio
	* file associated with current prompt
	****************************************************************/
	var incorrectPrompt = function(info) {

		var prompttrigger = false;
	    //update the interface on the student iPod


	    if(info.error == "Nomoveonxplus")
	    {
		   if(counter == Nomoveonxplus.length)
		   {
		      counter = 0;
		   }
		   var soundfile = Nomoveonxplus[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			Nomoveonxplus[counter].text,
			0,
			true
		        ); counter++; 
		   prompttrigger = true;
             }
	    else if(info.error == "Nomoveonxneg")
	    {
		   if(counter == Nomoveonxminus.length)
		   {
		      counter = 0;
		   }
		   var soundfile = Nomoveonxminus[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			Nomoveonxminus[counter].text,
			0,
			true
		        ); counter++; 
		   prompttrigger = true;
	     }
	     else if(info.error == "Nomoveonyplus")
	     {
		   if(counter == Nomoveonyplus.length)
		   {
		      counter = 0;
		   }
		   var soundfile = Nomoveonyplus[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			Nomoveonyplus[counter].text,
			0,
			true
		        ); counter++; 
		   prompttrigger = true;
	    }
	     else if(info.error == "Nomoveonyneg")
		{
		   if(counter == Nomoveonyminus.length)
		   {
		      counter = 0;
		   }
		   var soundfile = Nomoveonyminus[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			Nomoveonyminus[counter].text,
			0,
			true
		        ); counter++;
		   prompttrigger = true;
	    }
	    else if(info.error == "PlotPoint")
	    {
		   if(counter == plotpoint.length)
		   {
		      counter = 0;
		   }
		   var soundfile = plotpoint[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			plotpoint[counter].text,
			0,
			true
		        ); counter++; 
		   prompttrigger = true;
	    }
	    else if(info.error == "Signx")
		{
		   if(counter == signx.length)
		   {
		      counter = 0;
		   }
		   var soundfile = signx[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			signx[counter].text,
			2500,
			true
		        ); counter++; 
		   prompttrigger = true;
		}
		else if(info.error == "Signy")
		{
		   if(counter == signy.length)
		   {
		      counter = 0;
		   }
		   var soundfile = signy[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			signy[counter].text,
			2500,
			true
		        ); counter++; 
		   prompttrigger = true;
		}
	    else if(info.error == "Flip")
		{
		   if(counter == flip.length)
		   {
		      counter = 0;
		   }
		   var soundfile = flip[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			flip[counter].text,
			2500,
			true
		        ); counter++;
		        prompttrigger = true; 
		}
	   else if(info.error == "Offbyonex")
		{
		   if(counter == offbyonex.length)
		   {
		      counter = 0;
		   }
		   var soundfile = offbyonex[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			offbyonex[counter].text,
			2500,
			true
		        ); counter++; 
		   prompttrigger = true;
		}
	   else if(info.error == "Offbyoney")
		{
		   if(counter == offbyoney.length)
		   {
		      counter = 0;
		   }
		   var soundfile = offbyoney[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			offbyoney[counter].text,
			2500,
			true
		        ); counter++; 
		prompttrigger = true;
		}
		else if(info.error == "Firstquad") { // Make robot speak
			 if(counter == firstquad.length)
		   {
		      counter = 0;
		   }
		   var soundfile = firstquad[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			firstquad[counter].text,
			2500,
			true
		        ); counter++; 
		prompttrigger = true;}
		else if(info.error == "Secondquad") { // Make robot speak
			if(counter == secondquad.length)
		   {
		      counter = 0;
		   }
		   var soundfile = secondquad[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			secondquad[counter].text,
			2500,
			true
		        ); counter++; 
		prompttrigger = true;}
		else if(info.error == "Thirdquad") { // Make robot speak
			if(counter == thirdquad.length)
		   {
		      counter = 0;
		   }
		   var soundfile = thirdquad[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			thirdquad[counter].text,
			2500,
			true
		        ); counter++; 
		prompttrigger = true;}
		else if(info.error == "Fourthquad") { // Make robot speak
			if(counter == fourthquad.length)
		   {
		      counter = 0;
		   }
		   var soundfile = fourthquad[counter].sound_file;
		   speak(// Make robot speak
			soundfile,
			fourthquad[counter].text,
			2500,
			true
		        ); counter++; 
		prompttrigger = true;}
		else if(info.error == "xcorrect" || info.error == "xwrong" || info.error == "ycorrect" || info.error == "ywrong" || info.error == "flipmove")
		{		
			if(info.error == "flipmove") { // Make robot speak
				if(counter == flipmove.length)
		   		{
		      		counter = 0;
		   		}
		   		var soundfile = flipmove[counter].sound_file;
		   		speak(// Make robot speak
					soundfile,
					flipmove[counter].text,
					2500,
					true
		        	); counter++; 
			prompttrigger = true;}
			else if(info.error == "xwrong") { // Make robot speak
				if(counter == xwrong.length)
		   		{
		      		counter = 0;
		   		}
		   		var soundfile = xwrong[counter].sound_file;
		   		speak(// Make robot speak
					soundfile,
					xwrong[counter].text,
					2500,
					true
		        	); counter++; 
			prompttrigger = true;}
			else if(info.error == "ywrong") { // Make robot speak
				if(counter == ywrong.length)
		   		{
		      		counter = 0;
		   		}
		   		var soundfile = ywrong[counter].sound_file;
		   		speak(// Make robot speak
					soundfile,
					ywrong[counter].text,
					2500,
					true
		        	); counter++; 
			prompttrigger = true;}
		}

		if(prompttrigger == true)
	    {
	    $.ajax({
	        url: SET_COGNITIVE_TRIGGERED + "?data=" + JSON.stringify({"type":"setcognitivetrigger"}),
	        async: false,
	        success: function() {
	            console.dir("Sending message to student iPod that cognitive prompt has been triggered.....");
	        }
	    });
		}
		
	}




	var speak = function(file, message, delay, removeExtension){
		// Set facial expression
		$("body").removeClass().addClass("neutral");

		// load sound
		console.log("?????" + currentPromptIndex);
		console.log("/mobileinterface/static/audio/" + file);

		// format audio file location string
		audioFile = "/mobileinterface/static/audio/" + file;
		// checks if the original extension should be removed
		if(removeExtension === true){
			audioFileLength = audioFile.indexOf(".");
			audioFile = audioFile.substring(0, audioFileLength) + ".mp3";
		}
		//load sound
		AUDIO.setFile("promptSound", audioFile);
		AUDIO.loadSound("promptSound");
		// Attach handlers
		AUDIO.addStartListener("promptSound", function(){
			// When robot starts to speak
			$("body").addClass("talking");
			// Display the message if there is one
			if(message !== undefined){
				$("#speech").text(message).fadeIn('slow');
			}
						var datum;
			$.ajax({url : REQUEST_DATA_FROM_MOBILE,
					success: function(datum) {console.dir("DATA FROM MOBILE!!!" + datum);
												var tmpArray = datum.split('@@@', 2);
												current_problem_object = JSON.parse(tmpArray[0]);
												current_problem_object["problemNumber"] = Number(tmpArray[1]) + 1;
												},
					async : false});

			log("", {"type":"prompt","parameter":message, "initial" : "", "final" : "", 
				"problem number" : current_problem_object.problemNumber, "problem desc" : current_problem_object.text, "problem id" : current_problem_object.id});

			
		});

		AUDIO.addFinishListener("promptSound", finListener = function(){
			// When robot finishes speaking
			$("body").removeClass("talking");
			// Remove listener
			AUDIO.removeFinishListener("promptSound", finListener);
		});
		// play sound
		window.setTimeout(function(){
		AUDIO.play("promptSound");
		}, 3000);

		console.log("prompt: " + currentPromptIndex + ", problem: " + localProblemIndex);
	};


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

	return {
		doPromptAction : doPromptAction
	}
}

var cognitive_prompts = CognitivePrompts();
