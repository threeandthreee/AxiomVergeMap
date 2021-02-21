const websocket_endpoint = "ws://localhost:19906";
var map = document.getElementById("map");

var area1 = document.getElementById("area1");
var area2 = document.getElementById("area2");
var area3 = document.getElementById("area3");
var area4 = document.getElementById("area4");
var area5 = document.getElementById("area5");
var area6 = document.getElementById("area6");
var area7 = document.getElementById("area7");
var area8 = document.getElementById("area8");
var area9 = document.getElementById("area9");

var IsRandomizer = true;
var IsVisionDead = false;

var colorTheme = {
	unlockNormal: "#00FF00",
	lockNormal: "#FF0000",
	unlockAlternative: "#0072B2",
	lockAlternative: "#D55E32",
	unlockGreyscale: "#FFFFFF",
	lockGreyscale: "#000000",
}

window.onload = function ()
{
	ClearAll();
	const socket = new WebSocket(websocket_endpoint);
	socket.onmessage = event => appendData(JSON.parse(event.data));
}

function appendData(data)
{
	console.log(data);
	IsRandomizer = data.IsRandomizer;
	IsVisionDead = data.IsVisionDead;
	var KonamiCodeStart = (data.Items.length == 1 && data.Items[0].mName == "PasswordTool");
	if (data.Items.length == 0 || KonamiCodeStart) {
		NewGameStart(data);
	}
	else {
		GetMap(data);
	}
}

function NewGameStart(data) {
	ClearAll();
	GetMap(data);
}

function ClearAll() {
	area1.querySelectorAll(".item").forEach(i => i.innerHTML = `<div class="closed"><div class="unobtained"></div></div>`);
	area2.querySelectorAll(".item").forEach(i => i.innerHTML = `<div class="closed"><div class="unobtained"></div></div>`);
	area3.querySelectorAll(".item").forEach(i => i.innerHTML = `<div class="closed"><div class="unobtained"></div></div>`);
	area4.querySelectorAll(".item").forEach(i => i.innerHTML = `<div class="closed"><div class="unobtained"></div></div>`);
	area5.querySelectorAll(".item").forEach(i => i.innerHTML = `<div class="closed"><div class="unobtained"></div></div>`);
	area6.querySelectorAll(".item").forEach(i => i.innerHTML = `<div class="closed"><div class="unobtained"></div></div>`);
	area7.querySelectorAll(".item").forEach(i => i.innerHTML = `<div class="closed"><div class="unobtained"></div></div>`);
	area8.querySelectorAll(".item").forEach(i => i.innerHTML = `<div class="closed"><div class="unobtained"></div></div>`);
	area9.querySelectorAll(".item").forEach(i => i.innerHTML = `<div class="closed"><div class="unobtained"></div></div>`);
}

function SetItems(data) {
	data.Items.forEach((item) => {
		console.log(`Item: ${item.mName} Obtained`);
		document.getElementById(item.mName).innerHTML = `<div class="obtained"></div>`;
	});
}

function SetItemsRandom(data) {
	data.Items.forEach((item) => {
		for(var key in data.RandomItems) {
			  var value = data.RandomItems[key];
			  if (value == item.mName) {
				  console.log(`Item: ${item.mName} Obtained`);
				  document.getElementById(key).innerHTML = `<div class="obtained"></div>`;
			  }
		}
	});
}

