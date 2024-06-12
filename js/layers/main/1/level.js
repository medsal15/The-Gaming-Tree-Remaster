'use strict';

addLayer('l', {
    row: 1,
    position: 0,
    type: 'static',
    canBuyMax: true,
    baseResource: 'experience',
    baseAmount() { return player.xp.points; },
    requires: D(1_000),
    exponent: D.dTwo,
    base: D.dTwo,
    roundUpCost: true,
    name: 'level',
    resource: 'levels',
    color: '#11BBCC',
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            total: D.dZero,
            best: D.dZero,
        };
    },
    effect() {
        let base = D.dTwo,
            points = player.l.points;

        if (hasAchievement('ach', 25)) points = points.add(achievementEffect('ach', 25));

        if (hasUpgrade('l', 13)) base = base.add(upgradeEffect('l', 13));

        return {
            cap: D.pow(base, points),
        };
    },
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
    branches: ['xp'],
    layerShown() { return hasUpgrade('xp', 33) || player.l.unlocked; },
    tabFormat: {
        'Skills': {
            content: [
                ['display-text', () => `You have ${resourceColor(tmp.l.color, formatWhole(player.l.points), 'font-size:1.5em;')} levels`],
                ['display-text', () => {
                    let effect;
                    if (shiftDown) {
                        effect = '2 ^ levels';
                        if (hasUpgrade('l', 13)) effect = '3 ^ level';
                        effect = `[${effect}]`;
                    } else {
                        effect = format(tmp.l.effect.cap);
                    }
                    return `Your levels multiply the XP cap by ${resourceColor(tmp.l.color, effect)}`;
                }],
                'blank',
                ['row', [
                    ['bar', 'level'],
                    'blank',
                    'prestige-button',
                ]],
                'blank',
                ['display-text', () => {
                    return `You have ${resourceColor(tmp.l.skill.color, formatWhole(tmp.l.skill.points.left), 'font-size:1.2em;')}\
                        /${resourceColor(tmp.l.skill.color, formatWhole(tmp.l.skill.points.total))} skill points`;
                }],
                'blank',
                'respec-button',
                ['upgrade-tree',
                    [
                        [11, 12, 13],
                        [21, 22, 23],
                        [31, 33, 32],
                    ]
                ],
            ],
        },
    },
    buyables: {
        respec() {
            player.l.upgrades.length = 0;
            doReset('l', true);
        },
        respecText: 'Respec skills',
    },
    upgrades: {
        11: {
            title: 'XP Bonus',
            cost: D.dOne,
            description() {
                if (!shiftDown) {
                    return 'Levels boost XP gain';
                }
                let formula = 'levels / 8 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                let base = player.l.points;
                if (hasUpgrade('l', 32)) base = base.add(upgradeEffect('l', 32));
                return D.div(base, 8).add(1);
            },
            effectDisplay() { return `*${upgradeEffect(this.layer, this.id)}`; },
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill.points.left, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
        },
        12: {
            title: 'Limit Passer',
            cost: D.dOne,
            description() {
                if (!shiftDown) {
                    return 'Levels increase XP cap';
                }
                let formula = 'levels / 4 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                let base = player.l.points;
                if (hasUpgrade('l', 32)) base = base.add(upgradeEffect('l', 32));
                return D.div(base, 4).add(1);
            },
            effectDisplay() { return `*${upgradeEffect(this.layer, this.id)}`; },
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill.points.left, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
        },
        13: {
            title: 'Basic Boost',
            cost: D.dOne,
            description: 'Increase level effect by 1',
            effect() { return D.dOne },
            effectDisplay() { return `+${upgradeEffect(this.layer, this.id)}`; },
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill.points.left, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
        },
        21: {
            title: 'Spinblade',
            cost: D.dTwo,
            description: 'Double damage',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill.points.left, tmp[this.layer].upgrades[this.id].cost) && this.branches.every(id => hasUpgrade(this.layer, id)); },
            pay() { },
            branches: [11],
        },
        22: {
            title: 'Genius Mind',
            cost: D.dTwo,
            description() {
                if (!shiftDown) {
                    return 'XP boosts XP cap';
                }
                let formula = 'log10(XP + 10)';

                return `Formula: ${formula}`;
            },
            effect() { return D.add(player.xp.points, 10).log10(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill.points.left, tmp[this.layer].upgrades[this.id].cost) && this.branches.every(id => hasUpgrade(this.layer, id)); },
            pay() { },
            branches: [11, 12],
        },
        23: {
            title: 'Level Down',
            cost: D.dTwo,
            description() {
                if (tmp.xp.monster_list.length > 1) return '-25% enemy health';
                return '-25% slime health';
            },
            effect() { return D(.75); },
            effectDisplay() { return `*${upgradeEffect(this.layer, this.id)}`; },
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill.points.left, tmp[this.layer].upgrades[this.id].cost) && this.branches.every(id => hasUpgrade(this.layer, id)); },
            pay() { },
            branches: [13],
        },
        31: {
            title: 'Superskill',
            cost: D.dTwo,
            description: '+50% skill point amount',
            effect() { return D(1.5); },
            effectDisplay() { return `*${upgradeEffect(this.layer, this.id)}`; },
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill.points.left, tmp[this.layer].upgrades[this.id].cost) && this.branches.every(id => hasUpgrade(this.layer, id)); },
            pay() { },
            branches: [21, 22],
        },
        32: {
            title: 'Recycle',
            description: 'Level-based upgrades also count upgrades',
            cost: D.dTwo,
            effect() { return D(player.l.upgrades.length); },
            effectDisplay() { return `+${upgradeEffect(this.layer, this.id)}`; },
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill.points.left, tmp[this.layer].upgrades[this.id].cost) && this.branches.every(id => hasUpgrade(this.layer, id)); },
            pay() { },
            branches: [22, 23],
        },
        33: {
            title: 'Luck+',
            cost: D.dTwo,
            description() {
                if (!shiftDown) {
                    return 'Levels boost luck';
                }
                let formula = 'levels / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                let base = player.l.points;
                if (hasUpgrade('l', 32)) base = base.add(upgradeEffect('l', 32));
                return D.div(base, 10).add(1);
            },
            effectDisplay() { return `*${upgradeEffect(this.layer, this.id)}`; },
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill.points.left, tmp[this.layer].upgrades[this.id].cost) && this.branches.every(id => hasUpgrade(this.layer, id)); },
            pay() { },
            branches: [22],
        },
    },
    bars: {
        level: {
            direction: RIGHT,
            display() { return `${formatWhole(tmp.l.baseAmount)} / ${formatWhole(getNextAt('l', true))} XP`; },
            width: 320,
            height: 60,
            progress() { return D.div(tmp.l.baseAmount, getNextAt('l', true)); },
            fillStyle() {
                const colors = [
                    [0xCC, 0x11, 0xBB],
                    [0x11, 0xBB, 0xCC],
                    [0xBB, 0xCC, 0x11],
                ],
                    shifts = D.log2(getResetGain('l')).toNumber();
                // Gainmult breaks it during loading
                if (isNaN(shifts)) return { 'backgroundColor': tmp.l.color };
                const i0 = Math.floor(shifts % colors.length),
                    i1 = (i0 + 1) % colors.length,
                    fraction = shifts % 1,
                    backgroundColor = `#${Array.from({ length: 3 }, (_, i) => (colors[i0][i] * fraction + colors[i1][i] * (1 - fraction)).toString(16).padStart(2, '0')).join('')}`;
                return { backgroundColor, };
            },
        },
    },
    skill: {
        color: '#66CCDD',
        points: {
            total() {
                let points = player.l.points;

                if (hasAchievement('ach', 22)) points = points.add(achievementEffect('ach', 22));

                if (hasUpgrade('l', 31)) points = points.times(upgradeEffect('l', 31));

                return points.floor();
            },
            left() {
                const costs = player.l.upgrades.map(id => tmp.l.upgrades[id].cost)
                    .reduce((sum, cost) => D.add(sum, cost), D.dZero);

                return D.minus(tmp.l.skill.points.total, costs);
            },
        },
    },
    gainMult() {
        let mult = D.dOne;

        mult = mult.div(item_effect('slime_page').level);

        return mult;
    },
    onPrestige(gain) { if (D.gt(gain, 1)) giveAchievement('ach', 41); },
});
