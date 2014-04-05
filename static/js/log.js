var TEST_SESSION_JSON;

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

/*
* Logging function. The parameter should be a string, which will be logged.
* Events are logged to logs/log.csv
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

	    var URLString = "";

	    try {
	    	URLString = APP.LOG;
	    }
	    catch(e) {
	    	console.dir("APP.LOG is not defined");
	    	URLString = LOG;
	    }

	    // if(APP && APP.LOG) {
	    	// URLString = APP.LOG
	    // }
	    // else {
	    	// URLString = LOG;
	    // }

	    //this sets the global variable GEOGEBRA_STATUS_STRING
	    //!!!ONLY CALL IT IF THE data IS COMING FROM THE MOBILE SIDE ITSELF
	    // if(data && !(data.hasOwnProperty("geo_status"))) {
	    //     getGeogebraStatus();
	    // }

	    // if(data && !(data.initial)) {
	    //     getGeogebraStatus();
	    // }

	    //Getting testing session information
	    // var datum;
	    // var cndName;
	    // var str = jQuery.getJSON("../session/current_session", function(datum) {console.dir("DATA!!!" + datum)});
	    // console.dir("Data!!!" + JSON.stringify(datum));
	    // var str = JSON.parse(JSON.parse(jQuery.getJSON("../session/current_session").responseText));//need to parse twice
	    // console.dir(str);

	    if(data.firstPrint) {
	        //Doing this for formatting reasons where it becomes easy to include commas in the text file without creating a new column.
	        if(title) {
	            title = title.replace(/"/g, "'");//replacing all double quotes with single quotes.
	            console.dir("##### title");
	        }

	        var titleArray = title.split(',');
	        var logString = "%5Cn" + titleArray[0];
	        for(var i = 1 ; i < titleArray.length ; i++) {
	        	logString += "," + titleArray[i];
	        }


	        // Logging in server
	        $.ajax({
	            url: URLString + "?data=" + logString,
	            success: function(data) {
	                console.dir("Event '" + title + "' LOGGED!");
	            },
	            async: false
	        });

	        return;
	    }
		
		if(!TEST_SESSION_JSON) {
	    	//Interesting note, doing var TEST_SESSION_JSON = ... will create another local variable of the same name and it'll be undefined, so the flow will always enter this block.
	    	//Don't do var, this'll mean you're looking up the global variable (yuck! global variables!!)
	    	TEST_SESSION_JSON = {"subject_id" : "", "tester_name" : "", "condition_name" : ""};
	    }

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
	                // var geogebra_status = (data && data.geo_status && data.geo_status.string) ? data.geo_status.string : GEOGEBRA_STATUS_STRING;
	                console.dir("data" + JSON.stringify(data));
	                // console.dir("geogebra_status" + geogebra_status);
	                // geogebra_status = geogebra_status.replace(/"/g, "'");
	                // console.dir("##### geogebra_status");

	                // logString += "," + geogebra_status;

	                // var nextButtonStatusString = "next button " + (GBL_BOOL_NEXT_BUTTON_ENABLED ? "enabled" : "disabled");
	                // var nextButtonStatusString = "next button " + (($("#next-problem-button").css("opacity") == 1) ? "enabled" : "disabled");
	                // var listOfSteps = APP.currentStepsList;
	                
	                // (title ‘problem 1 plot P2’; next button disabled; no steps;)
	                // logString += ",problem {0},(title '{1}' {2} {3})".format((APP.currentProblemIndex + 1), APP.PROBLEMS[APP.currentProblemIndex].text, title);
	                
	                // var userStatus = "problem " + (APP.currentProblemIndex + 1) + ":" +
	                            // "(title " + APP.PROBLEMS[APP.currentProblemIndex].text + ":" + 
	                            // nextButtonStatusString + ":" +
	                            /*(listOfSteps ? JSON.stringify(listOfSteps) : [].toString()) +*/ 
	                            // (listOfSteps ? listOfSteps.length : 0) + ":)";
	                
	                // userStatus = userStatus.replace(/"/g, "'");
	                // console.dir("##### userStatus");

	                if(title) {
	                    logString += ",\"" + title + "\"";
	                }

	                if(data.type) {
	                	data.type = data.type.replace(/"/g, "'");//replacing all double quotes with single quotes.
	                }

	                if(data.parameter) {
                		data.parameter = data.parameter.replace(/"/g, "'");//replacing all double quotes with single quotes.
                	}

	                // var initialState = (data.hasOwnProperty("initial") || data.initial) ? data.initial : APP.GEOGEBRA_STATUS_STRING;
	                var initialState = (data.hasOwnProperty("initial") || data.initial) ? data.initial : "";
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
	                        + ",\"" + problemId + "\""
	                        + ",\"" + TEST_SESSION_JSON.subject_id + "\""
	                        + ",\"" + TEST_SESSION_JSON.tester_name + "\""
	                        + ",\"" + TEST_SESSION_JSON.condition_name + "\"";
	                        // ",\"" + logSource + "\"" + 
	                        // ",\"" + geogebra_status + "\"" +
	                        // ",\"" + userStatus + "\"";
	            }
	            else {
	                logString += ",\"" + title + "\"";
	            }

	            // Logging in server
	            $.ajax({
	                url: URLString + "?data=" + logString,
	                success: function(data) {
	                    console.dir("Event '" + title + "' LOGGED!");
	                },
	                async: false
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
	            // var geogebra_status = (data && data.geo_status && data.geo_status.string) ? data.geo_status.string : GEOGEBRA_STATUS_STRING;
	            console.dir("data" + JSON.stringify(data));
	            // console.dir("geogebra_status" + geogebra_status);
	            // geogebra_status = geogebra_status.replace(/"/g, "'");
	            // console.dir("##### geogebra_status");

	            // logString += "," + geogebra_status;

	            // var nextButtonStatusString = "next button " + (GBL_BOOL_NEXT_BUTTON_ENABLED ? "enabled" : "disabled");
	            // var nextButtonStatusString = "next button " + (($("#next-problem-button").css("opacity") == 1) ? "enabled" : "disabled");
	            // var listOfSteps = APP.currentStepsList;
	            
	            // (title ‘problem 1 plot P2’; next button disabled; no steps;)
	            // logString += ",problem {0},(title '{1}' {2} {3})".format((APP.currentProblemIndex + 1), APP.PROBLEMS[APP.currentProblemIndex].text, title);
	            
	            // var userStatus = "problem " + (APP.currentProblemIndex + 1) + ":" +
	                        // "(title " + APP.PROBLEMS[APP.currentProblemIndex].text + ":" + 
	                        // nextButtonStatusString + ":" +
	                        /*(listOfSteps ? JSON.stringify(listOfSteps) : [].toString()) +*/ 
	                        // (listOfSteps ? listOfSteps.length : 0) + ":)";
	            
	            // userStatus = userStatus.replace(/"/g, "'");
	            // console.dir("##### userStatus");

	            if(title) {
	                logString += ",\"" + title + "\"";
	            }

	            if(data.type) {
                	data.type = data.type.replace(/"/g, "'");//replacing all double quotes with single quotes.
                }

                if(data.parameter) {
                	data.parameter = data.parameter.replace(/"/g, "'");//replacing all double quotes with single quotes.
                }

	            // var initialState = (data.hasOwnProperty("initial") || data.initial) ? data.initial : APP.GEOGEBRA_STATUS_STRING;
	            var initialState = (data.hasOwnProperty("initial") || data.initial) ? data.initial : "";
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
	                    + ",\"" + problemId + "\""
	                    + ",\"" + TEST_SESSION_JSON.subject_id + "\""
	                    + ",\"" + TEST_SESSION_JSON.tester_name + "\""
	                    + ",\"" + TEST_SESSION_JSON.condition_name + "\"";
	                    // ",\"" + logSource + "\"" + 
	                    // ",\"" + geogebra_status + "\"" +
	                    // ",\"" + userStatus + "\"";
	        }
	        else {
	            logString += ",\"" + title + "\"";
	        }

	        // Logging in server
	        $.ajax({
	            url: URLString + "?data=" + logString,
	            success: function(data) {
	                console.dir("Event '" + title + "' LOGGED!");
	            },
				async: false
	        });
	    }
	}
	catch(e) {
	    console.dir("log function failed!!! : " + e.toString());
	}
}