// Copyright 1998-2019 Epic Games, Inc. All Rights Reserved.


function toggleSidebar(Open) 
{
	//Changed this function to open and close on defined instead of toggling
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
	document.getElementById("sidebarCollapse").classList.toggle('active'); // Added to make Toggle button stay active
}

function setVisualization(id) {
    let descriptor = {
        Visualization: id
    };
    emitUIInteraction(descriptor);
    console.log(descriptor);
}

function setBandwidthCap(cap) {
    capBpsCmd = 'Encoder.MaxBitrate ' + cap;
    let descriptor = {
        Console: capBpsCmd
    }
    capStr = cap != 0 ? cap : 'Unlimited';
    document.getElementById('bandwidthCapDropdown').innerHTML = 'Bandwidth Cap (' + capStr + ' Mbps)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    emitUIInteraction(descriptor);
    console.log(descriptor);
}

function setFramerateCap(cap) {
    capFpsCmd = 't.maxFPS ' + cap;
    let descriptor = {
        Console: capFpsCmd
    }
    capStr = cap != 0 ? cap : 'Unlimited';
    document.getElementById('framerateCapDropdown').innerHTML = 'Framerate Cap (' + capStr + ' fps)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    emitUIInteraction(descriptor);
    console.log(descriptor);
}

function zoom() {
    let descriptor = {
        zoom: 1
    };
    emitUIInteraction(descriptor);
    console.log(descriptor);
}

function onCharacterButton(category, item) {
    let descriptor = {
        Category: category,
        Item: item
    };
    emitUIInteraction(descriptor);
    console.log(descriptor);
}

function setRes(width, height) {
    let descriptor = {
        Console: 'r.' + 'setres ' + width + 'x' + height + 'f'
    };
    emitUIInteraction(descriptor);
    console.log(descriptor);
	
	if (height==1080){
		document.getElementById("1080p").classList.add("active");
		document.getElementById("720p").classList.remove("active");
	}
	else{
		document.getElementById("720p").classList.add("active");
		document.getElementById("1080p").classList.remove("active");
		}
}

function onConfigurationOne() {
    let descriptor = {
		Category: 0,
		Item: 3
	};
    emitUIInteraction(descriptor);
    console.log(descriptor);
}

function onConfigurationTwo() {
	let descriptor = {
	    Category: 1,
	    Item: 4
	};
	emitUIInteraction(descriptor);
}

// function myHandleResponseFunction(data) {
	// if (data.substring("1080p")) {
		// // UE4 only supports up to 1080p, not 4K.
		// console.log("Disabling 4k button");
		// let button4K = document.getElementById("4k");
		// button4K.disabled = true;
		// button4K.title = "4K is supported only when -NvEncH264ConfigLevel=NV_ENC_LEVEL_H264_52 UE4 is added to UE4 command line";
	// }
// }

var grabStyle = 'cursor: grab; cursor: -moz-grab; cursor: -webkit-grab';   // We will have a browser side grab cursor.
var isFullscreen = false;

function onParagonLoad() {
	styleAdditional = grabStyle;
	inputOptions.controlScheme = ControlSchemeType.HoveringMouse;
	inputOptions.fakeMouseWithTouches = true;
	styleWidth = 700;
	styleHeight = 394;
	console.warn("Application loaded!");

	if (document.addEventListener)
	{
	    document.addEventListener('webkitfullscreenchange', onFullscreenChange, false);
	    document.addEventListener('mozfullscreenchange', onFullscreenChange, false);
	    document.addEventListener('fullscreenchange', onFullscreenChange, false);
	    document.addEventListener('MSFullscreenChange', onFullscreenChange, false);
	}

	let fullscreenCheck = document.getElementById('ck-fullscreen');
	if(fullscreenCheck){
		fullscreenCheck.onclick = function(){
			if (!isFullscreen) {
				enterFullscreen();
			} else {
				exitFullscreen();
			}
		};
	}

	// When the data channel is connected we want to ask UE4 if 4K is supported.
	onDataChannelConnected = function() { emitUIInteraction("4K"); };
	addResponseEventListener("handle_responses", myHandleResponseFunction);
}

function onFullscreenChange(data)
{
	var fullscreenDiv    = document.getElementById("player");
	isFullscreen = (document.webkitIsFullScreen 
		|| document.mozFullScreen 
		|| (document.msFullscreenElement && document.msFullscreenElement !== null) 
		|| (document.fullscreenElement && document.fullscreenElement !== null)
		|| (fullscreenDiv && fullscreenDiv.classList.contains("fullscreen")));

	let fullscreenImg = document.getElementById('fullscreen-img');
	if(fullscreenImg){
		fullscreenImg.src = isFullscreen ? 'images/MinimiseToFullscreen.png' : 'images/MaximiseToFullscreen.png'
		fullscreenImg.alt = isFullscreen ? 'Shrink to normal size' : 'Maximise to Fullscreen'
	}
}

