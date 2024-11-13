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
            trades: Object.fromEntries(Object.keys(layers.s.items).map(item => {
                const obj = {};
                if ('cost' in layers.s.items[item]) obj.bought = D.dZero;
                if ('value' in layers.s.items[item]) obj.sold = D.dZero;
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
                    if (inChallenge('b', 12) || inChallenge('b', 22)) return [
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
            canAfford() { return D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost); },
            pay() {
                if (!D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost)) return;
                spend_coins(tmp[this.layer].upgrades[this.id].cost);
            },
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
            canAfford() { return D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost); },
            pay() {
                if (!D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost)) return;
                spend_coins(tmp[this.layer].upgrades[this.id].cost);
            },
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
            canAfford() { return D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost); },
            pay() {
                if (!D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost)) return;
                spend_coins(tmp[this.layer].upgrades[this.id].cost);
            },
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
            canAfford() { return D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost); },
            pay() {
                if (!D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost)) return;
                spend_coins(tmp[this.layer].upgrades[this.id].cost);
            },
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
            canAfford() { return D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost); },
            pay() {
                if (!D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost)) return;
                spend_coins(tmp[this.layer].upgrades[this.id].cost);
            },
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
            canAfford() { return D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost); },
            pay() {
                if (!D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost)) return;
                spend_coins(tmp[this.layer].upgrades[this.id].cost);
            },
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
            canAfford() { return D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost); },
            pay() {
                if (!D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost)) return;
                spend_coins(tmp[this.layer].upgrades[this.id].cost);
            },
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
            canAfford() { return D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost); },
            pay() {
                if (!D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost)) return;
                spend_coins(tmp[this.layer].upgrades[this.id].cost);
            },
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
            canAfford() { return D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost) && hasChallenge('b', 12); },
            pay() {
                if (!D.gte(tmp.s.coins.total, tmp[this.layer].upgrades[this.id].cost)) return;
                spend_coins(tmp[this.layer].upgrades[this.id].cost);
            },
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
    items: {
        ...Object.fromEntries(
            Object.keys(item_list)
                .filter(/**@param{items}item*/item => typeof item_list[item].value == 'object')
                .map(/**@param{items}item*/item => {
                    /** @type {Layers['s']['items'][items]} */
                    const entry = {
                        id: item,
                    };

                    if (item_list[item].value.cost) {
                        entry.cost = function () {
                            let base = D(tmp.items[this.id].value.cost);

                            const loss = D.add(player.s.trades[this.id]?.bought, 10).log10();

                            let cost = D.times(base, loss);

                            cost = cost.times(tmp.s.modifiers.trade.buy_mult);

                            return cost;
                        }
                    }
                    if (item_list[item].value.value) {
                        entry.value = function () {
                            let base = D(tmp.items[this.id].value.value);

                            const loss = D.add(player.s.trades[this.id]?.sold, 10).log10();

                            let value = D.div(base, loss);

                            value = value.times(tmp.s.modifiers.trade.buy_mult);

                            return value;
                        }
                    }

                    return [item, entry];
                }),
        )
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

        if (D.mod(player.s.buy_amount, 1).neq(0)) {
            player.s.buy_amount = D.round(player.s.buy_amount);
        }
        if (D.mod(player.s.sell_amount, 1).neq(0)) {
            player.s.sell_amount = D.round(player.s.sell_amount);
        }
    },
    doReset(layer) {
        if (tmp[layer].row < this.row) return;
        if (tmp[layer].row == this.row) {
            // Reset trades
            player.s.trades = layers.s.startData().trades;
            player.s.resetTime = 0;
            if (hasChallenge('b', 22)) player.s.resetTime = 300;
            return;
        }

        /** @type {(keyof Player['s'])[]} */
        const keep = ['upgrades'];

        layerDataReset(this.layer, keep);
    },
});
