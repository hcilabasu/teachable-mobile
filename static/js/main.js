/*
 * TODO Some naming conventions should be used for functions that are used as callbacks to other functions, and data from 
 * HTML inputs should be retrieved only inside entry-point functions (haven't quite decided on 'entry-point' definition. Maybe 
 * functions that are called directly AND as response to events?). Once this is done, I believe that the maintainability would 
 * greatly increase, and bugs would be more easily found.
 *
 * Growing pains with Javascript, right? :)
 */
// Defining global vars
var APP = {};

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
    // if(element.hasOwnProperty("dialog")) {
        element.dialog({
            autoOpen: false,
            height: 'auto',
            width: '270px',
            modal: true,
            draggable: false,
            resizable: false,
            focusSelector: undefined
        });
    // }
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

//A function to store the session information in a Global Variable!!! That's bad.
function storeTestSessionInformation(data) {
    TEST_SESSION_JSON = JSON.parse(data);
}

function isClickButtonVisible(){
    return $("#manual-click").css("display") === "block";
}

function clickButtonPromptStarted(){
    // Setting click action and label
    $("#manual-click a").css('background', 'red').off().text("Record").click(clickButtonRecordStarted);
};

function clickButtonRecordStarted(e){
    $("#manual-click a").off().text("Stop").click(clickButtonRecordFinished);
}

function clickButtonRecordFinished(e){
    $("#manual-click a").off().text("Done").click(clickButtonSetClickAction);
}

function clickButtonSetClickAction(e){
    $("#manual-click a").css('background', 'none').off().text("Click").click(clickButtonOpenDialog);   
    // Sending message to the robot to dismiss the prompt subtitles
    $.ajax({
        url: APP.DISMISS_PROMPT
    });
}

function clickButtonOpenDialog(e){
    e.preventDefault();
    // {trigger: "robot"}
    olddata = {trigger:"all"};
    updateCurrentStep();
    counter = 1;
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