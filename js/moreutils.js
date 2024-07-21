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
        ['display-text', `Level ${resourceColor(tmp.l.color, formatWhole(tmonst.level))}`],
        ['display-text', `Killed ${resourceColor(tmp.xp.kill.color, formatWhole(player.xp.monsters[monster].kills))} times`],
        ['display-text', `Gives ${resourceColor(tmp.xp.color, format(tmonst.experience))} XP on kill`],
        'blank',
        ['display-text', `Health: ${format(player.xp.monsters[monster].health)} / ${format(tmonst.health)}`],
        'blank',
    ];

    /** @type {TabFormatEntries<'xp'>[]} */
    const upgrade_lines = [];

    if (hasUpgrade('l', 31)) upgrade_lines.push([
        'display-text',
        `${resourceColor(tmp.l.skill_points.color, tmp.l.upgrades[31].title)} effect: +${format(upgradeEffect('l', 31)[monster])} damage`,
    ]);
    // Monster specific upgrades
    switch (monster) {
        case 'slime': {
            if (inChallenge('b', 11)) upgrade_lines.push([
                'display-text',
                `${resourceColor(tmp.b.color, tmp.b.challenges[11].name)} active effect: *${formatWhole(2)} health, *${format(1.5)} experience`,
            ]);
            if (hasChallenge('b', 11)) upgrade_lines.push([
                'display-text',
                `${resourceColor(tmp.b.color, tmp.b.challenges[11].name)} reward effect: *${format(1.5)} experience`,
            ]);
        }; break;
    }

    if (upgrade_lines.length > 0) lines.push(...upgrade_lines, 'blank');

    // Add the lore at the end
    lines.push(
        ['display-text', tmonst.lore],
    );

    if (tmp.c.chance_multiplier.gt(0)) {
        const drops = source_drops(`kill:${monster}`);
        lines.push(
            'blank',
            ['display-text', 'Chance to drop:'],
            ['row', Object.entries(drops.chances).map(/**@param{[items,Decimal]}*/([item, chance]) => {
                const tile = item_tile(item);
                tile.text = `${capitalize(tmp.items[item].name)}<br>${format_chance(chance)}`;

                return ['tile', tile];
            })],
        );
    }

    return lines;
}

/**
 * Returns a map of toggles for the crafting layer
 *
 * @returns {{[key: `${'inventory'|'crafting'}_${categories}`]: Clickable<'c'>}}
 */
function crafting_toggles() {
    /** @type {categories[]} */
    const list = ['materials', 'equipment', 'slime'];

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
                        name = {
                            'materials': 'Materials',
                            'equipment': 'Equipment',
                            'slime': 'Slime',
                        }[cat];

                    let visibility = {
                        'show': 'Shown',
                        'hide': 'Hidden',
                        'ignore': 'Ignored',
                    }[vis.inventory[cat] ??= 'ignore'];

                    return `<span style="font-size:1.5em;">${name}</span><br>\
                        ${visibility}`;
                },
                style: {
                    'backgroundColor'() {
                        const vis = player.c.visiblity,
                            color = {
                                'materials': tmp.c.color,
                                'equipment': tmp.c.color,
                                'slime': tmp.xp.monsters.slime.color,
                            }[cat];

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
                        name = {
                            'materials': 'Materials',
                            'equipment': 'Equipment',
                            'slime': 'Slime',
                        }[cat];

                    let visibility = {
                        'show': 'Shown',
                        'hide': 'Hidden',
                        'ignore': 'Ignored',
                    }[vis.crafting[cat] ??= 'ignore'];

                    return `<span style="font-size:1.5em;">${name}</span><br>\
                        ${visibility}`;
                },
                style: {
                    'backgroundColor'() {
                        const vis = player.c.visiblity,
                            color = {
                                'materials': tmp.c.color,
                                'equipment': tmp.c.color,
                                'slime': tmp.xp.monsters.slime.color,
                            }[cat];

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
                other = [],
            } = itemp.sources,
                tooltip_lines = [];

            if (Object.entries(chance).filter(([, c]) => D.gt(c, 0)).length) tooltip_lines.push(...Object.entries(chance)
                .map(/**@param{[string,Decimal]}*/([source, chance]) =>
                    `${capitalize(source_name(source))}: ${format_chance(chance)}`));
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

    if (!(trecipe.unlocked ?? true) || (
        trecipe.categories.some(cat => vis[cat] == 'hide') &&
        !trecipe.categories.some(cat => vis[cat] == 'show')
    )) return [];

    const craft = D.gt(precipe.making, 0) ? `<br>Crafting ${formatWhole(precipe.making)}` : '',
        total = trecipe.static ? `<br>Crafted ${formatWhole(precipe.crafted)}` : '',
        /** @template T @type {(list: T[], size?: number) => T[][]} */
        square = (list, size) => {
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
        },
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
