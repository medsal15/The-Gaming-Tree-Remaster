'use strict';

addLayer('c', {
    row: 1,
    position: 1,
    type: 'none',
    name: 'crafting',
    color: '#CC8811',
    hotkeys: [{
        key: 'C',
        description: 'Shift + C: Display crafting layer',
        onPress() { showTab('c'); },
        unlocked() { return player.c.shown; },
    }],
    tooltip() {
        const sum = Object.values(player.items).reduce((sum, n) => D.add(sum, n.amount), D.dZero);
        return `${formatWhole(sum)} items`;
    },
    startData() {
        return {
            unlocked: true,
            shown: false,
            recipes: Object.fromEntries(Object.keys(layers.c.recipes).map(r => [r, {
                target: D.dOne,
                making: D.dZero,
                time_left: D.dZero,
                crafted: D.dZero,
            }])),
            hide_cat: [],
            lore: '',
        };
    },
    layerShown() { return hasUpgrade('xp', 33) || player.c.shown; },
    branches: ['xp'],
    tabFormat: {
        'Crafting': {
            content: [
                ['buyable', 11],
                'clickables',
                'blank',
                ['column', () => Object.keys(layers.c.recipes).map(crafting_show_recipe)],
            ],
        },
        'Inventory': {
            content() {
                return [
                    ['display-text', `Chance multiplier: ${format(tmp.c.chance_multiplier)}`],
                    'blank',
                    ...inventory()
                ];
            },
        },
        'Compendium': {
            content() {
                return [
                    ...compendium_list(),
                    'blank',
                    ['column', compendium_content(player.c.lore)],
                ];
            },
        },
    },
    buyables: {
        //todo why is shift breaking the display?
        11: {
            title() { return `Looting ${formatWhole(getBuyableAmount(this.layer, this.id))}`; },
            display() {
                let chance = '', cost = '';
                if (shiftDown) {
                    chance = '[(level - 1) / 10 + 1]';
                    cost = '[200 * 2 ^ level]';
                } else {
                    chance = formatWhole(buyableEffect(this.layer, this.id));
                    cost = formatWhole(tmp[this.layer].buyables[this.id].cost);
                }

                return `First level allows obtaining loot from enemies.<br>\
                    Further levels increase loot chance.<br>\
                    Currently: +${chance} chance<br><br>\
                    <span class="warning">Resets lower layers</span><br>\
                    Requires ${formatWhole(tmp.xp.kill.total)} / ${cost} kills<br>`;
            },
            effect(x) {
                if (D.lte(x, 0)) return D.dZero;
                return D.minus(x, 1).div(10).add(1);
            },
            cost(x) { return D.pow(2, x).times(200); },
            canAfford() { return D.gte(tmp.xp.kill.total, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                doReset('c', true);
                addBuyables(this.layer, this.id, 1);
                player.c.shown = true;
            },
        },
    },
    chance_multiplier() {
        /** @type {Decimal} */
        let mult = buyableEffect('c', 11);

        if (hasAchievement('ach', 34)) mult = mult.add(achievementEffect('ach', 34));

        mult = mult.times(item_effect('slime_dice'));

        if (hasUpgrade('l', 32)) mult = mult.times(upgradeEffect('l', 32));

        return mult;
    },
    recipes: {
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

                return [['slime_core', D.times(count, 2)]];
            },
            formulas: {
                consumes: {
                    'slime_goo': '10 * amount',
                    'slime_core_shard': '3 * amount',
                },
                produces: {
                    'slime_core': 'amount * 2',
                },
            },
            category: ['materials', 'slime',],
        },
        dense_slime_core: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['slime_goo', D.times(15, count)],
                    ['slime_core_shard', D.times(5, count)],
                    ['slime_core', D.times(2, count)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['dense_slime_core', count]];
            },
            formulas: {
                consumes: {
                    'slime_goo': '15 * amount',
                    'slime_core_shard': '5 * amount',
                    'slime_core': '2 * amount',
                },
                produces: {
                    'dense_slime_core': 'amount',
                },
            },
            category: ['materials', 'slime',],
        },
        slime_crystal: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['slime_goo', D.sumGeometricSeries(count, 15, 2, total)],
                    ['slime_core', D.sumGeometricSeries(count, 1, 1.5, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['slime_crystal', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).div(10).add(10);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'slime_goo': '15 * (2 ^ (amount + crafted) - 2 ^ (crafted))',
                    'slime_core': '1.5 ^ (amount + crafted) - 1.5 ^ (crafted)',
                },
                produces: {
                    'slime_crystal': 'amount',
                },
                duration: '10 + (amount * 2 + crafted) / 10 seconds',
            },
            static: true,
            category: ['slime',],
        },
        slime_page: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['slime_goo', D.sumGeometricSeries(count, 25, 2, total)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 5, 1.75, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['slime_page', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).div(5).add(20);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'slime_goo': '25 * (2 ^ (amount + crafted) - 2 ^ (crafted))',
                    'slime_core_shard': '5 * (1.75 ^ (amount + crafted) - 1.75 ^ (crafted))',
                },
                produces: {
                    'slime_page': 'amount',
                },
                duration: '20 + (amount * 2 + crafted) / 5 seconds',
            },
            static: true,
            category: ['slime',],
        },
        slime_pocket: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['slime_goo', D.sumGeometricSeries(count, 20, 2, total)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 5, 1.75, total)],
                    ['slime_core', D.sumGeometricSeries(count, 1, 1.5, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['slime_pocket', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).div(3).add(30);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'slime_goo': '20 * (2 ^ (amount + crafted) - 2 ^ (crafted))',
                    'slime_core_shard': '5 * (1.75 ^ (amount + crafted) - 1.75 ^ (crafted))',
                    'slime_core': '1.5 ^ (amount + crafted) - 1.5 ^ (crafted)',
                },
                produces: {
                    'slime_pocket': 'amount',
                },
                duration: '30 + (amount * 2 + crafted) / 3 seconds',
            },
            static: true,
            category: ['slime',],
        },
        slime_dice: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['slime_core_shard', D.sumGeometricSeries(count, 12, 1.75, total)],
                    ['slime_core', D.sumGeometricSeries(count, 6, 1.5, total)],
                    ['dense_slime_core', D.sumGeometricSeries(count, 1, 1.25, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['slime_dice', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).times(10).add(60);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'slime_core_shard': '12 * (1.75 ^ (amount + crafted) - 1.75 ^ (crafted))',
                    'slime_core': '6 * (1.5 ^ (amount + crafted) - 1.5 ^ (crafted))',
                    'dense_slime_core': '1.25 ^ (amount + crafted) - 1.25 ^ (crafted)',
                },
                produces: {
                    'slime_dice': 'amount',
                },
                duration: '60 + (amount * 2 + crafted) * 10 seconds',
            },
            static: true,
            category: ['slime',],
        },
    },
    crafting: {
        max() { return D.dTen; },
        crafted() {
            return Object.values(tmp.c.recipes)
                .filter(rec => rec.static ?? false)
                .map(rec => player.c.recipes[rec.id].crafted)
                .reduce((sum, crafted) => D.add(sum, crafted), D.dZero);
        },
        speed() {
            let speed = D.dOne;

            if (hasAchievement('ach', 35)) speed = speed.times(achievementEffect('ach', 35));

            return speed;
        },
    },
    clickables: {
        11: {
            title: 'Materials',
            display() { return player.c.hide_cat.includes('materials') ? 'Hidden' : 'Visible'; },
            onClick() {
                if (player.c.hide_cat.includes('materials')) {
                    const i = player.c.hide_cat.indexOf('materials');
                    player.c.hide_cat.splice(i, 1);
                } else {
                    player.c.hide_cat.push('materials');
                }
            },
            canClick: true,
            style() {
                return {
                    'background-color': player.c.hide_cat.includes('materials') ? '#CC5555' : tmp.c.color,
                    'width': '100px',
                    'height': '100px',
                    'min-height': 'unset',
                };
            },
        },
        12: {
            title: 'Slime',
            display() { return player.c.hide_cat.includes('slime') ? 'Hidden' : 'Visible'; },
            onClick() {
                if (player.c.hide_cat.includes('slime')) {
                    const i = player.c.hide_cat.indexOf('slime');
                    player.c.hide_cat.splice(i, 1);
                } else {
                    player.c.hide_cat.push('slime');
                }
            },
            canClick: true,
            style() {
                return {
                    'background-color': player.c.hide_cat.includes('slime') ? '#CC5555' : tmp.xp.monsters.slime.color,
                    'width': '100px',
                    'height': '100px',
                    'min-height': 'unset',
                };
            },
        },
    },
    automate() {
        Object.entries(player.c.recipes).forEach(([id, craft]) => {
            if (D.gt(craft.making, 0) && D.lte(craft.time_left, 0)) {
                const trecipe = tmp.c.recipes[id];
                gain_items(trecipe.produces);
                craft.making = D.dZero;
                craft.time_left = D.dZero;
            }
        });
    },
    update(diff) {
        Object.values(player.c.recipes).forEach(craft => {
            if (D.gt(craft.making, 0) && D.gt(craft.time_left, 0)) {
                craft.time_left = D.minus(craft.time_left, diff);
            }
        });
    },
    shouldNotify() {
        return Object.values(tmp.c.recipes)
            .some(rec => !rec.category.includes('materials') && crafting_can(rec.id))
            || canBuyBuyable('c', 11);
    },
    doReset(layer) {
        if (tmp[layer].row <= this.row) return;

        /**
         * @type {(keyof Player['c'])[]}
         */
        const keep = ['shown'];

        layerDataReset(this.layer, keep);
    },
});
