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
        return `${formatWhole(sum)} items`;
    },
    startData() {
        return {
            points: D.dZero,
            unlocked: true,
            shown: false,
            visiblity: {
                inventory: {},
                crafting: {},
            },
            recipes: Object.fromEntries(Object.keys(layers.c.recipes).map(id => [id, {
                target: D.dOne,
                making: D.dZero,
                time: D.dZero,
                crafted: D.dZero,
            }])),
            compendium: false,
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
                    .filter(id => id.startsWith('crafting_'))
                    .map(id => [['clickable', id], 'blank']).flat()
                ],
                'blank',
                ['column', () => Object.keys(layers.c.recipes).map(id => crafting_show_recipe(id))],
            ],
        },
        'Inventory': {
            content() {
                return [
                    ['display-text', `Chance multiplier: ${format(tmp.c.chance_multiplier)}`],
                    'blank',
                    ['row', Object.keys(tmp.c.clickables)
                        .filter(id => id.startsWith('inventory_'))
                        .map(id => [['clickable', id], 'blank']).flat()
                    ],
                    'blank',
                    ...inventory(),
                    'blank',
                    ...compendium_content(player.c.compendium),
                ];
            }
        },
    },
    chance_multiplier() {
        let mult = D.dZero;

        mult = mult.add(buyableEffect('c', 11));
        if (hasAchievement('ach', 44)) mult = mult.add(achievementEffect('ach', 44));

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

                return D.add(x, 2).times(100);
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
    },
    clickables: {
        ...crafting_toggles(),
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

                if (hasUpgrade('m', 34)) costs.forEach(([, c], i) => costs[i][1] = D.div(c, upgradeEffect('m', 34)));

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

                if (hasUpgrade('m', 34)) costs.forEach(([, c], i) => costs[i][1] = D.div(c, upgradeEffect('m', 34)));

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

                if (hasUpgrade('m', 34)) costs.forEach(([, c], i) => costs[i][1] = D.div(c, upgradeEffect('m', 34)));

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

                if (hasUpgrade('m', 34)) costs.forEach(([, c], i) => costs[i][1] = D.div(c, upgradeEffect('m', 34)));

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
                    ['copper_ore', D.times(9, count)],
                    ['tin_ore', D.times(3, count)],
                ];

                if (hasUpgrade('m', 34)) costs.forEach(([, c], i) => costs[i][1] = D.div(c, upgradeEffect('m', 34)));

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
                    'copper_ore': '9 * count',
                    'tin_ore': '3 * count',
                },
                produces: {
                    'bronze_blend': 'count',
                }
            },
            categories: ['materials', 'mining',],
            unlocked() { return tmp.m.layerShown; },
        },
        // Equipment
        slime_crystal: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    all = crafting_default_all_time(this.id, all_time);

                return [
                    ['slime_goo', D.sumGeometricSeries(count, 15, 1.8, all)],
                    ['slime_core', D.sumGeometricSeries(count, 1, 1.2, all)],
                ];
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

                return [
                    ['slime_goo', D.sumGeometricSeries(count, 5, 1.8, all)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 10, 1.4, all)],
                ];
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

                return [
                    ['slime_goo', D.sumGeometricSeries(count, 25, 1.8, all)],
                    ['slime_core', D.sumGeometricSeries(count, 2, 1.2, all)],
                    ['dense_slime_core', D.sumGeometricSeries(count, 1, 1.1, all)],
                ];
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

                return [
                    ['slime_goo', D.sumGeometricSeries(count, 50, 1.8, all)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 25, 1.4, all)],
                    ['dense_slime_core', D.sumGeometricSeries(count, 1, 1.1, all)],
                ];
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

                return [
                    ['skull', D.sumGeometricSeries(count, 1, 1.2, all)],
                    ['slime_goo', D.sumGeometricSeries(count, 25, 1.8, all)],
                    ['slime_crystal', D.sumGeometricSeries(count, 1, 1.05, all)],
                ];
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
                    'skull': '1 * 1.2 ^ amount',
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

                return [
                    ['rib', D.sumGeometricSeries(count, 10, 1.4, all)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 12, 1.4, all)],
                ];
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

                return [
                    ['dense_slime_core', D.sumGeometricSeries(count, 2, 1.1, all)],
                    ['slimy_skull', D.sumGeometricSeries(count, 1, 1.1, all)],
                ];
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

                return [
                    ['bone', D.sumGeometricSeries(count, 5, 1.8, all)],
                    ['stone', D.sumGeometricSeries(count, 20, 2, all)],
                ];
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
                    'stone': '20 * 2 ^ amount',
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

                return [
                    ['bone', D.sumGeometricSeries(count, 9, 1.8, all)],
                    ['slime_goo', D.sumGeometricSeries(count, 15, 1.8, all)],
                    ['copper_ore', D.sumGeometricSeries(count, 20, 1.5, all)],
                ];
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
                    'bone': '9 * 1.8 ^ amount',
                    'slime_goo': '15 * 1.8 ^ amount',
                    'copper_ore': '20 * 1.5 ^ amount',
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

                return [
                    ['copper_ore', D.sumGeometricSeries(count, 10, 1.5, all)],
                    ['tin_ore', D.sumGeometricSeries(count, 20, 1.25, all)],
                ];
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
                    'copper_ore': '10 * 1.5 ^ amount',
                    'tin_ore': '20 * 1.25 ^ amount',
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

                return [
                    ['copper_ore', D.sumGeometricSeries(count, 25, 1.5, all)],
                    ['bronze_blend', D.sumGeometricSeries(count, 10, 1.1, all)],
                ];
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
                    'copper_ore': '25 * 1.5 ^ amount',
                    'bronze_blend': '10 * 1.1 ^ amount',
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

                return [
                    ['gold_nugget', D.sumGeometricSeries(count, 4, 1.125, all)],
                ];
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
    },
    doReset(layer) {
        if (tmp[layer].row <= this.row) return;

        /** @type {(keyof Player['c'])[]} */
        const keep = ['shown', 'compendium'];

        layerDataReset(this.layer, keep);
    },
    update(diff) {
        Object.entries(player.c.recipes).forEach(([id, rec]) => {
            if (D.gt(rec.making, 0) && D.lt(rec.time, tmp.c.recipes[id].duration)) {
                rec.time = D.add(rec.time, diff);
            }
        });
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
    },
    shouldNotify() {
        return canBuyBuyable('c', 11) ||
            Object.values(tmp.c.recipes).filter(rec => (rec.unlocked ?? true) &&
                rec.categories.includes('equipment') && crafting_can(rec.id, D.dOne)).length;
    },
    nodeStyle: {
        'backgroundColor'() {
            if (!player.c.shown && !canBuyBuyable('c', 11)) return colors[options.theme].locked;
            return tmp.c.color;
        },
    },
});
