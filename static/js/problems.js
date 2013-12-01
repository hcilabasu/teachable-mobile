var PROBLEMS = {};

PROBLEMS.init = function() {
    // Setting action listeners
    $("#next-problem-button").click(nextProblem);
    $("#check-solution-button").click(checkSolution);
    $("#current-problem-wrapper h3").click(function() {
        refreshProblem(" Restart current problem?");
    });

    // setCurrentProbelm should be called after adding all the listeners!!! Since we unbind certain listeners in it.
	// Setting problem info in the interface and in the applet
    setCurrentProblem();
}

function refreshProblem(message, executeSteps) {
    log("Calling refreshProblem");
    var refresh = true;
    
    if(message !== undefined) {
        refresh = confirm(message);
    }

    if(refresh) {
        // refreshing problem
        APP.currentStepsList = [];
        updateStepsListInDB();
        updateCurrentProcedureStepsList();
        if(executeSteps === undefined || executeSteps){ // TODO The first condition should be removed as soon as all calls to this function are updated accordingly
            executeStep(); 
        }
        STEPS.stopDragMode();
    }
    // Do nothing...
}

function setCurrentProblem() {
    log("Calling setCurrentProblem");

    $("#next-problem-button").fadeTo(1, 0.5);
    $("#next-problem-button").unbind();

    if(APP.currentProblem === undefined) {
        // Logging
        log("FINISHED ALL PROBLEMS");

        alert("All problems have been solved!");
        APP.currentProblemIndex = 0;
        APP.currentProblem = APP.PROBLEMS[APP.currentProblemIndex];
    }

    $("#current-problem-wrapper h3").html($("<div/>").html(APP.currentProblem.text).text());
    
    // send message to applet to update its problem
    //COMM.sendToApplet()
    
    log("Current problem index : " + APP.currentProblemIndex);
    log("data : " + JSON.stringify(APP.currentProblem));
    
    ajax(APP.UPDATE_CURRENT_PROBLEM + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(APP.currentProblem)), [], ""); // Call #1
}

function moveToProblemNumber(probNum) {
    log("Calling moveToProblemNumber");

    if(probNum >= APP.PROBLEMS.length) {
        log("Problem number " + probNum + "is out of bounds. Resetting to last problem.");
        probNum = APP.PROBLEMS.length - 1;
    }

    alert("Moving to problem number " + (probNum + 1) + ".");

    APP.currentProblemIndex = probNum;
    APP.currentProblem = APP.PROBLEMS[APP.currentProblemIndex];

    log("Problem number : " + probNum);
    log("Currnt problem : " + JSON.stringify(APP.currentProblem));
    // log("ALL PROBLEMS : " + JSON.stringify(APP.PROBLEMS));

    setCurrentProblem();
    refreshProblem();
    // Logging
    log("Moving to Problem " + APP.currentProblem.id);
}

function nextProblem() {
    if(confirm("Are you sure you want to move on? You are not going to be able to go back.")){
        if(APP.currentProblem.prompts.length > 0){
            openPrompt(APP.currentProblem.prompts, true);
        } else {
            moveToNext();
        }
    }
}

function callCheckForSecondPrompt(trigger, state, number) {
    ajax(APP.MAKE_COGNITIVE_PROMPT + "?trigger=" + trigger + "&state=" + state + "&number=" + number);
}

function moveToNext(callback) {
    log("Calling moveToNext");
    APP.currentProblemIndex++;
    APP.currentProblem = APP.PROBLEMS[APP.currentProblemIndex];
    setCurrentProblem(); // Call #1
    refreshProblem(undefined, false); // Call #2
    
    //check to see if prompts should be called
    ajax(APP.MAKE_COGNITIVE_PROMPT + "?trigger=" + "hit" + "&state=" + "beg" + "&number=" + 1);
    window.setTimeout(function(){
          callCheckForSecondPrompt("hit", "beg", 1);
        }, 13000);

    // Logging
    log("Moving to Problem " + APP.currentProblem.id);
    if(callback){
        callback();
    }
}

