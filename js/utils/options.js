// ************ Options ************

/** @type {ReturnType<typeof getStartOptions>} */
let options = {}

function getStartOptions() {
	return {
		autosave: true,
		/** @type {MS_DISPLAYS[number]} */
		msDisplay: "always",
		/** @type {keyof typeof colors} */
		theme: "default",
		hqTree: false,
		offlineProd: true,
		hideChallenges: false,
		showStory: true,
		forceOneTab: false,
		oldStyle: false,
		forceTooltips: true,
		hideMilestonePopups: false,
		/** @type {keyof typeof CHANCE_MODE} */
		chanceMode: 'NEVER',
		/** @type {keyof typeof DIST_MODE} */
		distMode: 'METERS',
		noRNG: false,
		colCraft: false,
	}
}

function toggleOpt(name) {
	if (name == "oldStyle" && styleCooldown > 0)
		return;

	options[name] = !options[name];
	if (name == "hqTree")
		changeTreeQuality();
	if (name == "oldStyle")
		updateStyle();
}
var styleCooldown = 0;
function updateStyle() {
	styleCooldown = 1;
	let css = document.getElementById("styleStuff");
	css.href = options.oldStyle ? "oldStyle.css" : "style.css";
	needCanvasUpdate = true;
}
function changeTreeQuality() {
	var on = options.hqTree;
	document.body.style.setProperty('--hqProperty1', on ? "2px solid" : "4px solid");
	document.body.style.setProperty('--hqProperty2a', on ? "-4px -4px 4px rgba(0, 0, 0, 0.25) inset" : "-4px -4px 4px rgba(0, 0, 0, 0) inset");
	document.body.style.setProperty('--hqProperty2b', on ? "0px 0px 20px var(--background)" : "");
	document.body.style.setProperty('--hqProperty3', on ? "2px 2px 4px rgba(0, 0, 0, 0.25)" : "none");
}
function toggleAuto(toggle) {
	Vue.set(player[toggle[0]], [toggle[1]], !player[toggle[0]][toggle[1]]);
	needCanvasUpdate = true
}

/** @type {['ALL','LAST, AUTO, INCOMPLETE','AUTOMATION, INCOMPLETE','INCOMPLETE','NONE']} */
const MS_DISPLAYS = ["ALL", "LAST, AUTO, INCOMPLETE", "AUTOMATION, INCOMPLETE", "INCOMPLETE", "NONE"];

const MS_SETTINGS = ["always", "last", "automation", "incomplete", "never"];

function adjustMSDisp() {
	options.msDisplay = MS_SETTINGS[(MS_SETTINGS.indexOf(options.msDisplay) + 1) % 5];
}
function milestoneShown(layer, id) {
	const complete = player[layer].milestones.includes(id);
	const auto = layers[layer].milestones[id].toggles;

	switch (options.msDisplay) {
		case "always":
			return true;
		case "last":
			return (auto) || !complete || player[layer].lastMilestone === id;
		case "automation":
			return (auto) || !complete;
		case "incomplete":
			return !complete;
		case "never":
			return false;
	}
	return false;
}

const CHANCE_MODE = {
	'NEVER': 'never',
	'LESS_HALF': 'below 50%',
	'NOT_GUARANTEED': 'below 100%',
};
function changeLootChance() {
	const modes = Object.keys(CHANCE_MODE);
	options.chanceMode = modes[(modes.indexOf(options.chanceMode) + 1) % modes.length];
}

let formatOption = (opt) => opt ? 'ON' : 'OFF';
