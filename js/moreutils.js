const UI_SIZES = {
    width: 3,
    height: 2,
};
/**
 * Checks if an upgrade can be purchased in a layer
 *
 * @param {keyof Layers} layer Layer to check for
 * @param {number[]} [rows] Rows to check for, by default all rows are checked
 * @returns {Boolean} True if an unlocked upgrade can be purchased
 */
function canAffordLayerUpgrade(layer, rows = { includes: n => true, length: 1 }) {
    if (!tmp[layer].upgrades || !rows.length) return false;

    try {
        for (const id in tmp[layer].upgrades) {
            if (isNaN(id)) continue;
            const row = Math.floor(id / 10);
            if (!rows.includes(row)) continue;
            let upgrade = tmp[layer].upgrades[id];
            if (!upgrade.unlocked) continue;
            if (!hasUpgrade(layer, id) && canAffordUpgrade(layer, id)) return true;
        }
    } catch { };
    return false;
}
/**
 * Checks if a buyable can be purchased in a layer
 *
 * @param {keyof Layers} layer Layer to check for
 * @returns {Boolean} True if an unlocked buyable can be purchased
 */
function canAffordLayerBuyable(layer) {
    if (!tmp[layer].buyables) return false;

    for (let id in tmp[layer].buyables) {
        if (isNaN(id)) continue;
        let buyable = tmp[layer].buyables[id];
        if (!buyable.unlocked) continue;
        if (canBuyBuyable(layer, id)) return true;
    }
    return false;
}
/**
 * Checks if a challenge can be completed in a layer
 *
 * @param {keyof Layers} layer Layer to check for
 * @returns {Boolean} True if an unlocked challenge can be completed
 */
function canCompleteLayerChallenge(layer) {
    if (!tmp[layer].challenges) return false;

    for (let id in tmp[layer].challenges) {
        if (isNaN(id)) continue;
        let challenge = tmp[layer].challenges[id];
        if (!challenge.unlocked) continue;
        if (canCompleteChallenge(layer, id)) return true;
    }
    return false;
}
/**
 * Sums the amount of purchased buyables in a layer
 *
 * @param {keyof Layers} layer Layer to check in
 * @returns {Decimal} The amount of purchased buyables
 */
function layerBuyableAmount(layer) {
    if (!tmp[layer].buyables) return new Decimal(0);

    let sum = new Decimal(0);
    for (let id in tmp[layer].buyables) {
        if (typeof tmp[layer].buyables != 'object') continue;
        sum = sum.add(getBuyableAmount(layer, id));
    }
    return sum;
}
/**
 * Colors a resource text
 *
 * @param {string} color
 * @param {string} text
 * @param {string} [style=""]
 * @returns {string}
 */
function resourceColor(color, text, style = "") {
    return `<span style="color:${color};text-shadow:${color} 0 0 10px;${style}" class="resource">${text}</span>`;
}
/**
 * Like format, but returns an array of smaller numbers
 *
 * @param {DecimalSource} decimal Number to format
 * @param {number} group_size Maximum of a group. **Must be a number!**
 * @param {number} max_groups Maximum amount of groups, the last group will ignore `group_size`. **Must be a number!**
 * @returns {string[]}
 */
function formatGroups(decimal, group_size, max_groups) {
    if (!max_groups || group_size <= 0) return [format(decimal)];

    // If decimal is bigger than that, we just return a mostly empty array
    const limit = D.pow(group_size, max_groups).times(1e9);
    if (D.gte(decimal, limit)) {
        const arr = Array.from({ length: max_groups - 1 }, (_, i) => '0');
        arr.push(formatWhole(D.div(decimal, limit)));
        return arr;
    }

    return Array.from({ length: max_groups }, (_, i) => {
        if (i == max_groups - 1) return formatWhole(decimal);

        let group = D(decimal).toNumber() % group_size;
        decimal = D.div(decimal, group_size).floor();
        if (i == 0) return format(group);
        return formatWhole(group);
    });
}
/**
 * @param {DecimalSource} chance
 */
function format_chance(chance) {
    if (D.gte(chance, 1) || options.noRNG) return `+${format(chance)}`;
    if (D.lte(chance, 0)) return format(0);

    const fractional = options.chanceMode == 'NOT_GUARANTEED' || (options.chanceMode == 'LESS_HALF' && D.lt(chance, .5));

    if (fractional) {
        return `1/${format(D.pow(chance, -1))}`;
    } else {
        return `${format(D.times(chance, 100))}%`;
    }
}
/**
 * Shorthand for Decimal and shorter way to create one
 *
 * @type {((val: DecimalSource) => Decimal)&{[k in keyof typeof Decimal]: (typeof Decimal)[k]}}
 */
const D = new Proxy(val => new Decimal(val), {
    get(_, prop) { return Decimal[prop]; },
    ownKeys() { return Object.keys(Decimal); },
});
/**
 * Same as `player.<layer>.activeChallenge ?? false`
 *
 * @param {keyof Layers} layer
 * @returns {number|false}
 */
