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
                    let effect, skill;
                    if (shiftDown) {
                        let base = D.dTwo;

                        if (hasUpgrade('l', 33)) base = base.add(upgradeEffect('l', 33));

                        effect = `[${formatWhole(base)} ^ levels]`;
                        skill = '[2 ^ levels - 1]';
                    } else {
                        effect = formatWhole(tmp.l.effect);
                        skill = formatWhole(D.pow(2, player.l.points).minus(1));
                    }

                    return `You have ${resourceColor(tmp.l.color, formatWhole(player.l.points), 'font-size:1.5em;')} levels,\
                        which multiply the XP cap by ${resourceColor(tmp.l.color, effect)}\
                        and grant ${resourceColor(tmp.l.skill_points.color, skill)} skill points`;
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
                    [11, 12, 13, 14],
                    [21, 22, 23, 24],
                    [31, 32, 33, 34],
                    [41, 42, 43, 44],
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
            progress() {
                if (canReset('l')) {
                    const prev = getNextAt('l', false, 'static'),
                        diff = D.minus(getNextAt('l', true, 'static'), prev),
                        prog = D.minus(tmp.l.baseAmount, prev);
                    return D.div(prog, diff);
                }
                return D.div(tmp.l.baseAmount, getNextAt('l', true, 'static'));
            },
            display() { return `${formatWhole(tmp.l.baseAmount)} / ${formatWhole(getNextAt('l', true, 'static'))} experience`; },
            fillStyle: {
                'backgroundColor'() { return tmp.l.color; },
            },
            baseStyle: { 'border-radius': 0, },
            borderStyle: {
                //'border-radius': 0,
                'borderRadius'() {
                    let cap = tmp.xp.modifiers.cap.total;
                    if (D.gt(tmp.m.modifiers.xp.base, 0)) cap = cap.add(tmp.m.modifiers.xp.cap);

                    if (D.lt(cap, getNextAt('l', true, 'static'))) return '10px';
                    return 0;
                },
                'borderColor'() {
                    let cap = tmp.xp.modifiers.cap.total;
                    if (D.gt(tmp.m.modifiers.xp.base, 0)) cap = cap.add(tmp.m.modifiers.xp.cap);

                    if (D.lt(cap, getNextAt('l', true, 'static'))) return '#CC6600';
                },
            },
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

                if (shiftDown) text += '<br>Formula: skills / 4 + 1';

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
        14: {
            title: 'Straight Hit',
            description() {
                let text = 'Skills increase mining damage';

                if (shiftDown) text += '<br>Formula: 2√(skills)';

                return text;
            },
            effect() { return D.sqrt(tmp.l.skill_points.skills); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D.dOne,
            currencyDisplayName: 'skill points',
            canAfford() { return D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            unlocked() { return tmp.m.layerShown; },
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
            canAfford() {
                let thismp = tmp[this.layer].upgrades[this.id];

                if (!Array.isArray(thismp.branches)) return false;

                return thismp.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost);
            },
            pay() { },
            branches() {
                let branches = [11, 12];

                if (hasUpgrade('s', 23)) branches = [this.id - 10];

                return branches;
            },
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
            canAfford() {
                let thismp = tmp[this.layer].upgrades[this.id];

                if (!Array.isArray(thismp.branches)) return false;

                return thismp.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost);
            },
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
            effect() { return D.add(tmp.l.baseAmount, 10).log10(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D.dTwo,
            currencyDisplayName: 'skill points',
            canAfford() {
                let thismp = tmp[this.layer].upgrades[this.id];

                if (!Array.isArray(thismp.branches)) return false;

                return thismp.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost);
            },
            pay() { },
            branches() {
                let branches = [12, 13];

                if (hasUpgrade('s', 23)) branches = [this.id - 10];

                return branches;
            },
        },
        24: {
            title: 'Extra Loot',
            description() {
                let text = 'Levels boost mining drops';

                if (shiftDown) text += '<br>Formula: log2(levels + 3)';

                return text;
            },
            effect() { return D.add(player.l.points, 3).log2(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D.dTwo,
            currencyDisplayName: 'skill points',
            canAfford() {
                let thismp = tmp[this.layer].upgrades[this.id];

                if (!Array.isArray(thismp.branches)) return false;

                return thismp.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost);
            },
            pay() { },
            branches() {
                let branches = [14, 13];

                if (hasUpgrade('s', 23)) branches = [this.id - 10];

                return branches;
            },
            unlocked() { return tmp.m.layerShown; },
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
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
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
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
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
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D(3),
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [22, 23],
        },
        34: {
            title: 'Bronze Level',
            description() {
                let text = 'Bronze blend reduces level costs';

                if (shiftDown) text += '<br>Formula: log10(bronze blend + 10)';

                return text;
            },
            effect() { return D.add(player.items.bronze_blend.amount, 10).log10(); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D(3),
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [23, 24],
            unlocked() { return tmp.m.layerShown; },
        },
        41: {
            title: 'Wizardry',
            description() {
                let text = 'Levels give extra arca';

                if (shiftDown) text += '<br>Formula: levels';

                return text;
            },
            effect() { return player.l.points; },
            effectDisplay() { return `+${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D(4),
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [31, 32],
            unlocked() { return tmp.a.layerShown; },
        },
        42: {
            title: 'Denser Levels',
            description() {
                let text = 'Compressor runs lower level costs';

                if (shiftDown) text += '<br>Formula: log2(runs + 2)';

                return text;
            },
            effect() { return D.add(player.m.compactor.runs, 2).log2(); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D(4),
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches().every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches() {
                let branches = [32];
                if (!tmp.a.layerShown) branches.push(31);
                return branches;
            },
            unlocked() { return tmp.a.layerShown; },
        },
        43: {
            title: 'Electrum Level',
            description() {
                let text = 'Electrum blend boost skill point amount';

                if (shiftDown) text += '<br>Formula: log2(electrum blend + 2)';

                return text;
            },
            effect() { return D.add(player.items.electrum_blend.amount, 2).log2(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D(4),
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [33, 34],
            unlocked() { return hasUpgrade('m', 61); },
        },
        44: {
            title: 'Level Efficiency',
            description() {
                let text = 'Levels divide arca consumption';

                if (shiftDown) text += '<br>Formula: levels / 10 + 1';

                return text;
            },
            effect() { return D.div(player.l.points, 10).add(1); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                let style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['backgroundColor'] = tmp.l.skill_points.color;

                return style;
            },
            cost: D(4),
            currencyDisplayName: 'skill points',
            canAfford() { return this.branches.every(id => hasUpgrade('l', id)) && D.gte(tmp.l.skill_points.remaining, tmp[this.layer].upgrades[this.id].cost); },
            pay() { },
            branches: [34],
            unlocked() { return tmp.a.layerShown; },
        },
    },
    type: 'static',
    baseResource: 'experience',
    baseAmount() {
        let amount = player.xp.points;

        if (D.gt(tmp.m.modifiers.xp.gain, 0)) amount = D.add(amount, player.m.experience);

        return amount;
    },
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
            let points = D.pow(2, player.l.points).minus(1);

            if (hasAchievement('ach', 34)) points = points.add(achievementEffect('ach', 34));

            points = points.add(tmp.a.spells.rank.effect.skill_point);

            if (hasUpgrade('l', 43)) points = points.times(upgradeEffect('l', 43));

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

            return skills;
        },
    },
    onPrestige(gain) {
        if (D.gt(gain, 1)) giveAchievement('ach', 22);
        if (D.lte(player.xp.points, 0)) giveAchievement('ach', 101);
    },
    gainMult() {
        let mult = D.dOne;

        if (hasUpgrade('l', 22)) mult = mult.times(upgradeEffect('l', 22));
        if (hasUpgrade('l', 32)) mult = mult.div(upgradeEffect('l', 32));
        if (hasUpgrade('l', 34)) mult = mult.div(upgradeEffect('l', 34));
        if (hasUpgrade('l', 42)) mult = mult.div(upgradeEffect('l', 42));

        if (hasUpgrade('xp', 42)) mult = mult.div(upgradeEffect('xp', 42));
        if (hasUpgrade('xp', 61)) mult = mult.div(upgradeEffect('xp', 61));

        if (hasUpgrade('m', 31)) mult = mult.div(upgradeEffect('m', 31));

        mult = mult.div(tmp.a.spells.rank.effect.level_cost);

        if (hasUpgrade('dea', 13)) mult = mult.div(upgradeEffect('dea', 13));
        if (hasUpgrade('dea', 33)) mult = mult.div(upgradeEffect('dea', 33));

        mult = mult.div(item_effect('slime_injector').level);
        mult = mult.div(item_effect('bone_slate').level);
        mult = mult.div(item_effect('tin_cache').level);
        mult = mult.div(item_effect('bug_pheromones').level_div);

        return mult;
    },
    automate() {
        // Remove most recent upgrade until we run out
        if (D.lt(tmp.l.skill_points.total, 0)) player.l.upgrades.pop();
    },
});
