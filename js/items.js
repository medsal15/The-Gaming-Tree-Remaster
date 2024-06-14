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
    // Skeleton
    'bone': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'bone',
        grid: [2, 0],
        icon: [2, 0],
        row: 1,
        sources: {
            chance() {
                if (D.lte(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 3);

                chance = chance.times(tmp.c.chance_multiplier);

                return {
                    'kill:skeleton': chance,
                };
            },
        },
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        lore: `A straight white bone.<br>
            Somehow clean, even after its owner was torn apart.<br>
            Could be used as a handle for tools.`,
    },
    'rib': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'rib',
        grid: [2, 1],
        icon: [2, 1],
        row: 1,
        sources: {
            chance() {
                if (D.lte(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 16);

                chance = chance.times(tmp.c.chance_multiplier);

                return {
                    'kill:skeleton': chance,
                };
            },
        },
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        lore: `A curved white bone.<br>
            Before being removed, it used to protect important organs.<br>
            Cannot be used as a boomerang, sadly.`,
    },
    'skull': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'skull',
        grid: [2, 2],
        icon: [2, 2],
        row: 1,
        sources: {
            chance() {
                if (D.lte(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 125);

                chance = chance.times(tmp.c.chance_multiplier);

                return {
                    'kill:skeleton': chance,
                };
            },
            other: ['crafting'],
        },
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        lore: `The head of a skeleton.<br>
            You can use your hand to make it speak.<br>
            If only you knew how to make skull chalices...`,
    },
    'glowing_skull': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'glowing skull',
        grid: [2, 3],
        icon() {
            if (inChallenge('b', 11)) return [2, 7];
            return [2, 3];
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        lore() {
            if (inChallenge('b', 11)) {
                return `A red glowing skull.<br>
                    Its sockets have a warm orange glow.<br>
                    Feels like its eyes are judging you.`;
            }
            return `A green glowing skull.<br>
                Its sockets have a dull green glow.<br>
                Feels like its eyes are watching you.`
        },
    },
    'bone_shiv': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'bone shiv',
        grid: [3, 0],
        icon() {
            if (inChallenge('b', 11)) return [3, 4];
            return [3, 0];
        },
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            let div = 10;

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                div = 9;
            }

            return D.div(amount, div).add(1);
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                return `Multiplies damage by ${format(item_effect(this.id))}`;
            }
            let formula = 'amount / 10 + 1';

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                formula = 'amount / 9 + 1';
            }

            return `Formula: ${formula}`;
        },
        sources: {
            other: ['crafting'],
        },
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        lore() {
            if (inChallenge('b', 11)) {
                return `A small orange knife.<br>
                    The slime flowing through the bone almost looks like blood...`;
            }
            return `A small green knife.<br>
                The shard feels sharp enough to cut through anything.`;
        },
    },
    'bone_pick': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'bone pick',
        grid: [3, 1],
        icon: [3, 1],
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            let mining,
                damage = D.div(amount, 10);

            if (D.lte(amount, 0)) mining = D.dZero;
            else {
                mining = D.minus(amount, 1).div(10).add(1);
            }

            return { mining, damage };
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                const effect = item_effect(this.id);
                return `Increases mining damage by ${format(effect.mining)}\
                    and attack damage by ${format(effect.damage)}`;
            }
            let formula_mining = '(amount - 1) / 10 + 1',
                formula_damage = 'amount / 10';

            return `Mining formula: ${formula_mining}<br>Damage formula: ${formula_damage}`;
        },
        sources: {
            other: ['crafting'],
        },
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        lore: `A crude pick made of bones.<br>
            Good for attacking enemies and rocks. Mostly rocks.<br>
            Now that you think about it, these rocks look suspicious...`,
    },
    'jaw_grabber': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'jaw grabber',
        grid: [3, 2],
        icon: [3, 2],
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            return D.div(amount, 20).add(1);
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                return `Multiplies drop chance by ${format(item_effect(this.id))}`;
            }
            let formula = 'amount / 20 + 1';

            return `Formula: ${formula}`;
        },
        sources: {
            other: ['crafting'],
        },
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        lore: `A fancy pair of jaws on a stick.<br>
            Can be used to stealthily grab enemy loot without them noticing.<br>
            Clacks when you miss.`,
    },
    'crystal_skull': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'crystal skull',
        grid: [3, 3],
        icon() {
            if (inChallenge('b', 11)) return [3, 7];
            return [3, 3];
        },
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            let cap_div = 7.5,
                mult_base = 1.1;

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                cap_div = 5;
                mult_base = 1.125;
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
            let formula_cap = 'amount / 7.5 + 1',
                formula_mult = '1.1 ^ amount';

            if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                formula_cap = 'amount / 5 + 1';
                formula_mult = '1.125 ^ amount';
            }

            return `Multiplier formula: ${formula_mult}<br>Cap formula: ${formula_cap}`;
        },
        sources: {
            other: ['crafting'],
        },
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        lore() {
            if (inChallenge('b', 11)) {
                return `A red crystal skull.<br>
                    Feels like its eyes- wait. Why are there 4?<br>
                    It judges your sins.`;
            }
            return `A green crystal skull.<br>
                Feels like its eyes- wait. Why are there 4?<br>
                It knows.`
        },
    },
    // Mining
    'rock': {
        id: null,
        color: '#DDDDEE',
        name: 'rock',
        grid: [4, 0],
        icon: [4, 0],
        row: 0,
        sources: {
            chance() {
                if (!tmp.m.layerShown) return {};

                let hit = tmp.m.modifiers.gain.mult,
                    destroy = tmp.m.modifiers.gain.break_mult;

                /** @type {{ [key in drop_sources]: Decimal }} */
                const chance = {
                    'mining:stone': hit,
                    'mining:stone:break': destroy,
                };

                if (hasUpgrade('m', 12)) {
                    const sub = upgradeEffect('m', 12);
                    chance['mining:copper'] = sub;
                    chance['mining:tin'] = sub;
                }

                return chance;
            },
        },
        lore: `A simple piece of stone.`,
        unlocked() { return tmp.m.layerShown; },
    },
    'copper_ore': {
        id: null,
        color: '#FFAA22',
        name: 'copper ore',
        grid: [4, 1],
        icon: [4, 1],
        row: 0,
        sources: {
            chance() {
                if (!tmp.m.layerShown) return {};

                let hit = tmp.m.modifiers.gain.mult,
                    destroy = tmp.m.modifiers.gain.break_mult;

                return {
                    'mining:copper': hit,
                    'mining:copper:break': destroy,
                };
            },
        },
        lore: `A piece of orange ore.<br>\
            Turns teal over the course of time.`,
        unlocked() { return tmp.m.layerShown; },
    },
    'tin_ore': {
        id: null,
        color: '#DDEEFF',
        name: 'tin ore',
        grid: [4, 2],
        icon: [4, 2],
        row: 0,
        sources: {
            chance() {
                if (!tmp.m.layerShown) return {};

                let hit = tmp.m.modifiers.gain.mult,
                    destroy = tmp.m.modifiers.gain.break_mult;

                return {
                    'mining:tin': hit,
                    'mining:tin:break': destroy,
                };
            },
        },
        lore: `A piece of light yellow ore.<br>\
            Not very useful for tool making...`,
        unlocked() { return tmp.m.layerShown; },
    },
    'bronze_blend': {
        id: null,
        color: '#BB7744',
        name: 'bronze blend',
        grid: [4, 3],
        icon: [4, 3],
        row: 1,
        sources: {
            other: ['crafting:',],
        },
        lore: `A crude blend of copper and tin.<br>
            Not very useful...`,
        unlocked() { return tmp.m.layerShown; },
    },
    'rock_club': {
        id: null,
        color: '#DDDDEE',
        name: 'rock club',
        grid: [5, 0],
        icon: [5, 0],
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            let div = 15;

            return D.div(amount, div).add(1);
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                return `Multiplies damage by ${format(item_effect(this.id))}`;
            }
            let formula = 'amount / 15 + 1';

            return `Formula: ${formula}`;
        },
        sources: {
            other: ['crafting:'],
        },
        lore: `A large rock stuck to a bone.<br>
            Makes whack-a-mole harder due to its weight.`,
        unlocked() { return tmp.m.layerShown; },
    },
    'copper_pick': {
        id: null,
        color: '#FFAA22',
        name: 'copper pick',
        grid: [5, 1],
        icon: [5, 1],
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            // Oxidize
            amount = D.times(amount, tmp.m.modifiers.oxidizing);

            let mining = D.div(amount, 7.5).add(1),
                health = D.div(amount, 5).add(1);

            return { mining, health };
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                const effect = item_effect(this.id);
                return `Multiplies mining damage by ${format(effect.mining)}\
                    and ore health by ${format(effect.health)}`;
            }
            let formula_mining = 'amount / 7.5 + 1',
                formula_health = 'amount / 5 + 1';

            return `Mining formula: ${formula_mining}<br>Health formula: ${formula_health}`;
        },
        sources: {
            other: ['crafting:'],
        },
        lore: `A crude pick made of ore.<br>
            Loses efficiency over time due to oxydizing.`,
        unlocked() { return tmp.m.layerShown; },
    },
    'tin_belt': {
        id: null,
        color: '#DDEEFF',
        name: 'tin belt',
        grid: [5, 2],
        icon: [5, 2],
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            let mining = D.div(amount, 20).add(1),
                speed = D.div(amount, 5).add(1);

            return { mining, speed };
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                const effect = item_effect(this.id);
                return `Multiplies mining drops by ${format(effect.mining)}\
                    and crafting speed by ${format(effect.speed)}`;
            }
            let formula_mining = 'amount / 20 + 1',
                formula_speed = 'amount / 5 + 1';

            return `Mining formula: ${formula_mining}<br>Speed formula: ${formula_speed}`;
        },
        sources: {
            other: ['crafting:'],
        },
        lore: `A crude conveyor belt made of tin.<br>
            The sticky goo allows it to move things around, but covers them too.`,
        unlocked() { return tmp.m.layerShown; },
    },
    'bronze_cart': {
        id: null,
        color: '#BB7744',
        name: 'bronze cart',
        grid: [5, 3],
        icon: [5, 3],
        row: 1,
        effect(amount) {
            amount ??= player.items[this.id].amount;

            let mining = D.div(amount, 15).add(1),
                drop = D.div(amount, 15).add(1);

            return { mining, drop };
        },
        effectDescription(amount) {
            amount ??= player.items[this.id].amount;

            if (!shiftDown) {
                const effect = item_effect(this.id);
                return `Multiplies mining drops by ${format(effect.mining)}\
                    and item drops by ${format(effect.drop)}`;
            }
            let formula_mining = 'amount / 15 + 1',
                formula_drop = 'amount / 15 + 1';

            return `Mining formula: ${formula_mining}<br>Drop formula: ${formula_drop}`;
        },
        sources: {
            other: ['crafting:',],
        },
        lore: `A hauling cart made of bronze.<br>
            Faster on rails.`,
        unlocked() { return tmp.m.layerShown; },
    },
};

const ITEM_SIZES = {
    width: 8,
    height: 6,
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
