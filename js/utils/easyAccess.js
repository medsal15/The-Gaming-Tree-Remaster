/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {boolean}
 */
function hasUpgrade(layer, id) {
	return ((player?.[layer].upgrades.includes(toNumber(id)) || player?.[layer].upgrades.includes(id.toString())) && !tmp[layer]?.deactivated)
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {boolean}
 */
function hasMilestone(layer, id) {
	return ((player[layer].milestones.includes(toNumber(id)) || player[layer].milestones.includes(id.toString())) && !tmp[layer].deactivated)
}

/**
 * Determine if the player has the Achievement.
 *
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {boolean}
 */
function hasAchievement(layer, id) {
	return ((player[layer].achievements.includes(toNumber(id)) || player[layer].achievements.includes(id.toString())) && !tmp[layer].deactivated)
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {boolean}
 */
function hasChallenge(layer, id) {
	return player && !!((player[layer].challenges[id]) && !tmp[layer].deactivated)
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {boolean}
 */
function maxedChallenge(layer, id) {
	return ((player[layer].challenges[id] >= tmp[layer].challenges[id].completionLimit) && !tmp[layer].deactivated)
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {number}
 */
function challengeCompletions(layer, id) {
	return (player[layer].challenges[id])
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {boolean}
 */
function canEnterChallenge(layer, id) {
	return tmp[layer].challenges[id].canEnter ?? true
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {boolean}
 */
function canExitChallenge(layer, id) {
	return tmp[layer].challenges[id].canExit ?? true
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {Decimal}
 */
function getBuyableAmount(layer, id) {
	return (player[layer].buyables[id])
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @param {Decimal} amt
 */
function setBuyableAmount(layer, id, amt) {
	player[layer].buyables[id] = amt
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @param {number|Decimal|string} amt
 */
function addBuyables(layer, id, amt) {
	player[layer].buyables[id] = player[layer].buyables[id].add(amt)
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {string|number}
 */
function getClickableState(layer, id) {
	return (player[layer].clickables[id])
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @param {string|number} state
 */
function setClickableState(layer, id, state) {
	player[layer].clickables[id] = state
}

/**
 * @template {keyof Layers} L
 * @param {L} layer
 * @param {number} id
 * @returns {Player[L]['grid']}
 */
function getGridData(layer, id) {
	return (player[layer].grid[id])
}

/**
 * @template {keyof Layers} L
 * @param {L} layer
 * @param {number} id
 * @param {Player[L]['grid']} data
 */
function setGridData(layer, id, data) {
	player[layer].grid[id] = data
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {any}
 */
function upgradeEffect(layer, id) {
	return (tmp[layer]?.upgrades[id].effect)
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {any}
 */
function challengeEffect(layer, id) {
	return (tmp[layer].challenges[id].rewardEffect)
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {any}
 */
function buyableEffect(layer, id) {
	return (tmp[layer]?.buyables?.[id].effect)
}

/**
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {any}
 */
function clickableEffect(layer, id) {
	return (tmp[layer].clickables[id].effect)
}

/**
 * Returns the current effects of the achievement, if any.
 *
 * @param {keyof Layers} layer
 * @param {string|number} id
 * @returns {any}
 */
function achievementEffect(layer, id) {
	return (tmp[layer].achievements[id].effect)
}

/**
 * @param {keyof Layers} layer
 * @param {number} id
 * @returns {any}
 */
function gridEffect(layer, id) {
	return (gridRun(layer, 'getEffect', player[layer].grid[id], id))
}
