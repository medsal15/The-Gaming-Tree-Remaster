'use strict';

addLayer('c', {
    row: 1,
    position: 1,
    type: 'none',
    name: 'crafting',
    color: '#CC8811',
    symbol: 'C',
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
                time: D.dZero,
                crafted: D.dZero,
            }])),
            hide_cat: [],
            lore: '',
        };
    },
    layerShown() { return hasUpgrade('xp', 33) || player.c.shown; },
    branches: ['xp', 'm'],
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
        11: {
            title() { return `Looting ${formatWhole(getBuyableAmount(this.layer, this.id))}`; },
            display() {
                let chance = '', cost = '';
                if (shiftDown) {
                    chance = '[(level - 1) / 5 + 1]';
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
                return D.minus(x, 1).div(5).add(1);
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
        mult = mult.times(item_effect('jaw_grabber'));
        mult = mult.times(item_effect('bronze_cart').drop);

        if (hasUpgrade('l', 32)) mult = mult.times(upgradeEffect('l', 32));

        return mult;
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

                let mult = D.dTwo;

                if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).craft);

                return [['slime_core', D.times(count, mult)]];
            },
            formulas: {
                consumes: {
                    'slime_goo': '10 * amount',
                    'slime_core_shard': '3 * amount',
                },
                produces: {
                    'slime_core'() {
                        let mult = D.dTwo;

                        if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).craft);

                        return `amount * ${formatWhole(mult)}`;
                    },
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

                let mult = D.dOne;

                if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).craft);

                return [['dense_slime_core', D.times(count, mult)]];
            },
            formulas: {
                consumes: {
                    'slime_goo': '15 * amount',
                    'slime_core_shard': '5 * amount',
                    'slime_core': '2 * amount',
                },
                produces: {
                    'dense_slime_core'() {
                        let mult = D.dOne,
                            text = 'amount';

                        if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).craft);

                        if (mult.gt(1)) text += ` * ${formatWhole(mult)}`;

                        return text;
                    },
                },
            },
            category: ['materials', 'slime',],
        },
        skull: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['bone', D.times(5, count)],
                    ['rib', D.times(2, count)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                let mult = D.dOne;

                if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).craft);

                return [['skull', D.times(count, mult)]];
            },
            formulas: {
                consumes: {
                    'slime_goo': '5 * amount',
                    'slime_core_shard': '2 * amount',
                },
                produces: {
                    'slime_core'() {
                        let mult = D.dOne,
                            text = 'amount';

                        if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).craft);

                        if (mult.gt(1)) text += ` * ${formatWhole(mult)}`;

                        return text;
                    },
                },
            },
            category: ['materials', 'skeleton',],
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        glowing_skull: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['dense_slime_core', count],
                    ['skull', count],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                let mult = D.dOne;

                if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).craft);

                return [['glowing_skull', D.times(count, mult)]];
            },
            formulas: {
                consumes: {
                    'skull': 'amount',
                    'dense_slime_core': 'amount',
                },
                produces: {
                    'glowing_skull'() {
                        let mult = D.dOne,
                            text = 'amount';

                        if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).craft);

                        if (mult.gt(1)) text += ` * ${formatWhole(mult)}`;

                        return text;
                    },
                },
            },
            category: ['materials', 'skeleton', 'slime',],
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        bronze_blend: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [
                    ['copper_ore', D.times(count, 9)],
                    ['tin_ore', D.times(count, 3)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                let mult = D.dOne;

                if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).craft);

                return [['bronze_blend', D.times(count, mult)]];
            },
            duration() {
                let time = D.dOne;

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'copper_ore': 'amount * 9',
                    'tin_ore': 'amount * 3',
                },
                produces: {
                    'bronze_blend'() {
                        let mult = D.dOne,
                            text = 'amount';

                        if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).craft);

                        if (mult.gt(1)) text += ` * ${formatWhole(mult)}`;

                        return text;
                    },
                },
                duration: '1 second',
            },
            category: ['materials', 'mining',],
            unlocked() { return tmp.m.layerShown; },
        },
        // Slime
        slime_crystal: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['slime_goo', D.sumGeometricSeries(count, 15, 1.75, total)],
                    ['slime_core', D.sumGeometricSeries(count, 1, 1.25, total)],
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
                    'slime_goo': '15 * (1.75 ^ (amount + crafted) - 1.75 ^ crafted)',
                    'slime_core': '1.25 ^ (amount + crafted) - 1.25 ^ crafted',
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
                    ['slime_goo', D.sumGeometricSeries(count, 25, 1.75, total)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 5, 1.5, total)],
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
                    'slime_goo': '25 * (1.75 ^ (amount + crafted) - 1.75 ^ crafted)',
                    'slime_core_shard': '5 * (1.5 ^ (amount + crafted) - 1.5 ^ crafted)',
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
                    ['slime_goo', D.sumGeometricSeries(count, 20, 1.75, total)],
                    ['slime_core_shard', D.sumGeometricSeries(count, 5, 1.5, total)],
                    ['slime_core', D.sumGeometricSeries(count, 1, 1.25, total)],
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
                    'slime_goo': '20 * (1.75 ^ (amount + crafted) - 1.75 ^ crafted)',
                    'slime_core_shard': '5 * (1.5 ^ (amount + crafted) - 1.5 ^ crafted)',
                    'slime_core': '1.25 ^ (amount + crafted) - 1.25 ^ crafted',
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
                    ['slime_core_shard', D.sumGeometricSeries(count, 12, 1.5, total)],
                    ['slime_core', D.sumGeometricSeries(count, 6, 1.25, total)],
                    ['dense_slime_core', D.sumGeometricSeries(count, 1, 1.125, total)],
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
                    'slime_core_shard': '12 * (1.5 ^ (amount + crafted) - 1.5 ^ crafted)',
                    'slime_core': '6 * (1.25 ^ (amount + crafted) - 1.25 ^ crafted)',
                    'dense_slime_core': '1.125 ^ (amount + crafted) - 1.125 ^ crafted',
                },
                produces: {
                    'slime_dice': 'amount',
                },
                duration: '60 + (amount * 2 + crafted) * 10 seconds',
            },
            static: true,
            category: ['slime',],
        },
        // Skeleton
        bone_shiv: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['slime_core_shard', D.sumGeometricSeries(count, 5, 1.5, total)],
                    ['bone', D.sumGeometricSeries(count, 5, 1.75, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['bone_shiv', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).div(5).add(10);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'slime_core_shard': '5 * (1.5 ^ (amount + crafted) - 1.5 ^ crafted)',
                    'bone': '5 * (1.75 ^ (amount + crafted) - 1.75 ^ crafted)',
                },
                produces: {
                    'bone_shiv': 'amount',
                },
                duration: '10 + (amount * 2 + crafted) / 5 seconds',
            },
            static: true,
            category: ['slime', 'skeleton',],
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        bone_pick: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['bone', D.sumGeometricSeries(count, 10, 1.75, total)],
                    ['rib', D.sumGeometricSeries(count, 5, 1.5, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['bone_pick', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).div(2.5).add(20);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'bone': '10 * (1.75 ^ (amount + crafted) - 1.75 ^ crafted)',
                    'rib': '5 * (1.5 ^ (amount + crafted) - 1.5 ^ crafted)',
                },
                produces: {
                    'bone_pick': 'amount',
                },
                duration: '20 + (amount * 2 + crafted) / 2.5 seconds',
            },
            static: true,
            category: ['skeleton',],
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        jaw_grabber: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['bone', D.sumGeometricSeries(count, 5, 1.75, total)],
                    ['rib', D.sumGeometricSeries(count, 3, 1.5, total)],
                    ['skull', D.sumGeometricSeries(count, 1, 1.25, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['jaw_grabber', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).div(1.5).add(40);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'bone': '5 * (1.75 ^ (amount + crafted) - 1.75 ^ crafted)',
                    'rib': '3 * (1.5 ^ (amount + crafted) - 1.5 ^ crafted)',
                    'skull': '1.25 ^ (amount + crafted) - 1.25 ^ crafted',
                },
                produces: {
                    'jaw_grabber': 'amount',
                },
                duration: '40 + (amount * 2 + crafted) / 1.5 seconds',
            },
            static: true,
            category: ['skeleton',],
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        crystal_skull: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['slime_crystal', D.sumGeometricSeries(count, 1, 1.1, total)],
                    ['glowing_skull', D.sumGeometricSeries(count, 1, 1.125, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['crystal_skull', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).times(15).add(50);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'glowing_skull': '1.125 ^ (amount + crafted) - 1.125 ^ crafted',
                    'slime_crystal': '1.1 ^ (amount + crafted) - 1.1 ^ crafted',
                },
                produces: {
                    'crystal_skull': 'amount',
                },
                duration: '50 + (amount * 2 + crafted) * 15 seconds',
            },
            static: true,
            category: ['skeleton', 'slime',],
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        // Mining
        rock_club: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['bone', D.sumGeometricSeries(count, 3, 1.75, total)],
                    ['rock', D.sumGeometricSeries(count, 10, 1.75, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['rock_club', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).div(2.5).add(10);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'bone': '3 * (1.75 ^ (amount + crafted) - 1.75 ^ crafted)',
                    'rock': '10 * (1.75 ^ (amount + crafted) - 1.75 ^ crafted)',
                },
                produces: {
                    'rock_club': 'amount',
                },
                duration: '10 + (amount * 2 + crafted) / 2.5 seconds',
            },
            static: true,
            category: ['mining', 'skeleton',],
            unlocked() { return tmp.m.layerShown; },
        },
        copper_pick: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['bone', D.sumGeometricSeries(count, 5, 1.75, total)],
                    ['copper_ore', D.sumGeometricSeries(count, 10, 1.5, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['copper_pick', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).div(1.25).add(30);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'bone': '10 * (1.75 ^ (amount + crafted) - 1.75 ^ crafted)',
                    'rib': '5 * (1.5 ^ (amount + crafted) - 1.5 ^ crafted)',
                },
                produces: {
                    'bone_pick': 'amount',
                },
                duration: '30 + (amount * 2 + crafted) / 2.5 seconds',
            },
            static: true,
            category: ['skeleton', 'mining',],
            unlocked() { return tmp.m.layerShown; },
        },
        tin_belt: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['slime_goo', D.sumGeometricSeries(count, 15, 1.75, total)],
                    ['rib', D.sumGeometricSeries(count, 1, 1.5, total)],
                    ['tin_ore', D.sumGeometricSeries(count, 1, 1.25, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['tin_belt', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).times(1.25).add(50);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'slime_goo': '15 * (1.75 ^ (amount + crafted) - 1.75 ^ crafted)',
                    'rib': '1.5 ^ (amount + crafted) - 1.5 ^ crafted',
                    'tin_ore': '1.25 ^ (amount + crafted) - 1.25 ^ crafted',
                },
                produces: {
                    'tin_belt': 'amount',
                },
                duration: '50 + (amount * 2 + crafted) * 1.25 seconds',
            },
            static: true,
            category: ['skeleton', 'mining', 'slime',],
            unlocked() { return tmp.m.layerShown; },
        },
        bronze_cart: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.c.recipes).find(([, r]) => r == this)[0]; },
            consumes(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                return [
                    ['bronze_blend', D.sumGeometricSeries(count, 2, 1.125, total)],
                    ['skull', D.sumGeometricSeries(count, 1, 1.125, total)],
                ];
            },
            produces(amount) {
                const count = crafting_default_amount(this.id, amount);

                return [['bronze_cart', count]];
            },
            duration(amount, all_time) {
                const count = crafting_default_amount(this.id, amount),
                    total = crafting_default_all_time(this.id, all_time);

                let time = D.times(count, 2).add(total).times(20).add(60);

                time = time.div(tmp.c.crafting.speed);

                return time;
            },
            formulas: {
                consumes: {
                    'bronze_blend': '2 * (1.125 ^ (amount + crafted) - 1.125 ^ crafted)',
                    'skull': '1.125 ^ (amount + crafted) - 1.125 ^ crafted',
                },
                produces: {
                    'bronze_cart': 'amount',
                },
                duration: '60 + (amount * 2 + crafted) * 20 seconds',
            },
            static: true,
            category: ['skeleton', 'mining',],
            unlocked() { return tmp.m.layerShown; },
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

            if (hasUpgrade('m', 34)) mult = mult.add(upgradeEffect('m', 34).speed);

            speed = speed.times(item_effect('tin_belt').speed);

            return speed;
        },
    },
    clickables: {
        11: {
            title: 'Uncraftable',
            display() { return player.c.hide_cat.includes('craftable') ? 'Hidden' : 'Visible'; },
            onClick() {
                if (player.c.hide_cat.includes('craftable')) {
                    const i = player.c.hide_cat.indexOf('craftable');
                    player.c.hide_cat.splice(i, 1);
                } else {
                    player.c.hide_cat.push('craftable');
                }
            },
            canClick: true,
            style() {
                return {
                    'background-color': player.c.hide_cat.includes('craftable') ? '#CC5555' : '#55CC55',
                    'width': '120px',
                    'height': '100px',
                    'min-height': 'unset',
                };
            },
        },
        12: {
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
        13: {
            title: 'Mining',
            display() { return player.c.hide_cat.includes('mining') ? 'Hidden' : 'Visible'; },
            onClick() {
                if (player.c.hide_cat.includes('mining')) {
                    const i = player.c.hide_cat.indexOf('mining');
                    player.c.hide_cat.splice(i, 1);
                } else {
                    player.c.hide_cat.push('mining');
                }
            },
            canClick: true,
            style() {
                return {
                    'background-color': player.c.hide_cat.includes('mining') ? '#CC5555' : tmp.m.color,
                    'width': '100px',
                    'height': '100px',
                    'min-height': 'unset',
                };
            },
            unlocked() { return tmp.m.layerShown; },
        },
        14: {
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
        15: {
            title: 'Skeleton',
            display() { return player.c.hide_cat.includes('skeleton') ? 'Hidden' : 'Visible'; },
            onClick() {
                if (player.c.hide_cat.includes('skeleton')) {
                    const i = player.c.hide_cat.indexOf('skeleton');
                    player.c.hide_cat.splice(i, 1);
                } else {
                    player.c.hide_cat.push('skeleton');
                }
            },
            canClick: true,
            style() {
                return {
                    'background-color': player.c.hide_cat.includes('skeleton') ? '#CC5555' : tmp.xp.monsters.skeleton.color,
                    'width': '100px',
                    'height': '100px',
                    'min-height': 'unset',
                };
            },
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
    },
    automate() {
        Object.entries(player.c.recipes).forEach(([id, craft]) => {
            const trecipe = tmp.c.recipes[id];
            if (D.gt(craft.making, 0) && D.gte(craft.time, trecipe.duration)) {
                gain_items(trecipe.produces);
                craft.making = D.dZero;
                craft.time = D.dZero;
            }
        });
    },
    update(diff) {
        Object.entries(player.c.recipes).forEach(([id, craft]) => {
            const trecipe = tmp.c.recipes[id];
            if (D.gt(craft.making, 0) && D.lt(craft.time, trecipe.duration)) {
                craft.time = D.add(craft.time, diff);
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
