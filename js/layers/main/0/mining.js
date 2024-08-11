'use strict';

const ORE_SIZES = {
    width: 2,
    height: 2,
};
//todo support multiple parallel mining (shows all, drops from all, health is sum of all, may repeat)
addLayer('m', {
    row: 0,
    position: 1,
    type: 'none',
    resource: 'rocks',
    name: 'mining',
    symbol: 'M',
    color() { return tmp.m.ores[player.m.target].color; },
    tooltip() {
        const sum = tmp.m.items
            .reduce(
                /**@param{Decimal}sum @param{items}item*/
                (sum, item) => D.add(sum, player.items[item].amount)
                , D.dZero);
        return `${formatWhole(player.items.stone.amount)} stone<br>${formatWhole(sum)} ores`;
    },
    startData() {
        return {
            lore: 'stone',
            target: 'stone',
            previous: 'stone',
            ores: Object.fromEntries(Object.keys(layers.m.ores).map(ore => [ore, {
                broken: D.dZero,
                health: D(50),
                last_drops: [],
                last_drops_times: D.dZero,
            }])),
            unlocked: true,
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
                    const list = tmp.m.minerals
                        .filter(item => (tmp.items[item].unlocked ?? true))
                        .map(item => `${resourceColor(tmp.items[item].color, formatWhole(player.items[item].amount), 'font-size:1.5em;')} ${tmp.items[item].name}`);

                    return `You have ${listFormat.format(list)}.`;
                }],
                'blank',
                ['display-text', () => {
                    const target = player.m.target;

                    return `You are mining ${tmp.m.ores[target].name}`;
                }],
                ['raw-html', () => {
                    return `<div style="width: 240px; height: 240px; overflow: hidden">
                            <img src="./resources/images/ores.png"
                                style="width: ${ORE_SIZES.width * 100}%;
                                    height: ${ORE_SIZES.height * 100}%;
                                    margin-left: ${-240 * tmp.m.ores[player.m.target].position[0]}px;
                                    margin-top: ${-240 * tmp.m.ores[player.m.target].position[1]}px;
                                    image-rendering: crisp-edges;"/>
                        </div>`;
                }],
                ['bar', 'health'],
                'blank',
                'blank',
                ['clickables', [1]],
                'blank',
                ['display-text', () => {
                    const target = player.m.target,
                        damage = tmp.m.ores[target].damage;

                    return `Mine for ${format(damage)} damage`;
                }],
                ['display-text', 'Hold to click 5 times per second'],
                'blank',
                ['display-text', () => {
                    if (D.lte(tmp.m.modifiers.range.mult, 0)) return '';

                    let drops = 'nothing',
                        count = '';
                    const last_drops = player.m.ores[player.m.previous].last_drops,
                        last_count = player.m.ores[player.m.previous].last_drops_times;
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${tmp.items[item].name}`));
                    if (last_count.gt(1)) count = ` (${formatWhole(last_count)})`;

                    return `${capitalize(tmp.m.ores[player.m.previous].name)} dropped ${drops}${count}`;
                }],
            ],
        },
        'Upgrades': {
            content: [
                ['display-text', () => {
                    const list = tmp.m.minerals
                        .filter(item => (tmp.items[item].unlocked ?? true))
                        .map(item => `${resourceColor(tmp.items[item].color, formatWhole(player.items[item].amount), 'font-size:1.5em;')} ${tmp.items[item].name}`);

                    return `You have ${listFormat.format(list)}.`;
                }],
                'blank',
                'upgrades',
            ],
            shouldNotify() { return canAffordLayerUpgrade('m'); },
        },
        'Miner\'s Handbook': {
            content: [
                ['display-text', 'Ore information'],
                ['clickables', [2]],
                'blank',
                ['column', () => handbook_content(player.m.lore)],
            ],
            unlocked() { return hasUpgrade('m', 22); },
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

                if (shiftDown) text += `<br>log10(health + 10)`;

                return text;
            },
            effect() {
                return Object.fromEntries(
                    Object.values(tmp.m.ores)
                        .map(ore => [ore.id, D.add(ore.health, 10).log10()]),
                );
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id)[player.m.target])}`; },
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
            show() { return hasUpgrade(this.layer, this.id - 10); },
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

                let text = 'Automatically mine current ore<br>Unlock the mining handbook';

                return text;
            },
            effect() { return D.dOne; },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `${format(tmp.m.ores[player.m.target].damage_per_second)} /s`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10); },
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

                let text = 'Double ore gain, but halve stone gain';

                return text;
            },
            effect() {
                return {
                    stone: D(0.5),
                    ore: D.dTwo,
                };
            },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                /** @type {{stone: Decimal, ore: Decimal}} */
                const effect = upgradeEffect(this.layer, this.id);
                return `*${format(effect.ore)}, /${format(effect.stone)}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10); },
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

                if (shiftDown) text += '<br>Formula: log4(broken + 4)';

                return text;
            },
            effect() {
                return Object.fromEntries(
                    Object.keys(layers.m.ores)
                        .map(/**@param{ores}ore*/ore => [ore, D.add(player.m.ores[ore].broken, 4).log(4)]),
                );
            },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id)[player.m.target])}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10); },
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
            show() { return hasUpgrade(this.layer, this.id - 10); },
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
                return `*${format(tmp.m.ores[player.m.target].damage_per_second)}`;
            },
            show() { return hasUpgrade(this.layer, this.id - 10); },
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
            show() { return hasUpgrade(this.layer, this.id - 10); },
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
            show() { return hasUpgrade(this.layer, this.id - 10); },
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
            },
            onClick() {
                const target = player.m.target,
                    damage = tmp.m.ores[target].damage,
                    ore = player.m.ores[target];

                ore.health = D.minus(ore.health, damage);
            },
            onHold() {
                const target = player.m.target,
                    // About 5 clicks per second
                    damage = D.div(tmp.m.ores[target].damage, 20 / 5),
                    ore = player.m.ores[target];

                ore.health = D.minus(ore.health, damage);
            },
            canClick() {
                const target = player.m.target;

                return D.gt(player.m.ores[target].health, 0);
            },
        },
        // Handbook
        21: {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-120px -120px',
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
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-120px 0',
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

                return D.times(base, tmp.m?.modifiers.health.mult);
            },
            damage() { return D.times(tmp.m.modifiers.damage.base, tmp.m.modifiers.damage.mult); },
            damage_per_second() {
                let mult = D.dZero;

                if (hasUpgrade('m', 22) && player.m.target == this.id) mult = mult.add(upgradeEffect('m', 22));

                return D.times(mult, tmp.m.ores[this.id].damage);
            },
            lore: `A large piece of rock.<br>
                Makes up most of the minerals around.<br>
                It would be weirder to not find any...`,
            weight() {
                let weight = D.dTen;

                if (hasUpgrade('m', 21)) weight = weight.div(upgradeEffect('m', 21));

                return weight;
            },
        },
        copper: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, r]) => r == this)[0]; },
            color() { return tmp.items.copper_ore.color; },
            name: 'copper ore',
            position: [0, 1],
            health() {
                let base = D(25);

                return D.times(base, tmp.m?.modifiers.health.mult);
            },
            damage() { return D.times(tmp.m.modifiers.damage.base, tmp.m.modifiers.damage.mult); },
            damage_per_second() {
                let mult = D.dZero;

                if (hasUpgrade('m', 22) && player.m.target == this.id) mult = mult.add(upgradeEffect('m', 22));

                return D.times(mult, tmp.m.ores[this.id].damage);
            },
            lore: `A chunk of rock containing copper.<br>
                Somewhat tough to break.<br>
                Still contains large amounts of stone.`,
            weight() { return D(4); },
        },
        tin: {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, r]) => r == this)[0]; },
            color() { return tmp.items.tin_ore.color; },
            name: 'tin ore',
            position: [1, 1],
            health() {
                let base = D(15);

                return D.times(base, tmp.m?.modifiers.health.mult);
            },
            damage() { return D.times(tmp.m.modifiers.damage.base, tmp.m.modifiers.damage.mult); },
            damage_per_second() {
                let mult = D.dZero;

                if (hasUpgrade('m', 22) && player.m.target == this.id) mult = mult.add(upgradeEffect('m', 22));

                return D.times(mult, tmp.m.ores[this.id].damage);
            },
            lore: `A chunk of rock containing tin.<br>
                Easy to break.<br>
                Mostly contains stone.`,
            weight() { return D(1); },
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            progress() {
                const target = player.m.target;

                return D.div(player.m.ores[target].health, tmp.m.ores[target].health);
            },
            display() {
                const target = player.m.target;

                return `${format(player.m.ores[target].health)} / ${format(tmp.m.ores[target].health)}`;
            },
            height: 40,
            width: 320,
            fillStyle() {
                const target = player.m.target,
                    backgroundColor = tmp.m.ores[target].color;
                return { backgroundColor, };
            },
            baseStyle: { 'border-radius': 0, },
            borderStyle: { 'border-radius': 0, },
        },
    },
    modifiers: {
        damage: {
            base() {
                let base = D.dZero;

                base = base.add(item_effect('bone_pick').m_damage);

                if (hasUpgrade('m', 11)) base = base.add(upgradeEffect('m', 11));
                if (hasUpgrade('m', 33)) base = base.add(upgradeEffect('m', 33));

                if (hasUpgrade('l', 14)) base = base.add(upgradeEffect('l', 14));

                if (hasAchievement('ach', 54)) base = base.add(achievementEffect('ach', 54));

                return base;
            },
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('m', 12)) mult = mult.times(upgradeEffect('m', 12));

                mult = mult.times(item_effect('stone_mace').m_damage);
                mult = mult.times(item_effect('copper_pick').damage);

                return mult;
            },
        },
        range: {
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('m', 13)) mult = mult.times(upgradeEffect('m', 13));
                if (hasUpgrade('m', 14)) mult = mult.times(upgradeEffect('m', 14)[player.m.target]);
                if (hasUpgrade('m', 24)) mult = mult.times(upgradeEffect('m', 24)[player.m.target]);

                if (hasUpgrade('l', 24)) mult = mult.times(upgradeEffect('l', 24));

                mult = mult.times(item_effect('copper_pick').ores);
                mult = mult.times(item_effect('bronze_cart').m_drop);

                return mult;
            },
        },
        health: {
            mult() { return D.dOne; },
        },
    },
    broken: {
        color: '#8855AA',
        total() { return Object.values(player.m.ores).map(ore => ore.broken).reduce((sum, broken) => D.add(sum, broken), D.dZero); },
    },
    list() { return Object.keys(layers.m.ores).filter(/**@param{ores}ore*/ore => tmp.m.ores[ore].unlocked ?? true); },
    items: ['copper_ore', 'tin_ore', 'gold_nugget'],
    minerals: ['stone', 'copper_ore', 'tin_ore', 'bronze_blend', 'gold_nugget'],
    automate() {
        Object.entries(player.m.ores)
            .forEach(/**@param {[ores, Player['m']['ores'][ores]]}*/([id, data]) => {
                if (D.gt(data.health, tmp.m.ores[id].health)) {
                    data.health = tmp.m.ores[id].health;
                }
                if (D.lte(data.health, 0)) {
                    data.health = tmp.m.ores[id].health;

                    data.broken = D.add(data.broken, 1);

                    // Drops
                    const own = get_source_drops(`mining:${id}`),
                        any = get_source_drops('mining:any'),
                        drops = merge_drops(own, any),
                        equal = drops.length == data.last_drops.length &&
                            drops.every(([item, amount]) => data.last_drops.some(([litem, lamount]) => litem == item && D.eq_tolerance(amount, lamount, 1e-3)));

                    if (equal) {
                        data.last_drops_times = D.add(data.last_drops_times, 1);
                    } else {
                        data.last_drops_times = D.dOne;
                        data.last_drops = drops;
                    }
                    gain_items(drops);

                    player.m.previous = id;
                    player.m.target = random_ore();
                }
            });
    },
    update(diff) {
        Object.values(tmp.m.ores)
            .forEach(ore => {
                const pore = player.m.ores[ore.id];
                if (D.gt(ore.damage_per_second, 0)) {
                    const damage = D.times(ore.damage_per_second, diff);
                    pore.health = D.minus(pore.health, damage);
                }
            });
    },
    doReset(layer) {
        if (tmp[layer].row <= this.row) return;

        const held = D(item_effect('tin_cache').hold).toNumber(),
            /** @type {number[]} */
            upgs = [],
            /** @type {(keyof Player['m'])[]} */
            keep = ['lore', 'previous'];
        if (D.gt(held, 0)) {
            upgs.push(...player.m.upgrades.slice(0, held));
        }

        layerDataReset(this.layer, keep);

        player.m.upgrades.push(...upgs);
    },
});
