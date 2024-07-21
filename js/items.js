/**
 * @type {{[id in items]: Item<id>}}
 */
const item_list = {
    // Slime
    'slime_goo': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime goo',
        grid: [0, 0],
        icon() {
            let icon = [0, 0];

            if (inChallenge('b', 11)) icon[1] += 4;

            return icon;
        },
        row: 1,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 2);

                chance = chance.times(tmp.c.chance_multiplier);

                return { 'kill:slime': chance };
            },
        },
        lore() {
            if (inChallenge('b', 11)) return `A chunk of orange goo.<br>
                Feels warm to the touch.<br>
                Tastes bad and spicy.`;

            return `A chunk of green goo.<br>
                Feels weird to the touch.<br>
                Not only does it taste like dirty water, but it's hard to chew.`;
        },
        categories: ['materials', 'slime'],
    },
    'slime_core_shard': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime core shard',
        grid: [0, 1],
        icon() {
            let icon = [0, 1];

            if (inChallenge('b', 11)) icon[1] += 4;

            return icon;
        },
        row: 1,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 7);

                chance = chance.times(tmp.c.chance_multiplier);

                return { 'kill:slime': chance };
            },
        },
        lore() {
            if (inChallenge('b', 11)) return `A dark red shard.<br>
                Very sharp, be careful when handling.<br>
                Can be recombined into an intact core with a bit of goo.`;

            return `A dark green shard.<br>
                Surprisingly sharp, so careful when handling.<br>
                Can be recombined into an intact core with a bit of goo.`;
        },
        categories: ['materials', 'slime'],
    },
    'slime_core': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime core',
        grid: [0, 2],
        icon() {
            let icon = [0, 2];

            if (inChallenge('b', 11)) icon[1] += 4;

            return icon;
        },
        row: 1,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 24);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(item_effect('slime_die').core_chance);

                return { 'kill:slime': chance };
            },
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `The very core of a slime.<br>
                Hot to the touch and valuable.<br>
                Hard, but shatters easily.`;

            return `The very core of a slime.<br>
                Smooth to the touch and valuable.<br>
                Fragile! Handle with care.`;
        },
        categories: ['materials', 'slime'],
    },
    'dense_slime_core': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'dense slime core',
        grid: [0, 3],
        icon() {
            let icon = [0, 3];

            if (inChallenge('b', 11)) icon[1] += 4;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `Are you sure this is a good idea?<br>
                It glows in an angry red light.<br>
                You can feel it pulse in your hands.`;

            return `The- This- What even is this?<br>
                It glows in a worrying green light.<br>
                You can feel it pulse in your hands.`;
        },
        categories: ['materials', 'slime'],
    },
    'slime_crystal': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime crystal',
        grid: [1, 0],
        icon() {
            let icon = [1, 0];

            if (inChallenge('b', 11)) icon[1] += 4;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `A bright red crystal made of pure slime.<br>
                Can hold experience better than you.<br>
                A clunky nightlight.`;

            return `A bright green crystal made of pure slime.<br>
                Can hold experience better than you.<br>
                A clunky nightlight.`;
        },
        categories: ['equipment', 'slime'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let xp_mult, xp_cap;

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                xp_mult = D.div(x, 9).add(1);
                xp_cap = D.pow(1.15, x);
            } else {
                xp_mult = D.div(x, 10).add(1);
                xp_cap = D.pow(1.1, x);
            }

            return { xp_mult, xp_cap, };
        },
        effectDescription(amount) {
            let gain, cap;
            if (shiftDown) {
                if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                    gain = '[amount / 9 + 1]';
                    cap = '[1.15 ^ amount]';
                } else {
                    gain = '[amount / 10 + 1]';
                    cap = '[1.1 ^ amount]';
                }
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                gain = format(effect.xp_mult);
                cap = format(effect.xp_cap);
            }

            return `Multiply xp gain by ${gain} and cap by ${cap}`;
        },
    },
    'slime_knife': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime knife',
        grid: [1, 1],
        icon() {
            let icon = [1, 1];

            if (inChallenge('b', 11)) icon[1] += 4;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `A sharp red weapon.<br>
                Requires a license to use in some kingdoms.<br>
                Chefs love this, as it allows cooking spicy food without spices`;

            return `A crude green weapon.<br>
                Very sharp, be careful with it.<br>
                Not recommended for cooking unless you like the taste of slime.`;
        },
        categories: ['equipment', 'slime'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let damage;

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                damage = D.pow(1.3, x);
            } else {
                damage = D.pow(1.2, x);
            }

            return { damage, };
        },
        effectDescription(amount) {
            let damage;
            if (shiftDown) {
                if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                    damage = '[1.3 ^ amount]';
                } else {
                    damage = '[1.2 ^ amount]';
                }
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                damage = format(effect.damage);
            }

            return `Multiply damage dealt by ${damage}`;
        },
    },
    'slime_injector': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime injector',
        grid: [1, 2],
        icon() {
            let icon = [1, 2];

            if (inChallenge('b', 11)) icon[1] += 4;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `This experimental drug destabilizes slimes.<br>
                It makes you feel... angrier? Weird.<br>
                Using too many may have side effects.`;

            return `This experimental drug destabilizes slimes.<br>
                It also makes you feel... stronger. Whatever that means.<br>
                Using too many may have side effects.`;
        },
        categories: ['equipment', 'slime'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let health, level, xp_mult;

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                health = D.pow(1.1, x);
                level = D.div(x, 9).add(1);
                xp_mult = D.div(x, 5).root(2).floor().pow_base(.9);
            } else {
                health = D.pow(1.05, x);
                level = D.div(x, 10).add(1);
                xp_mult = D.div(x, 5).root(2).floor().pow_base(.95);
            }

            return { health, level, xp_mult, };
        },
        effectDescription(amount) {
            const x = D(amount ?? player.items[this.id].amount),
                effect = item_list[this.id].effect(x),
                show_xp = D.neq(effect.xp_mult, 1),
                show_level = player.l.unlocked;
            let health, level, xp;
            if (shiftDown) {
                if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                    health = '[1.1 ^ amount]';
                    level = '[amount / 9 + 1]';
                    xp = '[0.9 ^ floor(2√(amount / 5))]';
                } else {
                    health = '[1.05 ^ amount]';
                    level = '[amount / 10 + 1]';
                    xp = '[0.95 ^ floor(2√(amount / 5))]';
                }
            } else {
                const effect = item_list[this.id].effect(x);

                health = format(effect.health);
                level = format(effect.level);
                xp = format(effect.xp_mult);
            }

            const text = [`Divide enemy health by ${health}`];

            if (show_level) text.push(`multiply level gain by ${level}`);
            if (show_xp) text.push(`divide xp gain by ${xp}`);

            return listFormat.format(text);
        },
    },
    'slime_die': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime die',
        grid: [1, 3],
        icon() {
            let icon = [1, 3];

            if (inChallenge('b', 11)) icon[1] += 4;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `A dice that glows in a worrying light.<br>
                It feels lucky, somehow.<br>
                Makes you feel like you can grab more from slimes.`;

            return `A green dice that glows in a more... worrying light.<br>
                It feels lucky, somehow.<br>
                Makes you feel like you can get more from slimes.`;
        },
        categories: ['equipment', 'slime'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let luck, core_chance;

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                luck = D.div(x, 17.5).add(1);
            } else {
                luck = D.div(x, 20).add(1);
            }
            core_chance = D.root(x, 2).floor();

            return { luck, core_chance, };
        },
        effectDescription(amount) {
            let luck, core;
            if (shiftDown) {
                if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                    luck = '[amount / 17.5 + 1]';
                } else {
                    luck = '[amount / 20 + 1]';
                }
                core = '[floor(2√(amount))]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                luck = format(effect.luck);
                core = formatWhole(effect.core_chance);
            }

            return `Multiply luck by ${luck} and core drop chances by ${core}`;
        },
    },
};

const ITEM_SIZES = {
    width: 8,
    height: 2,
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

    const rows = Object.keys(ROW_ITEMS)
        // Ignore side rows and equal/above reset row
        .filter(irow => !isNaN(irow) && irow < row)
        .map(n => +n)
        // Sort from highest to lowest
        .sort((a, b) => b - a);

    for (let r of rows) {
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

function item_tile_unknown() {
    //todo
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
    /** @type {[drop_types, string[]]} */
    const [type, ...sub] = source.split(':');
    switch (type) {
        case 'kill':
            return tmp.xp.monsters[sub[0]].name;
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
 * }}
 */
function source_drops(source) {
    const items = {
        chances: {},
    };

    Object.values(tmp.items).forEach(item => {
        if (!('sources' in item)) return;

        if ('chance' in item.sources && source in item.sources.chance && D.gt(item.sources.chance[source], 0)) items.chances[item.id] = item.sources.chance[source];
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
