var PROBLEMS = {};

var GBL_BOOL_NEXT_BUTTON_ENABLED = true; //Adrin, did this out of frustration when ._data() to the next-button-element to get event handlers was not working.

PROBLEMS.init = function() {
    // Setting action listeners
    $("#next-problem-button").click(nextProblem);
    $("#check-solution-button").click(checkSolution);

    //The clickable problem heading banner that allows you to restart the current problem.
    $("#current-problem-wrapper h3").click(function() {
        // log("Student restarted current problem",{"source":"ipod"});
        
        refreshProblem("Restart current problem?");
    });

    // setCurrentProblem should be called after adding all the listeners!!! Since we unbind certain listeners in it, specifically the next-problem-button.
	// Setting problem info in the interface and in the applet
    setCurrentProblem();
}

//A simple method that refreshes the problem, also handles triggered refreshes.
function refreshProblem(message, executeSteps) {
    // log("Calling refreshProblem");
    var refresh = true;
    
    if(message !== undefined) {
        refresh = confirm(message);
    }

    if(refresh) {
        // refreshing problem
        if(message == "Restart current problem?") {//logging only if clicked from header
            var initialStateOnLoadString  = calculateInitialStateOnLoad();
            log("", {"type":"reset","parameter":"","initial":initialStateOnLoadString, "final":initialStateOnLoadString});
        }

        APP.currentStepsList = [];
        updateStepsListInDB();
        updateCurrentProcedureStepsList();

        //check if it is time to deliver a cognitive prompt
        callCheckForCognitivePrompt();

        if(executeSteps === undefined || executeSteps) { // TODO The first condition should be removed as soon as all calls to this function are updated accordingly
            executeStep(); 
        }
        STEPS.stopDragMode();
    }
    // Do nothing...
}

// This function would set the current problem details into the UI, once the APP.currentProblemIndex has been changed to match the problem.
function setCurrentProblem() {
    // log("Calling setCurrentProblem", {"source":__SOURCE__});
    
    // var tmp = jQuery._data("#next-problem-button", "events");
    // alert(jQuery._data("#next-problem-button","events"));

    //Here we're as disallowing the user from going to the next problem, once a new problem has been presented.
    $("#next-problem-button").fadeTo(1, 0.5);
    $("#next-problem-button").unbind();//removing the listener
    // $('#next-problem-button').removeClass();
    // $('#next-problem-button').addClass('disabled');


    GBL_BOOL_NEXT_BUTTON_ENABLED = false;

    // alert($("#next-problem-button").css("opacity"));

    if(APP.currentProblem === undefined) {
        // Logging
        log("FINISHED ALL PROBLEMS");

        alert("All problems have been solved!");
        APP.currentProblemIndex = 0;
        APP.currentProblem = APP.PROBLEMS[APP.currentProblemIndex];
    }

    //This adds the problem heading in the top banner.
    $("#current-problem-wrapper h3").html($("<div/>").html(APP.currentProblem.text).text());
    
    // send message to applet to update its problem
    //COMM.sendToApplet()
    
    // log("Current problem index : " + APP.currentProblemIndex, {"source":__SOURCE__});
    // log("data : " + JSON.stringify(APP.currentProblem), {"source":__SOURCE__}, false);
    
    ajax(APP.UPDATE_CURRENT_PROBLEM + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(APP.currentProblem)), [], ""); // Call #1
}

function moveToProblemNumber(probNum) {
    // log("Calling moveToProblemNumber");

    if(probNum >= APP.PROBLEMS.length) {
        // log("Problem number " + probNum + "is out of bounds. Resetting to last problem.");
        probNum = APP.PROBLEMS.length - 1;
    }

    alert("Moving to problem number " + (probNum + 1) + ".");

    APP.currentProblemIndex = probNum;
    APP.currentProblem = APP.PROBLEMS[APP.currentProblemIndex];

    //check if it is time to deliver a cognitive prompt
    callCheckForCognitivePrompt();

    // log("Problem number : " + probNum);
    // log("Current problem : " + JSON.stringify(APP.currentProblem));
    // log("ALL PROBLEMS : " + JSON.stringify(APP.PROBLEMS));

    setCurrentProblem(); // Call #1
    refreshProblem(); // Call #2
    // Logging
    // log("Moving to Problem " + APP.currentProblem.id);
    log("", {"type":"admin changed problem","parameter":probNum+1,"initial":"", "final":""});
}

