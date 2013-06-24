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
            openPrompt(APP.currentProblem.prompts);
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

function openPrompt(promptMessages){

    var button = $("#prompt a");

    $("#prompt span").html($("<div/>").html(promptMessages[0]).text());

    if(promptMessages.length == 1){
        button.text("Close");
        button.click(closePrompt);
    } else {
        button.text("Next");
        button.click(function(){
            promptMessages.splice(0, 1)
            openPrompt(promptMessages);
        });
    }

    $("#prompt").fadeIn('slow');
}

function closePrompt(){
    moveToNext(function(){
        $("#prompt").fadeOut('slow');    
    });
    
}