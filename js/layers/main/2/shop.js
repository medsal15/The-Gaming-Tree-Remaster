'use strict';

addLayer('s', {
    row: 2,
    position: 1,
    // Allows for resets
    type: 'static',
    baseAmount: D.dZero,
    requires: D.dOne,
    resource: 'coins',
    name: 'shop',
    symbol: 'S',
    color: '#FFDD00',
    tooltip() { return `${formatWhole(tmp.s.coins.total)} money`; },
    startData() {
        return {
            unlocked: true,
            points: D.dZero,
            buy: D.dOne,
            buy_amount: D.dOne,
            sell: D.dOne,
            sell_amount: D.dOne,
            spent: D.dZero,
            trades: Object.fromEntries(Object.keys(layers.s.trades).map(item => {
                const obj = {};
                if ('cost' in layers.s.trades[item]) obj.bought = D.dZero;
                if ('value' in layers.s.trades[item]) obj.sold = D.dZero;
                return [item, obj];
            })),
        };
    },
    layerShown() { return inChallenge('b', 12) || hasChallenge('b', 12); },
    hotkeys: [
        {
            key: 'S',
            description: 'Shift + S: Display shop layer',
            onPress() { if (tmp.s.layerShown) showTab('s'); },
            unlocked() { return tmp.s.layerShown; },
        },
    ],
    tabFormat: {
        'Shop': {
            content: [
                ['display-text', () => {
                    let list = tmp.s.coins.list
                        .filter(([item]) => D.gt(player.items[item].amount, 0))
                        .map(([item]) => item)
                        .reverse();

                    if (!list.length) list.push('coin_copper');

                    list = list.map((item) => `${resourceColor(tmp.items[item].color, formatWhole(player.items[item].amount), 'font-size:1.5em;')} ${tmp.items[item].name}`);

                    return `You have ${listFormat.format(list)}`;
                }],
                ['column', () => {
                    if (inChallenge('b', 12)) return [
                        'blank',
                        ['layer-proxy', ['b', [['bar', 'progress']]]],
                    ];
                }],
                'blank',
                'upgrades',
            ],
            shouldNotify() { return canAffordLayerUpgrade('s'); },
        },
        'Trading': {
            content: () => {
                let list = tmp.s.coins.list
                    .filter(([item]) => D.gt(player.items[item].amount, 0))
                    .map(([item]) => item)
                    .reverse();

                if (!list.length) list.push('coin_copper');

                list = list.map((item) => `${resourceColor(tmp.items[item].color, formatWhole(player.items[item].amount), 'font-size:1.5em;')} ${tmp.items[item].name}`);

                /** @type {TabFormatEntries<'s'>[]} */
                const content = [
                    ['display-text', `You have ${listFormat.format(list)}`],
                    'blank',
                    ['row', [
                        ['display-text', 'Selling'],
                        'blank',
                        ['text-input', 'sell_amount'],
                        'blank',
                        ['display-text', 'items'],
                    ]],
                ];

                if (D.neq_tolerance(tmp.s.modifiers.trade.sell_mult, 1, 1e-3)) content.push(['display-text', `Value multiplier: ${format(tmp.s.modifiers.trade.sell_mult)}`]);
                content.push(
                    ...shop_display_sell(),
                    'blank',
                    ['row', [
                        ['display-text', 'Buying'],
                        'blank',
                        ['text-input', 'buy_amount'],
                        'blank',
                        ['display-text', 'items'],
                    ]],
                );

                if (D.neq_tolerance(tmp.s.modifiers.trade.buy_mult, 1, 1e-3)) content.push(['display-text', `Cost multiplier: ${format(tmp.s.modifiers.trade.buy_mult)}`]);
                content.push(
                    ...shop_display_buy(),
                );

                return content;
            },
        },
    },
    upgrades: {
        11: {
            title: 'Side Hustle',
            description: 'Gain 25% more coins',
            effect() { return D(1.25); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(25),
            costDisplay() {
                const list = value_coin(tmp[this.layer].upgrades[this.id].cost),
                    cost = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));
                return `Cost: ${cost}`;
            },
            pay() { spend_coins(tmp[this.layer].upgrades[this.id].cost); },
            currencyLocation() { return tmp.s.coins; },
            currencyInternalName: 'total',
        },
        12: {
            title: 'Bigger Bank Box',
            description: 'XP cap is increased by 50%',
            effect() { return D(1.5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(50),
            costDisplay() {
                const list = value_coin(tmp[this.layer].upgrades[this.id].cost),
                    cost = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));
                return `Cost: ${cost}`;
            },
            pay() { spend_coins(tmp[this.layer].upgrades[this.id].cost); },
            currencyLocation() { return tmp.s.coins; },
            currencyInternalName: 'total',
        },
        13: {
            title: 'Improved Crafting Plans',
            description: 'Equipment costs are 10% cheaper',
            effect() { return D(.9); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(75),
            costDisplay() {
                const list = value_coin(tmp[this.layer].upgrades[this.id].cost),
                    cost = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));
                return `Cost: ${cost}`;
            },
            pay() { spend_coins(tmp[this.layer].upgrades[this.id].cost); },
            currencyLocation() { return tmp.s.coins; },
            currencyInternalName: 'total',
        },
        21: {
            title: 'Return On Investment',
            description() {
                let text = '<u>Coins</u> boost coin gain';

                if (shiftDown) text += '<br>Formula: log10(sum(coins) + 10)';

                return text;
            },
            effect() {
                return layers.s.coins.list
                    .map(([coin]) => player.items[coin].amount)
                    .reduce((sum, amount) => D.add(sum, amount), D.dZero)
                    .add(10)
                    .log10();
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(100),
            costDisplay() {
                const list = value_coin(tmp[this.layer].upgrades[this.id].cost),
                    cost = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));
                return `Cost: ${cost}`;
            },
            pay() { spend_coins(tmp[this.layer].upgrades[this.id].cost); },
            currencyLocation() { return tmp.s.coins; },
            currencyInternalName: 'total',
        },
        22: {
            title: 'Larger Mineshaft',
            description: 'Mine 2 ores at once<br>Unlock the mining compactor',
            effect() { return D.dOne; },
            effectDisplay() { return `+${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            cost: D(200),
            costDisplay() {
                const list = value_coin(tmp[this.layer].upgrades[this.id].cost),
                    cost = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));
                return `Cost: ${cost}`;
            },
            pay() { spend_coins(tmp[this.layer].upgrades[this.id].cost); },
            currencyLocation() { return tmp.s.coins; },
            currencyInternalName: 'total',
        },
        23: {
            title: 'Simple Skill Guide',
            description: '2nd row skills lose their side branch',
            cost: D(500),
            costDisplay() {
                const list = value_coin(tmp[this.layer].upgrades[this.id].cost),
                    cost = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));
                return `Cost: ${cost}`;
            },
            pay() { spend_coins(tmp[this.layer].upgrades[this.id].cost); },
            currencyLocation() { return tmp.s.coins; },
            currencyInternalName: 'total',
        },
        31: {
            title: 'Interests Rising',
            description() {
                let text = 'Time since shop reset boosts coin gain';

                if (shiftDown) text += '<br>Formula: log100(time + 100)';

                return text;
            },
            effect() { return D.add(player.s.resetTime, 100).log(100); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(1_500),
            costDisplay() {
                const list = value_coin(tmp[this.layer].upgrades[this.id].cost),
                    cost = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));
                return `Cost: ${cost}`;
            },
            pay() { spend_coins(tmp[this.layer].upgrades[this.id].cost); },
            currencyLocation() { return tmp.s.coins; },
            currencyInternalName: 'total',
        },
        32: {
            title: 'Haggling',
            description: 'Items are 10% cheaper and more valuable',
            effect() {
                return {
                    cost: D(.9),
                    value: D(1.1),
                };
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id).cost)}, *${format(upgradeEffect(this.layer, this.id).value)}`; },
            cost: D(3_300),
            costDisplay() {
                const list = value_coin(tmp[this.layer].upgrades[this.id].cost),
                    cost = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));
                return `Cost: ${cost}`;
            },
            pay() { spend_coins(tmp[this.layer].upgrades[this.id].cost); },
            currencyLocation() { return tmp.s.coins; },
            currencyInternalName: 'total',
        },
        33: {
            title() {
                if (!hasChallenge('b', 12) && !hasUpgrade(this.layer, this.id)) return 'Strange Map';
                return 'Golem Map';
            },
            description() {
                if (!hasChallenge('b', 12) && !hasUpgrade(this.layer, this.id)) {
                    return `Captain Goodtooth isn't letting you take a good look.<br>\
                        You can make out a strange humanoid figure...`;
                }
                let text = 'Unlock a new enemy to fight.';
                if (hasUpgrade(this.layer, this.id)) text += `<br>This isn't even worth the paper it's printed on!`;
                return text;
            },
            cost: D(10_000),
            costDisplay() {
                if (!hasChallenge('b', 12)) return 'Not for sale';
                const list = value_coin(tmp[this.layer].upgrades[this.id].cost),
                    cost = listFormat.format(list.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`));
                return `Cost: ${cost}`;
            },
            pay() { spend_coins(tmp[this.layer].upgrades[this.id].cost); },
            currencyLocation() { return tmp.s.coins; },
            currencyInternalName: 'total',
            canAfford() { return hasChallenge('b', 12) && D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost); },
        },
    },
    modifiers: {
        coin: {
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('s', 11)) mult = mult.times(upgradeEffect('s', 11));
                if (hasUpgrade('s', 21)) mult = mult.times(upgradeEffect('s', 21));
                if (hasUpgrade('s', 31)) mult = mult.times(upgradeEffect('s', 31));

                mult = mult.times(item_effect('doubloon').coin_mult);
                mult = mult.times(item_effect('electrum_coin_mold').coin_mult);

                if (inChallenge('b', 12)) mult = mult.times(tmp.c.chance_multiplier);

                return mult;
            },
        },
        trade: {
            buy_mult() {
                let mult = D.dOne;

                if (hasUpgrade('s', 32)) mult = mult.times(upgradeEffect('s', 32).cost);

                return mult;
            },
            sell_mult() {
                let mult = D.dOne;
                if (hasUpgrade('s', 32)) mult = mult.times(upgradeEffect('s', 32).value);

                return mult;
            }
        },
    },
    coins: {
        total() { return tmp.s.coins.list.reduceRight((sum, [item, mult = 1]) => D.times(sum, mult).add(player.items[item].amount), D.dZero); },
        spent() {
            return player.s.upgrades.map(id => tmp.s.upgrades[id].cost)
                .reduce((sum, cost) => D.add(sum, cost), player.s.spent);
        },
        list: [
            ['coin_copper', 100],
            ['coin_bronze', 100],
            ['coin_silver', 100],
            ['coin_gold', 100],
            ['coin_platinum'],
        ],
    },
    trades: {
        // Enemy drops
        slime_goo: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12); },
            cost() {
                let base = D(5);

                const loss = D.add(player.s.trades[this.id].bought, 10).log10();

                return D.times(base, loss);
            },
        },
        slime_core_shard: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12); },
            cost() {
                let base = D(15);

                const loss = D.add(player.s.trades[this.id].bought, 10).log10();

                return D.times(base, loss);
            },
        },
        slime_core: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12); },
            cost() {
                let base = D(50);

                const loss = D.add(player.s.trades[this.id].bought, 10).log10();

                return D.times(base, loss);
            },
        },
        bone: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12); },
            cost() {
                let base = D(7);

                const loss = D.add(player.s.trades[this.id].bought, 10).log10();

                return D.times(base, loss);
            },
        },
        rib: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12); },
            cost() {
                let base = D(20);

                const loss = D.add(player.s.trades[this.id].bought, 10).log10();

                return D.times(base, loss);
            },
        },
        skull: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12); },
            cost() {
                let base = D(60);

                const loss = D.add(player.s.trades[this.id].bought, 10).log10();

                return D.times(base, loss);
            },
        },
        // Crafted items
        dense_slime_core: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            cost() {
                let base = D(100);

                const loss = D.add(player.s.trades[this.id].bought, 10).log10();

                return D.times(base, loss);
            },
        },
        slimy_skull: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            cost() {
                let base = D(150);

                const loss = D.add(player.s.trades[this.id].bought, 10).log10();

                return D.times(base, loss);
            },
        },
        slime_crystal: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(100);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        slime_knife: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(200);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        slime_injector: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(300);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        slime_die: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(800);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        bone_pick: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(150);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        crystal_skull: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(300);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        bone_slate: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(300);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        magic_slime_ball: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(500);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        stone_mace: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(300);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        copper_pick: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(150);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        tin_cache: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(150);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        bronze_cart: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(200);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        doubloon: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(5_000);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        densium_slime: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(1_000);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        densium_rock: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(750);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        magic_densium_ball: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            value() {
                let base = D(888);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        //todo extended ores equipment
        // Mined ores
        copper_ore: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12); },
            value() {
                let base = D(1);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        tin_ore: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12); },
            value() {
                let base = D(9);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        bronze_blend: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12); },
            value() {
                let base = D(20);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        gold_nugget: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12); },
            value() {
                let base = D(1_000);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
        //todo extended mining equipement
        densium: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.s.trades).find(([, t]) => t == this)[0]; },
            unlocked() { return inChallenge('b', 12) && tmp.m.compactor.unlocked; },
            value() {
                let base = D(500);

                const loss = D.add(player.s.trades[this.id].sold, 10).log10();

                return D.div(base, loss);
            },
        },
    },
    branches: ['c'],
    automate() {
        // Convert coins
        tmp.s.coins.list.forEach(([item, cap], i) => {
            const pitem = player.items[item];
            if (typeof cap == 'undefined' || D.lt(pitem.amount, cap) || i >= tmp.s.coins.list.length) return;

            const carry = D.div(pitem.amount, cap).floor(),
                next = tmp.s.coins.list[i + 1][0];
            pitem.amount = D.mod(pitem.amount, cap);
            gain_items(next, carry);
        });
    },
    doReset(layer) {
        if (tmp[layer].row < this.row) return;
        if (tmp[layer].row == this.row) {
            // Reset trades
            player.s.trades = layers.s.startData().trades;
            player.s.resetTime = 0;
            return;
        }

        /** @type {(keyof Player['s'])[]} */
        const keep = ['upgrades'];

        layerDataReset(this.layer, keep);
    },
});