function nextProblem() {
    if(APP.currentProblem.prompts.length > 0) {
        openPrompt(APP.currentProblem.prompts, true);
    }
    else {
        // log("Moving to next problem", {"source":"ipod"});
        if((APP.currentProblemIndex + 1) < APP.PROBLEMS.length) {
            log("",{"type":"change prob","parameter":APP.currentProblemIndex + 2,"initial":"", "final":"", "problem number" : APP.currentProblemIndex + 2, 
                "problem desc" : APP.PROBLEMS[APP.currentProblemIndex + 1].text, "problem id" : APP.PROBLEMS[APP.currentProblemIndex + 1].id});
        }
        moveToNext();
    }
}

function callCheckForCognitivePrompt() {
    ajax(APP.MAKE_COGNITIVE_PROMPT + "?trigger=" + "hit" + "&state=" + "dc" + "&number=" + "dc");
}

function moveToNext(callback) {
    // log("Calling moveToNext");
    APP.currentProblemIndex++;
    APP.currentProblem = APP.PROBLEMS[APP.currentProblemIndex];
    setCurrentProblem(); // Call #1
    refreshProblem(undefined, false); // Call #2
    
     //allow robot to resest, then check to see if prompts should be called
     window.setTimeout(function(){
           callCheckForCognitivePrompt();
         }, 15000);

    // Logging
    // log("Moving to Problem " + APP.currentProblem.id);
    if(callback) {
        callback();
    }
}

// !!! Read this and see the changes Victor made and learn from them.
function openFeedbackScreen(solutionStatus, appletMessage) {
    //Telling the applet to lock itself until further notice.
    var problemObject = JSON.parse(JSON.stringify(APP.currentProblem));
    problemObject.type = "lockapplet";
    // ajax(APP.LOCK_APPLET + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(problemObject)), [], "");

    $.ajax({
            url : APP.LOCK_APPLET + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(problemObject)),
            async : false
            });

    var button = $("#prompt a");
    
    var correctImage = "Check-256.png";
    var wrongImage = "Close-256.png";

    // Some mock messages.
    var correctResponseArray = ["Correct-amundo", "O frabjous day!\nThat answer is right!", "The answer is correct.\nHave some metaphorical milk and cookies."];
    var wrongResponseArray = ["That solution is wrong.\nBy the way did you hear that buzzer, I think someone is at the door.", "Negative, that is wrong.\nEpic failure is a stepping stone to epic success. ", "Incorrect-amundo."];
    var responseArray = wrongResponseArray, responseImage = wrongImage;
    
    if(String(solutionStatus).toLowerCase() == "true") {
        responseArray = correctResponseArray;
        responseImage = correctImage;

        //!!! Very important, make the next-problem-button clickable again.
        $("#next-problem-button").fadeTo(1, 1);
        $("#next-problem-button").click(nextProblem);
        GBL_BOOL_NEXT_BUTTON_ENABLED = true;
    }
    
    var rndIndx = Math.floor(10 * Math.random()) % (correctResponseArray.length);

    // $('<div />', {id : 'responseImageHolder'}).appendTo('#feedback span');
    // $('#responseImageHolder').prepend('<img id="theImg" src="../static/images/Close-256.png" />');
    // $('<img />', {id : 'responseImageHolder', src : '../static/images/Close-256.png'});

    $("#responseImageHolder").attr("src","../static/images/" + responseImage);

    // Commented the feedback message at Victor's request
    // Updating text
    /*if(String(solutionStatus).toLowerCase() == "true")  {
        $("#feedback span").html($("<div/>").html("The system says : " + responseArray[rndIndx]).text());
    }
    else {
        //$("#feedback span").html($("<div/>").html("The system says : " + responseArray[rndIndx]).text() + "<br><br>" + "Hint : " + appletMessage);
        $("#feedback span").html($("<div/>").html(solutionStatus"The system says : " + responseArray[rndIndx]).text() + "<br><br>" + (appletMessage ? "Hint : " + appletMessage : ""));
    }*/

    $("#feedback-ok").off('click');
    // button.text("OK");
    $("#feedback-ok").click(function () {
        // window.location.reload(true);
        $("#feedback").fadeOut('slow');
        //Not collecting attribution feedback for now...
        openEmoticonScreen();
        
        // log("Student's solution is " + ((String(solutionStatus).toLowerCase() == "true") ? "wrong" : "correct"), {"source":__SOURCE__});
        log("",{"type":"correctness feedback","parameter":((String(solutionStatus).toLowerCase() == "true") ? "correct" : "incorrect"),"initial":CURRENT_GEOGEBRA_STATE, "final":CURRENT_GEOGEBRA_STATE});
        // log("System's response to solution '" + responseArray[rndIndx] + "'", {"source":__SOURCE__});
        // alert("You clicked OK!!!!");
    });

    //Adrin added the next two lines since we did the applet unlocking in openEmoticonScreen().
    problemObject.type = "unlockapplet";
    // ajax(APP.LOCK_APPLET + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(problemObject)), [], "");

    $.ajax({
            url : APP.LOCK_APPLET + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(problemObject)),
            async : false
    });

    $("#feedback").fadeIn('slow');
}

