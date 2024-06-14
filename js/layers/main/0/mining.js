'use strict';

const ORE_SIZES = {
    width: 2,
    height: 2,
};

addLayer('m', {
    row: 0,
    position: 1,
    type: 'none',
    resource: 'ores',
    name: 'mining',
    symbol: 'M',
    color() { return tmp.m.ores[player.m.current.ore]?.color ?? tmp.m.ores.stone.color; },
    hotkeys: [{
        key: 'M',
        description: 'Shift + M: Display mining layer',
        onPress() { showt('m'); },
        unlocked() { return tmp.m.layerShown; },
    }],
    tooltip() {
        /** @type {items[]} */
        const ores = ['copper_ore', 'tin_ore',],
            sum = ores.map(item => player.items[item].amount)
                .reduce((sum, n) => D.add(sum, n), D.dZero);

        return `${formatWhole(player.items.rock.amount)} rock<br>${formatWhole(sum)} ores`;
    },
    layerShown() { return D.gt(tmp.m.modifiers.damage.total, 0); },
    startData() {
        return {
            unlocked: true,
            current: {
                ore: '',
                progress: D.dZero,
                health: D.dZero,
            },
            ores: Object.fromEntries(Object.keys(layers.m.ores).map(o => [o, {
                broken: D.dZero,
                last_drops: [],
                last_drops_times: D.dZero,
            }])),
        };
    },
    tabFormat: {
        'Mining': {
            content: [
                [
                    'column',
                    () => tmp.m.minerals
                        .map(item => [
                            'display-text',
                            `You have ${resourceColor(tmp.items[item].color, formatWhole(player.items[item].amount), 'font-size:1.5em;')} ${tmp.items[item].name}`
                        ])
                ],
                'blank',
                ['display-text', () => {
                    const current = player.m.current.ore;
                    if (!current) return 'You are mining nothing'

                    return `You are mining ${tmp.m.ores[current].name}`;
                }],
                ['raw-html', () => {
                    const current = player.m.current.ore;
                    if (!current) return '';

                    return `<div style="width: 240px; height: 240px; overflow: hidden">
                            <img src="./resources/images/ores.png"
                                style="width: ${ORE_SIZES.width * 100}%;
                                    height: ${ORE_SIZES.height * 100}%;
                                    margin-left: ${-240 * tmp.m.ores[current].position[0]}px;
                                    margin-top: ${-240 * tmp.m.ores[current].position[1]}px;
                                    image-rendering: crisp-edges;"/>
                        </div>`;
                }],
                ['bar', 'health'],
                'blank',
                'blank',
                ['clickables', [1]],
                'blank',
                ['display-text', () => {
                    const current = player.m.current.ore;
                    if (!current) return '';
                    const damage = tmp.m.ores[current].damage;

                    return `Strike for ${format(damage)} damage`;
                }],
                'blank',
                ['display-text', () => {
                    const current = player.m.current.ore;
                    if (!current) return '';

                    let drops = 'nothing',
                        count = '';
                    const last_drops = player.m.ores[current].last_drops,
                        last_count = player.m.ores[current].last_drops_times;
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${tmp.items[item].name}`));
                    if (last_count.gt(1)) count = ` (${formatWhole(last_count)})`;

                    return `Mined ${drops}${count}`;
                }],
            ],
        },
        'Upgrades': {
            content: [
                [
                    'column',
                    () => tmp.m.minerals
                        .map(item => [
                            'display-text',
                            `You have ${resourceColor(tmp.items[item].color, formatWhole(player.items[item].amount), 'font-size:1.5em;')} ${tmp.items[item].name}`
                        ])
                ],
                'blank',
                'upgrades',
            ],
        },
        'Guide': {
            content: [
                ['display-text', 'Ore information'],
                ['clickables', [2]],
                'blank',
                ['column', () => mining_guide_content(player.m.lore)],
            ],
            unlocked() { return hasUpgrade('m', 24); },
        },
    },
    upgrades: {
        11: {
            title: 'Rockier Rocks',
            description: 'Double ore health',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            item: 'rock',
            cost: D.dTen,
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        12: {
            title: 'Copper Chisel',
            description: 'Add a chance to mine rock when striking an ore',
            effect() {
                let chance = D.div(tmp.m.modifiers.gain.mult, 10);

                if (hasUpgrade('m', 21)) chance = chance.times(upgradeEffect('m', 21).rock);

                return chance;
            },
            effectDisplay() { return `+${format_chance(upgradeEffect(this.layer, this.id))}`; },
            item: 'copper_ore',
            cost: D(5),
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        13: {
            title: 'Tin Gloves',
            description: 'Deal +50% enemy and ore damage',
            effect() { return D(1.5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            item: 'tin_ore',
            cost: D(3),
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        14: {
            title: 'Bronze Extractor',
            description: 'Double items mined',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            item: 'bronze_blend',
            cost: D.dOne,
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        21: {
            title: 'Deeper Drilling',
            description: 'Reduce stone finding chance and increase rock chance from ores',
            effect() {
                return {
                    stone: D.dTwo,
                    rock: D.dTen,
                };
            },
            effectDisplay() {
                return `/${formatWhole(upgradeEffect(this.layer, this.id).stone)},\
                    *${formatWhole(upgradeEffect(this.layer, this.id).rock)}`;
            },
            item: 'rock',
            cost: D(50),
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        22: {
            title: 'Auto Picker',
            description: 'Automatically mine 100% of your damage every second',
            effect() { return D.dOne; },
            effectDisplay() {
                const current = player.m.current.ore;
                if (!current) return '0 /s';

                return `${format(tmp.m.ores[current].damage_per_second)}/s`;
            },
            item: 'copper_ore',
            cost: D(25),
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        23: {
            title: 'Tin Box',
            description() {
                if (!shiftDown) {
                    return 'Tin ore multiplies XP cap';
                }
                let formula = 'log5(tin ore + 10)';

                return `Formula: ${formula}`;
            },
            effect() { return D.add(player.items.tin_ore.amount, 10).log(5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            item: 'tin_ore',
            cost: D(15),
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        24: {
            title: 'Bronze Guide',
            description: 'Double ore gain<br>Unlock the mining guide',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            item: 'bronze_blend',
            cost: D(5),
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        31: {
            title: 'Stone Tablet',
            description() {
                if (!shiftDown) {
                    return 'Rocks divide level costs';
                }
                let formula = 'log10(rocks + 10)';

                return `Formula: ${formula}`;
            },
            effect() { return D.add(player.items.rock.amount, 10).log10(); },
            effectDisplay() { return `/${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            item: 'rock',
            cost: D(250),
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        32: {
            title: 'Copper Hammer',
            description() {
                if (!shiftDown) {
                    return 'Copper ore multiplies enemy and mining damage';
                }
                let formula_enemy = 'log10(copper ore + 10)',
                    formula_mining = 'log5(copper ore + 5)';

                return `Enemy formula: ${formula_enemy}, mining formula: ${formula_mining}`;
            },
            effect() {
                return {
                    enemy: D.add(player.items.copper_ore.amount, 10).log10(),
                    mining: D.add(player.items.copper_ore.amount, 5).log(5),
                };
            },
            effectDisplay() {
                return `*${formatWhole(upgradeEffect(this.layer, this.id).enemy)},\
                    *${formatWhole(upgradeEffect(this.layer, this.id).mining)}`;
            },
            item: 'copper_ore',
            cost: D(125),
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        33: {
            title: 'Tin Rails',
            description() {
                if (!shiftDown) {
                    return 'Tin ore boosts ore drops';
                }
                let formula = 'log10(tin ore + 10)';

                return `Formula: ${formula}`;
            },
            effect() { return D.add(player.items.tin_ore.amount, 10).log10(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            item: 'tin_ore',
            cost: D(75),
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
        34: {
            title: 'Bronze Crafter',
            description() {
                if (!shiftDown) {
                    return 'Crafting materials yield 1 extra item<br>Bronze blends boost crafting speed';
                }
                let formula = 'log3(bronze blend + 3)';

                return `Formula: ${formula}`;
            },
            effect() {
                return {
                    craft: D.dOne,
                    speed: D.add(player.items.bronze_blend.amount, 3).log(3),
                };
            },
            effectDisplay() {
                return `+${formatWhole(upgradeEffect(this.layer, this.id).craft)},\
                    *${format(upgradeEffect(this.layer, this.id).speed)}`;
            },
            item: 'bronze_blend',
            cost: D(25),
            canAfford() { return D.gte(player.items[this.item].amount, tmp[this.layer].upgrades[this.id].cost); },
            pay() { gain_items(this.item, D.neg(tmp[this.layer].upgrades[this.id].cost)); },
            style() {
                if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)) {
                    const color = tmp.items[this.item].color;
                    return {
                        'backgroundColor': color,
                        'color': rgb_opposite_bw(color),
                    };
                }
            },
            currencyDisplayName() { return tmp.items[this.item].name; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10); },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items[this.item]; },
        },
    },
    ores: {
        'stone': {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, o]) => o == this)[0]; },
            name: 'rock',
            position: [0, 0],
            health() {
                let base = D(10);

                return D.times(base, tmp.m.modifiers.health.mult);
            },
            damage() { return tmp.m.modifiers.damage.total; },
            damage_per_second() {
                let passive = D.dZero;

                if (hasUpgrade('m', 22)) passive = D.add(passive, upgradeEffect('m', 22));

                return D.times(passive, tmp.m.ores[this.id].damage);
            },
            lore: `A large chunk of stone.<br>\
                Found everywhere, no matter how deep you dig.`,
            weight() {
                let weight = D(15);

                if (hasUpgrade('m', 21)) weight = weight.div(upgradeEffect('m', 21));

                return weight;
            },
            color() { return tmp.items.rock.color; },
        },
        'copper': {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, o]) => o == this)[0]; },
            name: 'copper',
            position: [0, 1],
            health() {
                let base = D(25);

                return D.times(base, tmp.m.modifiers.health.mult);
            },
            damage() { return tmp.m.modifiers.damage.total; },
            damage_per_second() {
                let passive = D.dZero;

                if (hasUpgrade('m', 22)) passive = D.add(passive, upgradeEffect('m', 22));

                return D.times(passive, tmp.m.ores[this.id].damage);
            },
            lore: `An orange ore.<br>
                Can be used for tools. When refined.<br>
                Found easily without the need to dig deep.`,
            weight: D(4),
            color() { return tmp.items.copper_ore.color; },
        },
        'tin': {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.m.ores).find(([, o]) => o == this)[0]; },
            name: 'tin',
            position: [1, 1],
            health() {
                let base = D(50);

                return D.times(base, tmp.m.modifiers.health.mult);
            },
            damage() { return tmp.m.modifiers.damage.total; },
            damage_per_second() {
                let passive = D.dZero;

                if (hasUpgrade('m', 22)) passive = D.add(passive, upgradeEffect('m', 22));

                return D.times(passive, tmp.m.ores[this.id].damage);
            },
            lore: `A light yellow ore.<br>
                Can be used for jewelry. When refined.<br>
                Found in the same depth as copper, but much more rarely.`,
            weight: D(1),
            color() { return tmp.items.tin_ore.color; },
        },
    },
    modifiers: {
        damage: {
            base() {
                let base = D.dZero;

                base = base.add(item_effect('bone_pick').mining);

                return base;
            },
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('m', 13)) mult = mult.times(upgradeEffect('m', 13));
                if (hasUpgrade('m', 32)) mult = mult.times(upgradeEffect('m', 32).mining);

                mult = mult.times(item_effect('copper_pick').mining);

                return mult;
            },
            total() {
                return D.times(tmp.m.modifiers.damage.base, tmp.m.modifiers.damage.mult)
                    .max(tmp.m.modifiers.damage.min);
            },
            min() {
                let min = D.dZero;

                if (hasAchievement('ach', 64)) min = D.add(min, achievementEffect('ach', 64));

                return min;
            },
        },
        health: {
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('m', 11)) mult = mult.times(upgradeEffect('m', 11));

                mult = mult.times(item_effect('copper_pick').health);

                return mult;
            },
        },
        gain: {
            mult() {
                let mult = D(.01);

                mult = mult.times(D.max(tmp.c.chance_multiplier, 1));

                if (hasUpgrade('m', 24)) mult = mult.times(upgradeEffect('m', 24));
                if (hasUpgrade('m', 33)) mult = mult.times(upgradeEffect('m', 33));

                mult = mult.times(item_effect('tin_belt').mining);
                mult = mult.times(item_effect('bronze_cart').mining);

                return mult;
            },
            break_mult() {
                let mult = D.times(tmp.m.modifiers.gain.mult, 250);

                return mult;
            },
        },
        oxidizing() { return D.div(1, D.add(player.m.resetTime, 100).log(100)); },
    },
    bars: {
        health: {
            direction: RIGHT,
            progress() {
                const selected = player.m.current.ore;
                if (!selected) return 0;

                return D.div(player.m.current.health, tmp.m.ores[selected].health);
            },
            display() {
                const selected = player.m.current.ore;
                if (!selected) return 'You are not currently mining';

                return `${format(player.m.current.health)} / ${format(tmp.m.ores[selected].health)}`;
            },
            height: 40,
            width: 320,
            fillStyle() {
                const selected = player.m.current.ore,
                    prog = D(tmp[this.layer].bars[this.id].progress).clamp(0, 1);
                if (!selected || selected == 'stone' || prog.eq(0)) return { 'backgroundColor': tmp.m.ores.stone.color };

                if (prog.eq(1)) return { 'backgroundColor': tmp.m.ores[selected].color };

                const colors = [
                    rgb_split(tmp.m.ores.stone.color),
                    rgb_split(tmp.m.ores[selected].color),
                ],
                    fraction = prog.toNumber();

                return {
                    'backgroundColor': `#${Array.from(
                        { length: 3 },
                        (_, i) => Math.floor(colors[1][i] * fraction + colors[0][i] * (1 - fraction))
                            .toString(16).padStart(2, '0')
                    ).join('')}`,
                };
            },
            baseStyle: { 'border-radius': 0, },
            borderStyle: { 'border-radius': 0, },
            textStyle: {
                color: '#777777',
            },
        },
    },
    clickables: {
        11: {
            style: {
                width: '180px',
                height: '180px',
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 100}% ${UI_SIZES.height * 100}%`,
                'background-position': '0 -180px',
            },
            onClick() {
                const current = player.m.current;
                if (!current.ore) return;
                const damage = tmp.m.ores[current.ore].damage,
                    data = player.m.ores[current.ore],
                    drops = get_source_drops(`mining:${current.ore}`, damage),
                    equal = drops.length == data.last_drops.length &&
                        drops.every(([item, amount]) => data.last_drops.some(([litem, lamount]) => litem == item && D.eq_tolerance(amount, lamount, 1e-3)));

                if (drops.length) {
                    if (equal) {
                        data.last_drops_times = D.add(data.last_drops_times, 1);
                    } else {
                        data.last_drops_times = D.dOne;
                        data.last_drops = drops;
                    }

                    gain_items(drops);
                }

                player.m.current.health = D.minus(player.m.current.health, damage);
            },
            onHold() {
                const current = player.m.current;
                if (!current.ore) return;
                // About 5 clicks per second
                const damage = D.div(tmp.m.ores[current.ore].damage, 20 / 5),
                    data = player.m.ores[current.ore],
                    drops = get_source_drops(`mining:${current.ore}`, damage),
                    equal = drops.length == data.last_drops.length &&
                        drops.every(([item, amount]) => data.last_drops.some(([litem, lamount]) => litem == item && D.eq_tolerance(amount, lamount, 1e-3)));

                if (drops.length) {
                    if (equal) {
                        data.last_drops_times = D.add(data.last_drops_times, 1);
                    } else {
                        data.last_drops_times = D.dOne;
                        data.last_drops = drops;
                    }

                    gain_items(drops);
                }

                player.m.current.health = D.minus(player.m.current.health, damage);
            },
            canClick() {
                return D.gt(player.m.current.health, 0);
            },
        },
        // Guide
        21: {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-120px -120px',
            },
            onClick() {
                const list = tmp.m.ore_list,
                    i = list.indexOf(player.m.lore);
                player.m.lore = list[i - 1];
            },
            canClick() {
                if (!Array.isArray(tmp.m.ore_list)) return false;
                const i = tmp.m.ore_list.indexOf(player.m.lore);
                return i > 0;
            },
            unlocked() {
                /** @type {monsters[]} */
                const list = tmp.m.ore_list;
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
                const list = tmp.m.ore_list,
                    i = list.indexOf(player.m.lore);
                player.m.lore = list[i + 1];
            },
            canClick() {
                const list = tmp.m.ore_list;
                if (!Array.isArray(list)) return false;
                const i = list.indexOf(player.m.lore);
                return i < list.length - 1;
            },
            unlocked() {
                /** @type {monsters[]} */
                const list = tmp.m.ore_list;
                return list.length > 1;
            },
        },
    },
    minerals: ['rock', 'copper_ore', 'tin_ore', 'bronze_blend',],
    ore_list: ['stone', 'copper', 'tin'],
    automate() {
        const current = player.m.current;
        if (D.lte(current.health, 0)) {
            if (current.ore) {
                player.m.ores[current.ore].broken = D.add(player.m.ores[current.ore].broken);
                const drops = get_source_drops(`mining:${current.ore}:break`),
                    data = player.m.ores[current.ore],
                    equal = drops.length == data.last_drops.length &&
                        drops.every(([item, amount]) => data.last_drops.some(([litem, lamount]) => litem == item && D.eq_tolerance(amount, lamount, 1e-3)));

                if (equal) {
                    data.last_drops_times = D.add(data.last_drops_times, 1);
                } else {
                    data.last_drops_times = D.dOne;
                    data.last_drops = drops;
                }

                gain_items(drops);
            }

            const next = random_ore();
            current.ore = next;
            current.health = tmp.m.ores[next].health;
        }
    },
    update(diff) {
        const current = player.m.current;
        if (current.ore) {
            const dps = tmp.m.ores[current.ore].damage_per_second;
            if (D.gt(dps, 0) && D.gt(current.health, 0)) {
                const damage = D.times(dps, diff),
                    data = player.m.ores[current.ore],
                    drops = get_source_drops(`mining:${current.ore}`, damage),
                    equal = drops.length == data.last_drops.length &&
                        drops.every(([item, amount]) => data.last_drops.some(([litem, lamount]) => litem == item && D.eq_tolerance(amount, lamount, 1e-3)));

                if (drops.length) {
                    if (equal) {
                        data.last_drops_times = D.add(data.last_drops_times, 1);
                    } else {
                        data.last_drops_times = D.dOne;
                        data.last_drops = drops;
                    }
                }

                gain_items(drops);

                current.health = D.minus(current.health, damage);
            }
        }
    },
    doReset(layer) {
        if (tmp[layer].row <= this.row) return;

        /** @type {(keyof Player['m'])[]} */
        const keep = ['lore'];

        layerDataReset(this.layer, keep);
    },
});
