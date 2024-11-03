let modInfo = {
	name: "The Gaming Tree Rewritten",
	author: "medsal15",
	pointsName: "points",
	modFiles: [
		'tree.js',
		'layers/hotkeys.js',

		// main
		'layers/main/side/achievement.js', 'layers/main/side/death.js',
		'layers/main/0/experience.js', 'layers/main/0/mining.js',
		'layers/main/1/level.js', 'layers/main/1/crafting.js',
		'layers/main/2/boss.js', 'layers/main/2/shop.js',
	],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	/**
	 * The mod's version number, displayed at the top right of the tree tab.
	 */
	num: 'R0.2',
	/**
	 * The version's name, displayed alongside the number in the info tab.
	 */
	name: 'Bones and Stones',
	beta: false,
};

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.2: Bones and Stones</h3><br>
		- Update vue to 2.7.16 and TMT to 2.7<br>
		- Improve import modal.<br>
		- Add forge and compactor.<br>
		- Rebalance mining.<br>
		- A new layer.<br>
		- Update endgame: Enter the second boss fight.<br>
	<h3>v0.1: Basics</h3><br>
		- Rewrote XP, C, L.<br>
		- Update endgame: Enter the first boss fight.`;

let winText = `Congratulations! You have finished the current content in the game. Look forward for more.`;

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints() {
	return false
}

// Calculate points/sec!
function getPointGen() {
	return new Decimal(0)
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
	return {
		items: Object.fromEntries(Object.keys(item_list).map(id => [id, {
			amount: D.dZero,
			total: D.dZero,
		}])),
	};
}

/**
 * Display extra things at the top of the page
 *
 * @type {Computable<string>[]}
 */
var displayThings = [
	() => VERSION.beta ? '<span class="warning">Beta version, things might be a bit unstable</span>' : '',
	() => isEndgame() ? '<span style="color:#60C0F0">You are past endgame. Content may not be balanced.</span>' : '',
	() => {
		const chal = activeChallenge('b');
		if (!chal) return '';

		const chaltemp = tmp.b.challenges[chal],
			color = tmp.b.groups[chaltemp.group].color;

		return `You are in ${tmp.b.name} challenge ${resourceColor(color, chaltemp.name)}`;
	},
];

// Determines when the game "ends"
function isEndgame() {
	return inChallenge('b', 12);
}



// Less important things beyond this point!

/**
 * A CSS object containing the styling for the background of the full game. Can be a function!
 *
 * @type {Computable<CSSStyles>}
 */
var backgroundStyle = {}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return (3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) {
}
