// Copyright 1998-2019 Epic Games, Inc. All Rights Reserved.

var playerName = "";

var clusterType = "";
var levelType = "";
var unitType = "";
var layoutType = "";
var ag1Type = "";
var ag2Type = "";
var interiorType = "";
var unitID = "";

var gameState = "";

var unitSiteAnalysisData = [];
var unitSiteAnalysisLabels = [];
var MarketingJSON;


var TutorialStep = 0;

var loginModal = document.getElementById("LoginModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

function GetMarketingDataJSON(){
	var url = 'https://raw.githubusercontent.com/cafragachan/custom_html/master/Configurator/MarketingData.json';
	fetch(url)
	.then(res => res.json())
	.then((out) => {
	console.log('Checkout this JSON! ', out);
	MarketingJSON = out;
	})
	.catch(err => { throw err });
}


function parseFile(file, options) {

	var opts = typeof options === 'undefined' ? {} : options;
	var fileSize = file.size;
	var chunkSize = typeof opts['chunk_size'] === 'undefined' ? 24 * 1000 : parseInt(opts['chunk_size']); // bytes
	var binary = typeof opts['binary'] === 'undefined' ? false : opts['binary'] == true;
	var offset = 0;
	var self = this; // we need a reference to the current object
	var readBlock = null;
	var chunkReadCallback = typeof opts['chunk_read_callback'] === 'function' ? opts['chunk_read_callback'] : function () { };
	var chunkErrorCallback = typeof opts['error_callback'] === 'function' ? opts['error_callback'] : function () { };
	var success = typeof opts['success'] === 'function' ? opts['success'] : function () { };
	var arrayTest = [];

	var r = new FileReader();

	var onLoadHandler = function (evt) {

		console.log(r.result);

		let descriptor = r.result;
		emitUIInteraction(descriptor);


		if (evt.target.error == null) {
			offset += evt.target.result.length;
			chunkReadCallback(evt.target.result);
		} else {
			chunkErrorCallback(evt.target.error);
			return;
		}
		if (offset >= fileSize) {
			success(file);

			let descriptor = 'finished';
			emitUIInteraction(descriptor);

			return;
		}

		readBlock(offset, chunkSize, file);
	}

	readBlock = function (_offset, length, _file) {
		r = new FileReader();
		var blob = _file.slice(_offset, length + _offset);
		r.onload = onLoadHandler;
		if (binary) {
			r.readAsArrayBuffer(blob);
		} else {
			r.readAsText(blob);
		}
	}

	readBlock(offset, chunkSize, file);
}

function toggleSidebar(Open) {
	//Changed this function to open and close on defined instead of toggling
	var sidebar = document.getElementById('sidebar');
	sidebar.classList.toggle('active');
	document.getElementById("sidebarCollapse").classList.toggle('active'); // Added to make Toggle button stay active
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


/////////////Custom

function myHandleResponseFunction(data) {

	console.log(data);
	obj = JSON.parse(data);

	// if (obj.login == 'test') {
	// 	UpdateSidebarDisplay("SelectCluster");
	// 	SetGameEstateUI("SelectCluster");
	// }
	if ('message' in obj) {
		ShowActionModal(obj.message);
		document.getElementById("backButton").disabled = true;

	}
	if ('gui' in obj) {
		UpdateSidebarDisplay(obj.gui);
		SetGameEstateUI(obj.gui);
	}
	if('Views' in obj){
		console.log(Object.keys(obj));
		unitSiteAnalysisLabels = Object.keys(obj);
		unitSiteAnalysisData = [];
		
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				console.log(key + " -> " + obj[key]);
				unitSiteAnalysisData.push(obj[key])
			}
		}
		console.log(unitSiteAnalysisData);
	}
	if('id' in obj){
		console.log('id value: ' + obj.id);
		unitID = obj.id;
	}
	if('AG1_1' in obj){
		UpdateAG_UI(obj);
	}
	if('Layout1' in obj){
		UpdateLayout_UI(obj);
	}

	// if('instructions' in obj){
	// 	console.log('ibstructions: ' + obj.instructions);
	// 	ShowInstructions();
	// }

	//DownloadOrder();
}



//////

var grabStyle = 'cursor: grab; cursor: -moz-grab; cursor: -webkit-grab';   // We will have a browser side grab cursor.
var isFullscreen = false;