// !!! Read this and see the changes Victor made and learn from them.
function openEmoticonScreen() {
    // alert("I'm emoting!!!");

    $("#emoticon").fadeIn('slow');

    var container = $('#emoticon');
    var inputs = container.find('input');
    // var id = inputs.length + 1;
    var id = 0;
    var emotionArray = ["Happy", "Neutral", "Frustrated"]; //Guilty", "Hungry", "Grateful", "Ashamed", "Pitiful", "Frustrated", "Proud"];
    var emotionEmojiArray = ["happy.png", "neutral.png", "angry.png"];
    var currentEmotion = "TextMessages";
    var currentEmotionContainer = $('#' + currentEmotion);


    //add text message interface to make it look like students are talking to Quinn
    $('<div />', {id : currentEmotion}).appendTo(container);
    var textMessage = $('<p />', {text: "How are you feeling right now?"});
    $('<span/>', {'class':'dialog-detail'}).appendTo(textMessage);
    textMessage.appendTo("#TextMessages");
    //$('<img />', {'for': 'cb' + id, src: "/mobileinterface/static/images/attributions/" + "quinn.jpg", align : 'bottom' }).appendTo("#TextMessages");


    //add text message entry fields
    currentEmotion = "MessageEntry";
    currentEmotionContainer = $('#' + currentEmotion);
    $('<div />', {id : currentEmotion}).appendTo(container);
    $('<label />', {id : "entryfield", text: "Select an emoticon", 'class':'title'}).appendTo("#MessageEntry");
    $('<a/>', {id : "emoticon-ok", href : "#", text : "Send", click : function() {
            $("#emoticon").fadeOut('slow');

            // !!!Need to remove this hardcoded length and somehow get the emotionArray length in here.
            var length = 3;
            var checkedEmotions = [];
            //alert(length);
            //Adrin made this change, since the checkbox ids are cb3,4,5
            for(var i = 3 ; i < length + 3; i++) {
                var isChecked = $("#cb" + i).prop('checked');
                var emotion = $("#cb" + i).prop('value');
                // alert(emotion);
                if(isChecked) {
                    checkedEmotions.push(emotion);
                }
            }

            // alert("Checked emotions are " + checkedEmotions.toString() + ".");
            // log("Checked emotions are " + checkedEmotions.toString() + ".", {"source":__SOURCE__});

            $('#emoticon').empty();

            //Telling the applet to unlock itself until further notice.
            var problemObject = JSON.parse(JSON.stringify(APP.currentProblem));
            problemObject.type = "unlockapplet";
            ajax(APP.LOCK_APPLET + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(problemObject)), [], "");

            log("", {"type":"checked emotions", "parameter":checkedEmotions.toString(), "initial":CURRENT_GEOGEBRA_STATE, "final":CURRENT_GEOGEBRA_STATE});
        }}).appendTo("#MessageEntry");
        // $("emoticon-ok").appendTo(container);
    console.log(currentEmotionContainer);
    

    //add emoticon options that students can select from
    // for(var i = 0 ; i < emotionEmojiArray.length ; i+3, id++) {
        currentEmotion = "Emojis";//emotionArray[i];       
        var j = 0;
        var i = 0;
        $('<div />', {id : currentEmotion}).appendTo(container);
        while(i<emotionEmojiArray.length)// && j<3)
        {
            var currentEmotionEmoji = emotionEmojiArray[i];
            currentEmotionContainer = $('#' + currentEmotion);

            //populate window with 3 emoticons per row
            // var currentEmotionCB = $('#cb' + id);
            var label = $('<label/>', {'for' : 'cb' + currentEmotionEmoji});
            $('<img />', {'for': 'cb' + id, src: "/mobileinterface/static/images/attributions/" + currentEmotionEmoji, align : 'bottom' }).appendTo(label);
            label.appendTo(currentEmotionContainer)
            //$('<label />', {'for': 'cb' + id, text: currentEmotion, align : 'left' }).appendTo(currentEmotionContainer);
            i++;
            id++;
            j++;
        }
        i=0;  
        j = 0;
        currentEmotion = "Checkboxes";    
        $('<div />', {id : currentEmotion}).appendTo(container);
        while(i<emotionEmojiArray.length)// && j<3)
        {
            var currentEmotionEmoji = emotionEmojiArray[i];
            var currentEmotionContainer = $('#' + currentEmotion);

            //populate window with 3 checkboxes per row
            $('<input />', {type: 'checkbox', id: 'cb' + currentEmotionEmoji, value: currentEmotion, align : 'center'}).appendTo(currentEmotionContainer);

            // var currentEmotionCB = $('#cb' + id);
            //$('<label />', {'for': 'cb' + id, text: currentEmotion, align : 'left' }).appendTo(currentEmotionContainer);
            i++;
            id++;
            j++;
        }
    //}
}

