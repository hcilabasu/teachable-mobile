/*
 * TODO Some naming conventions should be used for functions that are used as callbacks to other functions, and data from 
 * HTML inputs should be retrieved only inside entry-point functions (haven't quite decided on 'entry-point' definition. Maybe 
 * functions that are called directly AND as response to events?). Once this is done, I believe that the maintainability would 
 * greatly increase, and bugs would be more easily found.
 *
 * Growing pains with Javascript, right? :)
 */
// Defining global vars
APP = {};

// Adrin added this init function to initialize certain problem tracking variables.
// if(!(APP.hasOwnProperty("init"))) {
//     APP.init = function() {
//         APP.PROBLEMS = JSON.parse(problems); // TODO use better encoding mechanism
//         APP.NUM_PROBLEMS = APP.PROBLEMS.length;
//         APP.basicProcedures = JSON.parse("{{=basic_procedures}}".replace(/&quot;/g, "\"").replace(/&#x27;/g, "'"));
//         APP.currentProblemIndex = "{{=current_problem}}";//we get it from mobile(), which returns a dict, defined in default.py.
//         APP.currentProblem = APP.PROBLEMS[APP.currentProblemIndex];
//     }
// }
// else {
//     alert("APP already has init defined.....");
// }



// Setting constants
APP.DELETE_IMAGE_CLASS = "delete-button";
APP.MAXIMUM_PARAMS = 9
// Seting variables
APP.paramsCounter = 0;
APP.currentDate = new Date();

//Adrin added this global variable
var __SOURCE__ = "system";

$(function() {
    // Initializing Step-related functions
    if (window['STEPS']) STEPS.init();
    // Initializing Procedure-related functions
    if (window['PROCEDURES']) PROCEDURES.init();
    // Initializing Problem navigation-related functions
    if (window['PROBLEMS']) PROBLEMS.init();
    // Initializing Steps List
    if (window['STEPS_LIST']) STEPS_LIST.init();
});

/*
 * PURPOSE: All functions bellow are utilitarian. Specific functions are found on the files:
 * - steps.js : functions related to 
 * - stepsList.js
 * - problems.js
 * - procedures.js
 * - audio.js
 */

/*
 * Function to set a step as draggable
 */
function setDraggable(element) {
    if(!element.data("draggable")){
        element.draggable({
            revert: true,         // Element reverts to original position after being dropped
            axis: "y",            // Element is only draggable in the y axis
            handle: "span",       // Element can only be dragged by span handle
            opacity: 0.5          // Opacity for when it's being dragged
        });
    } else {
        element.draggable('enable');
    }
    if(!element.hasClass("draggable")){
        element.addClass("draggable");
    }
}

/*
 * Function to set a list item as droppable
 */
function setDroppable(element){
    element.droppable({
        hoverClass: "droppable-active", // Class when element is being hovered by draggable
        drop: function(event, ui){      // Function to respond to drops
            stopDropped(event, ui);
        }
    }   );
}

function setDialog(element){
    element.dialog({
        autoOpen: false,
        height: 'auto',
        width: '270px',
        modal: true,
        draggable: false,
        resizable: false,
        focusSelector: undefined
    });
}


/**************************
 * Aux Functions
 **************************/
 function toggleError(element, property, newStyle, oldStyle){
    var animateObject = {};
    animateObject[property] = newStyle;
    element.animate(animateObject, 600);
    setTimeout(function(){
        // Re-coloring it black in 3 seconds
        animateObject[property] = oldStyle;
        element.animate(animateObject, 600);
    }, 3000);
 }

 function isTriggerEqual(object1, object2){
    console.dir("comparing...");
    console.dir(object1);
    console.dir(object2);
    if(object1 === undefined || object2 === undefined){
        return false;
    }
    if(object1.trigger === object2.trigger){
        return true;
    } else {
        return false;
    }
 }

/*
 * This function merges the objects data, newdata. If a property with the same name is found, 
 * the property from newdata will get incremented (prop, where N is the index number)
 * TODO increment until N. so far, it only increments up to 2.
 */
