// ************ Big Feature related ************

/**
 * @param {keyof Layers} layer
 */
function respecBuyables(layer) {
	if (!layers[layer].buyables) return
	if (!layers[layer].buyables.respec) return
	if (!player[layer].noRespecConfirm && !confirm(tmp[layer].buyables.respecMessage || "Are you sure you want to respec? This will force you to do a \"" + (tmp[layer].name ? tmp[layer].name : layer) + "\" reset as well!")) return
	run(layers[layer].buyables.respec, layers[layer].buyables)
	updateBuyableTemp(layer)
	document.activeElement.blur()
}

/**
 * @param {keyof Layers} layer
 * @param {String|Number} id
 * @returns {Boolean}
 */
function canAffordUpgrade(layer, id) {
	let upg = tmp[layer].upgrades[id]
	if (tmp[layer].deactivated) return false
	if (tmp[layer].upgrades[id].canAfford === false) return false
	let cost = tmp[layer].upgrades[id].cost
	if (cost !== undefined)
		return canAffordPurchase(layer, upg, cost)

	return true
}

/**
 * @param {keyof Layers} layer
 * @param {String|Number} id
 * @returns {Boolean}
 */
function canBuyBuyable(layer, id) {
	let b = temp[layer].buyables[id]
	return (b.unlocked && run(b.canAfford, b) && player[layer].buyables[id]?.lt(b.purchaseLimit) && !tmp[layer].deactivated)
}



/**
 * @param {keyof Layers} layer
 * @param {{currencyLocation: String, currencyInternalName: String, currencyLayer: String}} thing
 * @param {String|Number|Decimal} cost
 */
function canAffordPurchase(layer, thing, cost) {
	if (thing.currencyInternalName) {
		let name = thing.currencyInternalName
		if (thing.currencyLocation) {
			return !((thing.currencyLocation[name] ?? Decimal.dZero).lt(cost))
		}
		else if (thing.currencyLayer) {
			let lr = thing.currencyLayer
			return !(player[lr][name].lt(cost))
		}
		else {
			return !(player[name].lt(cost))
		}
	}
	else {
		return !Decimal.lt(player[layer].points, cost)
	}
}

/**
 * @param {keyof Layers} layer
 * @param {String|Number} id
 */
function buyUpgrade(layer, id) {
	buyUpg(layer, id)
}

/**
 * @param {keyof Layers} layer
 * @param {String|Number} id
 */
function buyUpg(layer, id) {
	if (!tmp[layer].upgrades || !tmp[layer].upgrades[id]) return
	let upg = tmp[layer].upgrades[id]
	if (!player[layer].unlocked || player[layer].deactivated) return
	if (!tmp[layer].upgrades[id].unlocked) return
	if (player[layer].upgrades.includes(id)) return
	if (upg.canAfford === false) return
	let pay = layers[layer].upgrades[id].pay
	if (pay !== undefined)
		run(pay, layers[layer].upgrades[id])
	else {
		let cost = tmp[layer].upgrades[id].cost

		if (upg.currencyInternalName) {
			let name = upg.currencyInternalName
			if (upg.currencyLocation) {
				if (upg.currencyLocation[name].lt(cost)) return
				upg.currencyLocation[name] = upg.currencyLocation[name].sub(cost)
			}
			else if (upg.currencyLayer) {
				let lr = upg.currencyLayer
				if (player[lr][name].lt(cost)) return
				player[lr][name] = player[lr][name].sub(cost)
			}
			else {
				if (player[name].lt(cost)) return
				player[name] = player[name].sub(cost)
			}
		}
		else {
			if (player[layer].points.lt(cost)) return
			player[layer].points = player[layer].points.sub(cost)
		}
	}
	player[layer].upgrades.push(id);
	if (upg.onPurchase != undefined)
		run(upg.onPurchase, upg)
	needCanvasUpdate = true
}

/**
 * @param {keyof Layers} layer
 * @param {String|Number} id
 */
function buyMaxBuyable(layer, id) {
	if (!player[layer].unlocked) return
	if (!tmp[layer].buyables[id].unlocked) return
	if (!tmp[layer].buyables[id].canBuy) return
	if (!layers[layer].buyables[id].buyMax) return

	run(layers[layer].buyables[id].buyMax, layers[layer].buyables[id])
	updateBuyableTemp(layer)
}

/**
 * @param {keyof Layers} layer
 * @param {String|Number} id
 */
