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
 * @param {{min: DecimalSource, max: DecimalSource}} range
 */
function format_range(range) {
    const min = D(range.min),
        max = D(range.max);
    if (options.noRNG) {
        return `+${format(min.add(max).div(2))}`;
    } else {
        return `+${format(min)}-${format(max)}`;
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
 * Given a color, returns its negative
 *
 * @param {string} color
 */
function rgb_negative(color) {
    return `#${rgb_split(color).map(n => (255 - n).toString(16).padStart(2, '0')).join('')}`;
}
/**
 * Given a color, returns its grayscale
 *
 * @param {string} color
 */
function rgb_grayscale(color) {
    const sum = rgb_split(color).map(n => n / 256 / 3)
        .reduce((a, b) => a + b, 0) * 256;

    return `#${Math.floor(sum).toString(16).padStart(2, '0').repeat(3)}`;
}
/**
 * Splits a hex color into its red, green, and blue values
 *
 * @param {string} color
 * @returns {[number, number, number]}
 */
function rgb_split(color) {
    if (!color || typeof color != 'string') return [0, 0, 0];
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
/**
 * Returns the result of 2 colors (as R, G, B) as per progress
 *
 * @param {[number, number, number]} low
 * @param {[number, number, number]} high
 * @param {number} progress Progress between low and high, between 0 and 1
 * @returns {[number, number, number]}
 */
function color_between(low, high, progress) {
    if (D.lte(progress, 0)) return low;
    if (D.gte(progress, 1)) return high;

    const unprogress = 1 - progress;
    return Array.from({ length: 3 }, (_, i) => Math.floor(high[i] * progress + low[i] * unprogress));
}
/**
 * Returns a square of the given list
 *
 * @template T
 * @param {T[]} list
 * @param {number} [size]
 * @returns {T[][]}
 */
function square(list, size) {
    size ??= Math.ceil(Math.sqrt(list.length));
    if (size <= 0) return [];

    /** @type {T[][]} */
    const sq = [];
    let x = 0;

    list.forEach(val => {
        if (x >= sq.length) sq.push([val]);
        else {
            sq[x].push(val);
            if (sq[x].length >= size) x++;
        }
    });

    return sq;
}

// Layer methods
// experience
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
        ['display-text', `Level ${resourceColor(tmp.l.color, formatWhole(tmonst.level))}`],
        ['display-text', `Killed ${resourceColor(tmp.xp.kill.color, formatWhole(player.xp.monsters[monster].kills))} times`],
    ];

    if (D.neq(tmonst.kills, 1)) lines.push(['display-text', `Each kill counts as ${resourceColor(tmp.xp.kill.color, format(tmonst.kills))} kills`]);

    lines.push(
        ['display-text', `Gives ${resourceColor(tmp.xp.color, format(tmonst.experience))} XP on kill`],
        'blank',
        ['display-text', `Health: ${format(player.xp.monsters[monster].health)} / ${format(tmonst.health)}`],
    );

    if (D.gt(tmonst.damage_per_second, 0)) lines.push(['display-text', `Damage per second: ~${format(tmonst.damage_per_second)}`]);
    if (inChallenge('b', 31)) {
        lines.push(['display-text', `Damage: ${format(tmp.dea.monsters[monster].damage)}`]);
    }

    lines.push('blank');

    /** @type {TabFormatEntries<'xp'>[]} */
    const upgrade_lines = [];

    if (hasUpgrade('l', 31)) upgrade_lines.push([
        'display-text',
        `${resourceColor(tmp.l.skill_points.color, tmp.l.upgrades[31].title)} effect: +${format(upgradeEffect('l', 31)[monster])} damage`,
    ]);
    // Monster specific upgrades
    switch (monster) {
        case 'slime': {
            if (inChallenge('b', 11)) {
                const group = tmp.b.challenges[11].group;
                upgrade_lines.push([
                    'display-text',
                    `${resourceColor(tmp.b.groups[group].color, tmp.b.challenges[11].name)} active effect: *${formatWhole(2)} health, *${format(1.5)} experience`,
                ]);
            }
            if (inChallenge('b', 21)) {
                const group = tmp.b.challenges[21].group;
                upgrade_lines.push([
                    'display-text',
                    `${resourceColor(tmp.b.groups[group].color, tmp.b.challenges[21].name)} active effect: *${formatWhole(2)} health, /${format(2)} experience`,
                ]);
            }
            if (hasChallenge('b', 11)) {
                const group = tmp.b.challenges[11].group;
                upgrade_lines.push([
                    'display-text',
                    `${resourceColor(tmp.b.groups[group].color, tmp.b.challenges[11].name)} reward effect: *${format(1.5)} experience`,
                ]);
            }
            if (D.gt(player.items.densium_slime.amount, 0)) {
                const itemp = tmp.items.densium_slime;
                upgrade_lines.push([
                    'display-text',
                    `${resourceColor(itemp.color, capitalize(itemp.name))} effect: *${format(itemp.effect.slime_mult)} health, experience, kills, and drops`,
                ]);
            }
        }; break;
    }

    if (upgrade_lines.length > 0) lines.push(...upgrade_lines, 'blank');

    // Add the lore at the end
    lines.push(
        ['display-text', tmonst.lore],
    );

    const own_drops = source_drops(`kill:${monster}`),
        any_drops = source_drops('kill:any'),
        /** @type {[items, Decimal][]} */
        chances = [...Object.entries(own_drops.chances), ...Object.entries(any_drops.chances)],
        /** @type {[items, {min: Decimal, max: Decimal}][]} */
        ranges = [...Object.entries(own_drops.range), ...Object.entries(any_drops.range)];
    if (ranges.length > 0) {
        lines.push(
            'blank',
            ['display-text', 'Drops:'],
            ['row', ranges.map(([item, range]) => {
                let tile;
                if (!(tmp.items[item].unlocked ?? true)) {
                    tile = item_tile_unknown();
                } else {
                    tile = item_tile(item);
                }
                tile.text += `<br>${format_range(range)}`;

                return ['tile', tile];
            })],
        );
    }
    if (chances.length > 0) {
        lines.push(
            'blank',
            ['display-text', 'Chance to drop:'],
            ['row', chances.map(([item, chance]) => {
                let tile;
                if (!(tmp.items[item].unlocked ?? true)) {
                    tile = item_tile_unknown();
                } else {
                    tile = item_tile(item);
                }
                tile.text += `<br>${format_chance(chance)}`;

                return ['tile', tile];
            })],
        );
    }

    return lines;
}

// mining
/**
 * Gets a random ore for mining
 *
 * @returns {ores}
 */
function random_ore() {
    if (!tmp.m) return 'stone';

    /** @type {[ores, Decimal][]} */
    const list = Object.values(tmp.m.ores)
        .filter(ore => (ore.unlocked ?? true) && D.gt(ore.weight, 0))
        .map(ore => [ore.id, ore.weight]),
        sum = list.reduce((sum, [, weight]) => D.add(sum, weight), D.dZero);

    let rand = sum.times(Math.random()),
        i = 0;
    for (; i < list.length && rand.gt(0); i++) {
        rand = rand.minus(list[i][1]);
    }

    return list[i - 1][0];
}
/**
 * Gets a list of random ores
 *
 * @param {number} length
 * @returns {ores[]}
 */
function random_ores(length) {
    return Array.from({ length }, () => random_ore());
}
/**
 * Returns the total weight of all unlocked ores
 *
 * @returns {Decimal}
 */
function total_ore_weights() {
    return Object.values(tmp.m.ores)
        .filter(ore => (ore.unlocked ?? true) && D.gt(ore.weight, 0))
        .reduce((sum, ore) => D.add(sum, ore.weight), D.dZero);
}
/**
 * Returns the content for lore in the mining tabFormat
 *
 * @param {ores} ore
 * @returns {TabFormatEntries<'m'>[]}
 */
function handbook_content(ore) {
    const tore = tmp.m.ores[ore];

    if (!(tore.unlocked ?? true)) return [];

    /** @type {TabFormatEntries<'m'>[]} */
    const lines = [
        [
            'raw-html',
            `<div style="width: 240px; height: 240px; overflow: hidden">
                    <img src="./resources/images/ores.png"
                        style="width: ${ORE_SIZES.width * 100}%;
                            height: ${ORE_SIZES.height * 100}%;
                            margin-left: ${-240 * tore.position[0]}px;
                            margin-top: ${-240 * tore.position[1]}px;
                            image-rendering: crisp-edges;"/>
                </div>`
        ],
        ['display-text', capitalize(tore.name)],
        'blank',
        ['display-text', `Mined ${resourceColor(tmp.m.broken.color, formatWhole(player.m.ores[ore].broken))} times`],
    ];

    if (D.neq(tore.breaks, 1)) lines.push(['display-text', `Each break counts as ${resourceColor(tmp.m.broken.color, format(tore.breaks))} breaks`]);

    lines.push(
        'blank',
        ['display-text', `Maximum health: ${format(tore.health)}`],
        ['display-text', `Chance to find: ${format_chance(D.div(tore.weight, total_ore_weights()))}`],
        'blank',
    );

    /** @type {TabFormatEntries<'xp'>[]} */
    const upgrade_lines = [];

    if (hasUpgrade('m', 14)) upgrade_lines.push([
        'display-text',
        `${resourceColor(tmp.items[tmp.m.upgrades[14].item].color, tmp.m.upgrades[14].title)} effect: *${format(upgradeEffect('m', 14)[ore])} drops`,
    ]);
    if (hasUpgrade('m', 24)) upgrade_lines.push([
        'display-text',
        `${resourceColor(tmp.items[tmp.m.upgrades[24].item].color, tmp.m.upgrades[24].title)} effect: *${format(upgradeEffect('m', 24)[ore])} drops`,
    ]);
    // Ore-specific upgrades
    switch (ore) {
        case 'stone': {
            if (D.gt(player.items.densium_rock.amount, 0)) {
                const itemp = tmp.items.densium_rock;
                upgrade_lines.push([
                    'display-text',
                    `${resourceColor(itemp.color, capitalize(itemp.name))} effect: ${format(itemp.effect.rock_mult)} health, breaks, and drops`,
                ]);
            }
        }; break;
    }

    if (upgrade_lines.length > 0) lines.push(...upgrade_lines, 'blank');

    const own_drops = source_drops(`mining:${ore}`),
        any_drops = source_drops('mining:any'),
        /** @type {[items, Decimal][]} */
        chances = [...Object.entries(own_drops.chances), ...Object.entries(any_drops.chances)],
        /** @type {[items, {min: Decimal, max: Decimal}][]} */
        ranges = [...Object.entries(own_drops.range), ...Object.entries(any_drops.range)];
    if (ranges.length > 0) {
        lines.push(
            'blank',
            ['display-text', 'Drops:'],
            ['row', ranges.map(([item, range]) => {
                let tile;
                if (!(tmp.items[item].unlocked ?? true)) {
                    tile = item_tile_unknown();
                } else {
                    tile = item_tile(item);
                }
                tile.text += `<br>${format_range(range)}`;

                return ['tile', tile];
            })],
        );
    }
    if (chances.length > 0) {
        lines.push(
            'blank',
            ['display-text', 'Chance to drop:'],
            ['row', chances.map(([item, chance]) => {
                let tile;
                if (!(tmp.items[item].unlocked ?? true)) {
                    tile = item_tile_unknown();
                } else {
                    tile = item_tile(item);
                }
                tile.text += `<br>${format_chance(chance)}`;

                return ['tile', tile];
            })],
        );
    }

    return lines;
}

// crafting
/**
 * Returns a map of toggles for the crafting layer
 *
 * @returns {{[key: `${'inventory'|'crafting'}_${categories}`]: Clickable<'c'>}}
 */
function crafting_toggles() {
    /** @type {categories[]} */
    const list = ['materials', 'equipment', 'slime', 'skeleton', 'mining'],
        /** @type {(cat: categories) => boolean} */
        unlocked = cat => {
            switch (cat) {
                case 'materials':
                case 'equipment':
                    return true;
                case 'slime':
                    return tmp.xp.monsters.slime.unlocked ?? true;
                case 'skeleton':
                    return tmp.xp.monsters.skeleton.unlocked ?? true;
                case 'mining':
                    return tmp.m.layerShown;
            }
        },
        /** @type {{[cat in categories]: string}} */
        names = {
            'materials': 'Materials',
            'equipment': 'Equipment',
            'slime': 'Slime',
            'skeleton': 'Skeleton',
            'mining': 'Mining',
        },
        /** @type {{[cat in categories]: () => string}} */
        colors = {
            'materials': () => tmp.c.color,
            'equipment': () => tmp.c.color,
            'slime': () => tmp.xp.monsters.slime.color,
            'skeleton': () => tmp.xp.monsters.skeleton.color,
            'mining': () => tmp.m.color,
        };

    return Object.fromEntries(list.map(/**@returns{[string, Clickable<'c'>][]}*/cat => {
        return [
            [`inventory_${cat}`, {
                canClick() { return true; },
                onClick() {
                    const vis = player.c.visiblity;

                    vis.inventory[cat] = {
                        'show': 'hide',
                        'hide': 'ignore',
                        'ignore': 'show',
                    }[vis.inventory[cat] ??= 'ignore'];
                },
                display() {
                    const vis = player.c.visiblity,
                        name = names[cat];

                    let visibility = {
                        'show': 'Shown',
                        'hide': 'Hidden',
                        'ignore': 'Ignored',
                    }[vis.inventory[cat] ??= 'ignore'];

                    return `<span style="font-size:1.5em;">${name}</span><br>${visibility}`;
                },
                style: {
                    'backgroundColor'() {
                        const vis = player.c.visiblity,
                            color = colors[cat]();

                        switch (vis.inventory[cat]) {
                            case 'show':
                                return color;
                            case 'hide':
                                return rgb_negative(color);
                            case 'ignore':
                                return rgb_grayscale(color);
                        }
                    },
                },
                unlocked: () => unlocked(cat),
            }],
            [`crafting_${cat}`, {
                canClick() { return true; },
                onClick() {
                    const vis = player.c.visiblity;

                    vis.crafting[cat] = {
                        'show': 'hide',
                        'hide': 'ignore',
                        'ignore': 'show',
                    }[vis.crafting[cat] ??= 'ignore'];
                },
                display() {
                    const vis = player.c.visiblity,
                        name = names[cat];

                    let visibility = {
                        'show': 'Shown',
                        'hide': 'Hidden',
                        'ignore': 'Ignored',
                    }[vis.crafting[cat] ??= 'ignore'];

                    return `<span style="font-size:1.5em;">${name}</span><br>${visibility}`;
                },
                style: {
                    'backgroundColor'() {
                        const vis = player.c.visiblity,
                            color = colors[cat]();

                        switch (vis.crafting[cat]) {
                            case 'show':
                                return color;
                            case 'hide':
                                return rgb_negative(color);
                            case 'ignore':
                                return rgb_grayscale(color);
                        }
                    },
                },
                unlocked: () => unlocked(cat),
            }],
        ];
    }).flat());
}
/**
 * Returns the display for the inventory
 *
 * @returns {TabFormatEntries<'c'>[]}
 */
function inventory() {
    const vis = player.c.visiblity.inventory,
        /** @type {{[row: number]: items[]}} */
        grid = {};

    Object.values(tmp.items)
        .filter(item => (item.unlocked ?? true) &&
            ('grid' in item) &&
            (
                item.categories.some(cat => vis[cat] == 'show') ||
                !item.categories.some(cat => vis[cat] == 'hide')
            ))
        .forEach(item => {
            const [row, col] = item.grid;

            (grid[row] ??= [])[col] = item.id;
        });

    return Object.values(grid).map(items => ['row', items.map(item => {
        const tile = item_tile(item),
            itemp = tmp.items[item];
        let tooltip = '';

        if ('effectDescription' in itemp) tooltip += itemp.effectDescription() + '<hr style="margin: 5px 0;">';
        if ('sources' in itemp) {
            const {
                chance = {},
                per_second = {},
                range = {},
                other = [],
            } = itemp.sources,
                tooltip_lines = [];

            if (Object.entries(chance).filter(([, c]) => D.gt(c, 0)).length) tooltip_lines.push(...Object.entries(chance)
                .map(/**@param{[string,Decimal]}*/([source, chance]) =>
                    `${capitalize(source_name(source))}: ${format_chance(chance)}`));
            if (Object.entries(range).filter(([, r]) => D.gt(r.max, 0)).length) tooltip_lines.push(...Object.entries(range)
                .map(/**@param{[items,{min:Decimal,max:Decimal}]}*/([source, range]) => `${capitalize(source_name(source))}: ${format_range(range)}`));
            if (Object.entries(per_second).filter(([, ps]) => D.gt(ps, 0)).length) tooltip_lines.push(...Object.entries(per_second)
                .map(/**@param{[string,Decimal]}*/([source, amount]) =>
                    `${capitalize(source_name(source))}: +${format(amount)} /s`));
            if (other.length) tooltip_lines.push(...other.map(source => capitalize(source_name(source))));

            tooltip += tooltip_lines.join('<br>');
        }

        if (!tooltip.length) tooltip = 'No sources';

        tile.text += `<br>${formatWhole(player.items[item].amount)}`;
        tile.tooltip = tooltip;
        tile.onClick = () => {
            if (player.c.compendium == item) player.c.compendium = false;
            player.c.compendium = item;
        };

        return ['tile', tile];
    })]);
}
/**
 * Returns the display for a crafting recipe
 *
 * @param {string} recipe
 * @returns {TabFormatEntries<'c'>[]}
 */
function crafting_show_recipe(recipe) {
    const precipe = player.c.recipes[recipe],
        trecipe = tmp.c.recipes[recipe],
        vis = player.c.visiblity.crafting;

    if (vis.craftable == 'show' && !crafting_can(recipe, D.dOne) && D.lte(precipe.making, 0)) return []

    if (!(trecipe.unlocked ?? true) || (
        trecipe.categories.some(cat => vis[cat] == 'hide') &&
        !trecipe.categories.some(cat => vis[cat] == 'show')
    )) return [];

    const craft = D.gt(precipe.making, 0) ? `<br>Crafting ${formatWhole(precipe.making)}` : '',
        total = trecipe.static ? `<br>Crafted ${formatWhole(precipe.crafted)}` : '',
        /** @type {(list: ReturnType<square<['tile', tile]>>) => TabFormatEntries<'c'>} */
        line = list => {
            if (options.colCraft) return ['row', list.map(row => ['column', row])];
            else return ['column', list.map(row => ['row', row])];
        };

    return ['row', [
        line(square(trecipe.consumes.map(([item, cost]) => {
            const tile = item_tile(item),
                text = shiftDown ? `[${trecipe.formulas.consumes[item]}]` : `${format(player.items[item].amount)} / ${format(cost)}`;
            tile.text = `${capitalize(tmp.items[item].name)}<br>${text}`;

            return ['tile', tile];
        }))),
        'blank',
        ['dynabar', {
            direction: RIGHT,
            height: 60,
            width: 300,
            progress() {
                if ('duration' in trecipe) return D.div(player.c.recipes[trecipe.id].time, trecipe.duration);
                return D.dZero;
            },
            display() {
                if ('duration' in trecipe) {
                    if (shiftDown) return `${trecipe.formulas.duration}`;
                    return `${formatTime(player.c.recipes[trecipe.id].time)} / ${formatTime(trecipe.duration)}`;
                }
            },
            fillStyle: {
                'backgroundColor': colors[options.theme][3],
            },
        }],
        'blank',
        line(square(trecipe.produces.map(([item, prod]) => {
            const tile = item_tile(item),
                text = shiftDown ? `[${trecipe.formulas.produces[item]}]` : format(prod);
            tile.text = `${capitalize(tmp.items[item].name)}<br>${text}`;

            return ['tile', tile];
        }))),
        'blank',
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
    ]];
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
 * Checks whether a recipe can run
 *
 * @param {string} recipe
 * @param {Decimal} amount
 * @returns {boolean}
 */
function crafting_can(recipe, amount) {
    /** @type {[items, Decimal][]} */
    let items = [];
    if (!amount) items = tmp.c.recipes[recipe].consumes;
    else items = layers.c.recipes[recipe].consumes(amount);
    return items.every(([item, amount]) => D.gte(player.items[item].amount, amount));
}
/**
 * Returns the content for lore in the crafting tabFormat
 *
 * @param {items|false} item
 * @returns {TabFormatEntries<'c'>[]}
 */
function compendium_content(item) {
    if (!item) return [];
    const itemp = tmp.items[item];

    if (!(itemp.unlocked ?? true)) return [];

    /** @type {TabFormatEntries<'c'>[]} */
    const lines = [
        ['display-text', capitalize(itemp.name)],
        'blank',
        ['display-text', `You have ${resourceColor(tmp.c.color, format(player.items[item].amount))}`],
        ['display-text', `Obtained ${resourceColor(tmp.c.color, format(player.items[item].total))} times`],
        'blank',
    ];

    if ('effectDescription' in itemp) lines.push(['display-text', item_list[item].effectDescription()], 'blank');

    lines.push(['display-text', itemp.lore]);

    return lines;
}

// boss
/**
 * Returns the content for lore in the boss tabFormat
 *
 * @param {monsters} monster
 * @returns {TabFormatEntries<'b'>[]}
 */
function bosstiary_content(boss) {
    const bosst = tmp.b.bosses[boss];

    if (!(bosst.unlocked ?? true)) return [];

    /** @type {TabFormatEntries<'b'>[]} */
    const lines = [
        [
            'raw-html',
            `<div style="width: 240px; height: 240px; overflow: hidden">
                <img src="./resources/images/bosses.png"
                    style="width: ${BOSS_SIZES.width * 100}%;
                        height: ${BOSS_SIZES.height * 100}%;
                        margin-left: ${-240 * bosst.position[0]}px;
                        margin-top: ${-240 * bosst.position[1]}px;
                        image-rendering: crisp-edges;"/>
            </div>`
        ],
        ['display-text', capitalize(bosst.name)],
        'blank',
        ['display-text', hasChallenge('b', bosst.challenge) ? 'Defeated' : 'Not yet defeated'],
    ];

    if (inChallenge('b', bosst.challenge)) lines.push(['display-text', 'Currently fighting']);

    lines.push('blank', ['display-text', bosst.lore]);

    return lines;
}

// shop
/**
 * Spend an amount of coins
 *
 * @param {DecimalSource} amount
 */
function spend_coins(amount) {
    if (D.lte(amount, 0)) return;

    /** @type {Record<items, Decimal>} */
    const list = Object.fromEntries(value_coin(amount));

    // Prevent negative coin amounts
    let carry = D.dZero;
    tmp.s.coins.list.forEach(([coin, cap]) => {
        if (D.gt(carry, 0)) {
            list[coin] = D.add(list[coin] ?? D.dZero, carry);
        }

        if (typeof cap == 'undefined') return;

        carry = D.dZero;
        let amount = list[coin] ?? D.dZero;
        if (D.gt(amount, player.items[coin].amount)) {
            list[coin] = amount = D.minus(amount, cap);
            carry = D.add(carry, 1);
        }
    });

    gain_items(Object.entries(list).map(([i, v]) => [i, v.neg()]));
}
/**
 * Convert a value into coins
 *
 * @type {((amount: DecimalSource) => [items, Decimal][]) & {values: [items, Decimal][]}}
 */
const value_coin = (amount) => {
    if (D.lte(amount, 0)) return [];

    let values = value_coin.values ??= [];
    if (!values.length) {
        let value = D.dOne;
        tmp.s.coins.list.forEach(([item, cap]) => {
            values.push([item, value]);
            value = value.times(cap);
        });
    }

    let left = D(amount);
    /** @type {Record<items, Decimal>} */
    const items = values.reduceRight(/**@param{Record<items,Decimal>}sum*/(sum, [item, value]) => {
        if (D.gte(left, value)) {
            const amount = D.div(left, value).floor();
            left = left.mod(value);
            sum[item] = amount;
        }
        return sum;
    }, {});

    // Ensure all of the amount is accounted
    if (left.gt(0)) {
        items.coin_copper = D.add(left, items.coin_copper ?? 0);
    }

    return Object.entries(items).filter(([, val]) => D.gt(val, 0));
}
/**
 * Returns the full display for item purchases in the shop
 *
 * @returns {TabFormatEntries<'s'>[]}
 */
function shop_display_buy() {
    if (!tmp.s.layerShown) return [];

    /** @type {{[row: number]: items[]}} */
    const grid = {};

    Object.entries(tmp.s.trades)
        .filter(/**@param {[items, Layers['s']['trades'][items]]}*/([item, trade]) => {
            if (!(trade.unlocked ?? true) || !('cost' in trade)) return false;
            const itemp = tmp.items[item];
            if (!('grid' in itemp) || !(itemp.unlocked ?? true)) return false;
            return true;
        })
        .forEach(/**@param {[items, Layers['s']['trades'][items]]}*/([item]) => {
            const [row, col] = tmp.items[item].grid;
            (grid[row] ??= [])[col] = item;
        });

    return Object.values(grid).map(items => ['row', items.map(item => {
        const trademp = tmp.s.trades[item],
            tile = item_tile(item, 90),
            cost = D.times(trademp.cost, player.s.buy_amount)
                .times(tmp.s.modifiers.trade.buy_mult),
            list = value_coin(cost);

        let cost_txt = 'free';
        if (list.length > 2) list.length = 2;
        if (list.length > 0) cost_txt = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));

        tile.text = `${formatWhole(player.s.buy_amount)} ${capitalize(tmp.items[item].name)}<br>
            You have ${formatWhole(player.items[item].amount)}<br><br>
            Cost: ${cost_txt}`;
        tile.canClick = () => D.gte(player.s.buy_amount, 1) && D.gte(tmp.s.coins.total, cost);
        tile.onClick = () => {
            const buy_amount = D.floor(player.s.buy_amount),
                cost = buy_amount.times(trademp.cost).times(tmp.s.modifiers.trade.buy_mult);
            gain_items(item, buy_amount);
            spend_coins(cost);
            player.s.spent = D.add(player.s.spent, cost);
            player.s.trades[item].bought = D.add(player.s.trades[item].bought, 1);
        };

        return ['tile', tile];
    })]);
}
/**
 * Returns the full display for item sales in the shop
 *
 * @returns {TabFormatEntries<'s'>[]}
 */