function onParagonLoad() {
	styleAdditional = grabStyle;
	inputOptions.controlScheme = ControlSchemeType.HoveringMouse;
	inputOptions.fakeMouseWithTouches = true;
	styleWidth = 1080;
	styleHeight = 900;
	console.warn("Application loaded!");

	if (document.addEventListener) {
		document.addEventListener('webkitfullscreenchange', onFullscreenChange, false);
		document.addEventListener('mozfullscreenchange', onFullscreenChange, false);
		document.addEventListener('fullscreenchange', onFullscreenChange, false);
		document.addEventListener('MSFullscreenChange', onFullscreenChange, false);
	}

	let fullscreenCheck = document.getElementById('ck-fullscreen');
	if (fullscreenCheck) {
		fullscreenCheck.onclick = function () {
			if (!isFullscreen) {
				enterFullscreen();
			} else {
				exitFullscreen();
			}
		};
	}

	// When the data channel is connected we want to ask UE4 if 4K is supported.
	onDataChannelConnected = function () { emitUIInteraction("4K"); };


	//////Event listener from ue4

	addResponseEventListener("handle_responses", myHandleResponseFunction);

	////////////////////////////
	GetMarketingDataJSON();
	
}

function onFullscreenChange(data) {
	var fullscreenDiv = document.getElementById("player");
	isFullscreen = (document.webkitIsFullScreen
		|| document.mozFullScreen
		|| (document.msFullscreenElement && document.msFullscreenElement !== null)
		|| (document.fullscreenElement && document.fullscreenElement !== null)
		|| (fullscreenDiv && fullscreenDiv.classList.contains("fullscreen")));

	let fullscreenImg = document.getElementById('fullscreen-img');
	if (fullscreenImg) {
		fullscreenImg.src = isFullscreen ? 'images/MinimiseToFullscreen.png' : 'images/MaximiseToFullscreen.png'
		fullscreenImg.alt = isFullscreen ? 'Shrink to normal size' : 'Maximise to Fullscreen'
	}
}

function enterFullscreen() {
	var fullscreenDiv = document.getElementById("player");
	var textDivs = document.getElementsByClassName("text");
	var headerDiv = document.getElementById("header-tbl");
	var fullscreenFunc = fullscreenDiv.requestFullscreen;

	if (!fullscreenFunc) {
		['mozRequestFullScreen',
			'msRequestFullscreen',
			'webkitRequestFullScreen'].forEach(function (req) {
				fullscreenFunc = fullscreenFunc || fullscreenDiv[req];
			});
	}

	if (fullscreenFunc) {
		fullscreenFunc.call(fullscreenDiv);
	} else {
		//No Fullscreen api so maximise video to window size
		if (fullscreenDiv) {
			fullscreenDiv.classList.add("fullscreen");
			fullscreenDiv.classList.remove("fixed-size");
		}

		if (textDivs) {
			for (let i = 0; i < textDivs.length; i++) {
				textDivs[i].style.display = "none";
			}
		}

		if (headerDiv)
			headerDiv.style.display = "none";

		onFullscreenChange({});
		onInPageFullscreen();
	}
}

function exitFullscreen() {
	var fullscreenDiv = document.getElementById("player");
	var textDivs = document.getElementsByClassName("text");
	var headerDiv = document.getElementById("header-tbl");
	var exitFullscreenFunc = document.exitFullscreen;

	if (!exitFullscreenFunc) {
		['mozCancelFullScreen',
			'msExitFullscreen',
			'webkitExitFullscreen'].forEach(function (req) {
				exitFullscreenFunc = exitFullscreenFunc || document[req];
			});
	}

	if (exitFullscreenFunc) {
		exitFullscreenFunc.call(document);
	} else {
		//No Fullscreen api so shrink video back from max window size
		if (fullscreenDiv) {
			fullscreenDiv.classList.remove("fullscreen");
			fullscreenDiv.classList.add("fixed-size");
			fullscreenDiv.style.left = "";
		}

		if (textDivs) {
			for (let i = 0; i < textDivs.length; i++) {
				textDivs[i].style.display = "block";
			}
		}

		if (headerDiv)
			headerDiv.style.display = "table";

		onFullscreenChange({});
		onInPageFullscreen();
	}
}

