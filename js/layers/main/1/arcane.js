'use strict';

addLayer('a', {
    name: 'arcane',
    startData() {
        return {
            points: D.dZero,
            unlocked: true,
            chains: Object.fromEntries(Object.keys(layers.c.recipes).map(id => [id, {
                built: D.dZero,
                time: D.dZero,
            }])),
        };
    },
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
                    const per_second = tmp.a.modifiers.arca.total;
                    let gain_txt = '';
                    if (D.neq_tolerance(per_second, 0, 1e-3)) {
                        const sign = D.gt(per_second, 0) ? '+' : '';
                        gain_txt = ` (${sign}${resourceColor(tmp.a.color, format(per_second))} /s)`
                    }

                    return `You have ${resourceColor(tmp.a.color, formatWhole(player.a.points), 'font-size:1.5em;')} ${tmp.a.resource}${gain_txt}`;
                }],
                ['display-text', () => {
                    let div;

                    if (shiftDown) {
                        div = `[${tmp.a.modifiers.arca.gain.div_formula}]`;
                    } else {
                        div = `/${format(tmp.a.modifiers.arca.gain.div)}`;
                    }

                    return `<span class="warning">Your arca is dividing its own gain by ${resourceColor(rgb_negative(tmp.a.color), div)}</span>`;
                }],
                'blank',
                ['microtabs', 'factory'],
            ],
        },
        'Spells': {
            content: [
                ['display-text', () => {
                    let gain = '';
                    if (D.neq_tolerance(tmp.a.modifiers.arca.total, 0, 1e-3)) {
                        gain = ` (+${resourceColor(tmp.a.color, format(tmp.a.modifiers.arca.total))} /s)`
                    }

                    return `You have ${resourceColor(tmp.a.color, formatWhole(player.a.points), 'font-size:1.5em;')} ${tmp.a.resource}${gain}`;
                }],
                'blank',
                //todo display spells
            ],
        },
        'Transmutation': {
            content: [
                ['display-text', () => {
                    let gain = '';
                    if (D.neq_tolerance(tmp.a.modifiers.arca.total, 0, 1e-3)) {
                        gain = ` (+${resourceColor(tmp.a.color, format(tmp.a.modifiers.arca.total))} /s)`
                    }

                    return `You have ${resourceColor(tmp.a.color, formatWhole(player.a.points), 'font-size:1.5em;')} ${tmp.a.resource}${gain}`;
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

                    base = base.add(item_effect('arcane_generator').arcane);

                    return base;
                },
                mult() {
                    let mult = D.dOne;

                    return mult;
                },
                div() { return D.max(player.a.points, 2).log2(); },
                div_formula: 'log2(max(arca, 2))',
                total() {
                    const mods = tmp.a.modifiers.arca.gain;
                    return D.times(mods.base, mods.mult).div(mods.div);
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

                        base = base.times(upkeep);
                    });

                    return base;
                },
                mult() {
                    let mult = D.dOne;

                    return mult;
                },
                total() {
                    const mods = tmp.a.modifiers.arca.loss;
                    return D.times(mods.base, mods.mult);
                },
            },
            total() { return D.minus(tmp.a.modifiers.arca.gain.total, tmp.a.modifiers.arca.loss.total); },
        },
        chain: {
            time_mult() { return D(2.5); },
        },
    },
    spells: {
        /**
         * TODO
         *
         * acid: /defense
         * convertion: XP -> arca
         */
    },
    update(diff) {
        if (D.gt(tmp.a.modifiers.arca.gain.total, 0)) {
            const gain = D.times(tmp.a.modifiers.arca.total, diff);
            addPoints('a', gain);
        }

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
                /** Actual elapsed time, including the amount of chains built */
                mult = D.times(diff, phain.built),
                upkeep = cost.map(([item, amount]) => D.times(tmp.a.upkeep[item] ?? 0, amount))
                    .reduce((sum, upkeep) => D.add(sum, upkeep), D.dZero).times(mult).times(tmp.a.modifiers.arca.loss.mult);

            // Not enough arca to work
            if (D.gt(upkeep, player.a.points)) return;

            addPoints('a', upkeep.neg());

            const continuous = thain?.continuous ?? (D.gt(trecipe.heat, 0) || D.lte(trecipe.duration, 0));
            if (continuous && crafting_can(chain, mult)) {
                // Give a little, take a little
                gain_items(trecipe.produces.map(([item, cost]) => [item, cost.times(mult)]));
                gain_items(trecipe.consumes.map(([item, cost]) => [item, cost.neg().times(mult)]));
                player.c.recipes[chain].crafted = D.add(player.c.recipes[chain].crafted, mult);
            } else if (D.gte(phain.time, D.times(trecipe.duration, thain?.time_multiplier ?? tmp.a.modifiers.chain.time_mult))) {
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
