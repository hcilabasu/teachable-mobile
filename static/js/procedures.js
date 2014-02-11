var PROCEDURES = {};

PROCEDURES.init = function(){
    // Setting dialogs
    APP.newProcedureDialog = $("#create-procedure-dialog");
    setDialog(APP.newProcedureDialog)
    APP.newProcedureDialog.bind('dialogclose', resetProcedureDialog);
    APP.paramsHiddenInput = $("#params-hidden-input");

    // Setting action listeners
    $("#new-procedure-button").click(openCreateNewProcedureDialog);
    $("#create-new-procedure-button").click(createNewProcedure);
    $("#delete-procedure-button").click(deleteProcedure);
    $("#current-procedure").change(updateCurrentProcedureStepsList);

    // Setting listeners for param-num form
    $("#increment-param-num").click(addNewParam);
    $("#decrement-param-num").click(removeParam);
}

/**************************
 * Params form functions
 **************************/

function addNewParam(){
    if(APP.paramsCounter < APP.MAXIMUM_PARAMS){
        // Incrementing counter
        APP.paramsCounter++;
        console.dir(APP.paramsCounter + " parameters");
        // Appending new input
        var newInput = $("<input>", {
            type : "text",
            placeholder : "Parameter " + APP.paramsCounter + " name"
        });
        newInput.keyup(function(){
            updateHiddenField();
        });
        $("#param-inputs-wrapper").append(newInput);
        // Updating the counter at the view
        updateViewCounter();
        updateHiddenField();
    }
}

function removeParam(){
    if(APP.paramsCounter > 0){
        // Decrementing counter
        APP.paramsCounter--;
        console.dir(APP.paramsCounter + " parameters");
        // Removing last input
        $("#param-inputs-wrapper > input:last-child").remove();
        // Updating the counter at the view
        updateViewCounter();
        updateHiddenField();
    }
}

function updateViewCounter(){
    $("#param-num-counter").text(APP.paramsCounter);
}

function updateHiddenField(){
    var text = "";
    var inputs = $("#param-inputs-wrapper input[type=text]");
    // Iterating through params text fields
    $.each(inputs, function(index, element){
        // The each function returns the HTML element (non jquery).
        // Therefore, we need to use the value attribute to get its value.
        text += element.value;
        if(index < inputs.length-1){
            text += ",";
        }
    });
    APP.paramsHiddenInput.val(text);
    console.dir(APP.paramsHiddenInput.val());
    if(isParamsFieldValid()){
        return true;
    } else {
        return false;
    }
}

function isParamsFieldValid(){
    var text = APP.paramsHiddenInput.val();
    // Checks if the params field is made of only characters (at least one) separated by a comma.
    if(/^(\w+(,\w+)*)$/.test(text) || (text === "" && APP.paramsCounter === 0)){
        return true;
    } else {
        return false;
    }
}

/**************************
 * Procedure CRUD functions
 **************************/

function resetProcedureDialog(event, ui){
    APP.paramsCounter = 0;
    updateViewCounter();
    $("#param-inputs-wrapper").empty();
    updateHiddenField();
}

function openCreateNewProcedureDialog(event){
    event.preventDefault();
    APP.newProcedureDialog.dialog("open");
}

function createNewProcedure(event){
    if(isParamsFieldValid()){
        ajax(APP.ADD_PROCEDURE, ['name', 'trigger', 'parameters'], ":eval");
    } else {
        $.each($("#param-inputs-wrapper input[type=text]"), function(index, element){
            if(element.value.trim() === ""){
                toggleError($(element), "background-color", "#feb6b9", "white");
            }
        });
    }
    return false;
}

function errorCreateNewProcedure(errorNamesMessages){
    // Iterating over labels
    $.each(errorNamesMessages, function(k, v){
        // Obtaining label
        var label = $("label[for='" + k + "']", $("#create-procedure-form"));
        // Coloring it red
        toggleError(label, "color", "red", "black");
    });   
}

function successCreateNewProcedure(procedureName){
    // Updating procedures list
    $("#current-procedure").append($("<option>", {
        value: procedureName
    }).text(procedureName));
    // Closing dialog
    APP.newProcedureDialog.dialog("close");
    // Clearing values
    $("#create-procedure-form")[0].reset();
}

function deleteProcedure(event){
    ajax(APP.DELETE_PROCEDURE, ['current_procedure'], ":eval");
}

function successDeleteProcedure(procedureName){
    $(":selected", $("#current-procedure")).remove();
}