function enterFullscreen()
{
	var fullscreenDiv    = document.getElementById("player");
	var textDivs    = document.getElementsByClassName("text");
	var headerDiv    = document.getElementById("header-tbl");
	var fullscreenFunc   = fullscreenDiv.requestFullscreen;

	if (!fullscreenFunc) {
	  ['mozRequestFullScreen',
	   'msRequestFullscreen',
	   'webkitRequestFullScreen'].forEach(function (req) {
	     fullscreenFunc = fullscreenFunc || fullscreenDiv[req];
	   });
	}

	if(fullscreenFunc){
		fullscreenFunc.call(fullscreenDiv);
	} else {
		//No Fullscreen api so maximise video to window size
		if(fullscreenDiv){
			fullscreenDiv.classList.add("fullscreen");
			fullscreenDiv.classList.remove("fixed-size");
		}

		if(textDivs){
			for(let i=0; i<textDivs.length; i++){
				textDivs[i].style.display = "none";
			}
		}

		if(headerDiv)
			headerDiv.style.display = "none";

		onFullscreenChange({});
		onInPageFullscreen();
	}
}

function exitFullscreen()
{
	var fullscreenDiv    = document.getElementById("player");
	var textDivs    = document.getElementsByClassName("text");
	var headerDiv    = document.getElementById("header-tbl");
	var exitFullscreenFunc   = document.exitFullscreen;

	if (!exitFullscreenFunc) {
	  ['mozCancelFullScreen',
	   'msExitFullscreen',
	   'webkitExitFullscreen'].forEach(function (req) {
	     exitFullscreenFunc = exitFullscreenFunc || document[req];
	   });
	}

	if(exitFullscreenFunc) {
		exitFullscreenFunc.call(document);
	} else {
		//No Fullscreen api so shrink video back from max window size
		if(fullscreenDiv){
			fullscreenDiv.classList.remove("fullscreen");
			fullscreenDiv.classList.add("fixed-size");
			fullscreenDiv.style.left = "";
		}

		if(textDivs){
			for(let i=0; i<textDivs.length; i++){
				textDivs[i].style.display = "block";
			}
		}

		if(headerDiv)
			headerDiv.style.display = "table";

		onFullscreenChange({});
		onInPageFullscreen();
	}
}

function onInPageFullscreen(){
	var playerElement = document.getElementById('player');
	let videoElement = playerElement.getElementsByTagName("VIDEO");
	document.documentElement.style.position = isFullscreen ?  "fixed" : "";
	document.body.style.position =  isFullscreen ?  "fixed" : "";

	if(isFullscreen){
		let windowAspectRatio = window.innerHeight / window.innerWidth;
		let playerAspectRatio = playerElement.clientHeight / playerElement.clientWidth;
		// We want to keep the video ratio correct for the video stream
	    let videoAspectRatio = videoElement.videoHeight / videoElement.videoWidth;

	    if(isNaN(videoAspectRatio)){
	    	//Video is not initialised yet so set playerElement to size of window
	    	styleWidth = window.innerWidth;
	    	styleHeight = window.innerHeight;
	    	styleTop = 0;
	        styleLeft = Math.floor((window.innerWidth - styleWidth) * 0.5);
	        //Video is now 100% of the playerElement so set the playerElement style
	        playerElement.style.width= styleWidth + "px";
	        playerElement.style.height= styleHeight + "px";
	    } else if (windowAspectRatio < playerAspectRatio) {
	        styleWidth = Math.floor(window.innerHeight / videoAspectRatio);
	        styleHeight = window.innerHeight;
	        styleTop = 0;
	        styleLeft = Math.floor((window.innerWidth - styleWidth) * 0.5);
	        //Video is now 100% of the playerElement so set the playerElement style
	        playerElement.style.width= styleWidth + "px";
	        playerElement.style.height= styleHeight + "px";
	    }
	    else {
	        styleWidth = window.innerWidth;
	        styleHeight = Math.floor(window.innerWidth * videoAspectRatio);
	        styleTop = Math.floor((window.innerHeight - styleHeight) * 0.5);
	        styleLeft = 0;
	        //Video is now 100% of the playerElement so set the playerElement style
	        playerElement.style.width= styleWidth + "px";
	        playerElement.style.height= styleHeight + "px";
	    }

	} else {
		playerElement.style.height = "";
		playerElement.style.width = "";
	}
}

//ADDED FUNCTIONS

