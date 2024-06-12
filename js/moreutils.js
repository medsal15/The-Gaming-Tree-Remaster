const UI_SIZES = {
    width: 2,
    height: 2,
};
const MONSTER_SIZES = {
    width: 1,
    height: 2,
};
const ITEM_SIZES = {
    width: 8,
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
 * Returns the average of 2 or more hex colors
 *
 * @param {...string} colors
 * @returns {string}
 */
function colors_average(...colors) {
    if (!colors.length) return '#000000';
    if (colors.length == 1) return colors[0];

    return '#' + colors.map(color => Array.from({ length: 3 }, (_, i) => {
        const hex = color.slice(i * 2 + 1, (i + 1) * 2 + 1),
            val = parseInt(hex, 16);

        return val / color.length;
    }))
        .reduce(([pr, pg, pb], [cr, cg, cb]) => [pr + cr, pg + cg, pb + cb], [0, 0, 0])
        .map(num => Math.floor(num).toString(16).padStart(2, '0'))
        .join('');
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
 * Generates a random alphabetical string
 *
 * @param {number} length
 * @returns {string}
 */
function random_string_alpha(length) {
    return Array.from({ length }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');
}
/**
 * Given a color, returns either black or white, depending on which one is furthest
 *
 * @param {string} color
 */
function rgb_opposite_bw(color) {
    const sum = Array.from({ length: 3 }, (_, i) => {
        const pair = color.slice(i * 2 + 1, i * 2 + 3),
            num = parseInt(pair, 16);
        return num / 256 / 3;
    }).reduce((a, b) => a + b, 0);

    if (sum > .5) return '#000000';
    return '#FFFFFF';
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
                            margin-left: ${-240 * tmp.xp.monsters[monster].position[0]}px;
                            margin-top: ${-240 * tmp.xp.monsters[monster].position[1]}px;
                            image-rendering: crisp-edges;"/>
                </div>`
        ],
        ['display-text', capitalize(tmonst.name)],
        'blank',
        ['display-text', `Level ${formatWhole(tmonst.level)}`],
        ['display-text', `Killed ${resourceColor(tmp.xp.kill.color, formatWhole(player.xp.monsters[monster].kills))} times`],
        ['display-text', `Gives ${resourceColor(tmp.xp.color, format(tmonst.experience))} XP on kill`],
        'blank',
    ];

    /** @type {TabFormatEntries<'xp'>[]} */
    const upgrade_lines = [];
    if (hasUpgrade('xp', 32)) upgrade_lines.push([
        'display-text',
        `${resourceColor(tmp.xp.color, capitalize(tmp.xp.upgrades[32].title))} effect: *${format(upgradeEffect('xp', 32).slime)} XP`
    ]);

    if (upgrade_lines.length > 0) lines.push(...upgrade_lines, 'blank');

    if (D.gt(tmp.c.chance_multiplier, 0)) {
        const drops = source_drops(`kill:${monster}`),
            /** @type {string[]} */
            list = [];

        Object.entries(drops.chances)
            .forEach(/**@param{[items,Decimal]}*/([item, chance]) => list.push(`${tmp.items[item].name} (${format_chance(chance)})`));
        Object.entries(drops.fixed)
            .forEach(/**@param{[items,Decimal]}*/([item, chance]) => list.push(`${tmp.items[item].name} (${format_chance(chance)})`));

        lines.push(['display-text', `Drops: ${listFormat.format(list)}`], 'blank');
    }

    // Add the lore at the end
    lines.push(
        ['display-text', tmonst.lore],
    );

    return lines;
}
/**
 * Returns the content for the inventory tab in the Crafting tabFormat
 * @returns {TabFormatEntries<'c'>[]}
 */
function inventory() {
    /** @type {{[row: number]: items[]}} */
    const items = {};
    Object.values(tmp.items)
        .filter(item => 'grid' in item && (item.unlocked ?? true))
        .forEach(item => {
            /** @type {[number, number]} */
            const [row, col] = item.grid;

            (items[row] ??= [])[col] = item.id;
        });

    return Object.values(items).map(items => ['row', items.map(item => {
        const tile = item_tile(item),
            itemp = tmp.items[item],
            tooltip_lines = [];

        if ('effectDescription' in itemp) tooltip_lines.push(itemp.effectDescription(), '<br>');

        if ('sources' in itemp) {
            const {
                chance = {},
                fixed = {},
                per_second = {},
                other = [],
            } = itemp.sources;

            if (Object.entries(chance).length) tooltip_lines.push(...Object.entries(chance)
                .map(/**@param{[string,Decimal]}*/([source, chance]) =>
                    `${capitalize(source_name(source))}: ${format_chance(chance)}`));
            if (Object.entries(fixed).length) tooltip_lines.push(...Object.entries(fixed)
                .map(/**@param{[string,Decimal]}*/([source, chance]) =>
                    `${capitalize(source_name(source))}: ${format_chance(chance)}`));
            if (Object.entries(per_second).length) tooltip_lines.push(...Object.entries(per_second)
                .map(/**@param{[string,Decimal]}*/([source, amount]) =>
                    `${capitalize(source_name(source))}: +${format(amount)} /s`));
            if (other.length) tooltip_lines.push(...other.map(source => capitalize(source_name(source))));
        }

        tile.text += `<br>${formatWhole(player.items[item].amount)}`;
        tile.tooltip = tooltip_lines.join('<br>');

        return ['tile', tile];
    })]);
}
/**
 * Returns the selector in the compendium tab in the Crafting tabFormat
 *
 * @returns {TabFormatEntries<'c'>[]}
 */
function compendium_list() {
    /** @type {{[row: number]: items[]}} */
    const items = {};
    Object.values(tmp.items)
        .filter(item => 'grid' in item && (item.unlocked ?? true))
        .forEach(item => {
            /** @type {[number, number]} */
            const [row, col] = item.grid;

            (items[row] ??= [])[col] = item.id;
        });

    return Object.values(items).map(items => ['row', items.map(item => {
        const tile = item_tile(item),
            lore = D.gt(player.items[item].total, 0);

        tile.onClick = function () {
            return player.c.lore = item;
        };
        tile.canClick = function () {
            return player.c.lore != item && D.gt(player.items[item].total, 0);
        };
        if (!lore) {
            delete tile.style['background-color'];
            tile.tooltip = `Obtain one to unlock`;
        } else {
            delete tile.style['transform'];
        }

        return ['tile', tile];
    })]);
}
/**
 * Returns the content for the compendium tab in the Crafting tabFormat
 *
 * @param {items} item
 * @returns {TabFormatEntries<'c'>[]}
 */
function compendium_content(item) {
    if (!(item in tmp.items)) return [
        ['display-text', 'No item selected'],
    ];

    const itemp = tmp.items[item];

    if (!(itemp.unlocked ?? true)) return [];

    const lore = D.gt(player.items[item].total, 0),
        /** @type {TabFormatEntries<'c'>[]} */
        lines = [
            [
                'raw-html',
                `<div style="width: 160px; height: 160px; overflow: hidden">
                    <img src="./resources/images/items.png"
                        style="width: ${ITEM_SIZES.width * 100}%;
                            height: ${ITEM_SIZES.height * 100}%;
                            margin-left: ${-160 * tmp.items[item].icon[1]}px;
                            margin-top: ${-160 * tmp.items[item].icon[0]}px;
                            image-rendering: crisp-edges;"/>
                </div>`
            ],
            ['display-text', capitalize(itemp.name)],
            'blank',
            ['display-text', `You own ${resourceColor(itemp.color, format(player.items[item].amount))}`],
            ['display-text', `You have obtained ${resourceColor(itemp.color, format(player.items[item].total))} in total`],
            'blank',
        ];

    if ('effectDescription' in itemp) lines.push(
        ['display-text', run(itemp.effectDescription, itemp)],
        'blank',
    );

    lines.push(
        ['display-text', lore ? itemp.lore : `You need to obtain more ${itemp.name} to know about it`],
    );

    return lines;
}
/**
 * Returns the default amount for a recipe
 *
 * @param {string} recipe
 * @param {DecimalSource} [amount]
 */
function crafting_default_amount(recipe, amount) {
    if (amount && D.gt(amount, 0)) return D(amount);
    if (D.gt(player.c.recipes[recipe].time, 0)) return player.c.recipes[recipe].making;
    if (D.gt(player.c.recipes[recipe].target, 0)) return player.c.recipes[recipe].target;
    return D.dOne;
}
/**
 * Returns the default all_time for a recipe
 *
 * @param {string} recipe
 * @param {DecimalSource} [all_time]
 */
function crafting_default_all_time(recipe, all_time) {
    if (all_time && D.gt(all_time, 0)) return D(all_time);
    if (!(tmp.c.recipes[recipe].static ?? false)) return D.dZero;
    return player.c.recipes[recipe].crafted;
}
/**
 * Shows a row for a crafting recipe
 *
 * @param {string} recipe
 * @returns {TabFormatEntries<'c'>[]}
 */
function crafting_show_recipe(recipe) {
    const trecipe = tmp.c.recipes[recipe];
    if (!(trecipe.unlocked ?? true)) return [];
    if (trecipe.category.some(cat => player.c.hide_cat.includes(cat))) return [];

    const precipe = player.c.recipes[recipe],
        craft = D.gt(precipe.making, 0) ? `<br>Crafting ${formatWhole(precipe.making)}` : '',
        total = trecipe.static ? `<br>Crafted ${formatWhole(precipe.crafted)}` : '';

    /** @type {TabFormatEntries<'c'>[]} */
    const list = [
        //todo auto square
        ...trecipe.consumes.map(([item, amount]) => {
            const am = shiftDown ? `[${trecipe.formulas.consumes[item]}]` : `${format(player.items[item].amount)} / ${format(amount)}`,
                tile = item_tile(item);

            tile.text += `<br>${am}`;

            return ['tile', tile];
        }),
        'blank',
    ];
    if (D.gt(trecipe.duration, 0)) {
        let display;
        if (shiftDown) {
            display = `[${trecipe.formulas.duration}]`;
        } else {
            display = `${formatTime(precipe.time)} / ${formatTime(trecipe.duration)}`;
        }
        list.push([
            'dynabar',
            {
                height: 80,
                width: 240,
                direction: RIGHT,
                display,
                progress() {
                    if (D.lte(precipe.making, 0)) return 0;
                    return D.div(precipe.time, trecipe.duration);
                },
                fillStyle: { 'background-color': tmp.c.color },
            },
        ]);
    } else {
        list.push(['raw-html', `<div style="width: 120px;"></div>`]);
    }

    list.push(
        'blank',
        //todo auto square
        ...trecipe.produces.map(([item, amount]) => {
            const am = shiftDown ? `[${trecipe.formulas.produces[item]}]` : `${format(amount)}`,
                tile = item_tile(item);

            tile.text += `<br>${am}`;

            return ['tile', tile];
        }),
        'blank',
        // Amount selectors and start
        ['column', [
            ['tile', {
                text: '+',
                style: {
                    height: '30px',
                    width: '40px',
                },
                canClick() { return D.lt(precipe.target, tmp.c.crafting.max); },
                onClick() { precipe.target = D.add(precipe.target, 1).min(tmp.c.crafting.max); },
                onHold() { precipe.target = D.add(precipe.target, 1).min(tmp.c.crafting.max); },
            }],
            ['tile', {
                text: `Craft ${formatWhole(precipe.target)}${craft}${total}`,
                canClick() { return D.lte(precipe.making, 0) && crafting_can(recipe); },
                onClick() {
                    gain_items(trecipe.consumes.map(([item, amount]) => [item, amount.neg()]));
                    precipe.making = precipe.target;
                    precipe.time = D.dZero;
                    precipe.crafted = D.add(precipe.crafted, precipe.target);
                },
                style: {
                    height: '60px',
                },
            }],
            ['tile', {
                text: '-',
                style: {
                    height: '30px',
                    width: '40px',
                },
                canClick() { return D.gt(precipe.target, 1); },
                onClick() { precipe.target = D.minus(precipe.target, 1).max(1); },
                onHold() { precipe.target = D.minus(precipe.target, 1).max(1); },
            }],
        ]],
    );
    return ['row', list];
}
/**
 * Checks whether a recipe can run
 *
 * @param {string} recipe
 * @returns {boolean}
 */
function crafting_can(recipe) { return tmp.c.recipes[recipe].consumes.every(([item, amount]) => D.gte(player.items[item].amount, amount)); }