function onInPageFullscreen() {
	var playerElement = document.getElementById('player');
	let videoElement = playerElement.getElementsByTagName("VIDEO");
	document.documentElement.style.position = isFullscreen ? "fixed" : "";
	document.body.style.position = isFullscreen ? "fixed" : "";

	if (isFullscreen) {
		let windowAspectRatio = window.innerHeight / window.innerWidth;
		let playerAspectRatio = playerElement.clientHeight / playerElement.clientWidth;
		// We want to keep the video ratio correct for the video stream
		let videoAspectRatio = videoElement.videoHeight / videoElement.videoWidth;

		if (isNaN(videoAspectRatio)) {
			//Video is not initialised yet so set playerElement to size of window
			styleWidth = window.innerWidth;
			styleHeight = window.innerHeight;
			styleTop = 0;
			styleLeft = Math.floor((window.innerWidth - styleWidth) * 0.5);
			//Video is now 100% of the playerElement so set the playerElement style
			playerElement.style.width = styleWidth + "px";
			playerElement.style.height = styleHeight + "px";
		} else if (windowAspectRatio < playerAspectRatio) {
			styleWidth = Math.floor(window.innerHeight / videoAspectRatio);
			styleHeight = window.innerHeight;
			styleTop = 0;
			styleLeft = Math.floor((window.innerWidth - styleWidth) * 0.5);
			//Video is now 100% of the playerElement so set the playerElement style
			playerElement.style.width = styleWidth + "px";
			playerElement.style.height = styleHeight + "px";
		}
		else {
			styleWidth = window.innerWidth;
			styleHeight = Math.floor(window.innerWidth * videoAspectRatio);
			styleTop = Math.floor((window.innerHeight - styleHeight) * 0.5);
			styleLeft = 0;
			//Video is now 100% of the playerElement so set the playerElement style
			playerElement.style.width = styleWidth + "px";
			playerElement.style.height = styleHeight + "px";
		}

	} else {
		playerElement.style.height = "";
		playerElement.style.width = "";
	}
}

//ADDED FUNCTIONS



function onLogin() {

	var text = document.getElementById("login-text");
	playerName = text.value;

	UpdateUIStats();

	let descriptor =
	{
		Category: "login",
		Item: text.value
	};

	console.log("Emitting from javascript to UE4! - Category: login" + " Item: " + text.value);
	emitUIInteraction(descriptor);

	console.log(MarketingJSON.base.LayoutA);
}

function onConfigButton(category, item) {
	let descriptor =
	{
		Category: category,
		Item: item
	};

	console.log("Emitting from javascript to UE4! - Category: " + category + " Item: " + item);
	emitUIInteraction(descriptor);
}