function activeChallenge(layer) {
    return player[layer].activeChallenge ?? false;
}
/**
 * Capitalizes the first letter
 *
 * @param {string} text
 * @returns {string}
 */
function capitalize(text) {
    return `${text}`.replace(/^./, s => s.toUpperCase());
}
/**
 * Capitalizes the first letter of each word
 *
 * @param {string} text
 */
function capitalize_words(text) {
    return `${text}`.replaceAll(/^.| ./g, s => s.toUpperCase());
}
/**
 * Rounds a number to a multiple of a power of `pow`
 *
 * Exemple:
 * ```js
 * powerRound(333, 100).eq(300); //true
 * ```
 *
 * @param {DecimalSource} decimal
 * @param {DecimalSource} pow
 * @returns {Decimal}
 */
function powerRound(decimal, pow) {
    let base = D.pow(pow, D.log(decimal, pow).floor()),
        mult = D.div(decimal, base).round();

    return base.times(mult);
}
/**
 * Converts hsl to rgb
 *
 * @param {number} hue Contained within [0,1]
 * @param {number} saturation Contained within [0,1]
 * @param {number} lightness Contained within [0,1]
 * @returns {[number, number, number]}
 *
 * @see https://stackoverflow.com/a/9493060
 */
function hsl_to_rgb(hue, saturation, lightness) {
    let r, g, b;

    if (saturation == 0) {
        // Achromatic
        r = g = b = lightness;
    } else {
        const q = lightness < .5 ? l * (1 + saturation) : lightness + saturation - lightness * saturation,
            p = 2 * lightness - q;
        r = hue_to_rgb(p, q, hue + 1 / 3);
        g = hue_to_rgb(p, q, hue);
        b = hue_to_rgb(p, q, hue - 1 / 3);
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}
/**
 * @param {number} p
 * @param {number} q
 * @param {number} t
 */
function hue_to_rgb(p, q, t) {
    if (t < 0) t++;
    if (t > 1) t--;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}
/**
 * Given a color, returns either black or white, depending on which one is furthest
 *
 * @param {string} color
 */
function rgb_opposite_bw(color) {
    const sum = rgb_split(color).map(n => n / 256 / 3)
        .reduce((a, b) => a + b, 0);

    if (sum > .5) return '#000000';
    return '#FFFFFF';
}
/**
 * Splits a hex color into its red, green, and blue values
 *
 * @param {string} color
 * @returns {[number, number, number]}
 */
function rgb_split(color) {
    return Array.from({ length: 3 }, (_, i) => parseInt(color.slice(i * 2 + 1, i * 2 + 3), 16));
}
/**
 * Generates a random alphabetical string
 *
 * @param {number} length
 * @returns {string}
 */
function random_string_alpha(length) {
    return Array.from({ length }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');
}

// Layer methods
/**
 * Returns the content for lore in the XP tabFormat
 *
 * @param {monsters} monster
 * @returns {TabFormatEntries<'xp'>[]}
 */
function bestiary_content(monster) {
    const tmonst = tmp.xp.monsters[monster];

    if (!(tmonst.unlocked ?? true)) return [];

    /** @type {TabFormatEntries<'xp'>[]} */
    const lines = [
        [
            'raw-html',
            `<div style="width: 240px; height: 240px; overflow: hidden">
                    <img src="./resources/images/enemies.png"
                        style="width: ${MONSTER_SIZES.width * 100}%;
                            height: ${MONSTER_SIZES.height * 100}%;
                            margin-left: ${-240 * tmonst.position[0]}px;
                            margin-top: ${-240 * tmonst.position[1]}px;
                            image-rendering: crisp-edges;"/>
                </div>`
        ],
        ['display-text', capitalize(tmonst.name)],
        'blank',
        ['display-text', `Level ${formatWhole(tmonst.level)}`],
        ['display-text', `Killed ${resourceColor(tmp.xp.kill.color, formatWhole(player.xp.monsters[monster].kills))} times`],
        ['display-text', `Gives ${resourceColor(tmp.xp.color, format(tmonst.experience))} XP on kill`],
        'blank',
        ['display-text', `Health: ${format(player.xp.monsters[monster].health)} / ${format(tmonst.health)}`],
        'blank',
    ];

    /** @type {TabFormatEntries<'xp'>[]} */
    const upgrade_lines = [];
    if (hasUpgrade('xp', 32)) upgrade_lines.push([
        'display-text',
        `${resourceColor(tmp.xp.color, capitalize(tmp.xp.upgrades[32].title))} effect: *${format(upgradeEffect('xp', 32)[monster])} XP`
    ]);

    if (upgrade_lines.length > 0) lines.push(...upgrade_lines, 'blank');

    // Add the lore at the end
    lines.push(
        ['display-text', tmonst.lore],
    );

    return lines;
}

