'use strict';

addLayer('a', {
    name: 'arcane',
    startData() {
        return {
            unlocked: true,
            chains: Object.fromEntries(Object.keys(layers.c.recipes).map(id => [id, {
                built: D.dZero,
                time: D.dZero,
            }])),
            cycle_time: D.dZero,
            spells: Object.fromEntries(Object.keys(layers.a.spells).map(id => [id, {
                cast: D.dZero,
                time: D.dZero,
            }])),
        };
    },
    tooltip() { return `${formatWhole(tmp.a.modifiers.arca.total)} arca`; },
    row: 1,
    position: 2,
    type: 'none',
    symbol: 'A',
    color: '#9966CC',
    resource: 'arca',
    layerShown() { return D.gte(player.items.arcane_generator.amount, 1) || hasAchievement('ach', 121); },
    hotkeys: [{
        key: 'A',
        description: 'Shift + A: Display level layer',
        onPress() { if (tmp.a.layerShown) showTab('a'); },
        unlocked() { return tmp.a.layerShown; },
    }],
    tabFormat: {
        'Factory': {
            content: [
                ['display-text', () => {
                    const total = tmp.a.modifiers.arca.gain.total,
                        available = tmp.a.modifiers.arca.total;

                    return `You have ${resourceColor(tmp.a.color, format(available), 'font-size:1.5em')} / \
                        ${resourceColor(tmp.a.color, format(total), 'font-size:1.5em;')} ${tmp.a.resource}`;
                }],
                'blank',
                ['bar', 'cycle'],
                ['display-text', () => `Every ${formatTime(tmp.a.modifiers.cycle.duration)}, progress production by ${formatTime(tmp.a.modifiers.cycle.time)}`],
                'blank',
                ['microtabs', 'factory'],
            ],
        },
        'Spells': {
            content: [
                ['display-text', () => {
                    const total = tmp.a.modifiers.arca.gain.total,
                        available = tmp.a.modifiers.arca.total;

                    return `You have ${resourceColor(tmp.a.color, format(available), 'font-size:1.5em')} / \
                        ${resourceColor(tmp.a.color, format(total), 'font-size:1.5em;')} ${tmp.a.resource}`;
                }],
                'blank',
                ['column', () => arcane_show_spells()],
            ],
        },
        'Transmutation': {
            content: [
                ['display-text', () => {
                    const total = tmp.a.modifiers.arca.gain.total,
                        available = tmp.a.modifiers.arca.total;

                    return `You have ${resourceColor(tmp.a.color, format(available), 'font-size:1.5em')} / \
                        ${resourceColor(tmp.a.color, format(total), 'font-size:1.5em;')} ${tmp.a.resource}`;
                }],
                'blank',
                //todo display recipes
            ],
        },
    },
    branches: ['c'],
    microtabs: {
        factory: { ...arcane_subtabs_factory(), },
    },
    bars: {
        cycle: {
            direction: RIGHT,
            progress() { return D.div(player.a.cycle_time, tmp.a.modifiers.cycle.duration); },
            height() {
                if (D.lte(player.items.disco_ball.amount, 0)) return 10;
                return 20;
            },
            width: 320,
            fillStyle: {
                backgroundColor() { return tmp.a.color; },
            },
            display() {
                if (player.items.disco_ball.amount.gt(0)) {
                    return `${formatWhole(D.div(60, tmp.a.modifiers.cycle.duration))} BPM`;
                }
            },
        },
    },
    chains: {
        electrum_coin_mold: {
            items: [
                ['extractor', D.dTwo],
                ['inserter', D.dOne],
                ['combiner', D.dOne],
            ]
        },
    },
    upkeep: {
        'extractor': D(.1),
        'inserter': D(.1),
        'combiner': D(.5),
        'smelter': D(.5),
    },
    modifiers: {
        arca: {
            gain: {
                base() {
                    let base = D.dZero;

                    if (hasUpgrade('l', 41)) base = base.add(upgradeEffect('l', 41));

                    base = base.add(tmp.a.spells.convertion.effect.arca);

                    base = base.add(item_effect('arcane_generator').arcane);
                    base = base.add(item_effect('factory_core').arcane);

                    return base;
                },
                mult() {
                    let mult = D.dOne;

                    mult = mult.times(tmp.a.spells.bossardry.effect.arca);

                    return mult;
                },
                total() {
                    const mods = tmp.a.modifiers.arca.gain;
                    return D.times(mods.base, mods.mult);
                },
            },
            loss: {
                base() {
                    let base = D.dZero;

                    Object.entries(player.a.chains).forEach(([chain, phain]) => {
                        if (D.lte(phain.built, 0)) return;


                        const trecipe = tmp.c.recipes[chain],
                            thain = tmp.a.chains[chain],
                            /** @type {[items, Decimal][]} */
                            cost = thain?.items ?? [
                                ['extractor', D(trecipe.consumes.length)],
                                ['inserter', D(trecipe.produces.length)],
                                [D.gt(trecipe.heat, 0) ? 'smelter' : 'combiner', D.dOne],
                            ],
                            upkeep = cost.map(([item, amount]) => D.times(tmp.a.upkeep[item] ?? 0, amount))
                                .reduce((sum, upkeep) => D.add(sum, upkeep), D.dZero).times(mult);

                        base = base.add(upkeep);
                    });

                    Object.entries(player.a.spells).forEach(([spell, pell]) => {
                        if (D.lte(pell.time, 0)) return;

                        const cost = tmp.a.spells[spell].cost;

                        base = base.add(cost);
                    });

                    return base;
                },
                mult() {
                    let mult = D.dOne;

                    if (hasUpgrade('l', 44)) mult = mult.div(upgradeEffect('l', 44));

                    return mult;
                },
                total() {
                    const mods = tmp.a.modifiers.arca.loss;
                    return D.times(mods.base, mods.mult);
                },
            },
            total() { return D.minus(tmp.a.modifiers.arca.gain.total, tmp.a.modifiers.arca.loss.total); },
        },
        cycle: {
            duration() {
                let duration = D(5);

                duration = duration.div(tmp.a.spells.speed.effect.cycle_duration);

                return duration;
            },
            time() {
                let time = D(2.5);

                time = time.times(tmp.a.spells.speed.effect.cycle_time);

                return time;
            },
        },
        spell: {
            cost_mult() {
                let mult = D.dOne;

                if (hasUpgrade('l', 44)) mult = mult.div(upgradeEffect('l', 44));

                return mult;
            },
            duration_mult() { return D.dOne; },
        },
    },
    spells: {
        convertion: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.a.spells).find(id => layers.a.spells[id] == this); },
            name: 'XP convertion',
            cost: D.dZero,
            duration() { return D.times(90, tmp.a.modifiers.spell.duration_mult); },
            effect(active) {
                active ??= D.gt(player.a.spells[this.id].time, 0) && D.gte(tmp.a.modifiers.arca.total, 0);

                let xp_loss = D.dZero,
                    m_xp_loss = D.dZero,
                    arca = D.dZero;

                if (active) {
                    xp_loss = D.div(player.xp.points, 20);
                    m_xp_loss = D.div(player.m.experience, 20);
                    arca = D.add(player.xp.points, player.m.experience).add(1).log10();
                }

                return { xp_loss, m_xp_loss, arca, };
            },
            effectDescription(active) {
                const effect = this.effect(active);

                let xp_loss = shiftDown ? '[XP / 20]' : format(effect.xp_loss),
                    m_xp_loss = shiftDown ? '[XP / 20]' : format(effect.m_xp_loss),
                    arca = shiftDown ? '[log10(XP + 1)]' : format(effect.arca),
                    m_txt = D.gt(tmp.m.modifiers.xp.base, 0) ? ` and ${m_xp_loss} mining XP` : '';

                return `Lose ${xp_loss} XP${m_txt} per second, gain ${arca} arca`;
            },
        },
        drain: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.a.spells).find(id => layers.a.spells[id] == this); },
            name: 'drain',
            cost() { return D.times(1.5, tmp.a.modifiers.spell.cost_mult); },
            duration() { return D.times(60, tmp.a.modifiers.spell.duration_mult); },
            effect(active) {
                active ??= D.gt(player.a.spells[this.id].time, 0) && D.gte(tmp.a.modifiers.arca.total, 0);

                let damage_mult = D.dOne,
                    xp_passive = D.dZero;

                if (active) {
                    damage_mult = D.dZero;
                    xp_passive = D.div(tmp.a.modifiers.arca.total, 20);
                }

                return { damage_mult, xp_passive, };
            },
            effectDescription(active) {
                const effect = this.effect(active);

                let xp_passive = shiftDown ? '[arca / 20]' : `${formatWhole(D.times(effect.xp_passive, 100))}%`;

                return `Multiply enemy damage by ${formatWhole(effect.damage_mult)}, and increase passive xp by ${xp_passive}`;
            },
        },
        acid: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.a.spells).find(id => layers.a.spells[id] == this); },
            name: 'acid melt',
            cost() { return D.times(1, tmp.a.modifiers.spell.cost_mult); },
            duration() { return D.times(60, tmp.a.modifiers.spell.duration_mult); },
            effect(active) {
                active ??= D.gt(player.a.spells[this.id].time, 0) && D.gte(tmp.a.modifiers.arca.total, 0);

                let def_div = D.dOne,
                    ore_health_div = D.dOne;

                if (active) {
                    def_div = D.dTwo;
                    ore_health_div = D.dTwo;
                }

                return { def_div, ore_health_div, };
            },
            effectDescription(active) {
                const effect = this.effect(active);

                return `Divide enemy defense by ${formatWhole(effect.def_div)} and ore health by ${formatWhole(effect.ore_health_div)}`;
            },
        },
        lava: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.a.spells).find(id => layers.a.spells[id] == this); },
            name: 'lava flow',
            cost() { return D.times(1, tmp.a.modifiers.spell.cost_mult); },
            duration() { return D.times(30, tmp.a.modifiers.spell.duration_mult); },
            effect(active) {
                active ??= D.gt(player.a.spells[this.id].time, 0) && D.gte(tmp.a.modifiers.arca.total, 0);

                let vein_size = D.dOne,
                    heat_gain = D.dZero;

                if (active) {
                    vein_size = D.dTwo;
                    heat_gain = D(.5);
                }

                return { vein_size, heat_gain, };
            },
            effectDescription(active) {
                const effect = this.effect(active);

                return `Multiply vein size by ${formatWhole(effect.vein_size)}, and increase heat gain by ${format(effect.heat_gain)}`;
            },
        },
        rank: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.a.spells).find(id => layers.a.spells[id] == this); },
            name: 'ranking',
            cost() { return D.times(2, tmp.a.modifiers.spell.cost_mult); },
            duration() { return D.times(60, tmp.a.modifiers.spell.duration_mult); },
            effect(active) {
                active ??= D.gt(player.a.spells[this.id].time, 0) && D.gte(tmp.a.modifiers.arca.total, 0);

                let level_cost = D.dOne,
                    skill_point = D.dZero;

                if (active) {
                    level_cost = D.dTwo;
                    skill_point = D.dOne;
                }

                return { level_cost, skill_point, };
            },
            effectDescription(active) {
                const effect = this.effect(active);

                return `Divide level cost by ${formatWhole(effect.level_cost)}, and increase skill points by ${formatWhole(effect.skill_point)}`;
            },
        },
        magic_hands: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.a.spells).find(id => layers.a.spells[id] == this); },
            name: 'magic hands',
            cost() { return D.times(1.5, tmp.a.modifiers.spell.cost_mult); },
            duration() { return D.times(60, tmp.a.modifiers.spell.duration_mult); },
            effect(active) {
                active ??= D.gt(player.a.spells[this.id].time, 0) && D.gte(tmp.a.modifiers.arca.total, 0);

                let crafting_speed = D.dOne;

                if (active) {
                    crafting_speed = D.dTwo;
                }

                return { crafting_speed, };
            },
            effectDescription(active) {
                const effect = this.effect(active);

                return `Multiplies crafting speed by ${formatWhole(effect.crafting_speed)}`;
            },
        },
        fireburn: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.a.spells).find(id => layers.a.spells[id] == this); },
            name: 'fireburn',
            cost() { return D.times(2, tmp.a.modifiers.spell.cost_mult); },
            duration() { return D.times(60, tmp.a.modifiers.spell.duration_mult); },
            effect(active) {
                active ??= D.gt(player.a.spells[this.id].time, 0) && D.gte(tmp.a.modifiers.arca.total, 0);

                let forge_speed = D.dOne,
                    heat_mult = D.dOne;

                if (active) {
                    forge_speed = D.dTwo;
                    heat_mult = D.dTwo;
                }

                return { forge_speed, heat_mult, };
            },
            effectDescription(active) {
                const effect = this.effect(active);

                return `Multiplies forging speed by ${formatWhole(effect.forge_speed)} and heat gain by ${formatWhole(effect.heat_mult)}`;
            },
        },
        speed: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.a.spells).find(id => layers.a.spells[id] == this); },
            name: 'speed',
            cost() { return D.times(2, tmp.a.modifiers.spell.cost_mult); },
            duration() { return D.times(60, tmp.a.modifiers.spell.duration_mult); },
            effect(active) {
                active ??= D.gt(player.a.spells[this.id].time, 0) && D.gte(tmp.a.modifiers.arca.total, 0);

                let cycle_duration = D.dOne,
                    cycle_time = D.dOne;

                if (active) {
                    cycle_duration = D.dTwo;
                    cycle_time = D.dTwo;
                }

                return { cycle_duration, cycle_time, };
            },
            effectDescription(active) {
                const effect = this.effect(active);

                return `Divide time between cycles by ${formatWhole(effect.cycle_duration)}, and multiply cycle time by ${formatWhole(effect.cycle_time)}`;
            },
        },
        bossardry: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.a.spells).find(id => layers.a.spells[id] == this); },
            name: 'bossardry',
            cost() { return D.times(1, tmp.a.modifiers.spell.cost_mult); },
            duration() { return D.times(120, tmp.a.modifiers.spell.duration_mult); },
            effect(active) {
                active ??= D.gt(player.a.spells[this.id].time, 0) && D.gte(tmp.a.modifiers.arca.total, 0);

                let arca = D.dOne;

                if (active) {
                    arca = D.div(tmp.b.groups.boss.completions, 5).add(1);
                }

                return { arca, };
            },
            effectDescription(active) {
                const effect = this.effect(active),
                    arca = shiftDown ? '[main bosses / 5 + 1]' : format(effect.arca);

                return `Multiplies arca by ${arca}`;
            },
        },
        thaumconomics: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.a.spells).find(id => layers.a.spells[id] == this); },
            name: 'thaumconomics',
            cost() { return D.times(2.5, tmp.a.modifiers.spell.cost_mult); },
            duration() { return D.times(60, tmp.a.modifiers.spell.duration_mult); },
            effect(active) {
                active ??= D.gt(player.a.spells[this.id].time, 0) && D.gte(tmp.a.modifiers.arca.total, 0);

                let value_gain = D.dZero,
                    craft_speed = D.dOne,
                    forge_speed = D.dOne;

                if (active) {
                    value_gain = Object.values(tmp.s.items)
                        .filter(data => ('value' in data) && (tmp.items[data.id].unlocked ?? true) && D.gt(player.items[data.id].amount, 0))
                        .reduce((sum, data) => D.times(data.value, player.items[data.id].amount).add(sum), D.dZero)
                        .div(100);
                    craft_speed = D(2.5);
                    forge_speed = D(2.5);
                }

                return { value_gain, craft_speed, forge_speed, };
            },
            effectDescription(active) {
                const effect = this.effect(active),
                    coins = value_coin(effect.value_gain);
                if (coins.length == 0) coins.push(['coin_copper', D.dZero]);
                const list = listFormat.format(coins.map(([item, amount]) => `${format(amount)} ${tmp.items[item].name}`));

                return `Gain ${list} every second, but divide crafting speed by ${format(effect.craft_speed, 1)} and forging speed by ${format(effect.forge_speed, 1)}`;
            },
        },
    },
    update(diff) {
        player.a.cycle_time = D.add(player.a.cycle_time, diff);

        if (D.gt(player.a.spells.convertion.time, 0)) {
            const eff = tmp.a.spells.convertion.effect,
                xp_loss = D.times(eff.xp_loss, diff),
                m_xp_loss = D.times(eff.m_xp_loss, diff);

            addPoints('xp', xp_loss.neg());
            player.m.experience = D.minus(player.m.experience, m_xp_loss);
        }

        if (D.gt(player.a.spells.thaumconomics.time, 0)) {
            const eff = tmp.a.spells.thaumconomics.effect,
                coins = value_coin(eff.value_gain);
            if (coins.length) gain_items(coins);
        }

        Object.values(player.a.spells).forEach(spell => {
            if (D.gt(spell.time, 0)) spell.time = D.minus(spell.time, diff).max(0);
        });
    },
    automate() {
        if (D.gte(player.a.cycle_time, tmp.a.modifiers.cycle.duration)) {
            player.a.cycle_time = D.minus(player.a.cycle_time, tmp.a.modifiers.cycle.duration)

            Object.entries(player.a.chains).forEach(([chain, phain]) => {
                if (D.lte(phain.built, 0) || D.lte(tmp.a.modifiers.arca.total, 0)) return;

                const trecipe = tmp.c.recipes[chain],
                    thain = tmp.a.chains[chain],
                    /** Actual elapsed time, including the amount of chains built */
                    mult = D.times(tmp.a.modifiers.cycle.time, phain.built),
                    continuous = thain?.continuous ?? (D.gt(trecipe.heat, 0) || D.lte(trecipe.duration, 0));

                if (trecipe.manual ?? false) return;

                if (continuous && crafting_can(chain, mult)) {
                    // Give and take
                    gain_items(trecipe.produces.map(([item, cost]) => [item, cost.times(mult)]));
                    gain_items(trecipe.consumes.map(([item, cost]) => [item, cost.neg().times(mult)]));
                    player.c.recipes[chain].crafted = D.add(player.c.recipes[chain].crafted, mult);
                } else if (D.gte(phain.time, D.times(trecipe.duration, thain?.time_multiplier ?? 1))) {
                    // We've worked long enough, time to give something
                    gain_items(trecipe.produces);
                    player.c.recipes[chain].crafted = D.add(player.c.recipes[chain].crafted, 1);
                    phain.time = D.dZero;
                } else if (D.gt(phain.time, 0)) {
                    // We've already consumed items, just work the time
                    phain.time = D.add(phain.time, mult);
                } else if (D.lte(phain.time, 0) && crafting_can(chain, 1)) {
                    // We can craft one of the item
                    phain.time = mult;
                    gain_items(trecipe.consumes.map(([item, cost]) => [item, cost.neg()]));
                }
            });
        }
    },
    doReset(layer) {
        if (tmp[layer].row <= this.row) return;

        /** @type {(keyof Player['c'])[]} */
        const keep = [],
            /** @type {[string, {built:Decimal}][]} */
            built = Object.entries(player.a.chains).map(([id, data]) => [id, { built: data.built }]);

        layerDataReset(this.layer, keep);
        built.forEach(([id, data]) => player.a.chains[id].built = data.built);
    },
});