window.onSliderInput = function (category, e) {
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


function CloseAllMenus() {
	document.getElementById("OutsideMenu").classList.remove("collapsing");
	document.getElementById("layout").classList.remove("collapsing");
}




/////

function ShowActionModal(message) {
	var actionModal = document.getElementById("ActionModal");
	actionModal.style.display = "block";

	$(".modal-content-message #ConfirmMessage").val(message);

	if(gameState == "SelectUnit"){
		console.log('show Radar IS HIDDEN')

		// showRadarChart();
	}
}
// When the user clicks on <span> (x), close the modal
function HideActionModal() {
	var actionModal = document.getElementById("ActionModal");
	actionModal.style.display = "none";

	document.getElementById("RadarModal").style.display = "none";
	document.getElementById("backButton").disabled = false;

	console.log('disablke!@@@: ' + document.getElementById("backButton").disabled);
}

function ShowLoginMenu() {
	var actionModal = document.getElementById("LoginModal");
	actionModal.style.display = "block";
	document.getElementById("curtain").style.display = "flex";

}

//Hack to Reset Camera on the background while ue loads
function DelayHideLogin() {
	setTimeout(HideLoginMenu, 1000);
}
//Hack to Reset Camera on the background while ue loads
function DelayHideInstructions() {
	setTimeout(HideInstructions, 1000);
}
// When the user clicks on <span> (x), close the modal
function HideLoginMenu() {
	var actionModal = document.getElementById("LoginModal");
	actionModal.style.display = "none";
	ShowInstructions();
}

function ShowSidebarMenu(show) {
	var sidebarNav = document.getElementById("sidebar");
	if (show) {
		sidebarNav.style.display = "block";
	}

	else {
		sidebarNav.style.display = "none";
	}

}

function HideInstructions(){
	document.getElementById("InstructionsModal").style.display = "none";
	document.getElementById("curtain").style.display = "none";

}
function ShowInstructions(){
	document.getElementById("InstructionsModal").style.display = "flex";
}




function SetGameEstateUI(gameEstate) {
	var navBar = document.querySelectorAll("input.Sidebar-Icon");
	gameState = gameEstate;

	for (var i in navBar) {
		if (navBar[i].value == gameEstate) {
			console.log('working' + gameEstate);
			navBar[i].checked = true;
		}
	}

	var radarModal = document.getElementById('RadarModal');
	radarModal.style.display='none';

}

///GUI

function UpdateAG_UI(obj_){
	
	var keys = Object.keys(obj_);
	var attributes = [];
	
	for (var key in obj_) {
		if(key == 'AG1_1') document.getElementById("img_a_ag1").style.display = (obj_[key] == "true") ? "block" : "none";
		if(key == 'AG1_2') document.getElementById("img_b_ag1").style.display = (obj_[key] == "true") ? "block" : "none";		
		// if(key == 'AG1_3') document.getElementById("img_c_ag1").style.display = (obj_[key] == "true") ? "block" : "none";
		
		if(key == 'AG2_1') document.getElementById("img_a_ag2").style.display = (obj_[key] == "true") ? "block" : "none";
		if(key == 'AG2_2') document.getElementById("img_b_ag2").style.display = (obj_[key] == "true") ? "block" : "none";
		if(key == 'AG2_3') document.getElementById("img_c_ag2").style.display = (obj_[key] == "true") ? "block" : "none";
	}
	console.log(keys);
	console.log(attributes);
}

function UpdateLayout_UI(obj_){
	
	var keys = Object.keys(obj_);
	var attributes = [];
	
	var i = 0;
	for (var key in obj_) {
		if(key == 'Layout1') document.getElementById("img_a_layout").style.display = (obj_[key] == "true") ? "block" : "none";
		if(key == 'Layout2') document.getElementById("img_b_layout").style.display = (obj_[key] == "true") ? "block" : "none";		
		if(key == 'Layout3') document.getElementById("img_c_layout").style.display = (obj_[key] == "true") ? "block" : "none";		
	}
	console.log(keys);
	console.log(attributes);
}



function SetStats(srcVal, value_){
	console.log('source: ' + srcVal);
	console.log('value:' + value_);
	console.log('GAMEESTATE: ' + gameState);

	if(gameState == 'SelectCluster'){
		document.getElementById("shop_1_img").setAttribute("src", srcVal);
		clusterType = value_;
		UpdateUIStats();
	}
	if(gameState == 'SelectLevel'){
		document.getElementById("shop_2_img").setAttribute("src", srcVal);
		levelType = value_;
		UpdateUIStats();
	}
	if(gameState == 'SelectUnit'){
		document.getElementById("shop_3_img").setAttribute("src", srcVal);
		// unitType = value_;
		UpdateUIStats();
		console.log('testing here')
	}
	if(gameState == 'SelectLayout'){
		document.getElementById("shop_4_img").setAttribute("src", srcVal);
		layoutType = value_;
		UpdateUIStats();
		console.log('baaaaaaaaaaaaad here')
	}
	if(gameState == 'SelectAddOn1'){
		document.getElementById("shop_5_img").setAttribute("src", srcVal);
		ag1Type = value_;
		UpdateUIStats();
	}
	if(gameState == 'SelectAddOn2'){
		document.getElementById("shop_6_img").setAttribute("src", srcVal);
		ag2Type = value_;
		UpdateUIStats();
	}
	
}



function UpdateUIStats(){
	document.getElementById("HeaderStatsName").innerHTML = playerName;

	document.getElementById("clusterStats").innerHTML = clusterType;
	document.getElementById("levelStats").innerHTML = levelType;
	document.getElementById("unitStats").innerHTML = unitType;
	document.getElementById("layoutStats").innerHTML = layoutType;
	document.getElementById("Ag1Stats").innerHTML = ag1Type;
	document.getElementById("Ag2Stats").innerHTML = ag2Type;
	
}

function SetLayoutSrc(unitType_) {

	var img_a = document.getElementById('img_a_layout');
	var img_b = document.getElementById('img_b_layout');
	// var img_c = document.getElementById('img_c_layout');

	if (unitType_ == 'base') {
		img_a.setAttribute("src", "images/SpaceLayout/01_BaseUnit/layout1.png");
		img_b.setAttribute("src", "images/SpaceLayout/01_BaseUnit/layout2.png");
		//img_c.setAttribute("src", "images/SpaceLayout/01_BaseUnit/layout3.png");

		document.getElementById('img_a_layout_large').setAttribute("src", "src/base/Plan/1/floorplan.jpg");
		document.getElementById('img_b_layout_large').setAttribute("src", "src/base/Plan/2/floorplan.jpg");
	}
	if (unitType_ == 'tall') {
		img_a.setAttribute("src", "images/SpaceLayout/02_TallUnit/layout1.png");
		img_b.setAttribute("src", "images/SpaceLayout/02_TallUnit/layout2.png");
		//img_c.setAttribute("src", "images/SpaceLayout/02_TallUnit/layout3.png");

		document.getElementById('img_a_layout_large').setAttribute("src", "src/tall/Plan/1/floorplan.jpg");
		document.getElementById('img_b_layout_large').setAttribute("src", "src/tall/Plan/2/floorplan.jpg");
	}
	if (unitType_ == 'wide') {
		img_a.setAttribute("src", "images/SpaceLayout/03_WideUnit/layout1.png");
		img_b.setAttribute("src", "images/SpaceLayout/03_WideUnit/layout2.png");
		//img_c.setAttribute("src", "images/SpaceLayout/03_WideUnit/layout3.png");

		document.getElementById('img_a_layout_large').setAttribute("src", "src/wide/Plan/1/floorplan.jpg");
		document.getElementById('img_b_layout_large').setAttribute("src", "src/wide/Plan/2/floorplan.jpg");
	}
	if (unitType_ == 'side') {
		img_a.setAttribute("src", "images/SpaceLayout/04_SideUnit/layout1.png");
		img_b.setAttribute("src", "images/SpaceLayout/04_SideUnit/layout2.png");
		//img_c.setAttribute("src", "images/SpaceLayout/03_WideUnit/layout3.png");

		document.getElementById('img_a_layout_large').setAttribute("src", "src/side/Plan/1/floorplan.jpg");
		document.getElementById('img_b_layout_large').setAttribute("src", "src/side/Plan/2/floorplan.jpg");
	}
	if (unitType_ == 'villaA') {
		img_a.setAttribute("src", "images/SpaceLayout/Villa_O/01.png");
		img_b.setAttribute("src", "images/SpaceLayout/Villa_O/02.png");
		//img_c.setAttribute("src", "images/SpaceLayout/Villa_O/03.png");

		document.getElementById('img_a_layout_large').setAttribute("src", "src/villaA/Plan/1/floorplan.jpg");
		document.getElementById('img_b_layout_large').setAttribute("src", "src/villaA/Plan/2/floorplan.jpg");

		//set attribute src for ag2 in villa
		document.getElementById('img_a_ag2').setAttribute("src", "images/icons/villa/ag2/pergola_1.png");
		document.getElementById('img_b_ag2').setAttribute("src", "images/icons/villa/ag2/pergola_2.png");
	}
	if (unitType_ == 'villaB') {
		img_a.setAttribute("src", "images/SpaceLayout/Villa_T/01.png");
		img_b.setAttribute("src", "images/SpaceLayout/Villa_T/02.png");
		//img_c.setAttribute("src", "images/SpaceLayout/Villa_T/03.png");

		document.getElementById('img_a_layout_large').setAttribute("src", "src/villaB/Plan/1/floorplan.jpg");
		document.getElementById('img_b_layout_large').setAttribute("src", "src/villaB/Plan/2/floorplan.jpg");

		//set attribute src for ag2 in villa
		document.getElementById('img_a_ag2').setAttribute("src", "images/icons/villa/ag2/swimmingpool_1.png");
		document.getElementById('img_b_ag2').setAttribute("src", "images/icons/villa/ag2/swimmingpool_2.png");
	}
}

function SetUnitSrc(clusterType_) {

	var img_a = document.getElementById('img_a_unit');
	var img_b = document.getElementById('img_b_unit');
	var img_c = document.getElementById('img_c_unit');
	var img_d = document.getElementById('img_d_unit');

	var img_a_ag1 = document.getElementById('img_a_ag1');
	var img_b_ag1 = document.getElementById('img_b_ag1');

	var img_a_ag2 = document.getElementById('img_a_ag2');
	var img_b_ag2 = document.getElementById('img_b_ag2');
	var img_c_ag2 = document.getElementById('img_c_ag2');

	console.log('cluster typr: ' + clusterType_);

	if (clusterType_ == 'rbu') {

		img_a.style.display = 'block';
		img_d.style.display = 'block';
		img_c_ag2.style.display = 'block';

		img_a.setAttribute("src", "images/icons/01_BaseUnit.png");
		img_b.setAttribute("src", "images/icons/02_TallUnit.png");
		img_c.setAttribute("src", "images/icons/03_WideUnit.png");
		img_d.setAttribute("src", "images/icons/04_DoubleUnit.png");

		img_a_ag1.setAttribute("src", "images/icons/palapa/flat.1.png");
		img_b_ag1.setAttribute("src", "images/icons/palapa/palapa.1.png");

		img_a_ag2.setAttribute("src", "images/icons/terrace/25_terrace.1.png");
		img_b_ag2.setAttribute("src", "images/icons/terrace/50_terrace.1.png");
		img_c_ag2.setAttribute("src", "images/icons/terrace/75_terrace.1.png");

		////level
		document.getElementById('img_a_level').style.display = 'block';
		document.getElementById('img_b_level').style.display = 'block';

		////large pop up src
		document.getElementById('img_a_unit_large').setAttribute("src", "images/misc/base.png");
		document.getElementById('img_b_unit_large').setAttribute("src", "images/misc/tall.png");
		document.getElementById('img_c_unit_large').setAttribute("src", "images/misc/wide.png");
		document.getElementById('img_d_unit_large').setAttribute("src", "images/misc/double.png");
	}
	if (clusterType_ == 'villa') {

		img_a.style.display = 'none';
		img_d.style.display = 'none';
		img_c_ag2.style.display = 'none';

		img_b.setAttribute("src", "images/icons/05_VillaA.png");
		img_c.setAttribute("src", "images/icons/06_VillaB.png");

		img_a_ag1.setAttribute("src", "images/icons/villa/ag1/DoubleHight.png");
		img_b_ag1.setAttribute("src", "images/icons/villa/ag1/SingleHight.png");

		//AG@ GETS Chosen when selecting villa type see SetLayoutSrc

		////level
		document.getElementById('img_a_level').style.display = 'none';
		document.getElementById('img_b_level').style.display = 'none';

		////large pop up src

		document.getElementById('img_b_unit_large').setAttribute("src", "images/misc/villaA.png");
		document.getElementById('img_c_unit_large').setAttribute("src", "images/misc/villaB.png");
	}
}

function SetLevelType(levelType_){
	levelType = levelType_;
}

function SetUnitType(unitType_) {

	if (clusterType_ == 'rbu') {

		if(unitType_ == '0') unitType = 'base'
		if(unitType_ == '1') unitType = 'tall'
		if(unitType_ == '2') unitType = 'wide'
		if(unitType_ == '3') unitType = 'side'
	}
	else if (clusterType_ == 'villa') {
		if(unitType_ == '1') unitType = 'villaA'
		if(unitType_ == '2') unitType = 'villaB'
	}

	SetLayoutSrc(unitType_);
}

function SetClusterType(clusterType_) {
	clusterType = clusterType_;
	SetUnitSrc(clusterType_);
}

function UpdateSidebarDisplay(gui) {

	UncheckUI();
	var els = document.getElementsByClassName("panel-group");
	console.log('length of panels: ' + els.length);

	for (var i = 0; i < els.length; ++i) {

		if (gui == els[i].id) {
			console.log('eureka')
			els[i].style.display = 'flex';
		}
		else {
			els[i].style.display = 'none';
		}
	};

	if (gui == 'Login' || gui == 'Review' || gui == 'SelectAG') {
		ShowSidebarMenu(false);
	}
	else {
		ShowSidebarMenu(true);
	}

	if (gui != 'Login') {
		document.getElementById('nav-bar').style.display = 'flex';
		document.getElementById('shopping-bar').style.display = 'flex';
	}
	if(gui == 'Review'){
		document.getElementById('review-bar').style.display = 'flex';
	}
}

function UpdateShoppingBar(){
	console.log("game: " + gameState)
	if(gameState == 'SelectCluster'){
		document.getElementById("shop_1").style.display = "block";
	}
	if(gameState == 'SelectLevel'){
		document.getElementById("shop_2").style.display = "block";
	}
	if(gameState == 'SelectUnit'){
		document.getElementById("shop_3").style.display = "block";
	}
	if(gameState == 'SelectLayout'){
		document.getElementById("shop_4").style.display = "block";
	}
	if(gameState == 'SelectAddOn1'){
		document.getElementById("shop_5").style.display = "block";
	}
	if(gameState == 'SelectAddOn2'){
		document.getElementById("shop_6").style.display = "block";
	}
	
}

function UndoShoppingBar(){
	if(gameState == 'SelectLevel'){
		document.getElementById("shop_1").style.display = "none";
	}
	if(gameState == 'SelectUnit'){
		document.getElementById("shop_2").style.display = "none";
	}
	if(gameState == 'SelectLayout'){
		document.getElementById("shop_3").style.display = "none";
	}
	if(gameState == 'SelectAddOn1'){
		document.getElementById("shop_4").style.display = "none";
	}
	if(gameState == 'SelectAddOn2'){
		document.getElementById("shop_5").style.display = "none";
	}
	if(gameState == 'Review'){
		document.getElementById("shop_6").style.display = "none";
	}
}

function UndoSystem(){
	UndoShoppingBar();
	document.getElementById("review-bar").style.display = "none";
}

function UncheckUI(gameEstate) {
	var panelIcons = document.querySelectorAll("input.selectType");

	for (var i in panelIcons) {
		panelIcons[i].checked = false;
	}
}


function hoverImg(element) {
	element.style.background = "#1f1f1f"
}
function unhoverImg(element) {
	element.style.background = "#000000"
}



function onConfigUnit(category, item) {

	if (clusterType == 'rbu') {

		if(item == '0') unitType = 'base';
		if(item == '1') unitType = 'tall';
		if(item == '2') unitType = 'wide';
		if(item == '3') unitType = 'side';

		let descriptor =
		{
			Category: category,
			Item: unitType
		};

		console.log("Emitting from javascript to UE4! - Category: " + category + " Item: " + unitType);
		emitUIInteraction(descriptor);
	}
	if (clusterType == 'villa') {

		if(item == '1') unitType = 'villaA';
		if(item == '2') unitType = 'villaB';

		let descriptor =
		{
			Category: category,
			Item: unitType
		};

		console.log("Emitting from javascript to UE4! - Category: " + category + " Item: " + unitType);
		emitUIInteraction(descriptor);
	}

	SetLayoutSrc(unitType);
}

////////////////////


function loadFile(filePath) {
	var result = null;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", filePath, false);
	xmlhttp.send();
	if (xmlhttp.status==200) {
	  result = xmlhttp.responseText;
	}
	return result;
}

function loadImage(filePath) {
	var result = null;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", filePath, false);
	xmlhttp.send();
	if (xmlhttp.status==200) {
	  result = xmlhttp.responseText;
	}
	return result;
}

function DownloadOrder()
{
	var renderImage = "";
	var planImage = "";
	var interiorImage = "";

	if(unitType == "base"){
		renderImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/base/RBU_Base_Palapa_1.png?raw=true";
		interiorImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/base/InteriorRender.png?raw=true";

		if(layoutType == "LayoutA") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/base/Plan/1/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutB") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/base/Plan/2/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutC") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/base/Plan/3/floorplan.jpg?raw=true";

	}
	if(unitType == "wide"){
		renderImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/wide/RBU_Wide_1.png?raw=true";
		interiorImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/wide/InteriorRender.png?raw=true";

		if(layoutType == "LayoutA") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/wide/Plan/1/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutB") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/wide/Plan/2/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutC") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/wide/Plan/3/floorplan.jpg?raw=true";
	}
	if(unitType == "tall"){
		renderImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/tall/RBU_Tall_1.png?raw=true";
		interiorImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/tall/InteriorRender.png?raw=true";
		
		if(layoutType == "LayoutA") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/tall/Plan/1/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutB") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/tall/Plan/2/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutC") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/tall/Plan/3/floorplan.jpg?raw=true";
	}
	if(unitType == "side"){
		renderImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/side/ExteriorRender.png?raw=true";
		interiorImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/side/InteriorRender.png?raw=true";
		
		if(layoutType == "LayoutA") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/side/Plan/1/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutB") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/side/Plan/2/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutC") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/side/Plan/3/floorplan.jpg?raw=true";
	}
	if(unitType == "villaA"){
		renderImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/villaA/ExteriorRender.png?raw=true";
		interiorImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/villaA/InteriorRender.png?raw=true";
		
		if(layoutType == "LayoutA") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/villaA/Plan/1/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutB") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/villaA/Plan/2/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutC") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/villaA/Plan/3/floorplan.jpg?raw=true";
	}
	if(unitType == "villaB"){
		renderImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/villaB/ExteriorRender.png?raw=true";
		interiorImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/villaB/InteriorRender.png?raw=true";
		
		if(layoutType == "LayoutA") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/villaB/Plan/1/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutB") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/villaB/Plan/2/floorplan.jpg?raw=true";
		else if(layoutType == "LayoutC") planImage = "https://github.com/cafragachan/custom_html/blob/master/Configurator/src/villaB/Plan/3/floorplan.jpg?raw=true";
	}




	var layoutData= MarketingJSON.base.LayoutA;
	var unitAreaData= MarketingJSON.base.unit;
	var unitDescriptionData= MarketingJSON.base.description;

	////////////////////////
	var textHtml = loadFile("test.html");
	var strs = textHtml.split("custom_unit_area");
	var textHTML2 = strs[0]+unitAreaData+strs[1]

	strs = textHTML2.split("custom_img")
	var textHTML3 = strs[0]+renderImage+strs[1]

	strs = textHTML3.split("custom_plan")
	var textHTML4 = strs[0]+planImage+strs[1]

	strs = textHTML4.split("custom_type")
	var textHTML5 = strs[0]+unitType+strs[1]

	strs = textHTML5.split("custom_layout")
	var textHTML6 = strs[0]+ layoutData + strs[1]

	strs = textHTML6.split("custom_description")
	var textHTML7 = strs[0]+unitDescriptionData+strs[1]

	strs = textHTML7.split("custom_id")
	var textHTML8 = strs[0]+unitID+strs[1]

	strs = textHTML8.split("custom_int_render")
	var newtextHTML = strs[0]+interiorImage+strs[1]

	console.log('interior render src: ' + interiorImage);

	// (1) CREATE BLOB OBJECT
	var myBlob = new Blob([newtextHTML], {type: 'text/html'});
	
	// (2) CREATE DOWNLOAD LINK
	var url = window.URL.createObjectURL(myBlob);
	var anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = "OrderSummary.html";
	anchor.click();
	window.URL.revokeObjectURL(url);
	document.removeChild(anchor);

	//var out = loadFile("test.html");
	//console.log(out);
}


