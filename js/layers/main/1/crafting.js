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
    branches: ['xp'],
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

        return mult;
    },
    buyables: {
        11: {
            title() { return `Looting lv.${formatWhole(getBuyableAmount(this.layer, this.id))}`; },
            display() {
                let cost = shiftDown ? '[200 * amount]' : formatWhole(tmp[this.layer].buyables[this.id].cost),
                    effect = shiftDown ? '[(amount - 1) / 20]' : format(buyableEffect(this.layer, this.id));

                return `Multiplies item drop chances by ${effect}<br>
                    First level increases effect by 1<br>
                    Performs a loot reset<br><br>
                Requires: ${cost} kills`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.add(x, 1).times(200);
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

                return [
                    ['slime_goo', D.times(10, count)],
                    ['slime_core_shard', D.times(3, count)],
                ];
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

                return [
                    ['slime_goo', D.times(25, count)],
                    ['slime_core_shard', D.times(7, count)],
                    ['slime_core', D.times(2, count)],
                ];
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

                let duration = D.times(count, 2).add(all).times(5).add(15);

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
                duration: '(crafting * 2 + crafted) * 5 + 30 seconds',
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

                let duration = D.times(count, 2).add(all).times(15);

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
                duration: '(crafting * 2 + crafted) * 25 seconds',
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

                let duration = D.times(count, 2).add(all).times(7.5).add(15);

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
                duration: '(crafting * 2 + crafted) * 7.5 + 15 seconds',
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
