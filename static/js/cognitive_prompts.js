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
var constant = 0;
var counter = 0;

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
	This function calls the GET_PROMPT function with the error value and gets
	the database value from GET_PROMP and pass it to promptcall function
	****************************************************************/
	var incorrectPrompt = function(info) {

		//Testing Abha
		$.ajax({
			url : GET_PROMPT + "?data=" + info.error,
			async : false,
			success: function(datum)
			{
				promptcall(datum);
			}
			});
		
	}

	/**************************************************************** 
	This function gets the input values from the promptcall function
	and plays the audio file alongwith displaying the respective prompt.
	****************************************************************/


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
		}, delay);

		console.log("prompt: " + currentPromptIndex + ", problem: " + localProblemIndex);
	};

	/**************************************************************** 
	This function calls the GET_PROMPT function with the error value and gets
	the database value from GET_PROMP and pass it to promptcall function
	****************************************************************/

	var promptcall = function(datum) {
	
		var ArrayDatum = JSON.parse(datum);
		var length = ArrayDatum[0].length;
		console.log(length); 
		var prompttrigger = false;
		if (length > 0)
		{
			if(counter == length)
		   	{
		   		counter = 0;
			}
	   		var textfile = ArrayDatum[constant][counter];
	   		var soundfile = ArrayDatum[constant + 1][counter];
	   		// Pass the text and audio file 
		   	speak(// Make robot speak
				soundfile,
				textfile,
				5500,
				true
		        );
		   	counter++; 
		    prompttrigger = true;

		}
		//update the interface on the student iPod

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

	return {
		doPromptAction : doPromptAction
	}
}

var cognitive_prompts = CognitivePrompts();
