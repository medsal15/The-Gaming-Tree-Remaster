/**
 * @type {{[id in items]: Item<id>}}
 */
const item_list = {
    'slime_goo': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime goo',
        grid: [0, 0],
        icon() {
            if (inChallenge('b', 11)) return [0, 4];
            return [0, 0];
        },
        row: 1,
        sources: {
            chance() {
                if (D.lte(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 2);

                chance = chance.times(tmp.c.chance_multiplier);

                return {
                    'kill:slime': chance,
                };
            },
        },
        lore() {
            if (inChallenge('b', 11)) {
                return `A chunk of orange goo.<br>
                    Feels warm to the touch.<br>
                    It tastes spicy, and is hard to chew.`;
            }
            return `A chunk of green goo.<br>
                Feels weird to the touch.<br>
                Not only does it taste like dirty water, but it's hard to chew.`;
        },
    },
    'slime_core_shard': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime core shard',
        grid: [0, 1],
        icon() {
            if (inChallenge('b', 11)) return [0, 5];
            return [0, 1];
        },
        row: 1,
        sources: {
            chance() {
                if (D.lte(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 9);

                chance = chance.times(tmp.c.chance_multiplier);

                return {
                    'kill:slime': chance,
                };
            },
        },
        lore() {
            if (inChallenge('b', 11)) {
                return `A dark red shard.<br>
                    Not sharp, but feels like it is.<br>
                    Can be combined into an intact core with a bit of goo.`;
            }
            return `A dark green shard.<br>
                Surprisingly sharp, so careful when handling.<br>
                Can be recombined into an intact core with a bit of goo.`;
        },
    },
    'slime_core': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime core',
        grid: [0, 2],
        icon() {
            if (inChallenge('b', 11)) return [0, 6];
            return [0, 2];
        },
        row: 1,
        sources: {
            chance() {
                if (D.lte(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 64);

                chance = chance.times(tmp.c.chance_multiplier);

                return {
                    'kill:slime': chance,
                };
            },
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) {
                return `The very core of a slime.<br>
                    Smooth to the touch and valuable.<br>
                    Surprisingly solid.`;
            }
            return `The very core of a slime.<br>
                Smooth to the touch and valuable.<br>
                Fragile! Handle with care.`;
        },
    },
    'dense_slime_core': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'dense slime core',
        grid: [0, 3],
        icon: [0, 3],
        icon() {
            if (inChallenge('b', 11)) return [0, 7];
            return [0, 3];
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) {
                return `Wha- Oh no...<br>
                    It glows in a burning orange light.<br>
                    It seethes in anger.`;
            }
            return `The- This- What even is this?<br>
                It glows in a worrying green light.<br>
                You can feel it pulse in your hands.`;
        },
    },
    'slime_crystal': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime crystal',
        grid: [1, 0],
        icon() {
            if (inChallenge('b', 11)) return [1, 4];
            return [1, 0];
        },
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            let cap_div = 10,
                mult_base = 1.05;

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                cap_div = 7.5;
                mult_base = 1.075;
            }

            return {
                cap: D.div(amount, cap_div).add(1),
                mult: D.pow(mult_base, amount),
            };
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                const effect = item_effect(this.id);
                return `Multiplies XP gain by ${format(effect.mult)} and XP cap by ${format(effect.cap)}`;
            }
            let formula_cap = 'amount / 10 + 1',
                formula_mult = '1.05 ^ amount';

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                formula_cap = 'amount / 7.5 + 1';
                formula_mult = '1.075 ^ amount';
            }

            return `Multiplier formula: ${formula_mult}<br>Cap formula: ${formula_cap}`;
        },
        sources: {
            other: ['crafting'],
        },
        lore: `A crystal made of pure slime.<br>
            It absorbs experience very easily, making it a good storage solution.`,
    },
    'slime_page': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime page',
        grid: [1, 1],
        icon() {
            if (inChallenge('b', 11)) return [1, 5];
            return [1, 1];
        },
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            let health_base = .95,
                level_base = 1.05;

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                health_base = .925;
                level_base = 1.075;
            }

            return {
                health: D.pow(health_base, amount),
                level: D.pow(level_base, amount),
            };
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                let type = 'slime';
                if (tmp.xp.monster_list.some(mon => mon != 'slime')) type = 'monster';
                const effect = item_effect(this.id),
                    level = player.l.unlocked ? ` and divides level cost by ${format(effect.level)}` : '';
                return `Multiplies ${type} health by ${format(effect.health)}${level}`;
            }
            let formula_health = '0.95 ^ amount',
                formula_level = '1.05 ^ amount';

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                formula_health = '0.925 ^ amount';
                formula_level = '1.075 ^ amount';
            }

            if (!player.l.unlocked) {
                return `Formula: ${formula_health}`;
            } else {
                return `Health formula: ${formula_health}<br>Level formula: ${formula_level}`;
            }
        },
        sources: {
            other: ['crafting'],
        },
        lore: `The discovery of slime paper truly changed the world.<br>
            Somehow allows you to level up with less experience.`,
    },
    'slime_pocket': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime pocket',
        grid: [1, 2],
        icon: [1, 2],
        icon() {
            if (inChallenge('b', 11)) return [1, 6];
            return [1, 2];
        },
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            let damage_base = 1.1;

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                damage_base = 1.15;
            }

            return {
                hold: D.floor(amount),
                damage: D.pow(damage_base, amount),
            };
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                const effect = item_effect(this.id);
                return `Multiplies damage by ${format(effect.damage)} and holds ${formatWhole(effect.hold)} XP upgrades`;
            }

            let formula_damage = '1.1 ^ amount',
                formula_hold = 'amount';

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                formula_damage = '1.15 ^ amount';
            }

            return `Damage formula: ${formula_damage}<br>Hold formula: ${formula_hold}`;
        },
        sources: {
            other: ['crafting'],
        },
        lore: `A pocket made of real slime leather.<br>
            Can hold upgrades and weapons.`,
    },
    'slime_dice': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime die',
        grid: [1, 3],
        icon() {
            if (inChallenge('b', 11)) return [1, 7];
            return [1, 3];
        },
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            let div = 20;

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                div = 15;
            }

            return D.div(amount, div).add(1);
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                return `Multiplies drop chance by ${format(item_effect(this.id))}`;
            }
            let formula = 'amount / 20 + 1';

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                formula = 'amount / 15 + 1';
            }

            return `Formula: ${formula}`;
        },
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) {
                return `A die with a hot orange glow.<br>
                    You feel luck when holding it...`;
            }
            return `A die with a dim green glow.<br>
                You feel lucky when holding it...`;
        },
    },
};

