'use strict';

const ORE_SIZES = {
    width: 3,
    height: 3,
};
addLayer('m', {
    row: 0,
    position: 1,
    type: 'none',
    resource: 'rocks',
    name: 'mining',
    symbol: 'M',
    color() { return tmp.m.ores.stone.color; },
    nodeStyle: {
        backgroundColor() {
            const targets = player.m.targets;
            if (!targets.length) return tmp.m.ores.stone.color;
            if (targets.length == 1) return tmp.m.ores[targets[0]].color;
            return '#' + targets.map(ore => rgb_split(tmp.m.ores[ore].color).map(c => c / targets.length))
                .reduce(([ar, ag, ab], [cr, cg, cb]) => [ar + cr, ag + cg, ab + cb], [0, 0, 0])
                .map(col => Math.floor(col).toString(16).padStart(2, '0'))
                .join('');
        },
    },
    tooltip() {
        const sum = tmp.m.items
            .reduce(
                /**@param{Decimal}sum @param{items}item*/
                (sum, item) => D.add(sum, player.items[item].amount),
                D.dZero);
        let text = `${formatWhole(player.items.stone.amount)} stone<br>${formatWhole(sum)} ores`;

        if (hasUpgrade('m', 63)) text += `<br>${formatWhole(player.m.experience)} experience`;

        return text;
    },
    startData() {
        return {
            lore: 'stone',
            targets: random_ores(1),
            previous: ['stone'],
            health: D(50),
            last_drops: [],
            ores: Object.fromEntries(Object.keys(layers.m.ores).map(ore => [ore, {
                broken: D.dZero,
                health: D(50),
                last_drops: [],
                last_drops_times: D.dZero,
            }])),
            unlocked: true,
            mine_time: D.dZero,
            compactor: {
                enabled: false,
                materials: D.dZero,
                runs: D.dZero,
                time: D.dZero,
                running: false,
            },
            experience: D.dZero,
        };
    },
    layerShown() { return D.gt(tmp.m.modifiers.damage.base, 0); },
    hotkeys: [
        {
            key: 'M',
            description: 'Shift + M: Display mining layer',
            onPress() { if (tmp.m.layerShown) showTab('m'); },
            unlocked() { return tmp.m.layerShown; },
        },
    ],
    tabFormat: {
        'Mining': {
            content: [
                ['display-text', () => {
                    const sum = tmp.m.items
                        .reduce(
                            /**@param{Decimal}sum @param{items}item*/
                            (sum, item) => D.add(sum, player.items[item].amount),
                            D.dZero),
                        list = [
                            `${resourceColor(tmp.items.stone.color, formatWhole(player.items.stone.amount), 'font-size:1.5em;')} ${tmp.items.stone.name}`,
                            `${resourceColor(tmp.m.nodeStyle.backgroundColor, formatWhole(sum), 'font-size:1.5em;')} ores`,
                        ];

                    return `You have ${listFormat.format(list)}.`;
                }],
                ['display-text', () => {
                    if (!hasUpgrade('m', 63)) return '';

                    const color = tmp.m.modifiers.xp.color,
                        gain = tmp.m.modifiers.xp.gain,
                        gain_txt = D.gt(gain, 0) ? ` (+ ${resourceColor(color, format(gain))})` : '',
                        cap = tmp.m.modifiers.xp.cap;

                    return `You have ${resourceColor(color, formatWhole(player.m.experience), 'font-size:1.5em')}${gain_txt}\
                        /${resourceColor(color, formatWhole(cap))} experience`;
                }],
                'blank',
                ['display-text', () => {
                    /** @type {Record<ores, number>} */
                    const count = {};
                    player.m.targets.forEach(ore => count[ore] = (count[ore] ?? 0) + 1);
                    const text = Object.entries(count).map(/**@param{[ores, number]}*/([ore, count]) => {
                        const name = tmp.m.ores[ore].name;
                        if (count == 1) return name;
                        return `${formatWhole(count)} ${name}`;
                    });

                    return `You are mining ${listFormat.format(text)}`;
                }],
                ['column', () => {
                    const list = player.m.targets.map(ore => ['raw-html', `<div style="width: 240px; height: 240px; overflow: hidden">
                            <img src="./resources/images/ores.png"
                                style="width: ${ORE_SIZES.width * 100}%;
                                    height: ${ORE_SIZES.height * 100}%;
                                    margin-left: ${-240 * tmp.m.ores[ore].position[0]}px;
                                    margin-top: ${-240 * tmp.m.ores[ore].position[1]}px;
                                    image-rendering: crisp-edges;"/>
                        </div>`]),
                        sq = square(list);
                    return sq.map(imgs => ['row', imgs])
                }],
                ['bar', 'health'],
                'blank',
                ['bar', 'mine'],
                'blank',
                ['clickables', [1]],
                'blank',
                ['display-text', () => {
                    const damage = tmp.m.modifiers.damage.total;

                    return `Mine for ${format(damage)} damage`;
                }],
                ['display-text', 'Hold to click 5 times per second'],
                'blank',
                ['display-text', () => {
                    if (D.lte(tmp.m.modifiers.range.mult, 0)) return '';

                    let drops = 'nothing';
                    const last_drops = player.m.last_drops,
                        /** @type {Record<ores, number>} */
                        prev_count = {};
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${tmp.items[item].name}`));
                    player.m.previous.forEach(ore => prev_count[ore] = (prev_count[ore] ?? 0) + 1);
                    const prev_text = Object.entries(prev_count).map(/**@param{[ores, number]}*/([ore, count]) => {
                        const name = tmp.m.ores[ore].name;
                        if (count == 1) return name;
                        return `${formatWhole(count)} ${name}`;
                    });

                    return `${capitalize(listFormat.format(prev_text))} dropped ${drops}`;
                }],
            ],
            buttonStyle: { borderColor() { return tmp.m.nodeStyle.backgroundColor; }, },
        },
        'Upgrades': {
            content: [
                ['display-text', () => {
                    /** @type {items[]} */
                    const resources = ['stone', 'copper_ore', 'tin_ore', 'bronze_blend'],
                        list = resources.map(item => `${resourceColor(tmp.items[item].color, formatWhole(player.items[item].amount), 'font-size:1.5em;')} ${tmp.items[item].name}`);

                    return `You have ${listFormat.format(list)}.`;
                }],
                'blank',
                ['upgrades', [1, 2, 3]],
                'blank',
                'h-line',
                'blank',
                ['display-text', () => {
                    /** @type {items[]} */
                    const resources = ['densium', 'iron_ore', 'silver_ore', 'electrum_blend'],
                        list = resources.map(item => `${resourceColor(tmp.items[item].color, formatWhole(player.items[item].amount), 'font-size:1.5em;')} ${tmp.items[item].name}`);

                    return `You have ${listFormat.format(list)}.`;
                }],
                'blank',
                ['upgrades', [4, 5, 6]],
            ],
            buttonStyle: { borderColor() { return tmp.m.nodeStyle.backgroundColor; }, },
            shouldNotify() { return canAffordLayerUpgrade('m'); },
        },
        'Compactor': {
            content: [
                ['display-text', () => {
                    const sum = tmp.m.items
                        .reduce(
                            /**@param{Decimal}sum @param{items}item*/
                            (sum, item) => D.add(sum, player.items[item].amount),
                            D.dZero),
                        list = [
                            `${resourceColor(tmp.items.stone.color, formatWhole(player.items.stone.amount), 'font-size:1.5em;')} ${tmp.items.stone.name}`,
                            `${resourceColor(tmp.m.nodeStyle.backgroundColor, formatWhole(sum), 'font-size:1.5em;')} ores`,
                        ];

                    return `You have ${listFormat.format(list)}.`;
                }],
                ['display-text', () => `The compactor has run ${resourceColor(tmp.items.densium.color, formatWhole(player.m.compactor.runs))} times.`],
                'blank',
                ['clickable', 31],
                'blank',
                ['bar', 'compactor'],
            ],
            unlocked() { return tmp.m.compactor.unlocked; },
            buttonStyle: { borderColor() { return tmp.items.densium.color; }, },
        },
        'Miner\'s Handbook': {
            content: [
                ['display-text', 'Ore information'],
                ['clickables', [2]],
                'blank',
                ['column', () => handbook_content(player.m.lore)],
            ],
            buttonStyle: { borderColor() { return tmp.m.nodeStyle.backgroundColor; }, },
            unlocked() { return hasUpgrade('m', 22) || hasAchievement('ach', 71); },
        },
    },
    upgrades: {
        11: {
            title: 'Stone Pick',
            description: '+1 mining damage',
            effect() { return D.dOne; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            item: 'stone',
            cost: D(8),
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        12: {
            title: 'Copper Pick',
            description: 'Double mining damage',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            item: 'copper_ore',
            cost: D(4),
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        13: {
            title: 'Tin Pick',
            description: '+50% mining drops',
            effect() { return D(1.5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            item: 'tin_ore',
            cost: D(2),
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        14: {
            title: 'Bronze Pick',
            description() {
                let text = 'Maximum ore health boosts mining amount';

                if (shiftDown) text += `<br>Formula: log16(health + 16)`;

                return text;
            },
            effect() {
                /** @type {{[ore in ores]: Decimal}} */
                const ores = Object.fromEntries(
                    Object.values(tmp.m.ores)
                        .map(ore => [ore.id, D.add(ore.health, 16).log(16)]),
                );

                return Object.assign(ores, {
                    current: player.m.targets.map(ore => ores[ore]).reduce((prod, mult) => D.times(prod, mult), D.dOne),
                });
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id).current)}`; },
            item: 'bronze_blend',
            cost: D(1),
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        21: {
            title: 'Rock Filter',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Breaking stone lowers its chance';

                if (shiftDown) text += '<br>Formula: 2√(broken + 1)';

                return text;
            },
            effect() { return D.add(player.m.ores.stone.broken, 1).sqrt(); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `/${format(upgradeEffect(this.layer, this.id))}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'stone',
            cost: D(32),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        22: {
            title: 'Copper Drill',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Automatically mine current ore once per second';

                if (!hasAchievement('ach', 71)) text += '<br>Unlock the mining handbook';

                return text;
            },
            effect() { return D.dOne; },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `+${formatWhole(upgradeEffect(this.layer, this.id))}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'copper_ore',
            cost: D(16),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        23: {
            title: 'Tin Filter',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = '+50% ore gain, but halve stone gain';

                return text;
            },
            effect() {
                return {
                    stone: D(0.5),
                    ore: D(1.5),
                };
            },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                /** @type {{stone: Decimal, ore: Decimal}} */
                const effect = upgradeEffect(this.layer, this.id);
                return `*${format(effect.ore)}, /${format(effect.stone)}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'tin_ore',
            cost: D(4),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        24: {
            title: 'Bronze Collector',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Breaking minerals boosts their drops';

                if (shiftDown) text += '<br>Formula: log8(broken + 8)';

                return text;
            },
            effect() {
                /** @type {{[ore in ores]: Decimal}} */
                const ores = Object.fromEntries(
                    Object.keys(layers.m.ores)
                        .map(/**@param{ores}ore*/ore => [ore, D.add(player.m.ores[ore].broken, 8).log(8)]),
                );

                return Object.assign(ores, {
                    current: player.m.targets.map(ore => ores[ore]).reduce((sum, mult) => D.add(sum, mult), D.dZero).div(player.m.targets.length),
                });
            },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id).current)}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'bronze_blend',
            cost: D(2),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        31: {
            title: 'Boulder',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Total minerals broken reduce level costs';

                if (shiftDown) text += '<br>Formula: 8√(broken + 4)';

                return text;
            },
            effect() { return D.add(tmp.m.broken.total, 4).root(8); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `/${format(upgradeEffect(this.layer, this.id))}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'stone',
            cost: D(256),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        32: {
            title: 'Copper Expansion Box',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Mining upgrades multiply experience cap';

                if (shiftDown) text += '<br>Formula: 2.5√(upgrades + 2)';

                return text;
            },
            effect() { return D.add(player.m.upgrades.length, 2).root(2.5); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'copper_ore',
            cost: D(32),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        33: {
            title: 'Tin Hammer',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Tin ore boosts mining damage';

                if (shiftDown) text += '<br>Formula: log5(tin ore + 1)';

                return text;
            },
            effect() { return D.add(player.items.tin_ore.amount, 7).log(5); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `+${format(upgradeEffect(this.layer, this.id))}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'tin_ore',
            cost: D(16),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        34: {
            title: 'Bronze Mixer',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Crafting materials is cheaper';

                return text;
            },
            effect() { return D(1.5); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `/${format(upgradeEffect(this.layer, this.id))}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'bronze_blend',
            cost: D(8),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
        },
        41: {
            title: 'Densium Pick',
            description: 'Multiply mining damage by amount of ores being mined',
            effect() { return D(player.m.targets.length); },
            effectDisplay() { return `*${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            item: 'densium',
            cost: D(2),
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return tmp.m.compactor.unlocked || hasAchievement('ach', 94); },
        },
        42: {
            title: 'Iron Pick',
            description() {
                let text = 'Increase mining damage by amount of ores broken';

                if (shiftDown) text += '<br>Formula: log25(broken + 1)';

                return text;
            },
            effect() { return D.add(tmp.m.broken.total, 1).log(25); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            item: 'iron_ore',
            cost: D(9),
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return hasUpgrade('m', 61) || hasAchievement('ach', 94); },
        },
        43: {
            title: 'Silver Pick',
            description: 'Multiply gold nugget chance by amount of picks',
            effect() { return D(player.m.upgrades.filter(id => tmp.m.upgrades[id].title.toLowerCase().includes('pick')).length); },
            effectDisplay() { return `*${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            item: 'silver_ore',
            cost: D(6),
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return hasUpgrade('m', 61) || hasAchievement('ach', 94); },
        },
        44: {
            title: 'Electrum Pick',
            description() {
                let text = 'Compactor runs boost compactor speed';

                if (shiftDown) text += '<br>Formula: log4(runs + 4)';

                return text;
            },
            effect() { return D.add(player.m.compactor.runs, 4).log(4); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            item: 'electrum_blend',
            cost: D(1),
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return hasUpgrade('m', 61) || hasAchievement('ach', 94); },
        },
        51: {
            title: 'Densium Attraction',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Densium multiplies stone gain';

                if (shiftDown) text += '<br>Formula: 2√(densium + 1)';

                return text;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            effect() { return D.add(player.items.densium.amount, 1).sqrt(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            item: 'densium',
            cost: D(3),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return tmp.m.compactor.unlocked; },
        },
        52: {
            title: 'Iron Drill',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Automatically mine current ore once every 3 second';

                return text;
            },
            effect() { return D.div(1, 3); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `+${formatWhole(upgradeEffect(this.layer, this.id))}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'iron_ore',
            cost: D(18),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return hasUpgrade('m', 61) || hasAchievement('ach', 94); },
        },
        53: {
            title: 'Anti-Undead Coating',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Double damage against skeletons';

                return text;
            },
            effect() { return D.dTwo; },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${formatWhole(upgradeEffect(this.layer, this.id))}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'silver_ore',
            cost: D(12),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return hasUpgrade('m', 61) || hasAchievement('ach', 94); },
        },
        54: {
            title: 'Electrum Drill Head',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Broken ores increase automatic mining speed';

                if (shiftDown) text += '<br>Formula: log16(broken ores + 1) / 10';

                return text;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            effect() { return D.add(tmp.m.broken.total, 1).log(16).div(10); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `+${format(upgradeEffect(this.layer, this.id))}`;
            },
            item: 'electrum_blend',
            cost: D(3),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return hasUpgrade('m', 61) || hasAchievement('ach', 94); },
        },
        61: {
            title: 'Densium Drill',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                return 'Automatically mine current ore once per second<br>Mine an additionnal ore at once';
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            effect() { return D.dOne; },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `+${formatWhole(upgradeEffect(this.layer, this.id))}`;
            },
            item: 'densium',
            cost: D(4),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return tmp.m.compactor.unlocked; },
        },
        62: {
            title: 'Iron Forge',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = '';

                if (!player.c.visited_forge) text += 'Unlock forging<br>';

                text += 'Gain +1 heat per second';

                return text;
            },
            effect() { return D.dOne; },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `+${formatWhole(upgradeEffect(this.layer, this.id))}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'iron_ore',
            cost: D(72),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return hasUpgrade('m', 61); },
        },
        63: {
            title: 'Silver Experience',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Unlock mining experience.<br>Double mining experience gain';

                return text;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            effect() { return D.dTwo; },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
            item: 'silver_ore',
            cost: D(24),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return hasUpgrade('m', 61) || hasAchievement('ach', 94); },
        },
        64: {
            title: 'Kineticism',
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) return `Buy ${tmp[this.layer].upgrades[this.id - 10].title} to unlock`;

                let text = 'Killing an enemy strikes ores once for 10% of damage<br>Breaking ores attacks enemies once for 10% of damage';

                return text;
            },
            effect() { return D(.1); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10) || hasUpgrade(this.layer, this.id) || hasAchievement('ach', 94); },
            item: 'electrum_blend',
            cost: D(9),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    const selftmp = tmp[this.layer].upgrades[this.id];
                    return {
                        'backgroundColor': tmp.items[selftmp.item].color,
                    };
                }
            },
            costDisplay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                return `Cost: ${format(selftmp.cost)} ${tmp.items[selftmp.item].name}`;
            },
            canAfford() {
                if (!tmp[this.layer].upgrades[this.id].show) return false;

                const selftmp = tmp[this.layer].upgrades[this.id];
                return D.gte(player.items[selftmp.item].amount, selftmp.cost);
            },
            pay() {
                const selftmp = tmp[this.layer].upgrades[this.id];
                gain_items(selftmp.item, D.neg(selftmp.cost));
            },
            currencyLocation() { return player.items[this.item]; },
            currencyInternalName: 'amount',
            unlocked() { return hasUpgrade('m', 61) || hasAchievement('ach', 94); },
        },
    },
    clickables: {
        // Mining
        11: {
            style: {
                width: '180px',
                height: '180px',
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 100}% ${UI_SIZES.height * 100}%`,
                'background-position-y': '-180px',
                backgroundColor() { return tmp.m.nodeStyle.backgroundColor; },
            },
            onClick: strike_ore,
            onHold() {
                // About 5 clicks per second
                const damage = D.div(tmp.m.modifiers.damage.total, 20 / 5);

                strike_ore(damage);
            },
            canClick() {
                if (inChallenge('b', 31) && D.lte(player.dea.health, 0)) return false;

                return D.gt(player.m.health, 0);
            },
        },
        // Handbook
        21: {
            style() {
                const style = {
                    'background-image': `url(./resources/images/UI.png)`,
                    'background-repeat': 'no-repeat',
                    'image-rendering': 'crisp-edges',
                    'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                    'background-position': '-120px -120px',
                };

                if (tmp[this.layer].clickables[this.id].canClick) {
                    style.backgroundColor = tmp.m.nodeStyle.backgroundColor;
                } else {
                    style.backgroundColor = colors[options.theme].locked;
                }

                return style;
            },
            onClick() {
                const list = tmp.m.list,
                    i = list.indexOf(player.m.lore);
                player.m.lore = list[i - 1];
            },
            canClick() {
                if (!Array.isArray(tmp.m.list)) return false;
                const i = tmp.m.list.indexOf(player.m.lore);
                return i > 0;
            },
            unlocked() {
                /** @type {monsters[]} */
                const list = tmp.m.list;
                return list.length > 1;
            },
        },
        22: {
            style() {
                const style = {
                    'background-image': `url(./resources/images/UI.png)`,
                    'background-repeat': 'no-repeat',
                    'image-rendering': 'crisp-edges',
                    'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                    'background-position': '-120px 0',
                };

                if (tmp[this.layer].clickables[this.id].canClick) {
                    style.backgroundColor = tmp.m.nodeStyle.backgroundColor;
                } else {
                    style.backgroundColor = colors[options.theme].locked;
                }

                return style;
            },
            onClick() {
                /** @type {monsters[]} */
                const list = tmp.m.list,
                    i = list.indexOf(player.m.lore);
                player.m.lore = list[i + 1];
            },
            canClick() {
                const list = tmp.m.list;
                if (!Array.isArray(list)) return false;
                const i = list.indexOf(player.m.lore);
                return i < list.length - 1;
            },
            unlocked() {
                /** @type {monsters[]} */
                const list = tmp.m.list;
                return list.length > 1;
            },
        },
        // Compactor
        31: {
            title: 'Enable Compactor',
            display() {
                if (!tmp.m.compactor.unlocked) return 'The compactor is locked!';
                return `Consume mined materials to produce densium<br>
                    Currently: ${player.m.compactor.enabled ? 'ON' : 'OFF'}`;
            },
            canClick() { return tmp.m.compactor.unlocked; },
            onClick() { player.m.compactor.enabled = !player.m.compactor.enabled; },
            style: { backgroundColor() { return tmp.items.densium.color; }, },
        },
    },
    ores: {
        stone: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, r]) => r == this)[0]; },
            color() { return tmp.items.stone.color; },
            name: 'stone',
            position: [1, 0],
            health() {
                let base = D.dTen;

                let health = D.times(base, tmp.m?.modifiers.health.mult)

                health = health.times(item_effect('densium_rock').rock_mult);

                return health;
            },
            lore: `A large piece of rock.<br>
                Makes up most of the minerals around.<br>
                It would be weirder to not find any...`,
            weight() {
                let weight = D.dTen;

                if (hasUpgrade('m', 21)) weight = weight.div(upgradeEffect('m', 21));

                return weight;
            },
            breaks() {
                let breaks = D.dOne;

                breaks = breaks.times(item_effect('densium_rock').rock_mult);

                return breaks;
            },
            experience() {
                let xp = D.times(.25, tmp.m.modifiers.xp.base)
                    .times(tmp.m.modifiers.xp.mult);

                return xp;
            },
        },
        copper: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, r]) => r == this)[0]; },
            color() { return tmp.items.copper_ore.color; },
            name: 'copper ore',
            position: [0, 1],
            health() {
                let base = D(25),
                    health = D.times(base, tmp.m?.modifiers.health.mult);

                return health;
            },
            lore: `A chunk of rock containing copper.<br>
                Somewhat tough to break.<br>
                Still contains large amounts of stone.`,
            weight() { return D(4); },
            breaks() { return D.dOne; },
            experience() {
                let xp = D.times(3, tmp.m.modifiers.xp.base)
                    .times(tmp.m.modifiers.xp.mult);

                return xp;
            },
        },
        tin: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, r]) => r == this)[0]; },
            color() { return tmp.items.tin_ore.color; },
            name: 'tin ore',
            position: [1, 1],
            health() {
                let base = D(15),
                    health = D.times(base, tmp.m?.modifiers.health.mult);

                return health;
            },
            lore: `A chunk of rock containing tin.<br>
                Easy to break.<br>
                Mostly contains stone.`,
            weight() { return D(1); },
            breaks() { return D.dOne; },
            experience() {
                let xp = D.times(6, tmp.m.modifiers.xp.base)
                    .times(tmp.m.modifiers.xp.mult);

                return xp;
            },
        },
        coal: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, r]) => r == this)[0]; },
            color() { return tmp.items.coal.color; },
            name: 'coal',
            position: [2, 0],
            health() {
                let base = D(20),
                    health = D.times(base, tmp.m?.modifiers.health.mult);

                return health;
            },
            lore: `A chunk of rock containing coal.<br>
                Chips easily and common.<br>
                Technically made entirely of rocks.`,
            weight() { return D(5); },
            breaks() { return D.dOne; },
            unlocked() { return hasUpgrade('m', 61); },
            experience() {
                let xp = D.times(2, tmp.m.modifiers.xp.base)
                    .times(tmp.m.modifiers.xp.mult);

                return xp;
            },
        },
        iron: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, r]) => r == this)[0]; },
            color() { return tmp.items.iron_ore.color; },
            name: 'iron',
            position: [2, 1],
            health() {
                let base = D(50),
                    health = D.times(base, tmp.m?.modifiers.health.mult);

                return health;
            },
            lore: `A chunk of rock mixed with iron.<br>
                Tough to break and solid red.<br>
                The red comes from oxidation. Refining this might be tough...`,
            weight() { return D.dOne; },
            breaks() { return D.dOne; },
            unlocked() { return hasUpgrade('m', 61); },
            experience() {
                let xp = D.times(4, tmp.m.modifiers.xp.base)
                    .times(tmp.m.modifiers.xp.mult);

                return xp;
            },
        },
        silver: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, r]) => r == this)[0]; },
            color() { return tmp.items.silver_ore.color; },
            name: 'silver',
            position: [2, 2],
            health() {
                let base = D(45),
                    health = D.times(base, tmp.m?.modifiers.health.mult);

                return health;
            },
            lore: `A chunk of rock mixed with silver.<br>
                Tough to break and has strange black spots.<br>
                Now this is a valuable ore!`,
            weight() { return D(.5); },
            breaks() { return D.dOne; },
            unlocked() { return hasUpgrade('m', 61); },
            experience() {
                let xp = D.times(8, tmp.m.modifiers.xp.base)
                    .times(tmp.m.modifiers.xp.mult);

                return xp;
            },
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            progress() { return D.div(player.m.health, tmp.m.modifiers.health.total); },
            display() { return `${format(player.m.health)} / ${format(tmp.m.modifiers.health.total)}`; },
            height: 40,
            width: 320,
            fillStyle() {
                const targets = player.m.targets,
                    backgroundColor = tmp.m.ores[targets[0] ?? 'stone'].color;
                return { backgroundColor, };
            },
            baseStyle: { 'border-radius': 0, },
            borderStyle: { 'border-radius': 0, },
        },
        mine: {
            direction: RIGHT,
            progress() { return player.m.mine_time; },
            height: 10,
            width: 320,
            fillStyle: {
                backgroundColor() { return tmp.m.nodeStyle.backgroundColor; },
            },
            unlocked() { return D.gt(tmp.m.modifiers.damage.speed, 0); },
        },
        compactor: {
            direction: RIGHT,
            progress() {
                if (!tmp.m.compactor.unlocked) return D.dZero;
                if (player.m.compactor.running) {
                    // Decrease the bar when compacting
                    return D.minus(1, D.div(player.m.compactor.time, tmp.m.compactor.time));
                } else {
                    return D.div(player.m.compactor.materials, tmp.m.compactor.materials);
                }
            },
            display() {
                if (!tmp.m.compactor.unlocked) return '0 / ??? materials<br>Inert';
                if (player.m.compactor.running) {
                    return `${formatTime(player.m.compactor.time)} / ${formatTime(tmp.m.compactor.time)}<br>Compacting`;
                } else {
                    let text = `${formatWhole(player.m.compactor.materials)} / ${formatWhole(tmp.m.compactor.materials)} minerals<br>`;
                    if (player.m.compactor.enabled) text += 'Filling';
                    else text += 'Idle';
                    return text;
                }
            },
            height: 60,
            width: 400,
            fillStyle: {
                backgroundColor() { return tmp.items.densium.color; },
            },
        },
    },
    modifiers: {
        damage: {
            base() {
                let base = D.dZero;

                base = base.add(item_effect('bone_pick').m_damage);

                if (hasUpgrade('m', 11)) base = base.add(upgradeEffect('m', 11));
                if (hasUpgrade('m', 33)) base = base.add(upgradeEffect('m', 33));
                if (hasUpgrade('m', 42)) base = base.add(upgradeEffect('m', 42));

                if (hasUpgrade('l', 14)) base = base.add(upgradeEffect('l', 14));

                if (hasAchievement('ach', 54)) base = base.add(achievementEffect('ach', 54));

                if (hasUpgrade('dea', 12)) base = base.add(upgradeEffect('dea', 12));

                return base;
            },
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 41)) mult = mult.times(upgradeEffect('xp', 41));
                if (hasUpgrade('xp', 53)) mult = mult.times(upgradeEffect('xp', 53));
                if (hasUpgrade('xp', 62)) mult = mult.times(upgradeEffect('xp', 62));

                if (hasUpgrade('m', 12)) mult = mult.times(upgradeEffect('m', 12));
                if (hasUpgrade('m', 41)) mult = mult.times(upgradeEffect('m', 41));

                mult = mult.times(item_effect('stone_mace').m_damage);
                mult = mult.times(item_effect('copper_pick').damage);

                return mult;
            },
            total() { return D.times(tmp.m.modifiers.damage.base, tmp.m.modifiers.damage.mult); },
            speed() {
                let speed = D.dZero;

                if (hasUpgrade('m', 22)) speed = speed.add(upgradeEffect('m', 22));
                if (hasUpgrade('m', 52)) speed = speed.add(upgradeEffect('m', 52));
                if (hasUpgrade('m', 54)) speed = speed.add(upgradeEffect('m', 54));

                return speed;
            },
        },
        range: {
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 63)) mult = mult.times(upgradeEffect('xp', 63));

                if (hasUpgrade('m', 13)) mult = mult.times(upgradeEffect('m', 13));
                if (hasUpgrade('m', 14)) mult = mult.times(upgradeEffect('m', 14).current);
                if (hasUpgrade('m', 24)) mult = mult.times(upgradeEffect('m', 24).current);

                if (hasUpgrade('l', 24)) mult = mult.times(upgradeEffect('l', 24));

                mult = mult.times(item_effect('copper_pick').ores);
                mult = mult.times(item_effect('bronze_cart').m_drop);

                return mult;
            },
        },
        health: {
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 43)) mult = mult.times(upgradeEffect('xp', 43));

                if (hasUpgrade('dea', 31)) mult = mult.div(upgradeEffect('dea', 31));

                return mult;
            },
            total() { return player.m.targets.map(ore => tmp.m.ores[ore].health).reduce((sum, health) => D.add(sum, health), D.dZero); },
        },
        xp: {
            base() {
                let base = D.dZero;

                if (hasUpgrade('m', 63)) base = D.dOne;

                return base;
            },
            mult() {
                let mult = tmp.xp.modifiers.xp.mult;

                if (hasUpgrade('m', 63)) mult = mult.times(upgradeEffect('m', 63));

                return mult;
            },
            gain() {
                let gain = player.m.targets.map(ore => tmp.m.ores[ore].experience)
                    .reduce((sum, xp) => D.add(sum, xp), D.dZero);

                return gain.min(tmp.m.modifiers.xp.gain_cap);
            },
            cap_base() {
                let base = D(100);

                if (hasAchievement('ach', 15)) base = base.add(achievementEffect('ach', 15));

                return base;
            },
            cap() { return D.times(tmp.m.modifiers.xp.cap_base, tmp.xp.modifiers.cap.mult); },
            gain_cap() { return D.minus(tmp.m.modifiers.xp.cap, player.m.experience); },
            color: '#BB8822',
        },
        size() {
            let size = D.dOne;

            if (hasUpgrade('s', 22)) size = size.add(upgradeEffect('s', 22));
            if (hasUpgrade('m', 61)) size = size.add(upgradeEffect('m', 61));

            return size.toNumber();
        },
    },
    broken: {
        color: '#8855AA',
        total() { return Object.values(player.m.ores).map(ore => ore.broken).reduce((sum, broken) => D.add(sum, broken), D.dZero); },
    },
    compactor: {
        materials() {
            let cost = D(500),
                mult = D.pow(1.25, player.m.compactor.runs);

            return D.times(cost, mult);
        },
        time() {
            let base = D(30),
                add = D.times(1, player.m.compactor.runs);

            let time = D.add(base, add);

            time = time.div(item_effect('magic_densium_ball').comp_mult);
            if (hasUpgrade('m', 44)) time = time.div(upgradeEffect('m', 44));

            return time;
        },
        unlocked() { return hasUpgrade('s', 22) || hasAchievement('b', 65); },
    },
    list() { return Object.keys(layers.m.ores).filter(/**@param{ores}ore*/ore => tmp.m.ores[ore].unlocked ?? true); },
    items: ['copper_ore', 'tin_ore', 'gold_nugget', 'iron_ore', 'clear_iron_ore', 'silver_ore'],
    minerals: [
        'stone', 'copper_ore', 'tin_ore', 'bronze_blend', 'gold_nugget', 'densium',
        'coal', 'iron_ore', 'clear_iron_ore', 'silver_ore', 'electrum_blend',
    ],
    automate() {
        if (player.m.targets.length != tmp.m.modifiers.size) {
            const targets = random_ores(tmp.m.modifiers.size),
                health = targets.map(ore => tmp.m.ores[ore].health).reduce((sum, health) => D.add(sum, health), D.dZero);
            player.m.targets = targets;
            player.m.health = health;
        }
        if (D.gt(player.m.health, tmp.m.modifiers.health.total)) {
            player.m.health = tmp.m.modifiers.health.total;
        }

        // Damage
        let damage = D.dZero;
        if (D.gte(player.m.mine_time, 1)) {
            damage = damage.add(tmp.m.modifiers.damage.total);
            player.m.mine_time = D.minus(player.m.mine_time, 1);
        }
        if (damage.gt(0)) strike_ore(damage);

        // Break ore
        if (D.lte(player.m.health, 0)) {
            const drops = merge_drops(player.m.targets.map(ore => {
                const breaks = tmp.m.ores[ore].breaks;
                return [get_source_drops(`mining:${ore}`, breaks), get_source_drops('mining:any', breaks)];
            }).flat(2));

            if (tmp.m.compactor.unlocked && player.m.compactor.enabled && !player.m.compactor.running) {
                const materials = drops.reduce((sum, [, drop]) => D.add(sum, drop), D.dZero);
                player.m.compactor.materials = D.add(player.m.compactor.materials, materials);
            } else {
                gain_items(drops);
            }

            if (hasUpgrade('m', 63)) {
                const xp = tmp.m.modifiers.xp.gain;
                player.m.experience = D.add(player.m.experience, xp);
            }

            player.m.last_drops = drops;
            player.m.previous = player.m.targets;
            player.m.targets.forEach(ore => {
                const breaks = tmp.m.ores[ore].breaks;
                return player.m.ores[ore].broken = D.add(player.m.ores[ore].broken, breaks);
            });

            const targets = random_ores(tmp.m.modifiers.size),
                health = targets.map(ore => tmp.m.ores[ore].health).reduce((sum, health) => D.add(sum, health), D.dZero);
            player.m.targets = targets;
            player.m.health = health;

            if (hasUpgrade('m', 64)) {
                const selected = player.xp.selected,
                    damage = D.times(tmp.xp.monsters[selected].damage, upgradeEffect('m', 64));
                attack_monster(player.xp.selected, damage);
            }
        }

        if (tmp.m.compactor.unlocked) {
            // Start compacting
            if (D.gte(player.m.compactor.materials, tmp.m.compactor.materials)) {
                player.m.compactor.running = true;
            }

            // End compacting
            if (D.gte(player.m.compactor.time, tmp.m.compactor.time)) {
                player.m.compactor.running = false;
                player.m.compactor.time = D.dZero;
                player.m.compactor.materials = D.dZero;
                player.m.compactor.runs = D.add(player.m.compactor.runs, 1);
                gain_items('densium', 1);
            }
        }
    },
    update(diff) {
        if (inChallenge('b', 31) && D.lte(player.dea.health, 0)) return;

        if (tmp.m.compactor.unlocked && player.m.compactor.running) player.m.compactor.time = D.add(diff, player.m.compactor.time);

        player.m.mine_time = D.times(diff, tmp.m.modifiers.damage.speed).add(player.m.mine_time).min(1);
    },
    doReset(layer) {
        if (tmp[layer].row <= this.row) return;

        const held = D(item_effect('tin_cache').hold).toNumber(),
            /** @type {number[]} */
            upgs = [],
            /** @type {(keyof Player['m'])[]} */
            keep = ['lore', 'previous'];
        if (hasAchievement('ach', 95) && hasUpgrade('m', 61)) {
            upgs.push(61);
        }
        if (D.gt(held, 0)) {
            upgs.push(...player.m.upgrades.filter(id => !upgs.includes(id)).slice(0, held));
        }

        layerDataReset(this.layer, keep);

        player.m.upgrades.push(...upgs);
    },
});
