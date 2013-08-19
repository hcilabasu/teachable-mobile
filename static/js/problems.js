var PROBLEMS = {};

PROBLEMS.init = function() {
	// Setting problem info in the interface and in the applet
    setCurrentProblem();
    // Setting action listeners
    $("#next-problem-button").click(nextProblem);
    $("#check-solution-button").click(checkSolution);
    $("#current-problem-wrapper h3").click(function(){
        refreshProblem(" Restart current problem?");
    });
}


function refreshProblem(message) {
    log("Calling refreshProblem");
    var refresh = true;
    if(message !== undefined){
        refresh = confirm(message);
    }
    if(refresh){
        // refreshing problem
        APP.currentStepsList = [];
        updateStepsListInDB();
        updateCurrentProcedureStepsList();
        executeStep();
        STEPS.stopDragMode();
    }
    // Do nothing...
}

function setCurrentProblem() {
    log("Calling setCurrentProblem");
    if(APP.currentProblem === undefined){
        // Logging
        log("FINISHED ALL PROBLEMS");

        alert("All problems have been solved!");
        APP.currentProblemIndex = 0;
        APP.currentProblem = APP.PROBLEMS[APP.currentProblemIndex];
    }
    $("#current-problem-wrapper h3").html($("<div/>").html(APP.currentProblem.text).text());
    
    // send message to applet to update its problem
    //COMM.sendToApplet()
    ajax(APP.UPDATE_CURRENT_PROBLEM + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(APP.currentProblem)), [], "");
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

function moveToNext(callback) {
    APP.currentProblemIndex++;
    APP.currentProblem = APP.PROBLEMS[APP.currentProblemIndex];
    setCurrentProblem();
    refreshProblem();
    // Logging
    log("Moving to Problem " + APP.currentProblem.id);
    if(callback){
        callback();
    }
}

function openFeedbackScreen(solutionStatus) {
    var button = $("#prompt a");
    
    // Updating text
    $("#feedback span").html($("<div/>").html(solutionStatus.toString()).text());
    
    $("#feedback-ok").off('click');
    // button.text("OK");
    $("#feedback-ok").click(function () {
        // window.location.reload(true);
        $("#feedback").fadeOut('slow');
        openEmoticonScreen();
        // log("!! Button Click !!");
        // alert("You clicked OK!!!!");
    });

    $("#feedback").fadeIn('slow');
}

function openEmoticonScreen() {
    // alert("I'm emoting!!!");

    $("#emoticon").fadeIn('slow');

    var container = $('#emoticon');
    var inputs = container.find('input');
    // var id = inputs.length + 1;

    var id = 0;
    var emotionArray = ["Happy", "Elated", "Melancholy", "Sad", "Morose", "Apathetic", "Depressed", "Angry", "Hungry"];
    
    for(var i = 0 ; i < emotionArray.length ; i++, id++) {
        var currentEmotion = emotionArray[i];
        
        $('<div />', {id : currentEmotion}).appendTo(container);
        var currentEmotionContainer = $('#' + currentEmotion);

        $('<input />', { type: 'checkbox', id: 'cb' + id, value: currentEmotion, align : 'left' }).appendTo(currentEmotionContainer);

        // var currentEmotionCB = $('#cb' + id);

        $('<label />', { 'for': 'cb' + id, text: currentEmotion, align : 'right' }).appendTo(currentEmotionContainer);
    }

    $('<a/>', {id : "emoticon-ok", href : "#", text : "OK", click : function() {
        $("#emoticon").fadeOut('slow');

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
    log(JSON.stringify(APP.currentProblem));

    // Need to confirm if this validation is necessary and sufficient
    if(APP.currentProblem){
        if(confirm("Are you you sure you want to submit this solution?")) {
            //ajax(APP.UPDATE_CURRENT_PROBLEM + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(APP.currentProblem)), [], "");
            APP.currentProblem.type = "check";
            ajax(APP.CHECK_SOLUTION + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(APP.currentProblem)), [], "");
            //ajax(APP.CHECK_SOLUTION, [], "");
        }
    }
}