// !!! Read this and see the changes Victor made and learn from them.
function openFeedbackScreen(solutionStatus, appletMessage) {
    //Telling the applet to lock itself until further notice.
    var problemObject = JSON.parse(JSON.stringify(APP.currentProblem));
    problemObject.type = "lockapplet";
    ajax(APP.LOCK_APPLET + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(problemObject)), [], "");

    var button = $("#prompt a");
    
    var correctImage = "Check-256.png";
    var wrongImage = "Close-256.png";

    // Some mock messages.
    var correctResponseArray = ["Correct-amundo", "O frabjous day!\nThat answer is right!", "The answer is correct.\nHave some metaphorical milk and cookies."];
    var wrongResponseArray = ["That solution is wrong.\nBy the way did you hear that buzzer, I think someone is at the door.", "Negative, that is wrong.\nEpic failure is a stepping stone to epic success. ", "Incorrect-amundo."];
    var responseArray = wrongResponseArray, responseImage = wrongImage;
    
    if(String(solutionStatus).toLowerCase() == "true")  {
        responseArray = correctResponseArray;
        responseImage = correctImage;

        //!!! Very important, make the next-problem-button clickable again.
        $("#next-problem-button").fadeTo(1, 1);
        $("#next-problem-button").click(nextProblem);
    }
    
    var rndIndx = Math.floor(10 * Math.random()) % (correctResponseArray.length);

    // $('<div />', {id : 'responseImageHolder'}).appendTo('#feedback span');
    // $('#responseImageHolder').prepend('<img id="theImg" src="../static/images/Close-256.png" />');
    // $('<img />', {id : 'responseImageHolder', src : '../static/images/Close-256.png'});

    $("#responseImageHolder").attr("src","../static/images/" + responseImage);

    // Updating text
    if(String(solutionStatus).toLowerCase() == "true")  {
        $("#feedback span").html($("<div/>").html("The system says : " + responseArray[rndIndx]).text());
    }
    else {
        //$("#feedback span").html($("<div/>").html("The system says : " + responseArray[rndIndx]).text() + "<br><br>" + "Hint : " + appletMessage);
        $("#feedback span").html($("<div/>").html("The system says : " + responseArray[rndIndx]).text() + "<br><br>" + (appletMessage ? "Hint : " + appletMessage : ""));
    }

    $("#feedback-ok").off('click');
    // button.text("OK");
    $("#feedback-ok").click(function () {
        // window.location.reload(true);
        $("#feedback").fadeOut('slow');
        //Not collecting attribution feedback for now...
        //openEmoticonScreen();
        log("!! Button Click !!");
        // alert("You clicked OK!!!!");
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
    var emotionArray = ["Happy", "Sad", "Guilty", "Hungry", "Grateful", "Ashamed", "Pitiful", "Frustrated", "Proud"];
    
    for(var i = 0 ; i < emotionArray.length ; i++, id++) {
        var currentEmotion = emotionArray[i];
        
        $('<div />', {id : currentEmotion}).appendTo(container);
        var currentEmotionContainer = $('#' + currentEmotion);

        $('<input />', {type: 'checkbox', id: 'cb' + id, value: currentEmotion}).appendTo(currentEmotionContainer);

        // var currentEmotionCB = $('#cb' + id);

        $('<label />', {'for': 'cb' + id, text: currentEmotion, align : 'left' }).appendTo(currentEmotionContainer);
    }

    $('<a/>', {id : "emoticon-ok", href : "#", text : "OK", click : function() {
        $("#emoticon").fadeOut('slow');

        // !!!Need to remove this hardcoded length and somehow get the emotionArray length in here.
        var length = 9;
        var checkedEmotions = [];
        //alert(length);
        for(var i = 0 ; i < length ; i++) {
            var isChecked = $("#cb" + i).prop('checked');
            var emotion = $("#cb" + i).prop('value');
            // alert(emotion);
            if(isChecked) {
                checkedEmotions.push(emotion);
            }
        }

        //alert("Checked emotions are " + checkedEmotions.toString() + ".");
        log("Checked emotions are " + checkedEmotions.toString() + ".");

        $('#emoticon').empty();

        //Telling the applet to unlock itself until further notice.
        var problemObject = JSON.parse(JSON.stringify(APP.currentProblem));
        problemObject.type = "unlockapplet";
        ajax(APP.LOCK_APPLET + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(problemObject)), [], "");
    }}).appendTo(container);
    // $("emoticon-ok").appendTo(container);
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
    log("Calling checkSolution");
    log("Current problem : " + JSON.stringify(APP.currentProblem));

    //!!! Not sending the entire problem object, just the message that the applet needs to lock down
    ajax(APP.LOCK_APPLET + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify({"type" : "lockapplet"})), [], "");

    // Need to confirm if this validation is necessary and sufficient
    if(APP.currentProblem) {
        if(confirm("Are you you sure you want to submit this solution?")) {
            // !!!Needed to do this bad cloning since putting type into the original problem structure was causing problems when using moveToProble. 
            // !!!When moving to a new problem, the "type" would persist and would immediately check for valid solution or not.
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