function onConfigButton(category, item){
    let descriptor = 
	{
        Category: category,
        Item: item
    };
	
	console.log("Emitting from javascript to UE4! - Category: " + category + " Item: " + item);
    emitUIInteraction(descriptor);
}

window.onSliderInput = function (category, e) 
{
	// document.getElementById("SunSliderText").innerHTML = "Sunslider Value: " + document.getElementById("SunSlider").value;
			
	    let descriptor = 
	{
        Category: category,
        Item: e.target.value
    };
	
	console.log("Emitting from javascript to UE4! - Category: " + category);
	emitUIInteraction(descriptor);
}

function updateWebsite() //Receive
{
	    let descriptor = 
	{
        Update: true
    };
	
	console.warn("Update reached .js on load - " + descriptor.Update);
	emitUIInteraction(descriptor);
}

function myHandleResponseFunction(data) //Getting Data from Unreal Engine
{
	console.warn("Response from UE4 rececieved! - " + data);
	
	const obj = JSON.parse(data);
	
	const MainMenu = obj.Settings.MainMenu;
	const GameUI = obj.Settings.GameUI;
	const Day = obj.Settings.Day;
	const SunSliderValue = obj.Settings.SunSlider;
	const Resolution = obj.Settings.Resolution;
	
	//Calling Functions if their values are defined from UE4
	if(typeof MainMenu !== "undefined" && Day !== "undefined"){CheckMainMenu(MainMenu, Day);}
	else if(typeof Day !== "undefined"){CheckDay(Day);}
	
	if(typeof GameUI !== "undefined"){CheckGameUI(GameUI);}
	if(typeof SunSliderValue !== "undefined"){document.getElementById("SunSlider").value = obj.Settings.SunSlider;}
	if(typeof Resolution !== "undefined"){ChangeResolution(Resolution);}
}
function CheckMainMenu(MainMenuOpen, DayValue){
	console.warn("Checking Main Menu!");
		if(MainMenuOpen == "true")
		{
			document.getElementById("ToggleMenu").classList.add("active"); //Adding active style to the Menu Button
			document.getElementById("ToggleGameUI").classList.add("HideButton"); // Hiding the GameUI Button
			document.getElementById("ToggleDay").classList.add("HideButton"); //Hiding the ToggleDay Button
			document.getElementById("SunSlider").style.visibility = "hidden"; //Hiding the SunSlider
			document.getElementById("sidebar").classList.add("active"); // Added to make Toggle button stay active
			
			//Will use these if we want a button for the sidebar instead
			// document.getElementById("sidebarCollapse").classList.add("HideButton"); // Hides/Shows the toggle button
			// document.getElementById("sidebarCollapse").classList.remove("active"); // Added to make Toggle button stay active
		}
		
		else if(MainMenuOpen == "false")
		{
			document.getElementById("ToggleMenu").classList.remove("active"); //Removing the active style to the Menu Button
			document.getElementById("ToggleGameUI").classList.remove("HideButton"); // Showing the GameUI Button
			document.getElementById("ToggleDay").classList.remove("HideButton"); //Showing the ToggleDay Button
			CheckDay(DayValue); //Hiding or showing the Sunslider if it's Day or Night
			document.getElementById("sidebar").classList.remove("active"); // Added to make Toggle button stay active
			
			// document.getElementById("sidebarCollapse").classList.remove("HideButton"); // Added to make Toggle button stay active
		}
}

function CheckGameUI(GameUIOpen)
{
	if(GameUIOpen == "true")
		{
			document.getElementById("ToggleGameUI").classList.add("active");
		}
	else if(GameUIOpen == "false")
		{
			document.getElementById("ToggleGameUI").classList.remove("active");
		}
}

function CheckDay(Day)
{
	console.warn("Checking day!");
	if (Day == "false")
	{
		document.getElementById("SunSlider").style.visibility = "hidden";
		document.getElementById("ToggleDay").classList.add("active");
		document.getElementById("DayText").innerHTML = "Change to Day";
	}
	
	else if  (Day == "true")
	{
		document.getElementById("SunSlider").style.visibility = "visible";
		document.getElementById("ToggleDay").classList.remove("active");
		document.getElementById("DayText").innerHTML = "Change to Night";
	}
}

function ChangeResolution(resolution)
{
	if(resolution == "1080p")
	{
		document.getElementById("1080p").classList.add("active");
		document.getElementById("720p").classList.remove("active");
	}
	
	else if(resolution == "720p")
	{
		document.getElementById("720p").classList.add("active");
		document.getElementById("1080p").classList.remove("active");
	}
}

function CloseAllMenus(){
	document.getElementById("OutsideMenu").classList.remove("collapsing");
	document.getElementById("InsideMenu").classList.remove("collapsing");
}