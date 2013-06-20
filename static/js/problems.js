var PROBLEMS = {};

PROBLEMS.init = function(){
	// Setting problem info in the interface and in the applet
    setCurrentProblem();
    // Setting action listeners
    $("#next-problem-button").click(nextProblem);
    $("#current-problem-wrapper h3").click(function(){
        refreshProblem(" Restart current problem?");
    });
    $("#prompt a").click(closePrompt);
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
    $("#current-problem-wrapper h3").text(unescape(APP.currentProblem.text));
    // send message to applet to update its problem
    //COMM.sendToApplet()
    ajax(APP.UPDATE_CURRENT_PROBLEM + "?index=" + APP.currentProblemIndex + "&data=" + escape(JSON.stringify(APP.currentProblem)), [], "")

}

function nextProblem(){
    if(confirm("Are you sure you want to move on? You are not going to be able to go back.")){
        var moveToNext = function(){
            APP.currentProblemIndex++;
            APP.currentProblem = APP.PROBLEMS[APP.currentProblemIndex];
            setCurrentProblem();
            refreshProblem();
        }
        if(APP.currentProblem.prompt){
            openPrompt(APP.currentProblem.prompt, function(){
                moveToNext();
            });
        } else {
            moveToNext();
        }
        
        // Logging
        log("Moving to Problem " + APP.currentProblem.id);
    }
}

function openPrompt(promptMessage, callback){
    $("#prompt span").html($("<div/>").html(promptMessage).text());
    $("#prompt").fadeIn('slow', callback);
}

function closePrompt(){
    $("#prompt").fadeOut('slow');
}