/**
 * @type {{[row in Layer['row']]: items[]}}
 */
const ROW_ITEMS = {};

/**
 * @param {Layer['row']} row
 */
function reset_items(row) {
    if (isNaN(row)) return;

    for (let r in ROW_ITEMS) {
        if (isNaN(r) || r >= row) continue;

        ROW_ITEMS[r].forEach(item => {
            player.items[item].amount = D.dZero;
            player.items[item].total = D.dZero;
        })
    }
}

function setupItems() {
    Object.entries(item_list).forEach(setupItem);
}
/**
 * @template {items} I
 * @param {[I, Item<I>]}
 */
function setupItem([id, item]) {
    item.id = id;
    if (typeof item.row == 'number') {
        const row = item.row;
        (ROW_ITEMS[row] ??= []).push(id);
    }
    if (typeof item.sources == 'object') {
        item.sources.id = id;

        if (item.sources.per_second) {
            item.sources.per_second_total = function () {
                /** @type {Item<I>} */
                const itemp = tmp.items[this.id],
                    ps = Object.values(itemp.sources.per_second);
                return ps.reduce((sum, ps) => D.add(sum, ps), D.dZero);
            }
        }
    }
}

/**
 * Creates a tile for an item display
 *
 * Can be safely modified
 *
 * The tile text is already set to the item name
 *
 * @param {items} item
 * @returns {tile}
 */
function item_tile(item) {
    const itemp = tmp.items[item];

    return {
        text: `${capitalize(itemp.name)}`,
        style: {
            'color': rgb_opposite_bw(itemp.color),
            'background-color': itemp.color,
            'background-image': `url(./resources/images/items.png)`,
            'background-origin': `border-box`,
            'background-repeat': `no-repeat`,
            'image-rendering': 'crisp-edges',
            'background-size': `${ITEM_SIZES.width * 80}px ${ITEM_SIZES.height * 80}px`,
            'background-position-x': `${itemp.icon[1] * -80}px`,
            'background-position-y': `${itemp.icon[0] * -80}px`,
            'transform': 'initial',
        },
    };
}


