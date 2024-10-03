'use strict';

addLayer('c', {
    name: 'crafting',
    row: 1,
    position: 1,
    // Allows for resets
    type: 'static',
    baseAmount: D.dZero,
    requires: D.dOne,
    symbol: 'C',
    color: '#996611',
    tooltip() {
        if (!player.c.shown) return `Reach ${formatWhole(tmp.c.buyables[11].cost)} kills to unlock (you have ${formatWhole(tmp.xp.kill.total)} kills)`;
        const sum = Object.values(player.items).reduce((sum, n) => D.add(sum, n.amount), D.dZero);
        let text = `${formatWhole(sum)} items`;

        if (tmp.c.forge.unlocked) text += `<br>${formatWhole(player.c.heat)} heat`;

        return text;
    },
    startData() {
        return {
            points: D.dZero,
            unlocked: true,
            shown: false,
            visiblity: {
                inventory: {},
                crafting: {},
                forge: {},
            },
            recipes: Object.fromEntries(Object.keys(layers.c.recipes).map(id => [id, {
                target: D.dOne,
                making: D.dZero,
                time: D.dZero,
                crafted: D.dZero,
            }])),
            compendium: false,
            visited_forge: false,
            heat: D.dZero,
        };
    },
    layerShown() { return player.c.shown || hasUpgrade('xp', 33); },
    hotkeys: [
        {
            key: 'C',
            description: 'Shift + C: Display crafting layer',
            onPress() { if (player.c.shown) showTab('c'); },
            unlocked() { return player.c.shown; },
        },
    ],
    branches: ['xp', 'm'],
    tabFormat: {
        'Crafting': {
            content: [
                ['buyable', 11],
                'blank',
                ['row', () => Object.keys(tmp.c.clickables)
                    .filter(id => id.startsWith('crafting_') && tmp.c.clickables[id].unlocked)
                    .map(id => [['clickable', id], 'blank']).flat()
                ],
                'blank',
                ['column', () => {
                    const types = {
                        /** @type {TabFormatEntries<'c'>[]} */
                        materials: [],
                        /** @type {TabFormatEntries<'c'>[]} */
                        equipment: [],
                    },
                        /** @type {TabFormatEntries<'c'>[]} */
                        lines = [];

                    Object.values(tmp.c.recipes)
                        .forEach(data => {
                            if (D.neq(data.heat, 0) || !(data.unlocked ?? true)) return;

                            const recipe = crafting_show_recipe(data.id);
                            if (!recipe.length) return;
                            if (data.categories.includes('materials')) types.materials.push(crafting_show_recipe(data.id));
                            else if (data.categories.includes('equipment')) types.equipment.push(crafting_show_recipe(data.id));
                        });

                    if (types.materials.length) {
                        const cost_mult = tmp.c.modifiers.materials.cost_mult;
                        if (D.neq_tolerance(cost_mult, 1, 1e-3)) {
                            lines.push(['display-text', `Material cost divider: /${resourceColor(colors[options.theme].points, format(D.pow(cost_mult, -1)))}`],);
                        }
                        lines.push(...types.materials);

                        if (types.equipment.length) lines.push('blank');
                    }
                    if (types.equipment.length) {
                        const cost_mult = tmp.c.modifiers.equipment.cost_mult;
                        if (D.neq_tolerance(cost_mult, 1, 1e-3)) {
                            lines.push(['display-text', `Equipment cost divider: /${resourceColor(colors[options.theme].points, format(D.pow(cost_mult, -1)))}`],);
                        }
                        lines.push(...types.equipment);
                    }

                    return lines;
                }],
            ],
        },
        'Inventory': {
            content() {
                return [
                    ['display-text', `Chance multiplier: ${format(tmp.c.chance_multiplier)}`],
                    'blank',
                    ['row', Object.keys(tmp.c.clickables)
                        .filter(id => id.startsWith('inventory_') && tmp.c.clickables[id].unlocked)
                        .map(id => [['clickable', id], 'blank']).flat()
                    ],
                    'blank',
                    ...inventory(),
                    'blank',
                    ...compendium_content(player.c.compendium),
                ];
            },
        },
        'Forge': {
            content: [
                ['display-text', () => {
                    const color = tmp.c.modifiers.heat.color,
                        gain = tmp.c.modifiers.heat.per_second,
                        gain_text = D.neq_tolerance(gain, 0, 1e-4) ? ` (+${resourceColor(color, format(gain))} /s)` : '';

                    return `You have ${resourceColor(color, formatWhole(player.c.heat), 'font-size:1.5em;')}${gain_text} heat`;
                }],
                ['display-text', `<span class="warning">You lose 1% of your heat every second</span>`],
                'blank',
                ['buyable', 21],
                ['upgrades', [1, 2]],
                'blank',
                ['row', () => Object.keys(tmp.c.clickables)
                    .filter(id => id.startsWith('forge_') && tmp.c.clickables[id].unlocked)
                    .map(id => [['clickable', id], 'blank']).flat()
                ],
                'blank',
                ['column', () => {
                    const types = {
                        /** @type {TabFormatEntries<'c'>[]} */
                        materials: [],
                        /** @type {TabFormatEntries<'c'>[]} */
                        equipment: [],
                    },
                        /** @type {TabFormatEntries<'c'>[]} */
                        lines = [];

                    Object.values(tmp.c.recipes)
                        .forEach(data => {
                            if (D.lte(data.heat, 0) || !(data.unlocked ?? true)) return;

                            const recipe = crafting_show_recipe(data.id);
                            if (!recipe.length) return;
                            if (data.categories.includes('materials')) types.materials.push(crafting_show_recipe(data.id));
                            else if (data.categories.includes('equipment')) types.equipment.push(crafting_show_recipe(data.id));
                        });

                    if (types.materials.length) {
                        const cost_mult = tmp.c.modifiers.materials.cost_mult;
                        if (D.neq_tolerance(cost_mult, 1, 1e-3)) {
                            lines.push(['display-text', `Material cost divider: /${resourceColor(colors[options.theme].points, format(D.pow(cost_mult, -1)))}`],);
                        }
                        lines.push(...types.materials);

                        if (types.equipment.length) lines.push('blank');
                    }
                    if (types.equipment.length) {
                        const cost_mult = tmp.c.modifiers.equipment.cost_mult;
                        if (D.neq_tolerance(cost_mult, 1, 1e-3)) {
                            lines.push(['display-text', `Equipment cost divider: /${resourceColor(colors[options.theme].points, format(D.pow(cost_mult, -1)))}`],);
                        }
                        lines.push(...types.equipment);
                    }

                    return lines;
                }],
            ],
            unlocked() { return tmp.c.forge.unlocked; },
            buttonStyle: { 'borderColor'() { return tmp.c.modifiers.heat.color; } },
            shouldNotify() { return tmp.c.forge.unlocked && !player.c.visited_forge; },
        },
    },
    chance_multiplier() {
        let mult = D.dZero;

        mult = mult.add(buyableEffect('c', 11));

        if (hasAchievement('ach', 44)) mult = mult.add(achievementEffect('ach', 44));
        if (hasAchievement('ach', 55)) mult = mult.add(achievementEffect('ach', 55));

        if (hasUpgrade('dea', 22)) mult = mult.times(upgradeEffect('dea', 22));

        mult = mult.times(item_effect('slime_die').luck);
        mult = mult.times(item_effect('magic_slime_ball').luck);

        return mult;
    },
    buyables: {
        11: {
            title() { return `Looting lv.${formatWhole(getBuyableAmount(this.layer, this.id))}`; },
            display() {
                let cost = shiftDown ? '[100 * (amount + 2)]' : `${formatWhole(tmp.xp.kill.total)} / ${formatWhole(tmp[this.layer].buyables[this.id].cost)}`,
                    effect = shiftDown ? '[(amount - 1) / 20]' : format(buyableEffect(this.layer, this.id));

                return `Multiplies item drop chances by ${effect}<br>
                    First level increases effect by 1<br>
                    Performs a loot reset<br><br>
                Requires: ${cost} kills`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                let cost = D.add(x, 2).times(100);

                if (hasUpgrade('dea', 32)) cost = cost.div(upgradeEffect('dea', 32));

                return cost;
            },
            canAfford() { return D.gte(tmp.xp.kill.total, tmp[this.layer].buyables[this.id].cost); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                if (D.lte(x, 0)) return D.dZero;

                return D.div(x, 20).add(.95);
            },
            buy() {
                if (!this.canAfford()) return;

                addBuyables(this.layer, this.id, 1);
                doReset('c', true);
                player.c.shown = true;
            },
        },
        21: {
            title() { return `Heating lv.${formatWhole(getBuyableAmount(this.layer, this.id))}`; },
            display() {
                const cost = tmp[this.layer].buyables[this.id].cost;
                let effect = shiftDown ? '[amount / 10]' : format(buyableEffect(this.layer, this.id)),
                    coal_cost = shiftDown ? '[1.1 ^ amount * 100]' : format(cost.coal),
                    stone_cost = shiftDown ? '[1.5 ^ amount * 333]' : format(cost.stone);

                return `Increases heat gain by ${effect}<br><br>
                Costs: ${coal_cost} coal, ${stone_cost} stone`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                let coal = D.pow(1.1, x).times(100),
                    stone = D.pow(1.5, x).times(333);

                return { coal, stone };
            },
            canAfford() {
                const cost = tmp[this.layer].buyables[this.id].cost;
                return D.gte(player.items.coal.amount, cost.coal) && D.gte(player.items.stone.amount, cost.stone);
            },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.div(x, 10);
            },
            buy() {
                if (!this.canAfford()) return;

                const cost = tmp[this.layer].buyables[this.id].cost;
                player.items.coal.amount = D.minus(player.items.coal.amount, cost.coal);
                player.items.stone.amount = D.minus(player.items.stone.amount, cost.stone);
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                if (canBuyBuyable(this.layer, this.id)) {
                    return { 'backgroundColor': tmp.c.modifiers.heat.color };
                }
            },
        },
    },
    upgrades: {
        //todo forge upgrades
    },
    clickables: {
        ...crafting_toggles(),
        'crafting_craftable': {
            canClick() { return true; },
            onClick() {
                const vis = player.c.visiblity,
                    /** @type {categories} */
                    cat = 'craftable';

                vis.crafting[cat] = {
                    'show': 'ignore',
                    'ignore': 'show',
                }[vis.crafting[cat] ??= 'ignore'];
            },
            display() {
                const vis = player.c.visiblity,
                    /** @type {categories} */
                    cat = 'craftable',
                    name = 'Craftable';

                let visibility = {
                    'show': 'Shown',
                    'ignore': 'Ignored',
                }[vis.crafting[cat] ??= 'ignore'];

                return `<span style="font-size:1.5em;">${name}</span><br>${visibility}`;
            },
            style: {
                'backgroundColor'() {
                    const vis = player.c.visiblity,
                        /** @type {categories} */
                        cat = 'craftable',
                        color = tmp.c.color;

                    switch (vis.crafting[cat]) {
                        case 'show':
                            return color;
                        case 'ignore':
                            return rgb_grayscale(color);
                    }
                },
            },
            unlocked: true,
        },
        'forge_craftable': {
            canClick() { return true; },
            onClick() {
                const vis = player.c.visiblity,
                    /** @type {categories} */
                    cat = 'craftable';

                vis.forge[cat] = {
                    'show': 'ignore',
                    'ignore': 'show',
                }[vis.forge[cat] ??= 'ignore'];
            },
            display() {
                const vis = player.c.visiblity,
                    /** @type {categories} */
                    cat = 'craftable',
                    name = 'Craftable';

                let visibility = {
                    'show': 'Shown',
                    'ignore': 'Ignored',
                }[vis.forge[cat] ??= 'ignore'];

                return `<span style="font-size:1.5em;">${name}</span><br>${visibility}`;
            },
            style: {
                'backgroundColor'() {
                    const vis = player.c.visiblity,
                        /** @type {categories} */
                        cat = 'craftable',
                        color = tmp.c.color;

                    switch (vis.forge[cat]) {
                        case 'show':
                            return color;
                        case 'ignore':
                            return rgb_grayscale(color);
                    }
                },
            },
            unlocked: true,
        },
    },
    crafting: {
        max() { return D.dTen; },
        crafted() { return Object.values(player.c.recipes).reduce((sum, rec) => D.add(sum, rec.crafted), D.dZero); },
        speed() {
            let speed = D.dOne;

            if (hasAchievement('ach', 45)) speed = speed.times(achievementEffect('ach', 45));

            return speed;
        },
    },
    forge: {
        unlocked() { return hasUpgrade('m', 62) || player.c.visited_forge; },
    },
    recipes: {
        // Materials
        slime_core: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                let costs = [
                    ['slime_goo', D.times(10, count)],
                    ['slime_core_shard', D.times(3, count)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['slime_core', count],
                ];
            },
            formulas: {
                consumes: {
                    'slime_goo': '10 * count',
                    'slime_core_shard': '3 * count',
                },
                produces: {
                    'slime_core': 'count',
                },
            },
            categories: ['materials', 'slime',],
        },
        dense_slime_core: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                let costs = [
                    ['slime_goo', D.times(25, count)],
                    ['slime_core_shard', D.times(7, count)],
                    ['slime_core', D.times(2, count)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['dense_slime_core', count],
                ];
            },
            duration() {
                let duration = D.dTen;

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'slime_goo': '25 * count',
                    'slime_core_shard': '7 * count',
                    'slime_core': '2 * count',
                },
                produces: {
                    'dense_slime_core': 'count',
                },
                duration: '10 seconds',
            },
            categories: ['materials', 'slime',],
        },
        skull: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                let costs = [
                    ['bone', D.times(13, count)],
                    ['rib', D.times(4, count)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['skull', count],
                ];
            },
            formulas: {
                consumes: {
                    'bone': '13 * count',
                    'rib': '4 * count',
                },
                produces: {
                    'skull': 'count',
                },
            },
            categories: ['materials', 'skeleton',],
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        slimy_skull: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                let costs = [
                    ['slime_goo', D.times(25, count)],
                    ['slime_core', D.times(5, count)],
                    ['skull', D.times(2, count)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['slimy_skull', count],
                ];
            },
            duration() {
                let duration = D(15);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'slime_goo': '25 * count',
                    'slime_core': '5 * count',
                    'skull': '2 * count',
                },
                produces: {
                    'slimy_skull': 'count',
                },
                duration: '15 seconds',
            },
            categories: ['materials', 'skeleton', 'slime',],
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        bronze_blend: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                let costs = [
                    ['copper_ore', D.times(6, count)],
                    ['tin_ore', D.times(2, count)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['bronze_blend', count],
                ];
            },
            formulas: {
                consumes: {
                    'copper_ore': '6 * count',
                    'tin_ore': '2 * count',
                },
                produces: {
                    'bronze_blend': 'count',
                }
            },
            categories: ['materials', 'mining',],
            unlocked() { return tmp.m.layerShown; },
        },
        clear_iron_ore: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                let costs = [
                    ['iron_ore', D.times(8, count)],
                    ['coal', D.times(16, count)],
                    ['slime_goo', D.times(15, count)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['clear_iron_ore', D.times(count, 2)],
                ];
            },
            duration() {
                let duration = D(20);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'iron_ore': '8 * count',
                    'coal': '16 * count',
                    'slime_goo': '15 * count',
                },
                produces: {
                    'clear_iron_ore': 'count * 2',
                },
                duration: '20 seconds',
            },
            categories: ['materials', 'mining',],
            unlocked() { return hasUpgrade('m', 61); },
        },
        electrum_blend: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                let costs = [
                    ['silver_ore', D.times(5, count)],
                    ['gold_nugget', count],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['electrum_blend', count],
                ];
            },
            formulas: {
                consumes: {
                    'silver_ore': '5 * count',
                    'gold_nugget': 'count',
                },
                produces: {
                    'electrum_blend': 'count',
                }
            },
            categories: ['materials', 'mining',],
            unlocked() { return hasUpgrade('m', 61); },
        },
        // Forge Materials
        stone_brick: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['stone', D.sumGeometricSeries(count, 100, 2, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['stone_brick', count],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 10).add(10);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D.dTen,
            formulas: {
                consumes: {
                    'stone': '100 * 2 ^ amount',
                },
                produces: {
                    'stone_brick': 'amount',
                },
                duration: 'crafting * 10 + 10 seconds',
                heat: '10',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.stone.unlocked; },
        },
        copper_ingot: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['copper_ore', D.sumGeometricSeries(count, 100, 1.5, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['copper_ingot', count],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 15).add(10);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D(25),
            formulas: {
                consumes: {
                    'copper_ore': '100 * 1.5 ^ amount',
                },
                produces: {
                    'copper_ingot': 'amount',
                },
                duration: 'crafting * 15 + 10 seconds',
                heat: '25',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.copper_ore.unlocked; },
        },
        tin_ingot: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['tin_ore', D.sumGeometricSeries(count, 100, 1.25, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['tin_ingot', count],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 5).add(10);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D(25),
            formulas: {
                consumes: {
                    'tin_ore': '100 * 1.25 ^ amount',
                },
                produces: {
                    'tin_ingot': 'amount',
                },
                duration: 'crafting * 5 + 10 seconds',
                heat: '25',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.tin_ore.unlocked; },
        },
        bronze_ingot: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['bronze_blend', D.sumGeometricSeries(count, 25, 1.1, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['bronze_ingot', count],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 20).add(10);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D(75),
            formulas: {
                consumes: {
                    'bronze_blend': '25 * 1.1 ^ amount',
                },
                produces: {
                    'bronze_ingot': 'amount',
                },
                duration: 'crafting * 20 + 10 seconds',
                heat: '75',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.bronze_blend.unlocked; },
        },
        bronze_ingot_alt: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['copper_ingot', D.sumGeometricSeries(count, 75, 1.25, all)],
                    ['tin_ingot', D.sumGeometricSeries(count, 25, 1.125, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['bronze_ingot', count],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 30).add(20);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D(75),
            formulas: {
                consumes: {
                    'copper_ingot': '75 * 1.25 ^ amount',
                    'tin_ingot': '25 * 1.125 ^ amount',
                },
                produces: {
                    'bronze_ingot': 'amount',
                },
                duration: 'crafting * 30 + 20 seconds',
                heat: '75',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.bronze_blend.unlocked; },
        },
        gold_ingot: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['gold_nugget', D.sumGeometricSeries(count, 5, 1.125, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['gold_ingot', count],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 5).add(5);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D(50),
            formulas: {
                consumes: {
                    'gold_nugget': '5 * 1.125 ^ amount',
                },
                produces: {
                    'gold_ingot': 'amount',
                },
                duration: 'crafting * 5 + 5 seconds',
                heat: '50',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.gold_nugget.unlocked; },
        },
        iron_ingot: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['iron_ore', D.sumGeometricSeries(count, 400, 1.4, all)],
                    ['coal', D.sumGeometricSeries(count, 100, 1.8, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['iron_ingot', count],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 30).add(30);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D(110),
            formulas: {
                consumes: {
                    'coal': '100 * 1.8 ^ amount',
                    'iron_ore': '400 * 1.4 ^ amount',
                },
                produces: {
                    'iron_ingot': 'amount',
                },
                duration: 'crafting * 30 + 30 seconds',
                heat: '110',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.iron_ore.unlocked; },
        },
        iron_ingot_alt: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['clear_iron_ore', D.sumGeometricSeries(count, 100, 1.4, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['iron_ingot', count],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 15).add(15);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D(100),
            formulas: {
                consumes: {
                    'clear_iron_ore': '400 * 1.4 ^ amount',
                },
                produces: {
                    'iron_ingot': 'amount',
                },
                duration: 'crafting * 15 + 15 seconds',
                heat: '100',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.iron_ore.unlocked; },
        },
        silver_ingot: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['silver_ore', D.sumGeometricSeries(count, 110, 1.2, all)],
                    ['coal', D.sumGeometricSeries(count, 100, 1.8, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['silver_ingot', count],
                    ['lead_ingot', D.div(count, 10)],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 15).add(45);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D(150),
            formulas: {
                consumes: {
                    'coal': '100 * 1.8 ^ amount',
                    'silver_ore': '110 * 1.2 ^ amount',
                },
                produces: {
                    'silver_ingot': 'amount',
                    'lead_ingot': 'amount / 10',
                },
                duration: 'crafting * 15 + 45 seconds',
                heat: '150',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.silver_ore.unlocked; },
        },
        electrum_ingot: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['electrum_blend', D.sumGeometricSeries(count, 25, 1.1, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['electrum_ingot', count],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 20).add(20);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D(225),
            formulas: {
                consumes: {
                    'electrum_blend': '25 * 1.1 ^ amount',
                },
                produces: {
                    'electrum_ingot': 'amount',
                },
                duration: 'crafting * 20 + 20 seconds',
                heat: '225',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.electrum_blend.unlocked; },
        },
        electrum_ingot_alt: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['gold_ingot', D.sumGeometricSeries(count, 5, 1.0625, all)],
                    ['silver_ingot', D.sumGeometricSeries(count, 5, 1.1, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.materials.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['electrum_ingot', count],
                ];
            },
            duration(amount) {
                const count = crafting_default_amount(this.id, amount);

                let duration = D.times(count, 10).add(10);

                return D.div(duration, tmp.c.crafting.speed);
            },
            heat: D(225),
            formulas: {
                consumes: {
                    'gold_ingot': '5 * 1.0625 ^ amount',
                    'silver_ingot': '5 * 1.1 ^ amount',
                },
                produces: {
                    'electrum_ingot': 'amount',
                },
                duration: 'crafting * 10 + 10 seconds',
                heat: '225',
            },
            categories: ['materials', 'forge',],
            static: true,
            unlocked() { return tmp.c.forge.unlocked && tmp.items.electrum_blend.unlocked; },
        },
        // Equipment
        slime_crystal: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['slime_goo', D.sumGeometricSeries(count, 15, 1.8, all)],
                    ['slime_core', D.sumGeometricSeries(count, 1, 1.2, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['slime_crystal', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 2).add(all).times(5).add(10);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'slime_goo': '15 * 1.8 ^ amount',
                    'slime_core': '1.2 ^ amount',
                },
                produces: {
                    'slime_crystal': 'amount',
                },
                duration: '(crafting * 2 + crafted) * 5 + 10 seconds',
            },
            categories: ['equipment', 'slime',],
            static: true,
        },
        slime_knife: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['slime_goo', D.sumGeometricSeries(count, 5, 1.8, all)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 10, 1.4, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['slime_knife', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 2).add(all).times(10);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'slime_goo': '5 * 1.8 ^ amount',
                    'slime_core_shard': '10 * 1.4 ^ amount',
                },
                produces: {
                    'slime_knife': 'amount',
                },
                duration: '(crafting * 2 + crafted) * 10 seconds',
            },
            categories: ['equipment', 'slime',],
            static: true,
        },
        slime_injector: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['slime_goo', D.sumGeometricSeries(count, 25, 1.8, all)],
                    ['slime_core', D.sumGeometricSeries(count, 2, 1.2, all)],
                    ['dense_slime_core', D.sumGeometricSeries(count, 1, 1.1, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['slime_injector', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 2).add(all).times(10).add(15);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'slime_goo': '25 * 1.8 ^ amount',
                    'slime_core': '2 * 1.2 ^ amount',
                    'dense_slime_core': '1.1 ^ amount',
                },
                produces: {
                    'slime_injector': 'amount',
                },
                duration: '(crafting * 2 + crafted) * 10 + 15 seconds',
            },
            categories: ['equipment', 'slime',],
            static: true,
        },
        slime_die: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['slime_goo', D.sumGeometricSeries(count, 50, 1.8, all)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 25, 1.4, all)],
                    ['dense_slime_core', D.sumGeometricSeries(count, 1, 1.1, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['slime_die', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 4).add(all).times(5).add(20);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'slime_goo': '50 * 1.8 ^ amount',
                    'slime_core_shard': '25 * 1.4 ^ amount',
                    'dense_slime_core': '1.1 ^ amount',
                },
                produces: {
                    'slime_crystal': 'amount',
                },
                duration: '(crafting * 4 + crafted) * 5 + 20 seconds',
            },
            categories: ['equipment', 'slime',],
            static: true,
        },
        bone_pick: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                return [
                    ['bone', D.sumGeometricSeries(count, 10, 1.8, all)],
                    ['rib', D.sumGeometricSeries(count, 3, 1.4, all)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['bone_pick', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 2).add(all).times(7.5).add(7.5);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'bone': '10 * 1.8 ^ amount',
                    'rib': '3 * 1.4 ^ amount',
                },
                produces: {
                    'bone_pick': 'amount',
                },
                duration: '(crafting * 2 + crafted) * 7.5 + 7.5 seconds',
            },
            categories: ['equipment', 'skeleton',],
            static: true,
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        crystal_skull: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['skull', D.sumGeometricSeries(count, 1, 1.2, all)],
                    ['slime_goo', D.sumGeometricSeries(count, 25, 1.8, all)],
                    ['slime_crystal', D.sumGeometricSeries(count, 1, 1.05, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['crystal_skull', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.add(count, all).times(30);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'skull': '1.2 ^ amount',
                    'slime_goo': '25 * 1.8 ^ amount',
                    'slime_crystal': '1.05 ^ amount',
                },
                produces: {
                    'crystal_skull': 'amount',
                },
                duration: '(crafting + crafted) * 30 seconds',
            },
            categories: ['equipment', 'skeleton', 'slime',],
            static: true,
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        bone_slate: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['rib', D.sumGeometricSeries(count, 10, 1.4, all)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 12, 1.4, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['bone_slate', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 4).add(all).times(5).add(15);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'rib': '10 * 1.4 ^ amount',
                    'slime_core_shard': '12 * 1.4 ^ amount',
                },
                produces: {
                    'bone_slate': 'amount',
                },
                duration: '(crafting * 4 + crafted) * 5 + 15 seconds',
            },
            categories: ['equipment', 'skeleton',],
            static: true,
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        magic_slime_ball: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['dense_slime_core', D.sumGeometricSeries(count, 2, 1.1, all)],
                    ['slimy_skull', D.sumGeometricSeries(count, 1, 1.1, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['magic_slime_ball', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.add(count, all).times(5).add(30);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'dense_slime_core': '2 * 1.1 ^ amount',
                    'slimy_skull': '1.1 ^ amount',
                },
                produces: {
                    'magic_slime_ball': 'amount',
                },
                duration: '(crafting + crafted) * 5 + 30 seconds',
            },
            categories: ['equipment', 'skeleton', 'slime',],
            static: true,
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        stone_mace: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['bone', D.sumGeometricSeries(count, 5, 1.8, all)],
                    ['stone', D.sumGeometricSeries(count, 12, 2, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['stone_mace', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 2).add(all).times(4).add(8);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'bone': '5 * 1.8 ^ amount',
                    'stone': '12 * 2 ^ amount',
                },
                produces: {
                    'stone_mace': 'amount',
                },
                duration: '(crafting * 2 + crafted) * 4 + 8 seconds',
            },
            categories: ['equipment', 'mining',],
            static: true,
            unlocked() { return tmp.m.layerShown; },
        },
        copper_pick: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['bone', D.sumGeometricSeries(count, 6, 1.8, all)],
                    ['slime_goo', D.sumGeometricSeries(count, 15, 1.8, all)],
                    ['copper_ore', D.sumGeometricSeries(count, 12, 1.5, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['copper_pick', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 2).add(all).times(8).add(8);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'bone': '6 * 1.8 ^ amount',
                    'slime_goo': '15 * 1.8 ^ amount',
                    'copper_ore': '12 * 1.5 ^ amount',
                },
                produces: {
                    'copper_pick': 'amount',
                },
                duration: '(crafting * 2 + crafted) * 8 + 8 seconds',
            },
            categories: ['equipment', 'mining',],
            static: true,
            unlocked() { return tmp.m.layerShown; },
        },
        tin_cache: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['copper_ore', D.sumGeometricSeries(count, 8, 1.5, all)],
                    ['tin_ore', D.sumGeometricSeries(count, 12, 1.25, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['tin_cache', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 2).add(all).times(4).add(12);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'copper_ore': '8 * 1.5 ^ amount',
                    'tin_ore': '12 * 1.25 ^ amount',
                },
                produces: {
                    'tin_cache': 'amount',
                },
                duration: '(crafting * 2 + crafted) * 4 + 12 seconds',
            },
            categories: ['equipment', 'mining',],
            static: true,
            unlocked() { return tmp.m.layerShown; },
        },
        bronze_cart: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['copper_ore', D.sumGeometricSeries(count, 24, 1.5, all)],
                    ['bronze_blend', D.sumGeometricSeries(count, 8, 1.1, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['bronze_cart', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 3).add(all).times(8).add(16);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'copper_ore': '24 * 1.5 ^ amount',
                    'bronze_blend': '8 * 1.1 ^ amount',
                },
                produces: {
                    'bronze_cart': 'amount',
                },
                duration: '(crafting * 2 + crafted) * 8 + 16 seconds',
            },
            categories: ['equipment', 'mining',],
            static: true,
            unlocked() { return tmp.m.layerShown; },
        },
        doubloon: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let costs = [
                    ['gold_nugget', D.sumGeometricSeries(count, 4, 1.125, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['doubloon', count],
                ];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                let duration = D.times(count, 3).add(all).times(10).add(6);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'gold_nugget': '4 * 1.125 ^ amount',
                },
                produces: {
                    'doubloon': 'amount',
                },
                duration: '(crafting * 3 + crafted) * 10 + 6 seconds',
            },
            categories: ['equipment', 'mining',],
            static: true,
            unlocked() { return inChallenge('b', 12) || hasChallenge('b', 12); },
        },
        //todo furnace (stone & coal), iron rails (clear iron & bone), silver coating (silver & slime goo), electrum coin mold (electrum & ??? coin)
        //todo bellow (stone & rib & slime core), lead coating (lead & slime goo)
        densium_slime: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                /** @type {[items, Decimal][]} */
                let costs = [
                    ['densium', D.sumGeometricSeries(count, 1, 1.05, all)],
                    ['slime_goo', D.sumGeometricSeries(count, 30, 2.7, all)],
                    ['slime_core', D.sumGeometricSeries(count, 5, 1.8, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['densium_slime', count],
                ];
            },
            duration(amount, all_time) {
                let duration = D(30);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'densium': '1.05 ^ amount',
                    'slime_goo': '30 * 2.7 ^ amount',
                    'slime_core': '5 * 1.8 ^ amount',
                },
                produces: {
                    'densium_slime': 'amount',
                },
                duration: '30 seconds',
            },
            categories: ['equipment', 'mining', 'slime',],
            static: true,
            unlocked() { return tmp.m.compactor.unlocked; },
        },
        densium_rock: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                /** @type {[items, Decimal][]} */
                let costs = [
                    ['densium', D.sumGeometricSeries(count, 1, 1.05, all)],
                    ['stone', D.sumGeometricSeries(count, 50, 3, all)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 10, 2.1, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['densium_rock', count],
                ];
            },
            duration(amount, all_time) {
                let duration = D(30);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'densium': '1.05 ^ amount',
                    'stone': '50 * 3 ^ amount',
                    'slime_core_shard': '5 * 2.1 ^ amount',
                },
                produces: {
                    'densium_rock': 'amount',
                },
                duration: '30 seconds',
            },
            categories: ['equipment', 'mining',],
            static: true,
            unlocked() { return tmp.m.compactor.unlocked; },
        },
        magic_densium_ball: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                /** @type {[items, Decimal][]} */
                let costs = [
                    ['densium', D.sumGeometricSeries(count, 1, 1.05, all)],
                    ['slime_goo', D.sumGeometricSeries(count, 40, 2.7, all)],
                    ['bone', D.sumGeometricSeries(count, 15, 2.7, all)],
                ];

                costs.forEach(([, c], i) => costs[i][1] = D.times(c, tmp.c.modifiers.equipment.cost_mult));

                return costs;
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['magic_densium_ball', count],
                ];
            },
            duration(amount, all_time) {
                let duration = D(30);

                return D.div(duration, tmp.c.crafting.speed);
            },
            formulas: {
                consumes: {
                    'densium': '1.05 ^ amount',
                    'slime_goo': '30 * 2.7 ^ amount',
                    'bone': '5 * 2.7 ^ amount',
                },
                produces: {
                    'magic_densium_ball': 'amount',
                },
                duration: '30 seconds',
            },
            categories: ['equipment', 'mining',],
            static: true,
            unlocked() { return tmp.m.compactor.unlocked; },
        },
    },
    modifiers: {
        craft: { cost_mult() { return D.dOne; }, },
        materials: {
            cost_mult() {
                let mult = D.dOne;

                mult = mult.times(tmp.c.modifiers.craft.cost_mult);

                if (hasUpgrade('m', 34)) mult = mult.div(upgradeEffect('m', 34));

                return mult;
            },
        },
        equipment: {
            cost_mult() {
                let mult = D.dOne;

                mult = mult.times(tmp.c.modifiers.craft.cost_mult);

                if (hasUpgrade('s', 13)) mult = mult.times(upgradeEffect('s', 13));

                return mult;
            },
        },
        heat: {
            gain: {
                base() {
                    let base = D.dZero;

                    if (hasUpgrade('m', 62)) base = base.add(upgradeEffect('m', 62));

                    base = base.add(buyableEffect('c', 21));

                    return base;
                },
                mult() {
                    let mult = D.dOne;

                    mult = mult.times(item_effect('furnace').heat_mult);
                    mult = mult.times(item_effect('bellow').heat_mult);

                    return mult;
                },
                total() { return D.times(tmp.c.modifiers.heat.gain.base, tmp.c.modifiers.heat.gain.mult); },
            },
            loss: {
                base() {
                    let base = D.div(player.c.heat, 100);

                    return base;
                },
                mult() { return D.dOne; },
                total() { return D.times(tmp.c.modifiers.heat.loss.base, tmp.c.modifiers.heat.loss.mult); },
            },
            per_second() { return D.minus(tmp.c.modifiers.heat.gain.total, tmp.c.modifiers.heat.loss.total); },
            color() {
                const low =
                    [0x99, 0x00, 0x00],
                    high = [0xff, 0xbb, 0x33],
                    progress = D.add(player.c.heat, 1).log10().div(10);

                return `#${color_between(low, high, progress.toNumber()).map(n => n.toString(16).padStart(2, '0')).join('')}`;
            },
        },
    },
    doReset(layer) {
        if (tmp[layer].row < this.row) return;
        if (tmp[layer].row == this.row) {
            player.c.heat = D.dZero;
            return;
        }

        /** @type {(keyof Player['c'])[]} */
        const keep = ['shown', 'compendium', 'visited_forge'];

        layerDataReset(this.layer, keep);
    },
    update(diff) {
        Object.entries(player.c.recipes).forEach(([id, rec]) => {
            if (D.gt(rec.making, 0) && D.lt(rec.time, tmp.c.recipes[id].duration) && D.gte(player.c.heat, tmp.c.recipes[id].heat)) {
                rec.time = D.add(rec.time, diff);
            }
        });

        player.c.heat = D.times(tmp.c.modifiers.heat.per_second, diff).add(player.c.heat);
    },
    automate() {
        Object.entries(player.c.recipes).forEach(([id, rec]) => {
            if (D.gt(rec.making, 0) && D.gte(rec.time, tmp.c.recipes[id].duration)) {
                gain_items(tmp.c.recipes[id].produces);
                rec.time = D.dZero;
                rec.crafted = D.add(rec.crafted, rec.making);
                rec.making = D.dZero;
            }
        });

        if (!player.c.visited_forge && player.subtabs.c.mainTabs == 'Forge') player.c.visited_forge = true;
    },
    shouldNotify() {
        return Object.values(tmp.c.recipes).filter(rec => (rec.unlocked ?? true) &&
            rec.categories.includes('equipment') && crafting_can(rec.id, D.dOne) && D.lte(player.c.recipes[rec.id].making, 0)).length;
    },
    prestigeNotify() { return canBuyBuyable('c', 11) || (tmp.c.forge.unlocked && !player.c.visited_forge); },
    nodeStyle: {
        'backgroundColor'() {
            if (!player.c.shown && !canBuyBuyable('c', 11)) return colors[options.theme].locked;
            return tmp.c.color;
        },
        'borderColor'() {
            if (tmp.c.forge.unlocked) {
                return tmp.c.modifiers.heat.color + '77';
            }
        },
    },
});
