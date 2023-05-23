// Main Variables
let video = document.getElementById('video');
let durationTime;
let currentTime;
let videoHalfWay;
let SD = window.parent;
let runHalfOnce = false;

// xAPI variables
let email = "admin@learningdojo.net";
let name = "Sammy McGee";
let verb = "";
let objectDesc = "";
let alertMsg = document.getElementById("alertMsg");

// Video variables
video.src = "https://player.vimeo.com/video/"+videoID+"?title=0&byline=0&portrait=0";

let iframe = document.querySelector('iframe');
let player = new Vimeo.Player(iframe);

// Page Ready
$(document).ready(function(){
    if(xAPIReporting){
        $('#userInfo').modal("show");
    };

    // Initialized verb
    if(xAPIReporting){
        sendBasicStatement("http://adlnet.gov/expapi/verbs/initialized", "initialized", objectName, "User was able to initialize "+ objectName +" video.")
    }

});

// Update text
function updateLabels(){
    videoTitle.innerHTML = title;
    videoDesc.innerHTML = description;
    copyright.innerHTML = copyrightText;
    profile.src = profilePic;
}

// Video events
player.on('play', function(data){
    // console.log(data.duration);
    durationTime = Math.round(data.duration);
    videoHalfWay = Math.round(durationTime/2);

    if(xAPIReporting){
        sendBasicStatement("https://w3id.org/xapi/video/verbs/played", "played", objectName, "User was able to start "+ objectName +" video.");
    };

});

player.on('pause', function(data){
    if(xAPIReporting){
        sendBasicStatement("https://w3id.org/xapi/video/verbs/paused", "paused", objectName + " at " + currentTime + " seconds.", "User paused the " + objectName + " video.");
    }
});

player.on('ended', function(data){
    setCompletion();
});

player.on('timeupdate', function(data){
    // Round current time
    currentTime = Math.round(data.seconds);
    // Half way
    if(currentTime == videoHalfWay){
        if(!runHalfOnce){
            if(xAPIReporting){
                sendBasicStatement("http://id.tincanapi.com/verb/viewed", "viewed", "half of " + objectName, "User was able to complete half of "+ objectName +" video.");
            }
            runHalfOnce = true;
        }
    }
});

// Set Video Completion
function setCompletion(){
    // SCORM Reporting
    if(scormReporting){
        SD.SetScore(100, 100, 0);
	    SD.SetPassed();
    }

    // xAPI Wrapper
    if(xAPIReporting){
        sendBasicStatement("http://adlnet.gov/expapi/verbs/initialized", "completed", objectName, "The user completed the "+ objectName +" video.");
    } 
}

// Save user details
function saveName(){
	name = document.getElementById('nameEntered').value;
	console.log(name);
}

function saveEmail(){
	email = document.getElementById('userEmail').value;
	console.log(email)
}

$('#userInfo').on('shown.bs.modal', function (e) {
    player.pause();
});

$('#userInfo').on('hidden.bs.modal', function (e) {
    player.play();
});

function saveUserInfo(){
    if(name != "" && email != ""){
        $('#userInfo').modal("hide");
    } else{
        alertMsg.classList.remove('d-none');
    }
}

// xAPI Basic Statement
function sendBasicStatement(verbID, verb, objectName, objectDesc){
    let statement = {
		"actor": {
			"mbox": "mailto:"+email,  
			"name": name,  
			"objectType": "Agent"  
		},
		"verb": {
			"id": verbID,
			"display": {
				"en-US": verb
			}
		},
		"object": {
			"id": objectID,
			"definition": {
				"name": {
					"en-US": objectName
				},
				"description": {
					"en-US": objectDesc
				}
			},
			"objectType": "Activity"
		}
	};
	ADL.XAPIWrapper.sendStatement(statement);
}