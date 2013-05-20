var STEPS_LIST = {};

STEPS_LIST.init = function(){
    setDraggable($(".draggable"));
    setDroppable($(".droppable"));
}

function updateCurrentProcedureStepsList(){
    var selectedProcedure = $("#current-procedure option:selected").val();
    $.ajax({
        url: APP.GET_PROCEDURE_STEPS + "?name=" + selectedProcedure,
        success: function(data) {
            var object = JSON.parse(data);
            addStepsToListView(object);
            APP.currentStepsList = object;
            console.dir(APP.currentStepsList);
        }
    });
}

function addStepsToListView(data){
    var droppable = $("#steps-list .droppable:first-child");
    var stepsList = $("#steps-list");
    // Clearing list
    stepsList.html(droppable);
    // The droppable has to be reset
    setDroppable(droppable);
    $.each(data, function(index, value){
        // Creating new Item
        var newItem = createStepItem(value.name);
        // Adding handler to draggable and setting it as draggable
        var span = $("<span>");
        newItem.prepend(span);
        setDraggable(newItem);
        span.bind("touchstart", function(e) { e.preventDefault(); });
        // Adding it to the list
        stepsList.append(newItem);
        // Creating the new droppable and appending it
        var newDroppable = droppable.clone();
        setDroppable(newDroppable);
        stepsList.append(newDroppable);
    });
}

function stopDropped(event, ui){
    // Retrieving drop target
    var dropTarget = $(event.target);
    // Retrieving current step's inner html
    var currentStepHTML = ui.draggable.html();
    if(ui.draggable.is("div")){
        // Inserting new Step
        insertNewStep(dropTarget, currentStepHTML);
    } else {
        // Reordering steps
        moveStep(dropTarget, ui.draggable);
    }
}

/*
 * Function used to move a step (reorderListItem) into a new position in the list (dropTarget)
 */
function moveStep(dropTarget, reorderListItem){
    var dropIndex = dropTarget.index("#steps-list .droppable");
    var dragIndex = reorderListItem.index("#steps-list .draggable");
    // Checking if item is being dropped into a different position
    if(dropTarget[0] !== reorderListItem.prev()[0] &&
       dropTarget[0] !== reorderListItem.next()[0]){
        dropTarget.before(reorderListItem.prev());
        dropTarget.before(reorderListItem);
    }
    // TODO reorder object list
    if(dropIndex < dragIndex || dropIndex > dragIndex+1){
        // Removing the object from the list
        var movedObject = APP.currentStepsList.splice(dragIndex, 1)[0];
        // The element should be inserted in the position
        // of the draggable that precedes the used droppable.
        // If the droppable was the first one (which doesn't have
        // a predecessor), the first draggable position of the
        // list will be used.
        var targetIndex = dropIndex == 0 ? 0 : dropIndex - 1;        
        // inserting it in the correct position
        APP.currentStepsList.splice(targetIndex, 0, movedObject);
        // Update list in db
        updateStepsListInDB();
    }
    console.dir(APP.currentStepsList);
}

/*
 * Function used to insert a new step in the position of a droppable
 */
function insertNewStep(dropTarget, newStepHTML){
    var index = dropTarget.index('#steps-list .droppable');
    console.dir(); // Getting index of element
    // Cloning drop zones
    var preDrop = dropTarget.clone();
    var postDrop = dropTarget.clone();
    // Setting them as droppables
    setDroppable(preDrop);
    setDroppable(postDrop);
    // Inserting them before and after the new item
    dropTarget.before(preDrop);
    dropTarget.after(postDrop);
    // Creating new item
    var newListItem = createStepItem(newStepHTML);
    // Replacing old item with new
    dropTarget.replaceWith(newListItem);
    setDraggable(newListItem);
    // Insert into object list
    APP.currentStepsList.splice(index, 0, APP.currentStep);
    console.dir(APP.currentStepsList);
    // Clearing current step
    var currentStepElement = $("#current-step");
    currentStepElement.empty();
    currentStepElement.draggable("disable");
    // Update list in db
    updateStepsListInDB();
}

function updateStepsListInDB(){
    var selectedProcedure = $("#current-procedure option:selected").val();
    var steps = JSON.stringify(APP.currentStepsList)
    steps = steps.substr(1, steps.length-2);
    //COMM.sendToApplet(steps);
    /*var queryString = "?name=" + selectedProcedure + "&steps=" + steps;
    $.ajax({
        url: APP.UPDATE_PROCEDURE_STEPS + queryString,
        success: function(data) {
            console.dir("Procedure " + selectedProcedure + " steps updated in DB");
        }
    });*/
    // Logging
    log("Updated steps list in DB", steps);
}

function addDeleteButton(item){
    var deleteImg = $("<div>", {
        "class": APP.DELETE_IMAGE_CLASS
    });
    deleteImg.click(deleteStep);
    item.append(deleteImg);
}

function createStepItem(value){
    var newItem = $("<li>", {"class": "draggable"}).html(value);
    // Adding the delete button the the list item
    addDeleteButton(newItem);
    if(STEPS.isInDragMode()){
        newItem.addClass("drag");
    }
    return newItem;
}

/*
 * Function used to delete a step
 */
function deleteStep(e){
    if(confirm("Are you sure you want to delete this step?")){
        var draggable = $(e.target).parent()
        var index = draggable.index('#steps-list .draggable');
        draggable.prev().remove(); // Remove previous droppable
        draggable.remove(); // Remove item from list
        // TODO Remove from steps list
        var deleted = APP.currentStepsList.splice(index, 1);
        var deletedObject = JSON.stringify(deleted);
        console.dir("Deleted object: " + deletedObject);    
        console.dir(APP.currentStepsList);
        // Update list in db
        updateStepsListInDB();
        // Logging
        log("Deleted step from list", deletedObject);
    }
}