function shop_display_sell() {
    if (!tmp.s.layerShown) return [];

    /** @type {{[row: number]: items[]}} */
    const grid = {};

    Object.entries(tmp.s.trades)
        .filter(/**@param {[items, Layers['s']['trades'][items]]}*/([item, trade]) => {
            if (!(trade.unlocked ?? true) || !('value' in trade)) return false;
            const itemp = tmp.items[item];
            if (!('grid' in itemp) || !(itemp.unlocked ?? true)) return false;
            return true;
        })
        .forEach(/**@param {[items, Layers['s']['trades'][items]]}*/([item]) => {
            const [row, col] = tmp.items[item].grid;
            (grid[row] ??= [])[col] = item;
        });

    return Object.values(grid).map(items => ['row', items.map(item => {
        const trademp = tmp.s.trades[item],
            tile = item_tile(item, 90),
            value = D.times(trademp.value, player.s.sell_amount)
                .times(tmp.s.modifiers.trade.sell_mult)
                .times(tmp.s.modifiers.coin.mult),
            list = value_coin(value);

        let value_txt = 'free';
        if (list.length > 2) list.length = 2;
        if (list.length > 0) value_txt = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));

        tile.text = `${formatWhole(player.s.sell_amount)} ${capitalize(tmp.items[item].name)}<br>
            You have ${formatWhole(player.items[item].amount)}<br><br>
            Value: ${value_txt}`;
        tile.canClick = () => D.gte(player.s.sell_amount, 1) && D.gte(player.items[item].amount, player.s.sell_amount);
        tile.onClick = () => {
            const sell_amount = D.floor(player.s.sell_amount),
                value = D.times(trademp.value, sell_amount).times(tmp.s.modifiers.trade.sell_mult).times(tmp.s.modifiers.coin.mult);
            gain_items(item, sell_amount.neg());
            gain_items(value_coin(value));
            player.s.trades[item].sold = D.add(player.s.trades[item].sold, 1);
        };

        return ['tile', tile];
    })]);
}