function mergeObjects(data, newdata){
    for(prop in newdata){
        if(prop in data){
            // Incrementing prop
            data[prop+"2"] = newdata[prop];
        } else {
            // Adding property to data
            data[prop] = newdata[prop];
        }
    }
}

/*
 * Logging function. The parameter should be a string, which will be logged.
 * Events are logged to logs/log.txt
 * Adrin made changes to this function
 * title - main log message
 * data - an object containing source and other info if needed
 * bool_verbose - true => geogebra + robot status info is included in each log call
 */
 function log(title, data, bool_verbose, callback) {
    try {
        if(bool_verbose === undefined) {
            bool_verbose = true;//default
        }

        //this sets the global variable GEOGEBRA_STATUS_STRING
        //!!!ONLY CALL IT IF THE data IS COMING FROM THE MOBILE SIDE ITSELF
        // if(data && !(data.hasOwnProperty("geo_status"))) {
        //     getGeogebraStatus();
        // }

        // if(data && !(data.initial)) {
        //     getGeogebraStatus();
        // }

        console.dir("log callback : " + callback);

        if(callback) {
            callback(function(title, data, bool_verbose) {
                /*var logString = ">>> {0} | {1}:{2}h - {3}/{4}/{5}%5Cn".format(title, 
                                                                  APP.currentDate.getHours(), APP.currentDate.getMinutes(), 
                                                                  APP.currentDate.getMonth()+1, APP.currentDate.getDate(), APP.currentDate.getFullYear());*/
        
                //Doing this for formatting reasons where it becomes easy to include commas in the text file without creating a new column.
                if(title) {
                    title = title.replace(/"/g, "'");//replacing all double quotes with single quotes.
                    console.dir("##### title");
                }

                var timeStamp = new Date();
                
                var logString = "%5Cn{0}/{1}/{2} - {3}:{4}:{5}".format(timeStamp.getMonth()+1, timeStamp.getDate(), timeStamp.getFullYear(),
                                                                    timeStamp.getHours(), timeStamp.getMinutes(), timeStamp.getSeconds());

                if(bool_verbose) {
                    if(data !== undefined) {
                        // logString += "    {0}%5Cn".format(data);
                        // logString += ",\"{0}\"".format(data.source);
                    }
                    else {
                        // logString += "%5Cn";
                        // logString += ",\"{0}\"".format("NOT DEFINED");
                        data = {"type":"", "parameter":"", "initial":"", "final":""};
                    }

                    //Getting source
                    var logSource = (data && data.source) ? data.source : "NOT DEFINED";
                    logSource = logSource.replace(/"/g, "'");
                    console.dir("##### logSource");

                    //Getting geogebra status; geo_status would only be there for data coming from cartesian side.
                    var geogebra_status = (data && data.geo_status && data.geo_status.string) ? data.geo_status.string : GEOGEBRA_STATUS_STRING;
                    console.dir("data" + JSON.stringify(data));
                    console.dir("geogebra_status" + geogebra_status);
                    geogebra_status = geogebra_status.replace(/"/g, "'");
                    console.dir("##### geogebra_status");

                    // logString += "," + geogebra_status;

                    var nextButtonStatusString = "next button " + (GBL_BOOL_NEXT_BUTTON_ENABLED ? "enabled" : "disabled");
                    // var nextButtonStatusString = "next button " + (($("#next-problem-button").css("opacity") == 1) ? "enabled" : "disabled");
                    var listOfSteps = APP.currentStepsList;
                    
                    // (title ‘problem 1 plot P2’; next button disabled; no steps;)
                    // logString += ",problem {0},(title '{1}' {2} {3})".format((APP.currentProblemIndex + 1), APP.PROBLEMS[APP.currentProblemIndex].text, title);
                    
                    var userStatus = "problem " + (APP.currentProblemIndex + 1) + ":" +
                                "(title " + APP.PROBLEMS[APP.currentProblemIndex].text + ":" + 
                                nextButtonStatusString + ":" +
                                /*(listOfSteps ? JSON.stringify(listOfSteps) : [].toString()) +*/ 
                                (listOfSteps ? listOfSteps.length : 0) + ":)";
                    
                    userStatus = userStatus.replace(/"/g, "'");
                    console.dir("##### userStatus");

                    if(title) {
                        logString += ",\"" + title + "\"";
                    }

                    var initialState = (data.hasOwnProperty("initial") || data.initial) ? data.initial : APP.GEOGEBRA_STATUS_STRING;
                    var finalState = (data.hasOwnProperty("final") || data.final) ? data.final : initialState;
                    var problemNumber = (data.hasOwnProperty("problem number") || data["problem number"]) ? data["problem number"] : (APP.currentProblemIndex+1);
                    var problemDesc = (data.hasOwnProperty("problem desc") || data["problem desc"]) ? data["problem desc"] : (APP.PROBLEMS[APP.currentProblemIndex].text);
                    var problemId = (data.hasOwnProperty("problem id") || data["problem id"]) ? data["problem id"] : (APP.PROBLEMS[APP.currentProblemIndex].id);
                    
                    logString += ",\"" + data.type + "\""
                            + ",\"" + data.parameter + "\""
                            + ",\"" + initialState + "\""
                            + ",\"" + finalState + "\""
                            + ",\"" + problemNumber + "\""
                            + ",\"" + problemDesc + "\""
                            + ",\"" + problemId + "\"";
                            // ",\"" + logSource + "\"" + 
                            // ",\"" + geogebra_status + "\"" +
                            // ",\"" + userStatus + "\"";
                }
                else {
                    logString += ",\"" + title + "\"";
                }

                // Logging in server
                $.ajax({
                    url: APP.LOG + "?data=" + logString,
                    success: function(data) {
                        console.dir("Event '" + title + "' LOGGED!");
                    }
                });
            }, title, data, bool_verbose);
        }
        else {
            /*var logString = ">>> {0} | {1}:{2}h - {3}/{4}/{5}%5Cn".format(title, 
                                                                  APP.currentDate.getHours(), APP.currentDate.getMinutes(), 
                                                                  APP.currentDate.getMonth()+1, APP.currentDate.getDate(), APP.currentDate.getFullYear());*/
        
            //Doing this for formatting reasons where it becomes easy to include commas in the text file without creating a new column.
            if(title) {
                title = title.replace(/"/g, "'");//replacing all double quotes with single quotes.
                console.dir("##### title");
            }

            var timeStamp = new Date();
            
            var logString = "%5Cn{0}/{1}/{2} - {3}:{4}:{5}".format(timeStamp.getMonth()+1, timeStamp.getDate(), timeStamp.getFullYear(),
                                                                timeStamp.getHours(), timeStamp.getMinutes(), timeStamp.getSeconds());

            if(bool_verbose) {
                if(data !== undefined) {
                    // logString += "    {0}%5Cn".format(data);
                    // logString += ",\"{0}\"".format(data.source);
                }
                else {
                    // logString += "%5Cn";
                    // logString += ",\"{0}\"".format("NOT DEFINED");
                    data = {"type":"", "parameter":"", "initial":"", "final":""};
                }

                //Getting source
                var logSource = (data && data.source) ? data.source : "NOT DEFINED";
                logSource = logSource.replace(/"/g, "'");
                console.dir("##### logSource");

                //Getting geogebra status; geo_status would only be there for data coming from cartesian side.
                var geogebra_status = (data && data.geo_status && data.geo_status.string) ? data.geo_status.string : GEOGEBRA_STATUS_STRING;
                console.dir("data" + JSON.stringify(data));
                console.dir("geogebra_status" + geogebra_status);
                geogebra_status = geogebra_status.replace(/"/g, "'");
                console.dir("##### geogebra_status");

                // logString += "," + geogebra_status;

                var nextButtonStatusString = "next button " + (GBL_BOOL_NEXT_BUTTON_ENABLED ? "enabled" : "disabled");
                // var nextButtonStatusString = "next button " + (($("#next-problem-button").css("opacity") == 1) ? "enabled" : "disabled");
                var listOfSteps = APP.currentStepsList;
                
                // (title ‘problem 1 plot P2’; next button disabled; no steps;)
                // logString += ",problem {0},(title '{1}' {2} {3})".format((APP.currentProblemIndex + 1), APP.PROBLEMS[APP.currentProblemIndex].text, title);
                
                var userStatus = "problem " + (APP.currentProblemIndex + 1) + ":" +
                            "(title " + APP.PROBLEMS[APP.currentProblemIndex].text + ":" + 
                            nextButtonStatusString + ":" +
                            /*(listOfSteps ? JSON.stringify(listOfSteps) : [].toString()) +*/ 
                            (listOfSteps ? listOfSteps.length : 0) + ":)";
                
                userStatus = userStatus.replace(/"/g, "'");
                console.dir("##### userStatus");

                if(title) {
                    logString += ",\"" + title + "\"";
                }

                var initialState = (data.hasOwnProperty("initial") || data.initial) ? data.initial : APP.GEOGEBRA_STATUS_STRING;
                var finalState = (data.hasOwnProperty("final") || data.final) ? data.final : initialState;
                var problemNumber = (data.hasOwnProperty("problem number") || data["problem number"]) ? data["problem number"] : (APP.currentProblemIndex+1);
                var problemDesc = (data.hasOwnProperty("problem desc") || data["problem desc"]) ? data["problem desc"] : (APP.PROBLEMS[APP.currentProblemIndex].text);
                var problemId = (data.hasOwnProperty("problem id") || data["problem id"]) ? data["problem id"] : (APP.PROBLEMS[APP.currentProblemIndex].id);
                
                logString += ",\"" + data.type + "\""
                        + ",\"" + data.parameter + "\""
                        + ",\"" + initialState + "\""
                        + ",\"" + finalState + "\""
                        + ",\"" + problemNumber + "\""
                        + ",\"" + problemDesc + "\""
                        + ",\"" + problemId + "\"";
                        // ",\"" + logSource + "\"" + 
                        // ",\"" + geogebra_status + "\"" +
                        // ",\"" + userStatus + "\"";
            }
            else {
                logString += ",\"" + title + "\"";
            }

            // Logging in server
            $.ajax({
                url: APP.LOG + "?data=" + logString,
                success: function(data) {
                    console.dir("Event '" + title + "' LOGGED!");
                }
            });
        }
    }
    catch(e) {
        console.dir("log function failed!!! : " + e.toString());
    }
 }

//Gets the status of the cartesian plane.
function getGeogebraStatus(onSuccessCallback, title, data, bool_verbose) {
    // Logging in server
    $.ajax({
        url: APP.GEOGEBRA_STATUS + "?data=" + JSON.stringify({"type":"geogebrastatus"}),
        async: false,
        success: function() {
            console.dir("Calling getGeogebraStatus.....");
            // console.dir(onSuccessCallback);
            onSuccessCallback(title, data, bool_verbose);
        }
    });
}

/*
Adrin added this function to "calculate" the initial state of the cartesian plane, since the callback for getGeogebraStatus was not working
*/
function calculateInitialStateOnLoad() {
    var stateString = "R,0,0,0";
    var pointsListArray = APP.PROBLEMS[APP.currentProblemIndex].points;

    for(var i = 0 ; i < pointsListArray.length ; i++) {
        var currPointObj = pointsListArray[i]
        stateString += ":" + currPointObj.name + "," + currPointObj.x + "," + currPointObj.y;
    }

    return stateString;
}

/*
 * Method for formatting strings. 
 * Posted by "fearphage" on: http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436
 */
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

if (!String.prototype.trim) {
   String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
}

/* 
 * Checks if a string is a number.
 * Based on: http://stackoverflow.com/a/1421988/1335568
 */
function isNumber (o) {
  return ! isNaN (o-0) && o != null && o.trim() != "";
}

/*
 * Checks if a string is a valid point name
 */
function isPoint(p){
    return p != null && p[0] === 'P' && isNumber(p.substring(1))
}