/////////////////////////////////


function renderChart(labels_, data_) {     
	var ctx = document.getElementById("myChart").getContext('2d');
	var myChart = new Chart(ctx, {
		type: 'radar',
		data: {
		  labels: labels_,
		  datasets: [
			{
			  //label: "2050",
			  fill: true,
			  backgroundColor: "rgba(255,99,132,0.2)",
			  borderColor: "rgba(255,99,132,1)",
			  pointBorderColor: "#fff",
			  pointBackgroundColor: "rgba(255,99,132,1)",
			  pointBorderColor: "#fff",
			  data: data_
			}
		  ]
		},
		options: {
			
			legend: {
				display: false
			},
			title: {
				display: true,
				text: 'Unit Context Analysis',
				fontColor: "rgba(255,255,255,1.0)"

			},
			scale: {
				ticks:{
					display: false,
					beginAtZero: true,
					max: 10,
					min: 0,
					stepSize: 1,
				},
				gridLines: {
					color: "rgba(255,255,255,0.2)"
				},
				angleLines: {
					color: "rgba(255,255,255,0.5)"
				},
				pointLabels :{
					fontColor: "rgba(255,255,255,1.0)"
				 }
			}
			
		}
	});
}


function showRadarChart(){
	document.getElementById("RadarModal").style.display = 'block';
	renderChart(unitSiteAnalysisLabels, unitSiteAnalysisData);
}