function CheckOpen(data) {
	for (const itemLocation of data.LocationsData) {
    	const openData = {
    		defaultOpen: CheckDefault(data, itemLocation),
    		advancedOpen: CheckAdvanced(data, itemLocation),
    		masochistOpen: CheckMasochist(data, itemLocation)
    	};
    	const isAdvanced = data.progression === 1;
    	const isMasochist = data.progression === 2;

    	const {defaultOpen, advancedOpen, masochistOpen} = openData;

		let IsOpen = defaultOpen || advancedOpen || masochistOpen;

		if (IsOpen) 
		{
			OpenDefault(itemLocation, defaultOpen, advancedOpen);

      		if (advancedOpen && isAdvanced)
			{
				OpenAdvanced(itemLocation, defaultOpen, advancedOpen);
			}

      		if (masochistOpen && isMasochist)
			{
				OpenMasochist(itemLocation);
			}
		}
		else if (!IsOpen) {
			document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="closed"><div class="unobtained"></div></div>`;
		}
	}
}

function CheckOpenVision(data) {
	for (const itemLocation of data.LocationsData) {
		if (itemLocation.LocationId == 73 || itemLocation.LocationId == 75 || itemLocation.LocationId == 76 || itemLocation.LocationId == 97) {
			console.log(`Location Doesn't Exist Vision Still Alive! ${itemLocation.LocationId}`);
			continue;
		}
    	const openData = {
    		defaultOpen: CheckDefault(data, itemLocation),
    		advancedOpen: CheckAdvanced(data, itemLocation),
			masochistOpen: CheckMasochist(data, itemLocation),
			visionOpen: CheckVision(data, itemLocation)
    	};
    	const isAdvanced = data.progression === 1;
    	const isMasochist = data.progression === 2;

    	const {defaultOpen, advancedOpen, masochistOpen, visionOpen} = openData;

		let IsOpen = defaultOpen || advancedOpen || masochistOpen || visionOpen;

		if (itemLocation.LocationId == 110) {
			console.log(`Location ID: ${itemLocation.LocationId} IsOpen: ${IsOpen}`);
		}

		if (IsOpen) 
		{
			OpenDefault(itemLocation, defaultOpen, advancedOpen, visionOpen);

      		if (advancedOpen && isAdvanced)
			{
				OpenAdvanced(itemLocation, defaultOpen, advancedOpen, visionOpen);
			}

      		if (masochistOpen && isMasochist)
			{
				OpenMasochist(itemLocation);
			}
		}
		else if (!IsOpen) {
			document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="closed"><div class="unobtained"></div></div>`;
		}
	}
}

function BaseCheck(data, itemLocation, key) {
  if (itemLocation[key]) {
    for (const power of itemLocation[key]) {
      if (CheckPowers(data.CurrentPowers, power)) {
        return true;
      }
    }

    return false;
  }

  return false;
}

function CheckDefault(data, itemLocation)
{
  return BaseCheck(data, itemLocation, 'RequiredPowers');
}

function CheckAdvanced(data, itemLocation)
{
  return BaseCheck(data, itemLocation, 'RequiredPowersAdvanced');
}

function CheckMasochist(data, itemLocation)
{
  return BaseCheck(data, itemLocation, 'RequiredPowersMasochist');
}

function CheckVision(data, itemLocation)
{
  return BaseCheck(data, itemLocation, 'RequiredPowersHallucination');
}

function OpenDefault(itemLocation, easy, normal)
{
	if (easy) {
		//console.log("Open With Default Logic");
		document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="open"><div class="unobtained"></div></div>`;
	}
	else if (normal) {
		//console.log("Open With Advanced Logic");
		document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="openadvanced"><div class="unobtained"></div></div>`;
	}
	else {
		//console.log("Open With Masochist Logic");
		document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="openmasochist"><div class="unobtained"></div></div>`;
	}
}

function OpenDefault(itemLocation, easy, normal, vision)
{
	if (easy || vision) {
		//console.log("Open With Default Logic");
		document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="open"><div class="unobtained"></div></div>`;
	}
	else if (normal) {
		//console.log("Open With Advanced Logic");
		document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="openadvanced"><div class="unobtained"></div></div>`;
	}
	else {
		//console.log("Open With Masochist Logic");
		document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="openmasochist"><div class="unobtained"></div></div>`;
	}
}

function OpenAdvanced(itemLocation, easy, normal)
{
	if (easy || normal) {
		//console.log("Open With Default/Advanced Logic");
		document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="open"><div class="unobtained"></div></div>`;
	}
	else {
		//console.log("Open With Masochist Logic");
		document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="openadvanced"><div class="unobtained"></div></div>`;
	}
}

function OpenAdvanced(itemLocation, easy, normal, vision)
{
	if (easy || normal || vision) {
		//console.log("Open With Default/Advanced Logic");
		document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="open"><div class="unobtained"></div></div>`;
	}
	else {
		//console.log("Open With Masochist Logic");
		document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="openadvanced"><div class="unobtained"></div></div>`;
	}
}

function OpenMasochist(itemLocation)
{
	//console.log("Open With Default/Masochist Logic");
	document.getElementById(itemLocation.VanillaItemName).innerHTML = `<div class="open"><div class="unobtained"></div></div>`;
}

var CheckPowers = (current_powers, required_powers) => {
	return (current_powers & required_powers) === required_powers;
}

function GetMap(data) {
	if (IsVisionDead) {
		CheckOpen(data);
	}
	else {
		CheckOpenVision(data);
	}
	
	if (IsRandomizer) {
		SetItemsRandom(data);
	}
	else {
		SetItems(data);
	}
}
