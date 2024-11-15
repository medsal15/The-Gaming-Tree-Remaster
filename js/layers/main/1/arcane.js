'use strict';

addLayer('a', {
    name: 'arcane',
    startData() {
        return {
            points: D.dZero,
            unlocked: true,
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
                //todo display factory (canvas)
            ],
        },
        'Construction': {
            content: [
                ['display-text', () => {
                    let gain = '';
                    if (D.neq_tolerance(tmp.a.modifiers.arca.total, 0, 1e-3)) {
                        gain = ` (+${resourceColor(tmp.a.color, format(tmp.a.modifiers.arca.total))} /s)`
                    }

                    return `You have ${resourceColor(tmp.a.color, formatWhole(player.a.points), 'font-size:1.5em;')} ${tmp.a.resource}${gain}`;
                }],
                'blank',
                //todo display buildings & costs
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
    world: {
        width() { return 5; },
        height() { return 5; },
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
    },
    update(diff) {
        if (D.gt(tmp.a.modifiers.arca.total, 0)) {
            const gain = D.times(tmp.a.modifiers.arca.total, diff);
            addPoints('a', gain);
        }
    },
});
