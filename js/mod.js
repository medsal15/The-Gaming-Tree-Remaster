/**
 * Where most of the basic configuration for the mod is.
 */
let modInfo = {
	/**
	 * The name of your mod.
	 */
	name: 'The Gaming Tree Rewritten',
	/**
	 * The id for your mod, a unique string that is used to determine savefile location.
	 * Be sure to set it when you start making a mod, and don't change it later because it will erase all saves.
	 */
	id: 'thegamingtreev4',
	/**
	 * The name of the author, displayed in the info tab.
	 */
	author: 'medsal15',
	/**
	 * This changes what is displayed instead of "points" for the main currency.
	 */
	pointsName: 'points',
	/**
	 * An array of file addresses which will be loaded for this mod.
	 * Using smaller files makes it easier to find what you're looking for.
	 */
	modFiles: [
		'tree.js',
		'items.js',
		'layers/hotkeys.js',

		// main
		'layers/main/side/achievement.js',
		'layers/main/0/experience.js',
		'layers/main/1/level.js', 'layers/main/1/crafting.js',
		'layers/main/2/boss.js',
	],
	/**
	 * If you have a Discord server or other discussion place, you can add a link to it.
	 *
	 * The text on the link.
	 */
	discordName: '',
	/**
	 * If you have a Discord server or other discussion place, you can add a link to it.
	 *
	 * The url of an invite.
	 * If you're using a Discord invite, please make sure it's set to never expire
	 */
	discordLink: '',
	/**
	 * The maximum amount of offline time that the player can accumulate, in hours.
	 * Any extra time is lost.
	 */
	offlineLimit: 12,  // In hours
	/**
	 * A Decimal for the amount of points a new player should start with.
	 */
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
};

/**
 * Used to describe the current version of your mod
 */
let VERSION = {
	/**
	 * The mod's version number, displayed at the top right of the tree tab.
	 */
	num: 'R0.1',
	/**
	 * The version's name, displayed alongside the number in the info tab.
	 */
	name: 'RRewrite',
	beta: false,
};

/**
 * HTML displayed in the changelog tab
 */
let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- Rewrote XP, Level, Loot, and Boss.<br>
		- Update endgame: Enter the first boss fight.`;

let winText = `Congratulations! You have finished the current content in the game. Look forward for more.`;

/**
 * Very important, if you are adding non-standard functions.
 * TMT calls every function anywhere in "layers" every tick to store the result, unless specifically told not to.
 * Functions that have are used to do an action need to be identified.
 * "Official" functions (those in the documentation) are all fine, but if you make any new ones, add their names to this array.
 *
 * ```js
 * // (The ones here are examples, all official functions are already taken care of)
 * var doNotCallTheseFunctionsEveryTick = ["doReset", "buy", "onPurchase", "blowUpEverything"]
 * ```
 */
var doNotCallTheseFunctionsEveryTick = [];

/**
 * A function that returns any non-layer-related data that you want to be added to the save data and "player" object.
 *
 * ```js
 * function addedPlayerData() { return {
 * 	weather: "Yes",
 * 	happiness: new Decimal(72),
 * }}
 * ```
 */
function addedPlayerData() {
	return {
		items: Object.fromEntries(Object.keys(item_list).map(id => [id, {
			amount: D.dZero,
			total: D.dZero,
		}])),
	};
}

/**
 * An array of functions used to display extra things at the top of the tree tab.
 * Each function returns a string, which is a line to display (with basic HTML support).
 * If a function returns nothing, nothing is displayed (and it doesn't take up a line).
 *
 * @type {Computable<string>[]}
 */
var displayThings = [
	() => VERSION.beta ? '<span class="warning">Beta version, things might be a bit unstable</span>' : '',
	() => isEndgame() ? '<span style="color:#60C0F0">You are past endgame. Content may not be balanced.</span>' : '',
	() => {
		const chal = activeChallenge('b');
		if (!chal) return '';

		return `You are in challenge ${resourceColor(tmp.b.challenges[chal].color, tmp.b.challenges[chal].name)}`;
	},
];

/**
 * A function to determine if the player has reached the end of the game, at which point the "you win!" screen appears.
 *
 * @returns {Boolean}
 */
function isEndgame() {
	return inChallenge('b', 11);
}



// Less important things beyond this point!

/**
 * A CSS object containing the styling for the background of the full game. Can be a function!
 *
 * @type {Computable<CSSStyles>}
 */
var backgroundStyle = {}

// You can change this if you have things that can be messed up by long tick lengths
/**
 * Returns the maximum tick length, in milliseconds.
 * Only really useful if you have something that reduces over time,
 * which long ticks mess up (usually a challenge).
 *
 * @returns {Number}
 */
function maxTickLength() {
	return (3600); // Default is 1 hour which is just arbitrarily large
}

/**
 * Can be used to modify a save file when loading into a new version of the game.
 * Use this to undo inflation, never forcibly hard reset your players.
 *
 * @param {string} oldVersion
 */
function fixOldSave(oldVersion) {
}
