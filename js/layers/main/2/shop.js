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
            buy_time: D.dZero,
            sell: D.dOne,
            sell_time: D.dZero,
            spent: D.dZero,
        };
    },
    layerShown() { return inChallenge('b', 12) || hasChallenge('b', 12); },
    hotkeys: [
        {
            key: 'S',
            description: 'Shift + S: Display shop layer',
            onPress() { if (player.b.shown) showTab('b'); },
            unlocked() { return player.b.shown; },
        },
    ],
    tabFormat: {
        'Shop': {
            content: [
                ['display-text', () => {
                    let list = tmp.s.coins.list
                        .filter(([item]) => D.gt(player.items[item].amount, 0))
                        .map(([item]) => item);

                    if (!list.length) list.push('coin_copper');

                    list = list.map(([item]) => `${resourceColor(tmp.items[item].color, formatWhole(player.items[item].amount), 'font-size:1.5em;')} ${tmp.items[item].name}`);

                    return `You have ${listFormat.format(list)}`;
                }],
                ['column', () => {
                    if (inChallenge('b', 12)) return [
                        'blank',
                        //todo check if this works
                        ['layer-proxy', ['b', [['bars', 'progress']]]],
                    ];
                }],
                'blank',
                'upgrades',
            ],
            shouldNotify() { return canAffordLayerUpgrade('s'); },
        },
        'Trading': {
            content: [
                ['display-text', () => {
                    let list = tmp.s.coins.list
                        .filter(([item]) => D.gt(player.items[item].amount, 0))
                        .map(([item]) => item);

                    if (!list.length) list.push('coin_copper');

                    list = list.map(([item]) => `${resourceColor(tmp.items[item].color, formatWhole(player.items[item].amount), 'font-size:1.5em;')} ${tmp.items[item].name}`);

                    return `You have ${listFormat.format(list)}`;
                }],
                'blank',
                //todo item sell
                'blank',
                //todo item purchase
            ],
        },
    },
    upgrades: {
        //todo
    },
    modifiers: {
        coin: {
            mult() {
                let mult = D.dOne;

                mult = mult.times(item_effect('doubloon').coin_mult);

                if (inChallenge('b', 12)) mult = mult.times(tmp.c.chance_multiplier);

                return mult;
            },
        },
        trade: {
            buy_mult() {
                let mult = D.dOne;

                const loss = D.add(player.s.buy_time, 10).log10();

                return mult.times(loss);
            },
            sell_mult() {
                let mult = D.dOne;

                const loss = D.add(player.s.sell_time, 10).log10();

                return mult.div(loss);
            }
        },
    },
    coins: {
        total() { return tmp.s.coins.list.reduceRight((sum, [item, mult = 1]) => D.times(sum, mult).add(player.items[item].amount), D.dZero); },
        spent() {
            return player.s.spent; //todo add upgrade costs
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
        //todo
    },
    branches: ['c'],
    update(diff) {
        if (D.gt(player.s.buy_time, 0)) player.s.buy_time = player.s.buy_time.minus(diff).max(0);
        if (D.gt(player.s.sell_time, 0)) player.s.sell_time = player.s.sell_time.minus(diff).max(0);
    },
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
        if (tmp[layer].row <= this.row) return;

        /** @type {(keyof Player['s'])[]} */
        const keep = ['upgrades'];

        layerDataReset(this.layer, keep);
    },
});