function openPrompt(promptMessages, isFirst) {
    var button = $("#prompt a");
    
    // Updating text
    $("#prompt span").html($("<div/>").html(promptMessages[0]).text());
    // removing previous handlers
    button.off('click');
    if(promptMessages.length == 1) {
        // There is only one prompt
        // Change button to "close"
        button.text("Close");
        // Associate button to close action
        button.click(closePrompt);
    }
    else {
        // There are more prompts
        // Change button to "next"
        button.text("Next");
        // Associate button to next prompt action
        button.click(function() {
            openPrompt(promptMessages.slice(1, promptMessages.length, false));
        });

    }
    // If this is the first time the prompt is opened, fade window in.
    if(isFirst) {
        $("#prompt").fadeIn('slow');
    }
}

function closePrompt() {
    

    // Calling moveToNext function
    moveToNext(function() {
        // Fading prompt after moving to next problem
        $("#prompt").fadeOut('slow');  
    });
}

// Checking the solution entered by the user.
function checkSolution() {
    // TO DO: need to add some validations
    // log("Calling checkSolution",undefined,false);
    // log("Current problem : " + JSON.stringify(APP.currentProblem),undefined,false);

    // alert($("#next-problem-button").css("opacity"));

    //!!! Not sending the entire problem object, just the message that the applet needs to lock down
    ajax(APP.LOCK_APPLET + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify({"type" : "lockapplet"})), [], "");

    // Adrin just put this in for testing purposes while merging logs and cog prompts.
    // $.ajax({url : APP.MAKE_COGNITIVE_PROMPT + "?trigger=hit&state=end&number=540",
    //         success : function(data) {
    //             console.dir("Successfully ran MAKE_COGNITIVE_PROMPT!!!");
    //         }});

    // Need to confirm if this validation is necessary and sufficient
    if(APP.currentProblem) {
        // if(confirm("Are you you sure you want to submit this solution?")) {
        if(true) {
            // !!!Needed to do this bad cloning since putting type into the original problem structure was causing problems when using moveToProble. 
            // !!!When moving to a new problem, the "type" would persist and would immediately check for valid solution or not.
            
            // log("Student initiated solution check",{"source":__SOURCE__});

            var problemObject = JSON.parse(JSON.stringify(APP.currentProblem));
            problemObject.type = "check";
            ajax(APP.CHECK_SOLUTION + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(problemObject)), [], "");
        }
        else {
            //!!! Not sending the entire problem object, just the message that the applet needs to unlock itself
            ajax(APP.LOCK_APPLET + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify({"type" : "unlockapplet"})), [], "");
        }
    }
}
