'use strict';

addLayer('clo', {
    row: 'side',
    position: 1,
    type: 'none',
    resource: 'time',
    symbol: '⏲️',
    color: '#DDAA55',
    startData() {
        return {
            unlocked: true,
        };
    },
    layerShown() { return inChallenge('b', 31) || hasChallenge('b', 31); },
    tooltip() { return `Time speed: ${format(tmp.clo.time_speed)}`; },
    tabFormat: {
        'Clockwork': {
            content: [
                ['display-text', () => `Time speed: *${format(tmp.clo.time_speed)}`],
                'blank',
                ['upgrade-tree', [
                    [11, 12],
                ]],
            ],
        },
    },
    upgrades: {
        /** @type {CurrencyUpgrade<Player['xp'], 'clo'>} */
        11: {
            title() {
                if (!tmp[this.layer].upgrades[this.id].show) return '??? Connector';
                return 'Experience Connector';
            },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked with XP layer`;
                }

                let text = 'Kills boost time speed';

                if (shiftDown) text += '<br>Formula: log10(kills + 10)';

                return text;
            },
            show() { return hasUpgrade(this.layer, this.id) || tmp.xp.layerShown; },
            effect() {
                let effect = D.add(tmp.xp.kill.total, 10).log10();
                if (inChallenge('b', 31)) effect = effect.pow(2);
                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(1200),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.xp.color,
                    };
                }
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            currencyDisplayName: 'experience',
            currencyInternalName: 'points',
            currencyLocation() { return player.xp; },
        },
        /** @type {CurrencyUpgrade<Player['items'][items], 'clo'>} */
        12: {
            title() {
                if (!tmp[this.layer].upgrades[this.id].show) return '??? Connector';
                return 'Mining Connector';
            },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked with M layer`;
                }

                let text = 'Broken ores boost time speed';

                if (shiftDown) text += '<br>Formula: log10(broken ores + 10)';

                return text;
            },
            show() { return hasUpgrade(this.layer, this.id) || tmp.m.layerShown; },
            effect() {
                let effect = D.add(tmp.m.broken.total, 10).log10();
                if (inChallenge('b', 31)) effect = effect.pow(2);
                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(600),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.m.color,
                    };
                }
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            currencyDisplayName() { return tmp.items.stone.name; },
            currencyInternalName: 'amount',
            currencyLocation() { return player.items.stone; },
        },
        //todo 13
        /** @type {CurrencyUpgrade<Temp['l']['skill_points'], 'clo'>} */
        21: {
            title() {
                if (!tmp[this.layer].upgrades[this.id].show) return '??? Connector';
                return 'Level Connector';
            },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked with L layer`;
                }

                let text = 'Skills boost time speed<br>This upgrade counts as a skill';

                if (shiftDown) text += '<br>Formula: 2√(skills + 1)';

                return text;
            },
            show() { return hasUpgrade(this.layer, this.id) || tmp.l.layerShown; },
            effect() {
                let effect = D.add(tmp.l.skill_points.skills, 1).sqrt();
                if (inChallenge('b', 31)) effect = effect.pow(2);
                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(1200),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.l.color,
                    };
                }
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            currencyDisplayName: 'skill points',
            currencyInternalName: 'remaining',
            currencyLocation() { return tmp.l.skill_points; },
            branches: [11],
        },
        /** @type {CurrencyUpgrade<Player['c']['buyables'], 'clo'>} */
        22: {
            title() {
                if (!tmp[this.layer].upgrades[this.id].show) return '??? Connector';
                return 'Crafting Connector';
            },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked with C layer`;
                }

                let text = 'Total crafts boost time speed';

                if (shiftDown) text += '<br>Formula: log10(Total crafts + 10)';

                return text;
            },
            show() { return hasUpgrade(this.layer, this.id) || tmp.c.layerShown; },
            effect() {
                let effect = D.add(tmp.c.crafting.crafted, 10).log10();
                if (inChallenge('b', 31)) effect = effect.pow(2);
                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
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
                    return {
                        'backgroundColor': tmp.c.color,
                    };
                }
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            currencyDisplayName: 'levels of looting',
            currencyInternalName: '11',
            currencyLocation() { return player.c.buyables; },
            branches: [11, 12],
        },
        //todo 23
        /** @type {Upgrade'clo'>} */
        31: {
            title() {
                if (!tmp[this.layer].upgrades[this.id].show) return '??? Connector';
                return 'Boss Connector';
            },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked with B layer`;
                }

                let text = 'Bosses defeated boost time speed';

                if (shiftDown) text += '<br>Formula: bosses / 10 + 1';

                return text;
            },
            show() { return hasUpgrade(this.layer, this.id) || tmp.xp.layerShown; },
            effect() {
                let effect = D.add(tmp.b.groups.boss.completions, tmp.b.groups.mini.completions).div(10).add(1);
                if (inChallenge('b', 31)) effect = effect.pow(2);
                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(0),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.b.color,
                    };
                }
            },
            costDisplay: 'Free!',
            pay() { },
        },
        //todo 32 (shop & coins)
        //todo 33
    },
    time_speed() {
        if (!tmp[this.layer].layerShown) return D.dOne;

        let speed = D.dOne;

        if (inChallenge('b', 31)) speed = speed.div(1000);

        if (hasUpgrade('clo', 11)) speed = speed.times(upgradeEffect('clo', 11));
        if (hasUpgrade('clo', 12)) speed = speed.times(upgradeEffect('clo', 12));
        if (hasUpgrade('clo', 21)) speed = speed.times(upgradeEffect('clo', 21));
        if (hasUpgrade('clo', 22)) speed = speed.times(upgradeEffect('clo', 22));
        if (hasUpgrade('clo', 31)) speed = speed.times(upgradeEffect('clo', 31));

        return speed;
    },
});
