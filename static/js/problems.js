var PROBLEMS = {};

PROBLEMS.init = function(){
	// Setting problem info in the interface and in the applet
    setCurrentProblem();
    // Setting action listeners
    $("#next-problem-button").click(nextProblem);
    $("#current-problem-wrapper h3").click(function(){
        refreshProblem(" Restart current problem?");
    });
}


function refreshProblem(message){
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

function setCurrentProblem(){
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
    ajax(APP.UPDATE_CURRENT_PROBLEM + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(APP.currentProblem)), [], "")

}

function nextProblem(){
    if(confirm("Are you sure you want to move on? You are not going to be able to go back.")){
        if(APP.currentProblem.prompts.length > 0){
            openPrompt(APP.currentProblem.prompts, true);
        } else {
            moveToNext();
        }
    }
}

function moveToNext(callback){
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

function openPrompt(promptMessages, isFirst){

    var button = $("#prompt a");
    // Updating text
    $("#prompt span").html($("<div/>").html(promptMessages[0]).text());
    // removing previous handlers
    button.off('click');
    if(promptMessages.length == 1){
        // There is only one prompt
        // Change button to "close"
        button.text("Close");
        // Associate button to close action
        button.click(closePrompt);
    } else {
        // There are more prompts
        // Change button to "next"
        button.text("Next");
        // Associate button to next prompt action
        button.click(function(){
            openPrompt(promptMessages.slice(1, promptMessages.length, false));
        });

    }
    // If this is the first time the prompt is opened, fade window in.
    if(isFirst){
        $("#prompt").fadeIn('slow');
    }
}

function closePrompt(){
    // Calling moveToNext function
    moveToNext(function(){
        // Fading prompt after moving to next problem
        $("#prompt").fadeOut('slow');  
    });
    
}