/////////////////////

function UpdateTutorialStep(val){

	TutorialStep += val;
	if(TutorialStep == 0){
		document.getElementById("prevTutorial").disabled = true;
	}
	else{
		document.getElementById("prevTutorial").disabled = false;
	}
	if(TutorialStep == 8){
		document.getElementById("nextTutorial").disabled = true;
	}
	else{
		document.getElementById("nextTutorial").disabled = false;
	}


	if(TutorialStep == 0){
		document.getElementById("instructionsImage").setAttribute("src", "images/Instructions/1.jpg");
	}
	if(TutorialStep == 1){
		document.getElementById("instructionsImage").setAttribute("src", "images/Instructions/2.jpg");
	}
	if(TutorialStep == 2){
		document.getElementById("instructionsImage").setAttribute("src", "images/Instructions/3.jpg");
	}
	if(TutorialStep == 3){
		document.getElementById("instructionsImage").setAttribute("src", "images/Instructions/4.jpg");
	}
	if(TutorialStep == 4){
		document.getElementById("instructionsImage").setAttribute("src", "images/Instructions/5.jpg");
	}
	if(TutorialStep == 5){
		document.getElementById("instructionsImage").setAttribute("src", "images/Instructions/6.jpg");
	}
	if(TutorialStep == 6){
		document.getElementById("instructionsImage").setAttribute("src", "images/Instructions/7.jpg");
	}
	if(TutorialStep == 7){
		document.getElementById("instructionsImage").setAttribute("src", "images/Instructions/8.jpg");
	}
	if(TutorialStep == 8){
		document.getElementById("instructionsImage").setAttribute("src", "images/Instructions/9.jpg");
	}

}