/**
 * @param {[items, DecimalSource][]|items} item
 * @param {DecimalSource} [amount]
 */
function gain_items(item, amount) {
    if (Array.isArray(item)) {
        item.forEach(pair => gain_items(...pair))
    } else {
        player.items[item].amount = D.add(player.items[item].amount, amount);
        if (D.gt(amount, 0)) player.items[item].total = D.add(player.items[item].total, amount);
    }
}
/**
 * @param {drop_sources} source
 */
function source_name(source) {
    /** @type {[drop_types, string]} */
    const [type, sub] = source.split(':');
    switch (type) {
        case 'kill':
            return tmp.xp.monsters[sub].name;
        case 'crafting':
            return 'crafting';
    }
}
/**
 * Returns a list of items that are dropped by `source`
 *
 * Items that are not unlocked cannot be dropped
 *
 * @param {drop_sources} source
 * @returns {{
 *  chances: {[item in items]: Decimal}
 *  fixed: {[item in items]: Decimal}
 * }}
 */
function source_drops(source) {
    const items = {
        chances: {},
        fixed: {},
    };

    Object.values(tmp.items).forEach(item => {
        if (!('sources' in item)) return;

        if ('chance' in item.sources && source in item.sources.chance) items.chances[item.id] = item.sources.chance[source];
        if ('fixed' in item.sources && source in item.sources.fixed) items.fixed[item.id] = item.sources.fixed[source];
    });

    return items;
}
/**
 * Computes the drops from a type
 *
 * @param {drop_sources} source
 * @param {DecimalSource} [chance_multiplier=D.dOne]
 * @returns {[items, Decimal][]}
 */
function get_source_drops(source, chance_multiplier = D.dOne) {
    if (D.lte(chance_multiplier, 0)) return [];

    /**
     * Sum of all items to return
     * @type {{[item_id in items]: Decimal}}
     */
    const results = {},
        /**
         * List of all entries to roll at once
         * @type {[items, Decimal][]}
         */
        to_roll = [],
        /**
         * @type {(item: items, amount: DecimalSource) => void}
         */
        add_to_results = (item, amount) => results[item] = D.add(results[item] ?? 0, amount),
        items = source_drops(source);

    Object.entries(items.chances).forEach(/**@param{[items, Decimal]}*/([item, chance]) => {
        const rchance = D.times(chance, chance_multiplier);
        if (rchance.gte(1) || options.noRNG) {
            add_to_results(item, chance);
        } else {
            to_roll.push([item, chance]);
        }
    });
    Object.entries(items.fixed).forEach(/**@param{[items, Decimal]}*/([item, chance]) => {
        const rchance = D.times(chance, chance_multiplier);
        if (rchance.gte(1) || options.noRNG) {
            add_to_results(item, chance);
        } else {
            to_roll.push([item, chance]);
        }
    });

    if (to_roll.length > 7) {
        // Not dealing with more than 2^7 attempts
        to_roll.forEach(([item_id, chance]) => add_to_results(item_id, chance));
    } else {
        let rng = Math.random(),
            i = 0;
        for (; i < 2 ** to_roll.length && rng > 0; i++) {
            const bin = i.toString(2).padStart(to_roll.length, '0').split(''),
                chance = to_roll.map(([, chance], i) => {
                    if (bin[i] == '1') return chance;
                    else return D.dOne.minus(chance);
                }).reduce(D.times, D.dOne);
            rng -= chance.toNumber();
        }

        if (rng <= 0 && i > 0) i--;
        const bin = i.toString(2).padStart(to_roll.length, '0').split('');
        to_roll.forEach(([item], i) => {
            if (bin[i] == '1') add_to_results(item, 1);
        });
    }

    return Object.entries(results);
}

/**
 * Shortcut for `tmp.items[item].effect`
 *
 * @param {items} item
 */
function item_effect(item) { return tmp.items[item].effect; }