function buyBuyable(layer, id) {
	if (!player[layer].unlocked) return
	if (!tmp[layer].buyables[id].unlocked) return
	if (!tmp[layer].buyables[id].canBuy) return

	run(layers[layer].buyables[id].buy, layers[layer].buyables[id])
	updateBuyableTemp(layer)
}

/**
 * @param {keyof Layers} layer
 * @param {String|Number} id
 */
function clickClickable(layer, id) {
	if (!player[layer].unlocked || tmp[layer].deactivated) return
	if (!tmp[layer].clickables[id].unlocked) return
	if (!tmp[layer].clickables[id].canClick) return

	run(layers[layer].clickables[id].onClick, layers[layer].clickables[id])
	updateClickableTemp(layer)
}

/**
 * @param {keyof Layers} layer
 * @param {String|Number} id
 */
function clickGrid(layer, id) {
	if (!player[layer].unlocked || tmp[layer].deactivated) return
	if (!run(layers[layer].grid.getUnlocked, layers[layer].grid, id)) return
	if (!gridRun(layer, 'getCanClick', player[layer].grid[id], id)) return

	gridRun(layer, 'onClick', player[layer].grid[id], id)
}

// Function to determine if the player is in a challenge
/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {boolean}
 */
function inChallenge(layer, id) {
	let challenge = player?.[layer]?.activeChallenge
	if (!challenge) return false
	id = toNumber(id)
	if (challenge == id) return true

	if (layers[layer].challenges[challenge].countsAs)
		return tmp[layer].challenges[challenge].countsAs.includes(id) || false
	return false
}

// ************ Misc ************

var onTreeTab = true

/**
 * @param {String} name
 */
function showTab(name) {
	if (LAYERS.includes(name) && !layerunlocked(name)) return
	if (player.tab !== name) clearParticles(function (p) { return p.layer === player.tab })
	player.tab = name
	if (tmp[name] && (tmp[name].row !== "side") && (tmp[name].row !== "otherside")) player.lastSafeTab = name
	updateTabFormats()
	needCanvasUpdate = true
	document.activeElement.blur()

}

/**
 * @param {String} name
 * @param {String} prev
 */
function showNavTab(name, prev) {
	if (LAYERS.includes(name) && !layerunlocked(name)) return
	if (player.navTab !== name) clearParticles(function (p) { return p.layer === player.navTab })
	if (tmp[name] && tmp[name].previousTab !== undefined) prev = tmp[name].previousTab
	var toTreeTab = name == "tree-tab";
	if (name !== "none" && prev && !tmp[prev]?.leftTab == !tmp[name]?.leftTab) player[name].prevTab = prev
	else if (player[name])
		player[name].prevTab = ""
	player.navTab = name
	updateTabFormats()
	needCanvasUpdate = true
}


/**
 * @param {keyof Layers} layer
 */
function goBack(layer) {
	let nextTab = "none"

	if (player[layer].prevTab) nextTab = player[layer].prevTab
	if (player.navTab === "none" && (tmp[layer]?.row == "side" || tmp[layer].row == "otherside")) nextTab = player.lastSafeTab

	if (tmp[layer].leftTab) showNavTab(nextTab, layer)
	else showTab(nextTab, layer)

}

/**
 * @template T
 * @param {Object} obj1
 * @param {T} obj2
 * @returns {T}
 */
function layOver(obj1, obj2) {
	for (let x in obj2) {
		if (obj2[x] instanceof Decimal) obj1[x] = new Decimal(obj2[x])
		else if (obj2[x] instanceof Object) layOver(obj1[x], obj2[x]);
		else obj1[x] = obj2[x];
	}
}

/**
 * @param {keyof Layers} layer
 * @returns {Boolean}
 */
function prestigeNotify(layer) {
	if (layers[layer].prestigeNotify) return layers[layer].prestigeNotify()

	if (isPlainObject(tmp[layer].tabFormat)) {
		for (const subtab in tmp[layer].tabFormat) {
			if (subtabResetNotify(layer, 'mainTabs', subtab))
				return true
		}
	}
	for (const family in tmp[layer].microtabs) {
		for (const subtab in tmp[layer].microtabs[family]) {
			if (subtabResetNotify(layer, family, subtab))
				return true
		}
	}
	if (tmp[layer].autoPrestige || tmp[layer].passiveGeneration) return false
	else if (tmp[layer].type == "static") return tmp[layer].canReset
	else if (tmp[layer].type == "normal") return (tmp[layer].canReset && (tmp[layer].resetGain.gte(player[layer].points.div(10))))
	else return false
}

