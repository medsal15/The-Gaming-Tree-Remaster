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
            if (inChallenge('b', 11)) return [0, 4];
            return [0, 0];
        },
        row: 1,
        sources: {},
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
        sources: {},
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
        unlocked: false,
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
        unlocked: false,
    },
};

const ITEM_SIZES = {
    width: 4,
    height: 1,
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
        case 'mining':
            let text = 'mining';
            if (sub[1] == 'break') text = 'breaking';
            return `${text} ${tmp.m.ores[sub[0]].name}`;
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

        if ('chance' in item.sources && source in item.sources.chance) items.chances[item.id] = item.sources.chance[source];
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
