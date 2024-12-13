'use strict';

addLayer('dea', {
    displayRow: 'side',
    row: 1,
    position: 1,
    // Allows for resets
    type: 'static',
    baseAmount: D.dZero,
    requires: D.dOne,
    hotkeys: [{
        key: 'd',
        description: 'D: Die and repeat the cycle',
        onPress() { if (tmp.dea.layerShown) clickClickable('dea', 11); },
        unlocked() { return tmp.dea.layerShown; },
    }],
    resource: 'deaths',
    symbol: '💀',
    color: '#555555',
    startData() {
        return {
            unlocked: true,
            points: D.dZero,
            health: D(100),
            karma: D.dZero,
            souls: D.dZero,
        };
    },
    tooltip() { return `${formatWhole(player.dea.points)} deaths<br>${formatWhole(player.dea.karma)} karma<br>${formatWhole(player.dea.souls)} souls`; },
    layerShown() { return inChallenge('b', 31); },
    tabFormat: {
        'Afterlife': {
            content: [
                ['display-text', () => `You have died ${resourceColor(tmp.dea.color, formatWhole(player.dea.points), 'font-size:1.5em;')} times`],
                ['display-text', () => {
                    let karma_gain = shiftDown ? `[${tmp.dea.currencies.karma.formula}]` : formatWhole(tmp.dea.currencies.karma.reset_gain),
                        souls_gain = shiftDown ? `[${tmp.dea.currencies.souls.formula}]` : formatWhole(tmp.dea.currencies.souls.reset_gain);

                    return `You have ${resourceColor(tmp.dea.currencies.karma.color, formatWhole(player.dea.karma), 'font-size:1.5em;')}
                        (+${resourceColor(tmp.dea.currencies.karma.color, karma_gain)})
                        ${tmp.dea.currencies.karma.name} and
                        ${resourceColor(tmp.dea.currencies.souls.color, formatWhole(player.dea.souls), 'font-size:1.5em;')}
                        (+${resourceColor(tmp.dea.currencies.souls.color, souls_gain)})
                        ${tmp.dea.currencies.souls.name}`;
                }],
                () => { if (D.lte(player.dea.health, 0)) return ['display-text', `You're dead and cannot do anything in row 0`]; },
                'blank',
                ['clickable', 11],
                'blank',
                ['row', [
                    ['display-text', 'Health:'],
                    'blank',
                    ['layer-proxy', ['xp', [['bar', 'player_health']]]],
                ]],
            ],
            prestigeNotify() { return D.lte(player.dea.health, 0); },
        },
        'Karma': {
            content: [
                ['display-text', () => {
                    const cur = tmp.dea.currencies.karma;
                    return `You have ${resourceColor(cur.color, formatWhole(player.dea.karma), 'font-size:1.5em;')} ${cur.name}`;
                }],
                'blank',
                'buyables',
            ],
            buttonStyle: {
                borderColor() { return tmp.dea.currencies.karma.color; },
            },
            shouldNotify() { return canAffordLayerBuyable('dea'); },
        },
        'Souls': {
            content: [
                ['display-text', () => {
                    const cur = tmp.dea.currencies.souls;
                    return `You have ${resourceColor(cur.color, formatWhole(player.dea.souls), 'font-size:1.5em;')} ${cur.name}`;
                }],
                'blank',
                'upgrades',
            ],
            buttonStyle: {
                borderColor() { return tmp.dea.currencies.souls.color; },
            },
            shouldNotify() { return canAffordLayerUpgrade('dea'); },
        },
    },
    clickables: {
        11: {
            title: 'Samsara',
            display() {
                const cur = tmp.dea.currencies;

                let text = `Reset the loop of life and death.<br>
                    You will earn ${formatWhole(cur.karma.reset_gain)} ${cur.karma.name} and ${formatWhole(cur.souls.reset_gain)} ${cur.souls.name}<br>
                    Does a row 1 reset`;
                if (D.gt(player.dea.health, 0)) text += `<br><br>You're not dead yet`;
                return text;
            },
            canClick() { return D.lte(player.dea.health, 0); },
            onClick() {
                player.dea.health = tmp.dea.player.health;
                player.dea.karma = D.add(player.dea.karma, tmp.dea.currencies.karma.reset_gain);
                player.dea.souls = D.add(player.dea.souls, tmp.dea.currencies.souls.reset_gain);
                player.dea.survives = D.dZero;
                addPoints('dea', 1);
                doReset('dea', true);
                player.wor.position = [12, 12];
            },
        },
    },
    buyables: {
        11: {
            title: 'Karmic Health',
            display() {
                let effect = shiftDown ? '[amount * 5]' : formatWhole(buyableEffect(this.layer, this.id)),
                    cost = shiftDown ? '[1.5 ^ amount * 10]' : format(tmp[this.layer].buyables[this.id].cost);

                return `Increase player health by ${effect}<br><br>
                    Cost: ${cost} karma`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.pow(1.5, x).times(10);
            },
            canAfford() { return D.gte(player.dea.karma, tmp[this.layer].buyables[this.id].cost); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.times(x, 5);
            },
            buy() {
                if (!this.canAfford()) return;

                player.dea.karma = D.minus(player.dea.karma, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
        },
        12: {
            title: 'Karmic Defense',
            display() {
                let effect = shiftDown ? '[1.1 ^ amount]' : format(buyableEffect(this.layer, this.id)),
                    cost = shiftDown ? '[2 ^ amount * 15]' : format(tmp[this.layer].buyables[this.id].cost);

                return `Divide damage taken by ${effect}<br><br>
                        Cost: ${cost} karma`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.pow(2, x).times(15);
            },
            canAfford() { return D.gte(player.dea.karma, tmp[this.layer].buyables[this.id].cost); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.pow(1.1, x);
            },
            buy() {
                if (!this.canAfford()) return;

                player.dea.karma = D.minus(player.dea.karma, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
        },
        13: {
            title: 'Karmic Retribution',
            display() {
                let effect = shiftDown ? '[amount / 4]' : format(buyableEffect(this.layer, this.id)),
                    cost = shiftDown ? '[1.75 ^ amount * 20]' : format(tmp[this.layer].buyables[this.id].cost);

                return `Increase damage dealt by ${effect}<br><br>
                        Cost: ${cost} karma`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.pow(1.75, x).times(20);
            },
            canAfford() { return D.gte(player.dea.karma, tmp[this.layer].buyables[this.id].cost); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.div(x, 4);
            },
            buy() {
                if (!this.canAfford()) return;

                player.dea.karma = D.minus(player.dea.karma, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
        },
        21: {
            title: 'Karmic Unhealth',
            display() {
                let effect = shiftDown ? '[amount * deaths / 10]' : format(buyableEffect(this.layer, this.id)),
                    cost = shiftDown ? '[2 ^ amount * 50]' : format(tmp[this.layer].buyables[this.id].cost);

                return `Increase player health by ${effect}<br><br>
                    Cost: ${cost} karma`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.pow(2, x).times(50);
            },
            canAfford() { return D.gte(player.dea.karma, tmp[this.layer].buyables[this.id].cost); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.times(x, player.dea.points).div(10);
            },
            buy() {
                if (!this.canAfford()) return;

                player.dea.karma = D.minus(player.dea.karma, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
        },
        22: {
            title: 'Karmic Resilience',
            display() {
                let effect = shiftDown ? '[log10(karma + 10) ^ amount]' : format(buyableEffect(this.layer, this.id)),
                    cost = shiftDown ? '[2.5 ^ amount * 75]' : format(tmp[this.layer].buyables[this.id].cost);

                return `Divide damage taken by ${effect}<br><br>
                        Cost: ${cost} karma`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.pow(2.5, x).times(75);
            },
            canAfford() { return D.gte(player.dea.karma, tmp[this.layer].buyables[this.id].cost); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.add(player.dea.karma, 10).log10().pow(x);
            },
            buy() {
                if (!this.canAfford()) return;

                player.dea.karma = D.minus(player.dea.karma, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
        },
        23: {
            title: 'Karmic Knowledge',
            display() {
                let effect = shiftDown ? '[10√(souls + 1) ^ amount]' : format(buyableEffect(this.layer, this.id)),
                    cost = shiftDown ? '[2.25 ^ amount * 100]' : format(tmp[this.layer].buyables[this.id].cost);

                return `Multiply XP gain by ${effect}<br><br>
                        Cost: ${cost} karma`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.pow(2.25, x).times(100);
            },
            canAfford() { return D.gte(player.dea.karma, tmp[this.layer].buyables[this.id].cost); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.add(player.dea.souls, 1).root(10).pow(x);
            },
            buy() {
                if (!this.canAfford()) return;

                player.dea.karma = D.minus(player.dea.karma, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
        },
        31: {
            title: 'Leveled Health',
            display() {
                let effect = shiftDown ? '[amount * levels * 2.5]' : format(buyableEffect(this.layer, this.id)),
                    cost = shiftDown ? '[2.5 ^ amount * 150]' : format(tmp[this.layer].buyables[this.id].cost);

                return `Increase player health by ${effect}<br><br>
                    Cost: ${cost} karma`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.pow(2.5, x).times(150);
            },
            canAfford() { return D.gte(player.dea.karma, tmp[this.layer].buyables[this.id].cost); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.times(x, player.l.points).times(2.5);
            },
            buy() {
                if (!this.canAfford()) return;

                player.dea.karma = D.minus(player.dea.karma, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
        },
        32: {
            title: 'Karmic Deconstruction',
            display() {
                let effect = shiftDown ? '[luck ^ amount]' : format(buyableEffect(this.layer, this.id)),
                    cost = shiftDown ? '[3 ^ amount * 200]' : format(tmp[this.layer].buyables[this.id].cost);

                return `Divide damage taken by ${effect}<br><br>
                        Cost: ${cost} karma`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.pow(3, x).times(200);
            },
            canAfford() { return D.gte(player.dea.karma, tmp[this.layer].buyables[this.id].cost); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.max(tmp.c.chance_multiplier, 1).pow(x);
            },
            buy() {
                if (!this.canAfford()) return;

                player.dea.karma = D.minus(player.dea.karma, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
        },
        33: {
            title: 'Karmic Regeneration',
            display() {
                let effect = shiftDown ? '[amount / 10]' : format(buyableEffect(this.layer, this.id)),
                    cost = shiftDown ? '[2.75 ^ amount * 300]' : format(tmp[this.layer].buyables[this.id].cost);

                return `Increase health regeneration by ${effect}<br><br>
                        Cost: ${cost} karma`;
            },
            cost(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.pow(2.75, x).times(300);
            },
            canAfford() { return D.gte(player.dea.karma, tmp[this.layer].buyables[this.id].cost); },
            effect(x) {
                if (tmp[this.layer].deactivated) x = D.dZero;

                return D.div(x, 10);
            },
            buy() {
                if (!this.canAfford()) return;

                player.dea.karma = D.minus(player.dea.karma, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
        },
    },
    upgrades: {
        11: {
            title: 'Undying Damage',
            description: 'Double damage dealt',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(3),
            currencyDisplayName() { return tmp.dea.currencies.souls.name; },
            currencyLocation() { return player.dea; },
            currencyInternalName: 'souls',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.dea.currencies.souls.color,
                    };
                }
            },
        },
        12: {
            title: 'Undead Driller',
            description() {
                if (!tmp.m.layerShown) return 'This upgrade has no effect';
                return 'Add 1 to mining damage';
            },
            effect() { return D.dOne; },
            effectDisplay() { return `+${formatWhole(upgradeEffect(this.layer, this.id))}`; },
            cost: D(7),
            currencyDisplayName() { return tmp.dea.currencies.souls.name; },
            currencyLocation() { return player.dea; },
            currencyInternalName: 'souls',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.dea.currencies.souls.color,
                    };
                }
            },
        },
        13: {
            title: 'Resurrected Levels',
            description: 'Halve level costs',
            effect() { return D.dTwo; },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(15),
            currencyDisplayName() { return tmp.dea.currencies.souls.name; },
            currencyLocation() { return player.dea; },
            currencyInternalName: 'souls',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.dea.currencies.souls.color,
                    };
                }
            },
        },
        21: {
            title: 'Dying Health',
            description() {
                let text = 'Deaths reduces enemy health';

                if (shiftDown) text += '<br>Formula: log3(deaths + 3)';

                return text;
            },
            effect() { return D.add(player.dea.points, 3).log(3); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(30),
            currencyDisplayName() { return tmp.dea.currencies.souls.name; },
            currencyLocation() { return player.dea; },
            currencyInternalName: 'souls',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.dea.currencies.souls.color,
                    };
                }
            },
        },
        22: {
            title: 'Death Chance',
            description() {
                let text = 'Player health boosts luck';

                if (shiftDown) text += '<br>Formula: log10(health + 10)';

                return text;
            },
            effect() { return D.add(player.dea.health, 10).log10(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(50),
            currencyDisplayName() { return tmp.dea.currencies.souls.name; },
            currencyLocation() { return player.dea; },
            currencyInternalName: 'souls',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.dea.currencies.souls.color,
                    };
                }
            },
        },
        23: {
            title: 'Last Point',
            description: 'Survive once after taking fatal damage',
            effect() { return D.dOne; },
            cost: D(70),
            currencyDisplayName() { return tmp.dea.currencies.souls.name; },
            currencyLocation() { return player.dea; },
            currencyInternalName: 'souls',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.dea.currencies.souls.color,
                    };
                }
            },
        },
        31: {
            title: 'Six Feet Under',
            description() {
                let text = 'Deaths reduces ore health';

                if (shiftDown) text += '<br>Formula: log6(deaths + 6)';

                return text;
            },
            effect() { return D.add(player.dea.points, 6).log(6); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(100),
            currencyDisplayName() { return tmp.dea.currencies.souls.name; },
            currencyLocation() { return player.dea; },
            currencyInternalName: 'souls',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.dea.currencies.souls.color,
                    };
                }
            },
        },
        32: {
            title: 'Lower Goals',
            description: 'Lower looting requirements',
            effect() { return D(.9); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id).pow(-1))}`; },
            cost: D(150),
            currencyDisplayName() { return tmp.dea.currencies.souls.name; },
            currencyLocation() { return player.dea; },
            currencyInternalName: 'souls',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.dea.currencies.souls.color,
                    };
                }
            },
        },
        33: {
            title: 'Self Replication',
            description() {
                let text = 'Soul upgrades lower level costs';

                if (shiftDown) text += '<br>Formula: upgrades + 1';

                return text;
            },
            effect() { return D.add(player.dea.upgrades.length, 1); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(200),
            currencyDisplayName() { return tmp.dea.currencies.souls.name; },
            currencyLocation() { return player.dea; },
            currencyInternalName: 'souls',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.dea.currencies.souls.color,
                    };
                }
            },
        },
    },
    monsters: {
        'slime': {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.dea.monsters).find(mon => layers.dea.monsters[mon] == this); },
            damage() {
                const mod = tmp.dea.modifiers.damage;
                let damage = D.add(tmp.xp.monsters[this.id].level, 0);

                damage = damage.add(mod.base);
                damage = damage.times(mod.mult);

                return damage.max(0);
            },
        },
        'skeleton': {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.dea.monsters).find(mon => layers.dea.monsters[mon] == this); },
            damage() {
                const mod = tmp.dea.modifiers.damage;
                let damage = D.add(tmp.xp.monsters[this.id].level, 1);

                damage = damage.add(mod.base);
                damage = damage.times(mod.mult);

                return damage.max(0);
            },
        },
        'golem': {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.dea.monsters).find(mon => layers.dea.monsters[mon] == this); },
            damage() {
                const mod = tmp.dea.modifiers.damage;
                let damage = D.add(tmp.xp.monsters[this.id].level, 1);

                damage = damage.add(mod.base);
                damage = damage.times(mod.mult);
                damage = damage.pow(1.25);

                return damage.max(0);
            },
        },
        'bug': {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.dea.monsters).find(mon => layers.dea.monsters[mon] == this); },
            damage() {
                const mod = tmp.dea.modifiers.damage;
                let damage = D.add(tmp.xp.monsters[this.id].level, 2);

                damage = damage.add(mod.base);
                damage = damage.times(mod.mult);
                damage = damage.pow(1.5);

                return damage.max(0);
            },
        },
    },
    player: {
        health() {
            if (!tmp.dea) return D.dZero;
            const mod = tmp.dea.modifiers.health;
            return D.times(mod.base, mod.mult);
        },
        regen() {
            const mod = tmp.dea.modifiers.regen;
            return D.times(mod.base, mod.mult);
        },
        survives() {
            let survives = D.dZero;

            if (hasUpgrade('dea', 23)) survives = survives.add(upgradeEffect('dea', 23));

            return survives;
        },
    },
    modifiers: {
        damage: {
            base() {
                let base = D.dZero;

                return base;
            },
            mult() {
                let mult = D.dOne;

                mult = mult.div(buyableEffect('dea', 12));
                mult = mult.div(buyableEffect('dea', 22));
                mult = mult.div(buyableEffect('dea', 32));

                return mult;
            },
        },
        health: {
            base() {
                let base = D.dTen;

                base = base.add(buyableEffect('dea', 11));
                base = base.add(buyableEffect('dea', 21));
                base = base.add(buyableEffect('dea', 31));

                return base;
            },
            mult() { return D.dOne; },
        },
        regen: {
            base() {
                let base = D.dZero;

                base = base.add(buyableEffect('dea', 33));

                return base;
            },
            mult() { return D.dOne; },
        },
    },
    currencies: {
        karma: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.dea.currencies).find(cur => layers.dea.currencies[cur] == this); },
            color: '#0055AA',
            name: 'karma',
            reset_gain() { return D.sqrt(player.xp.points); },
            formula: '2√(experience)',
        },
        souls: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.dea.currencies).find(cur => layers.dea.currencies[cur] == this); },
            color: '#AA0055',
            name: 'souls',
            reset_gain() { return D.sqrt(tmp.xp.kill.total); },
            formula: '2√(kills)',
        },
    },
    update(diff) {
        if (inChallenge('b', 31) && D.lte(player.dea.health, 0)) return;

        const regen = D.times(tmp.dea.player.regen, diff);
        player.dea.health = D.add(player.dea.health, regen);
    },
    automate() {
        if (D.gt(player.dea.health, tmp.dea.player.health)) {
            player.dea.health = tmp.dea.player.health;
        }

        if (hasChallenge('b', 51)) {
            if (player.a.automation.dea.samsara && D.lte(player.dea.health, 0)) {
                clickClickable('dea', 11);
            }
            if (player.a.automation.dea.buyables) Object.keys(tmp.dea.buyables)
                .filter(id => typeof tmp.dea.buyables[id] == 'object')
                .forEach(id => { if (canBuyBuyable('dea', id)) buyBuyable('dea', id); });
        }
    },
    prestigeNotify() { return D.lte(player.dea.health, 0); },
    autoUpgrade() { return hasChallenge('b', 51) && player.a.automation.dea.upgrades; },
});
