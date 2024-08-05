'use strict';

addLayer('l', {
    name: 'level',
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
        };
    },
    color: '#0066CC',
    row: 1,
    resource: 'level',
    effect() {
        let base = D.dTwo,
            levels = player.l.points;

        if (hasUpgrade('l', 33)) base = base.add(upgradeEffect('l', 33));

        if (hasAchievement('ach', 35)) levels = levels.add(achievementEffect('ach', 35));

        return D.pow(base, player.l.points);
    },
    layerShown() { return player.l.unlocked || hasUpgrade('xp', 33); },
    tooltip() { return `${formatWhole(player.l.points)} levels<br>${formatWhole(tmp.l.skill_points.remaining)} skill points`; },
    hotkeys: [
        {
            key: 'L',
            description: 'Shift + L: Display level layer',
            onPress() { if (player.l.unlocked) showTab('l'); },
            unlocked() { return player.l.unlocked; },
        },
        {
            key: 'l',
            description: 'L: Reset for levels',
            onPress() { if (player.l.unlocked) doReset('l'); },
            unlocked() { return player.l.unlocked; },
        },
    ],
    tabFormat: {
        'Levels': {
            content: [
                ['display-text', () => {
                    let effect;
                    if (shiftDown) {
                        let base = D.dTwo;

                        if (hasUpgrade('l', 33)) base = base.add(upgradeEffect('l', 33));

                        effect = `[${formatWhole(base)} ^ levels]`;
                    } else effect = formatWhole(tmp.l.effect);

                    return `You have ${resourceColor(tmp.l.color, formatWhole(player.l.points), 'font-size:1.5em;')} levels,\
                        which multiply the XP cap by ${resourceColor(tmp.l.color, effect)}`;
                }],
                'blank',
                ['row', [
                    ['bar', 'progress'],
                    'blank',
                    'prestige-button'
                ]],
                'blank',
                ['display-text', () => {
                    const sp = tmp.l.skill_points;

                    return `You have ${resourceColor(sp.color, formatWhole(sp.remaining), 'font-size:1.5em;')}\
                        /${resourceColor(sp.color, formatWhole(sp.total))} skill points`;
                }],
                'blank',
                'respec-button',
                ['upgrade-tree', [
                    [11, 12, 13],
                    [21, 22, 23],
                    [31, 32, 33],
                ]],
            ],
        },
    },
    buyables: {
        respec() {
            player.l.upgrades.length = 0;
            doReset('l', true);
        },
        showRespec: true,
        respecMessage: 'Are you sure you want to respec skill upgrades?\nThis will perform a level reset',
        respecText: 'Respec skill upgrades',
    },
    bars: {
        progress: {
            direction: RIGHT,
            height: 40,
            width: 320,
            progress() { return D.div(tmp.l.baseAmount, getNextAt('l', true, 'static')); },
            display() { return `${formatWhole(tmp.l.baseAmount)} / ${formatWhole(getNextAt('l', true, 'static'))} experience`; },
            fillStyle: {
                'backgroundColor'() { return tmp.l.color; },
            },
            baseStyle: { 'border-radius': 0, },
            borderStyle: { 'border-radius': 0, },
        },
    },
    upgrades: {
        11: {
            title: 'Simple Stab',
            description: 'Deal +1 base damage',
            effect() { return D.dOne; },
            effectDisplay() { return `+${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D.dOne,
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
        },
        12: {
            title: 'Success Knowledge',
            description: 'Gain +25% experience',
            effect() { return D(1.25); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D.dOne,
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
        },
        13: {
            title: 'Higher Limit',
            description() {
                let text = 'Skills increase experience cap';

                if (shiftDown) text += 'Formula: skills / 4 + 1';

                return text;
            },
            effect() { return D.div(tmp.l.skill_points.skills, 4).add(1); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D.dOne,
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
        },
        21: {
            title: 'Spin Blade',
            description: 'Double damage dealt',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D.dTwo,
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [11, 12],
        },
        22: {
            title: 'Unhealthy Levels',
            description: 'Health multipliers affect level',
            effect() { return tmp.xp.modifiers.health.mult; },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id).pow(-1))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D.dTwo,
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [12],
        },
        23: {
            title: 'Dynamic Boundary',
            description() {
                let text = 'Experience boosts experience cap';

                if (shiftDown) text += '<br>Formula: log10(experience + 10)';

                return text;
            },
            effect() { return D.add(player.xp.points, 10).log10(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D.dTwo,
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [12, 13],
        },
        31: {
            title: 'Lifesteal',
            description() {
                let text = 'Enemy max health boosts damage';

                if (shiftDown) text += '<br>Formula: log10(max health + 1)';

                return text;
            },
            effect() {
                return Object.fromEntries(
                    Object.values(tmp.xp.monsters)
                        .map(mon => [mon.id, D.add(mon.health, 1).log10()])
                );
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id)[player.xp.selected])}`; },
            cost: D(3),
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [21],
        },
        32: {
            title: 'Level Down',
            description() {
                let text = 'Total enemy levels divide level cost';

                if (shiftDown) text += '<br>Formula: 2√(∑(levels - 1) + 1)';

                return text;
            },
            effect() {
                return Object.values(tmp.xp.monsters).map(mon => (mon.unlocked ?? true) ? D.minus(mon.level, 1) : D.dZero)
                    .reduce((sum, level) => D.add(sum, level), D.dZero).add(1).root(2);
            },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(3),
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [22],
        },
        33: {
            title: 'Extra Base',
            description: 'Level effect base +1',
            effect() { return D.dOne; },
            effectDisplay() { return `+${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            cost: D(3),
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [22, 23],
        },
    },
    type: 'static',
    baseResource: 'experience',
    baseAmount() { return player.xp.points; },
    requires: D(750),
    exponent: D.dTwo,
    base: D(1.75),
    roundUpCost: true,
    canBuyMax: true,
    symbol: 'L',
    position: 0,
    branches: ['xp'],
    skill_points: {
        color: '#00CCCC',
        total() {
            let points = player.l.points;

            if (hasAchievement('ach', 34)) points = points.add(achievementEffect('ach', 34));

            return points.floor();
        },
        remaining() {
            const spent = player.l.upgrades.map(id => {
                const upg = tmp.l.upgrades[id];
                if (upg.currencyDisplayName == 'skill points') return upg.cost;
                return D.dZero;
            }).reduce((sum, cost) => D.add(sum, cost), D.dZero);

            return D.minus(this.total(), spent);
        },
        skills() {
            let skills = D(player.l.upgrades.length);

            if (hasUpgrade('clo', 21)) skills = skills.add(1);

            return skills;
        },
    },
    onPrestige(gain) {
        if (D.gt(gain, 1)) giveAchievement('ach', 22);
    },
    gainMult() {
        let mult = D.dOne;

        if (hasUpgrade('l', 22)) mult = mult.times(upgradeEffect('l', 22));
        if (hasUpgrade('l', 32)) mult = mult.div(upgradeEffect('l', 32));

        if (hasUpgrade('m', 31)) mult = mult.div(upgradeEffect('m', 31));

        mult = mult.div(item_effect('slime_injector').level);
        mult = mult.div(item_effect('bone_slate').level);
        mult = mult.div(item_effect('tin_cache').level);

        return mult;
    },
});