/**
 * @param {String} name
 */
function notifyLayer(name) {
	if (player.tab == name || !layerunlocked(name)) return
	player.notify[name] = 1
}

/**
 * @param {keyof Layers} layer
 * @param {String} family
 * @param {String} id
 * @returns {Boolean}
 */
function subtabShouldNotify(layer, family, id) {
	let subtab = {}
	if (family == "mainTabs") subtab = tmp[layer].tabFormat[id]
	else subtab = tmp[layer].microtabs[family][id]
	if (!(subtab.unlocked ?? true)) return false
	if (subtab.embedLayer) return tmp[subtab.embedLayer].notify
	else return subtab.shouldNotify
}

/**
 * @param {keyof Layers} layer
 * @param {String} family
 * @param {String} id
 * @returns {Boolean}
 */
function subtabResetNotify(layer, family, id) {
	let subtab = {}
	if (family == "mainTabs") subtab = tmp[layer].tabFormat[id]
	else subtab = tmp[layer].microtabs[family][id]
	if (subtab.embedLayer) return tmp[subtab.embedLayer].prestigeNotify
	else return subtab.prestigeNotify
}

/**
 * @param {keyof Layers} layer
 * @returns {Boolean}
 */
function nodeShown(layer) {
	return layerShown(layer)
}

/**
 * @param {keyof Layers} layer
 * @returns {Boolean}
 */
function layerunlocked(layer) {
	if (tmp[layer] && tmp[layer].type == "none") return (player[layer].unlocked)
	return LAYERS.includes(layer) && (player[layer].unlocked || (tmp[layer].canReset && tmp[layer].layerShown))
}

function keepGoing() {
	player.keepGoing = true;
	needCanvasUpdate = true;
}

/**
 * @param {Decimal|string} x
 * @returns {Number}
 */
function toNumber(x) {
	if (x.mag !== undefined) return x.toNumber()
	if (x + 0 !== x) return parseFloat(x)
	return x
}

/**
 * @param {keyof Layers} layer
 */
function updateMilestones(layer) {
	if (tmp[layer].deactivated) return
	for (const id in layers[layer].milestones) {
		if (!(hasMilestone(layer, id)) && layers[layer].milestones[id].done()) {
			player[layer].milestones.push(id)
			if (layers[layer].milestones[id].onComplete) layers[layer].milestones[id].onComplete()
			if (tmp[layer].milestonePopups || tmp[layer].milestonePopups === undefined) doPopup("milestone", tmp[layer].milestones[id].requirementDescription, "Milestone Gotten!", 3, tmp[layer].color);
			player[layer].lastMilestone = id
		}
	}
}

/**
 * @param {keyof Layers} layer
 */
function updateAchievements(layer) {
	if (tmp[layer].deactivated) return
	for (const id in layers[layer].achievements) {
		if (isPlainObject(layers[layer].achievements[id]) && !(hasAchievement(layer, id)) && layers[layer].achievements[id].done()) {
			player[layer].achievements.push(id)
			if (layers[layer].achievements[id].onComplete) layers[layer].achievements[id].onComplete()
			if (tmp[layer].achievementPopups || tmp[layer].achievementPopups === undefined) doPopup("achievement", tmp[layer].achievements[id].name, "Achievement Gotten!", 3, tmp[layer].color);
		}
	}
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 */
function giveAchievement(layer, id) {
	if (tmp[layer].deactivated) return;
	if (isPlainObject(layers[layer].achievements[id]) && !(hasAchievement(layer, id))) {
		player[layer].achievements.push(id);
		if (layers[layer].achievements[id].onComplete) layers[layer].achievements[id].onComplete();
		if (tmp[layer].achievementPopups || tmp[layer].achievementPopups === undefined) doPopup("achievement", tmp[layer].achievements[id].name, "Achievement Gotten!", 3, tmp[layer].color);
	}
}

/**
 * @param {Number} diff
 * @param {keyof Layers} layer
 */
function addTime(diff, layer) {
	let data = player
	let time = data.timePlayed
	if (layer) {
		data = data[layer]
		time = data.time
	}

	//I am not that good to perfectly fix that leak. ~ DB Aarex
	if (time + 0 !== time) {
		console.log("Memory leak detected. Trying to fix...")
		time = toNumber(time)
		if (isNaN(time) || time == 0) {
			console.log("Couldn't fix! Resetting...")
			time = layer ? player.timePlayed : 0
			if (!layer) player.timePlayedReset = true
		}
	}
	time += toNumber(diff)

	if (layer) data.time = time
	else data.timePlayed = time
}

var shiftDown = false
var ctrlDown = false

document.onkeydown = function (e) {
	if (player === undefined) return;
	shiftDown = e.shiftKey
	ctrlDown = e.ctrlKey
	if (tmp.gameEnded && !player.keepGoing) return;
	let key = e.key
	if (ctrlDown) key = "ctrl+" + key
	if (onFocused) return
	if (ctrlDown && hotkeys[key]) e.preventDefault()
	if (hotkeys[key]) {
		hotkeys[key].forEach(/**@param {Hotkey & {layer: string, id: string}} k*/k => {
			if (player[k.layer].unlocked && tmp[k.layer].hotkeys[k.id].unlocked) k.onPress();
		});
	}
}

document.onkeyup = function (e) {
	shiftDown = e.shiftKey
	ctrlDown = e.ctrlKey
}

var onFocused = false
/**
 * @param {Boolean} x
 */
function focused(x) {
	onFocused = x
}


/**
 * @param {any} obj
 * @returns {obj is (...args: any) => any}
 */
function isFunction(obj) {
	return !!(obj && obj.constructor && obj.call && obj.apply);
};

/**
 * @param {any} obj
 * @returns {obj is Object}
 */
function isPlainObject(obj) {
	return (!!obj) && (obj.constructor === Object)
}

document.title = modInfo.name

// Converts a string value to whatever it's supposed to be
/**
 * @param {String} value
 * @param {String|Number|Decimal} oldValue
 * @returns {String|Number|Decimal}
 */
function toValue(value, oldValue) {
	if (oldValue instanceof Decimal) {
		value = new Decimal(value)
		if (checkDecimalNaN(value)) return decimalZero
		return value
	}
	if (!isNaN(oldValue))
		return parseFloat(value) || 0
	return value
}

// Variables that must be defined to display popups
var activePopups = [];
var popupID = 0;

// Function to show popups
/**
 * @param {'achievement'|'challenge'|'none'} type
 * @param {String} text
 * @param {String} title
 * @param {Number} timer time in seconds to display it
 * @param {String?} color
 */
function doPopup(type = "none", text = "This is a test popup.", title = "", timer = 3, color = "") {
	switch (type) {
		case "achievement":
			popupTitle = "Achievement Unlocked!";
			popupType = "achievement-popup"
			break;
		case "challenge":
			popupTitle = "Challenge Complete";
			popupType = "challenge-popup"
			break;
		default:
			popupTitle = "Something Happened?";
			popupType = "default-popup"
			break;
	}
	if (title != "") popupTitle = title;
	popupMessage = text;
	popupTimer = timer;

	activePopups.push({ "time": popupTimer, "type": popupType, "title": popupTitle, "message": (popupMessage + "\n"), "id": popupID, "color": color })
	popupID++;
}


//Function to reduce time on active popups
/**
 * @param {Number} diff in seconds
 */
function adjustPopupTime(diff) {
	for (const popup in activePopups) {
		activePopups[popup].time -= diff;
		if (activePopups[popup]["time"] < 0) {
			activePopups.splice(popup, 1); // Remove popup when time hits 0
		}
	}
}

/**
 * @template T, E, O
 * @param {E|(args: T, this: O) => E} func
 * @param {O} target bound to the function
 * @param {T} args
 * @returns {E} returns `func` if it's not a valid function
 */
function run(func, target, args = null) {
	if (isFunction(func)) {
		let bound = func.bind(target)
		return bound(args)
	}
	else
		return func;
}

/**
 * @template {keyof Layers} L
 * @param {L} layer
 * @param {string} func id of a function in a grid
 * @param {Player[L]['grid'][number]} data
 * @param {string|number}
 * @returns {any} returns `func` if it's not a valid function
 */
function gridRun(layer, func, data, id) {
	if (isFunction(layers[layer].grid[func])) {
		let bound = layers[layer].grid[func].bind(layers[layer].grid)
		return bound(data, id)
	}
	else
		return layers[layer].grid[func];
}
