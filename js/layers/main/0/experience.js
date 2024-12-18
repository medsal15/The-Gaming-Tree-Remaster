'use strict';

const MONSTER_SIZES = {
    width: 4,
    height: 4,
};
addLayer('xp', {
    row: 0,
    position: 0,
    type: 'none',
    resource: 'experience',
    name: 'experience',
    symbol: 'XP',
    color() {
        if (player.xp.selected) return tmp.xp.monsters[player.xp.selected].color;
        else return tmp.xp.monsters.slime.color;
    },
    tooltip() {
        let text = `${formatWhole(player.xp.points)} experience`;
        if (D.gte(player.xp.points, tmp.xp.modifiers.cap.total)) text += ' (capped)';
        text += `<br>${formatWhole(tmp.xp.kill.total)} kills`;
        return text;
    },
    startData() {
        return {
            unlocked: true,
            points: D.dZero,
            best: D.dZero,
            total: D.dZero,
            selected: 'slime',
            lore: 'slime',
            attack_time_selected: D.dZero,
            attack_time_all: D.dZero,
            monsters: Object.fromEntries(Object.keys(layers.xp.monsters)
                .map(mon => [mon, {
                    kills: D.dZero,
                    health: D(100),
                    last_drops: [],
                    last_drops_times: D.dZero,
                }])),
        };
    },
    hotkeys: [{
        key: 'X',
        description: 'Shift + X: Display XP layer',
        onPress() { showTab('xp'); },
    }],
    tabFormat: {
        'Enemy': {
            content: [
                ['display-text', () => {
                    const selected = player.xp.selected,
                        color = tmp.xp.color,
                        cap = tmp.xp.modifiers.cap,
                        /** @type {string[]} */
                        gain_extra = [];

                    if (selected) {
                        const gain = D.min(tmp.xp.monsters[selected].experience, cap.gain);
                        gain_extra.push(`+${resourceColor(color, format(gain))}`);
                    }
                    if (D.gt(tmp.xp.modifiers.xp.passive.total, 0)) {
                        const gain = D.min(tmp.xp.modifiers.xp.passive.total, cap.gain);
                        gain_extra.push(`+${resourceColor(color, format(gain))} /s`);
                    }

                    let gain_txt = '';
                    if (gain_extra.length) gain_txt = ` (${gain_extra.join(', ')})`;

                    return `You have ${resourceColor(color, formatWhole(player.xp.points), 'font-size:1.5em;')}${gain_txt}\
                        /${resourceColor(color, formatWhole(cap.total))} experience`;
                }],
                ['display-text', () => {
                    const selected = player.xp.selected;
                    let kill_txt = '';
                    if (selected) {
                        const current = player.xp.monsters[selected].kills,
                            /** @type {string[]} */
                            kill_ext = [],
                            tmonst = tmp.xp.monsters[selected];

                        if (D.neq(tmonst.kills, 1)) kill_ext.push(resourceColor(tmp.xp.kill.color, `+${formatWhole(tmonst.kills)}`));
                        if (D.neq(current, tmp.xp.kill.total)) kill_ext.push(resourceColor(tmp.xp.kill.color, formatWhole(current)));

                        if (kill_ext.length) kill_txt = ` (${kill_ext.join(',')})`;
                    }

                    return `You have killed ${resourceColor(tmp.xp.kill.color, formatWhole(tmp.xp.kill.total), 'font-size:1.5em;')}${kill_txt} enemies`;
                }],
                'blank',
                ['display-text', () => {
                    const selected = player.xp.selected;

                    if (!selected) return `You are not fighting`;

                    return `You are fighting a level ${resourceColor(tmp.l.color, formatWhole(tmp.xp.monsters[selected].level))} ${tmp.xp.monsters[selected].name}`;
                }],
                ['raw-html', () => {
                    const selected = player.xp.selected;

                    if (!selected) return `<div style="width: 240px; height: 240px; overflow: hidden"></div>`;

                    return `<div style="width: 240px; height: 240px; overflow: hidden">
                            <img src="./resources/images/enemies.png"
                                style="width: ${MONSTER_SIZES.width * 100}%;
                                    height: ${MONSTER_SIZES.height * 100}%;
                                    margin-left: ${-240 * tmp.xp.monsters[selected].position[0]}px;
                                    margin-top: ${-240 * tmp.xp.monsters[selected].position[1]}px;
                                    image-rendering: pixelated;"/>
                        </div>`;
                }],
                ['bar', 'health'],
                () => {
                    const selected = player.xp.selected;
                    if (!selected) return;
                    const def = tmp.xp.monsters[selected].defense;
                    if (D.lte(def, 0)) return;
                    return ['display-text', `Defense: ${format(def)}`];
                },
                'blank',
                ['bar', 'attack_selected'],
                ['bar', 'attack_all'],
                'blank',
                ['clickables', [1]],
                'blank',
                ['display-text', () => {
                    const selected = player.xp.selected;
                    if (!selected) return;

                    const damage = tmp.xp.monsters[selected].damage;
                    return `Attack for ${format(damage)} damage`;
                }],
                ['display-text', 'Hold to click 5 times per second'],
                ['bar', 'player_health'],
                'blank',
                ['display-text', () => {
                    const selected = player.xp.selected;
                    if (D.lte(tmp.c.chance_multiplier, 0) || !selected) return '';

                    let drops = 'nothing',
                        count = '';
                    const last_drops = player.xp.monsters[selected].last_drops,
                        last_count = player.xp.monsters[selected].last_drops_times;
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${tmp.items[item].name}`));
                    if (last_count.gt(1)) count = ` (${formatWhole(last_count)})`;

                    return `${capitalize(tmp.xp.monsters[selected].name)} dropped ${drops}${count}`;
                }],
            ],
        },
        'Upgrades': {
            content: [
                ['display-text', () => {
                    const color = tmp.xp.color,
                        cap = tmp.xp.modifiers.cap.total;

                    return `You have ${resourceColor(color, formatWhole(player.xp.points), 'font-size:1.5em;')}\
                        /${resourceColor(color, formatWhole(cap))} experience`;
                }],
                ['display-text', () => `You have killed ${resourceColor(tmp.xp.kill.color, formatWhole(tmp.xp.kill.total), 'font-size:1.5em;')} enemies`],
                'blank',
                ['upgrades', [1, 2, 3]],
            ],
            shouldNotify() { return canAffordLayerUpgrade('xp', [1, 2, 3]); },
        },
        'Kill Upgrades': {
            content: [
                ['display-text', () => `You have killed ${resourceColor(tmp.xp.kill.color, formatWhole(tmp.xp.kill.total), 'font-size:1.5em;')} enemies`],
                'blank',
                ['upgrades', [4, 5, 6]],
            ],
            shouldNotify() { return canAffordLayerUpgrade('xp', [4, 5, 6]); },
            unlocked() { return hasChallenge('b', 31); },
            buttonStyle() { return { borderColor: tmp.xp.kill.color }; },
        },
        'Bestiary': {
            content: [
                ['display-text', 'Monster information'],
                ['clickables', [2]],
                'blank',
                ['column', () => bestiary_content(player.xp.lore)],
            ],
            unlocked() { return hasUpgrade('xp', 21) || hasAchievement('ach', 51); },
        },
    },
    upgrades: {
        // Normal
        11: {
            title: 'Larger Sword',
            kills: D.dOne,
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                return 'Deal +50% damage';
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D.dTwo,
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D(1.5); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        12: {
            title: 'Slimy Records',
            kills: D(5),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                return 'Gain +50% experience';
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(5),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D(1.5); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        13: {
            title: 'Level Down',
            kills: D.dTen,
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                return 'Enemies lose a third of their health';
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D.dTen,
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D(2 / 3); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        21: {
            title: 'Blood Knowledge',
            kills: D(20),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }

                let text = `Kills boost experience gain`;
                if (!hasAchievement('ach', 51)) text += `<br>Unlock the Bestiary`;
                if (shiftDown) text += `<br>log10(kills + 15)`;

                return text;
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(30),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D.add(tmp.xp.kill.total, 15).log10(); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        22: {
            title: 'Trap',
            kills: D(35),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                return 'Automatically attack current enemy once per second';
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(75),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D.dOne; },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `+${formatWhole(upgradeEffect(this.layer, this.id))}`;
            },
        },
        23: {
            title: 'Deadly Sword',
            kills: D(50),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }

                let text = `Kills boost damage dealt`;

                if (shiftDown) text += `<br>log15(kills + 15)`;

                return text;
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(111),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D.add(tmp.xp.kill.total, 15).log(15); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        31: {
            title: 'Unhealthy Knowledge',
            kills: D(75),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }

                let text = `Experience lowers enemy health`;

                if (shiftDown) text += `<br>1.1 ^ log5(experience + 5)`;

                return text;
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(200),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D.add(player.xp.points, 5).log(5).pow_base(1.1); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `/${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        32: {
            title: 'Weak Points',
            kills: D(100),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }

                let text = `Experience boosts damage dealt`;

                if (shiftDown) text += `<br>log20(experience + 20)`;

                return text;
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(250),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D.add(player.xp.points, 20).log(20); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        33: {
            title: 'Power of Riches',
            kills: D(150),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }

                let text = 'Double XP gain';

                if (!player.l.unlocked && !player.c.shown) text += '<br>Unlock 2 new layers';

                return text;
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(500),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D.dTwo; },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        // Kill
        41: {
            title: 'Second Sword',
            description: 'Deal +50% mining damage',
            effect() { return D(1.5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(3),
            currencyDisplayName: 'kills',
            currencyLocation() { return tmp.xp.kill; },
            currencyInternalName: 'total',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.xp.kill.color,
                    };
                }
            },
            pay() { },
            unlocked() { return hasChallenge('b', 31); },
            canAfford() { return D.gte(tmp.xp.kill, tmp[this.layer].upgrades[this.id].cost); },
        },
        42: {
            title: 'Bone Recording',
            description: 'Divide level costs by 1.5',
            effect() { return D(1.5); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(7),
            currencyDisplayName: 'kills',
            currencyLocation() { return tmp.xp.kill; },
            currencyInternalName: 'total',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.xp.kill.color,
                    };
                }
            },
            pay() { },
            unlocked() { return hasChallenge('b', 31); },
            canAfford() { return D.gte(tmp.xp.kill, tmp[this.layer].upgrades[this.id].cost); },
        },
        43: {
            title: 'Hardness Down',
            description: 'Ores lose a third of their health',
            effect() { return D(2 / 3); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(12),
            currencyDisplayName: 'kills',
            currencyLocation() { return tmp.xp.kill; },
            currencyInternalName: 'total',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.xp.kill.color,
                    };
                }
            },
            pay() { },
            unlocked() { return hasChallenge('b', 31); },
            canAfford() { return D.gte(tmp.xp.kill, tmp[this.layer].upgrades[this.id].cost); },
        },
        51: {
            title: 'Bloodstone',
            description() {
                let text = `Kills boost stone gain`;

                if (shiftDown) text += `<br>log10(kills + 15)`;

                return text;
            },
            effect() { return D.add(tmp.xp.kill.total, 15).log10(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(25),
            currencyDisplayName: 'kills',
            currencyLocation() { return tmp.xp.kill; },
            currencyInternalName: 'total',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.xp.kill.color,
                    };
                }
            },
            pay() { },
            unlocked() { return hasChallenge('b', 31); },
            canAfford() { return D.gte(tmp.xp.kill, tmp[this.layer].upgrades[this.id].cost); },
        },
        52: {
            title: 'Pitfall',
            description: 'Automatically attack all enemies every 4 seconds',
            effect() { return D(.25); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(40),
            currencyDisplayName: 'kills',
            currencyLocation() { return tmp.xp.kill; },
            currencyInternalName: 'total',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.xp.kill.color,
                    };
                }
            },
            pay() { },
            unlocked() { return hasChallenge('b', 31); },
            canAfford() { return D.gte(tmp.xp.kill, tmp[this.layer].upgrades[this.id].cost); },
        },
        53: {
            title: 'Deadly Pick',
            description() {
                let text = `Kills boost mining damage`;

                if (shiftDown) text += `<br>log15(kills + 15)`;

                return text;
            },
            effect() { return D.add(tmp.xp.kill.total, 15).log(15); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(55),
            currencyDisplayName: 'kills',
            currencyLocation() { return tmp.xp.kill; },
            currencyInternalName: 'total',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.xp.kill.color,
                    };
                }
            },
            pay() { },
            unlocked() { return hasChallenge('b', 31); },
            canAfford() { return D.gte(tmp.xp.kill, tmp[this.layer].upgrades[this.id].cost); },
        },
        61: {
            title: 'Lowered Levels',
            description() {
                let text = `Experience lowers level costs`;

                if (shiftDown) text += `<br>1.1 ^ log5(experience + 5)`;

                return text;
            },
            effect() { return D.add(player.xp.points, 5).log(5).pow_base(1.1); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(100),
            currencyDisplayName: 'kills',
            currencyLocation() { return tmp.xp.kill; },
            currencyInternalName: 'total',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.xp.kill.color,
                    };
                }
            },
            pay() { },
            unlocked() { return hasChallenge('b', 31); },
            canAfford() { return D.gte(tmp.xp.kill, tmp[this.layer].upgrades[this.id].cost); },
        },
        62: {
            title: 'Soft Spot',
            description() {
                let text = `Experience boosts mining damage`;

                if (shiftDown) text += `<br>log20(experience + 20)`;

                return text;
            },
            effect() { return D.add(player.xp.points, 20).log(20); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(125),
            currencyDisplayName: 'kills',
            currencyLocation() { return tmp.xp.kill; },
            currencyInternalName: 'total',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.xp.kill.color,
                    };
                }
            },
            pay() { },
            unlocked() { return hasChallenge('b', 31); },
            canAfford() { return D.gte(tmp.xp.kill, tmp[this.layer].upgrades[this.id].cost); },
        },
        63: {
            title: 'Power in Riches',
            description: 'Double mining gains',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(175),
            currencyDisplayName: 'kills',
            currencyLocation() { return tmp.xp.kill; },
            currencyInternalName: 'total',
            style() {
                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    return {
                        'backgroundColor': tmp.xp.kill.color,
                    };
                }
            },
            pay() { },
            unlocked() { return hasChallenge('b', 31); },
            canAfford() { return D.gte(tmp.xp.kill, tmp[this.layer].upgrades[this.id].cost); },
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            progress() {
                const selected = player.xp.selected;

                if (!selected) return 0;

                return D.div(player.xp.monsters[selected].health, tmp.xp.monsters[selected].health);
            },
            display() {
                const selected = player.xp.selected;

                if (!selected) return;

                return `${format(player.xp.monsters[selected].health)} / ${format(tmp.xp.monsters[selected].health)}`;
            },
            height: 40,
            width: 320,
            fillStyle() {
                const prog = D.min(tmp[this.layer].bars[this.id].progress, 1).max(0),
                    /** @type {[DecimalSource, number[]][]} */
                    colors = [
                        [0, [0xAA, 0x00, 0x00]],
                        [.5, [0xCC, 0x66, 0x00]],
                        [1, [0x00, 0x77, 0x00]],
                    ],
                    i = Math.max(colors.findIndex(([n]) => D.gte(n, prog)), 0);
                let backgroundColor;
                if (i == 0) {
                    backgroundColor = `#${colors[i][1].map(n => n.toString(16).padStart(2, '0')).join('')}`;
                } else {
                    const min = colors[i - 1],
                        max = colors[i],
                        diff = D.minus(max[0], min[0]),
                        fraction = D.minus(prog, min[0]).div(diff).clamp(0, 1).toNumber();

                    backgroundColor = `#${Array.from(
                        { length: 3 },
                        (_, i) => Math.floor(max[1][i] * fraction + min[1][i] * (1 - fraction))
                            .toString(16).padStart(2, '0'))
                        .join('')}`;
                }
                return { backgroundColor, };
            },
            baseStyle: { 'border-radius': 0, },
            borderStyle: { 'border-radius': 0, },
        },
        attack_selected: {
            direction: RIGHT,
            progress() { return player.xp.attack_time_selected; },
            height() {
                if (D.lte(player.items.disco_ball.amount, 0)) return 10;
                return 20;
            },
            width: 320,
            fillStyle: {
                backgroundColor() { return tmp.xp.color; },
            },
            unlocked() { return D.gt(tmp.xp.modifiers.speed.active, 0); },
            display() {
                if (player.items.disco_ball.amount.gt(0)) {
                    return `${formatWhole(D.times(tmp.xp.modifiers.speed.active, 60))} BPM`;
                }
            },
        },
        attack_all: {
            direction: RIGHT,
            progress() { return player.xp.attack_time_all; },
            height() {
                if (D.lte(player.items.disco_ball.amount, 0)) return 10;
                return 20;
            },
            width: 320,
            fillStyle: {
                backgroundColor() { return tmp.xp.kill.color; },
            },
            unlocked() { return D.gt(tmp.xp.modifiers.speed.passive, 0); },
            display() {
                if (player.items.disco_ball.amount.gt(0)) {
                    return `${formatWhole(D.times(tmp.xp.modifiers.speed.active, 60))} BPM`;
                }
            },
        },
        player_health: {
            direction: RIGHT,
            progress() { return D.div(player.dea.health, tmp.dea.player.health); },
            display() {
                let regen = '';
                if (D.gt(tmp.dea.player.regen, 0)) regen = ` (+${format(tmp.dea.player.regen)} /s)`;

                return `${format(player.dea.health)} / ${format(tmp.dea.player.health)}${regen}`;
            },
            height: 40,
            width: 320,
            fillStyle() {
                const prog = D.min(tmp[this.layer].bars[this.id].progress, 1).max(0),
                    /** @type {[DecimalSource, number[]][]} */
                    colors = [
                        [0, [0x77, 0x00, 0x00]],
                        [.5, [0x66, 0xCC, 0x00]],
                        [1, [0x00, 0xAA, 0x00]],
                    ],
                    i = Math.max(colors.findIndex(([n]) => D.gte(n, prog)), 0);
                let backgroundColor;
                if (i == 0) {
                    backgroundColor = `#${colors[i][1].map(n => n.toString(16).padStart(2, '0')).join('')}`;
                } else {
                    const min = colors[i - 1],
                        max = colors[i],
                        diff = D.minus(max[0], min[0]),
                        fraction = D.minus(prog, min[0]).div(diff).clamp(0, 1).toNumber();

                    backgroundColor = `#${Array.from(
                        { length: 3 },
                        (_, i) => Math.floor(max[1][i] * fraction + min[1][i] * (1 - fraction))
                            .toString(16).padStart(2, '0'))
                        .join('')}`;
                }
                return { backgroundColor, };
            },
            unlocked() { return inChallenge('b', 31); },
        },
    },
    clickables: {
        // Fight
        11: {
            style: {
                width: '120px',
                height: '120px',
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-240px -120px',
            },
            onClick() {
                const selected = player.xp.selected,
                    i = tmp.xp.list.indexOf(selected);

                player.xp.selected = tmp.xp.list[i - 1];
            },
            canClick() {
                const selected = player.xp.selected;

                return selected != tmp.xp.list[0];
            },
            unlocked() { return tmp.xp.list.length > 1; },
        },
        12: {
            style: {
                width: '180px',
                height: '180px',
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
                'background-size': `${UI_SIZES.width * 100}% ${UI_SIZES.height * 100}%`,
            },
            onClick: attack_monster,
            onHold() {
                const selected = player.xp.selected,
                    // About 5 clicks per second
                    damage = D.div(tmp.xp.monsters[selected].damage, 20 / 5);

                attack_monster(player.xp.selected, damage);
            },
            canClick() {
                if (inChallenge('b', 31) && D.lte(player.dea.health, 0)) return false;

                const selected = player.xp.selected;

                if (!selected) return;

                return D.gt(player.xp.monsters[selected].health, 0) && D.gt(tmp.xp.monsters[selected].damage, 0);
            },
        },
        13: {
            style: {
                width: '120px',
                height: '120px',
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-240px 0',
            },
            onClick() {
                const selected = player.xp.selected,
                    i = tmp.xp.list.indexOf(selected);

                player.xp.selected = tmp.xp.list[i + 1];
            },
            canClick() {
                const selected = player.xp.selected;

                return selected != tmp.xp.list[tmp.xp.list.length - 1];
            },
            unlocked() { return tmp.xp.list.length > 1; },
        },
        // Bestiary
        21: {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-120px -120px',
            },
            onClick() {
                const list = tmp.xp.list,
                    i = list.indexOf(player.xp.lore);
                player.xp.lore = list[i - 1];
            },
            canClick() {
                if (!Array.isArray(tmp.xp.list)) return false;
                const i = tmp.xp.list.indexOf(player.xp.lore);
                return i > 0;
            },
            unlocked() {
                /** @type {monsters[]} */
                const list = tmp.xp.list;
                return list.length > 1;
            },
        },
        22: {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-120px 0',
            },
            onClick() {
                /** @type {monsters[]} */
                const list = tmp.xp.list,
                    i = list.indexOf(player.xp.lore);
                player.xp.lore = list[i + 1];
            },
            canClick() {
                const list = tmp.xp.list;
                if (!Array.isArray(list)) return false;
                const i = list.indexOf(player.xp.lore);
                return i < list.length - 1;
            },
            unlocked() {
                /** @type {monsters[]} */
                const list = tmp.xp.list;
                return list.length > 1;
            },
        },
    },
    automate() {
        let limit = tmp.xp.modifiers.cap.gain,
            killed = D.dZero;
        Object.entries(player.xp.monsters)
            .forEach(/**@param {[monsters, Player['xp']['monsters'][monsters]]}*/([id, data]) => {
                if (D.gt(data.health, tmp.xp.monsters[id].health)) {
                    data.health = tmp.xp.monsters[id].health;
                }
                let damage = D.dZero;
                if (id == player.xp.selected && D.gte(player.xp.attack_time_selected, 1)) {
                    damage = damage.add(tmp.xp.monsters[id].damage);
                }
                if (D.gte(player.xp.attack_time_all, 1)) {
                    damage = damage.add(tmp.xp.monsters[id].damage);
                }
                attack_monster(id, damage);
                if (D.lte(data.health, 0)) {
                    const monster = layers.xp.monsters[id],
                        kills = tmp.xp.monsters[id].kills;

                    let gain = tmp.xp.monsters[id].experience;
                    // limit XP gain to prevent going over the cap
                    if (D.gt(gain, limit)) gain = limit;
                    addPoints('xp', gain);
                    limit = D.minus(limit, gain).max(0);

                    data.kills = D.add(data.kills, kills);
                    const level = monster.level(data.kills);

                    data.health = monster.health(level);

                    // Drops
                    const own = get_source_drops(`kill:${id}`, kills),
                        any = get_source_drops('kill:any', kills),
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

                    killed = killed.add(1);
                }
            });

        if (hasUpgrade('m', 64) && D.gt(killed, 0)) {
            let damage = D.times(tmp.m.modifiers.damage.total, killed).div(upgradeEffect('m', 64));
            strike_ore(damage);
        }

        if (D.gte(player.xp.attack_time_selected, 1)) player.xp.attack_time_selected = D.minus(player.xp.attack_time_selected, 1);
        if (D.gte(player.xp.attack_time_all, 1)) player.xp.attack_time_all = D.minus(player.xp.attack_time_all, 1);

        if (!tmp.xp.list.includes(player.xp.selected)) {
            if (tmp.xp.list.length) {
                player.xp.selected = tmp.xp.list[0];
            } else {
                player.xp.selected = false;
            }
        }
        if (!tmp.xp.list.includes(player.xp.lore)) {
            if (tmp.xp.list.length) {
                player.xp.lore = tmp.xp.list[0];
            } else {
                player.xp.lore = false;
            }
        }
    },
    update(diff) {
        if (inChallenge('b', 31) && D.lte(player.dea.health, 0)) return;

        // Fill auto attack
        player.xp.attack_time_selected = D.times(diff, tmp.xp.modifiers.speed.active).add(player.xp.attack_time_selected).min(1);
        player.xp.attack_time_all = D.times(diff, tmp.xp.modifiers.speed.passive).add(player.xp.attack_time_all).min(1);

        // Passive gain
        let passive_gain = D.times(tmp.xp.modifiers.xp.passive.total, diff)
            .min(tmp.xp.modifiers.cap.gain);
        addPoints('xp', passive_gain);
    },
    monsters: {
        slime: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.xp.monsters).find(mon => layers.xp.monsters[mon] == this); },
            color() {
                if (inChallenge('b', 41)) return '#55AA88';
                if (inChallenge('b', 21)) return '#AAFFDD';
                if (inChallenge('b', 11)) return '#FF6600';

                return '#55CC11';
            },
            name() {
                if (inChallenge('b', 41)) return 'slime golem';
                return 'slime';
            },
            position() {
                let i = 0;

                if (inChallenge('b', 11)) i = 1;
                if (inChallenge('b', 21)) i = 2;
                if (inChallenge('b', 41)) i = 3;

                return [0, i];
            },
            level(kills) {
                let k = D(kills ?? player.xp.monsters[this.id].kills);

                const mod = tmp.xp.modifiers.level;

                return k.div(mod.base).pow(mod.exp).times(mod.mult).floor().add(1);
            },
            health(level) {
                let l = D(level ?? tmp?.xp?.monsters[this.id].level);

                const level_mult = D.minus(l, 1).pow_base(1.5);

                let health = D.times(level_mult, 5).times(tmp.xp?.modifiers.health.mult ?? 1);

                if (inChallenge('b', 11)) health = health.times(2);
                if (inChallenge('b', 21)) health = health.times(2);
                if (inChallenge('b', 41)) health = health.times(5);

                health = D.times(health, item_effect('densium_slime')?.slime_mult);

                return health;
            },
            defense(level) {
                if (inChallenge('b', 41)) {
                    let l = D(level ?? tmp?.xp?.monsters[this.id].level),
                        defense = D.pow(1.25, l).minus(1);

                    defense = defense.times(tmp.xp.modifiers.defense.mult);

                    return defense;
                }
            },
            experience(level) {
                const l = D(level ?? tmp.xp.monsters[this.id].level);

                let xp = D.times(l, tmp.xp.modifiers.xp.mult);

                if (inChallenge('b', 11)) xp = xp.times(1.5);
                if (hasChallenge('b', 11)) xp = xp.times(1.5);
                if (inChallenge('b', 21)) xp = xp.div(2);

                xp = D.times(xp, item_effect('densium_slime').slime_mult);

                xp = D.pow(xp, tmp.xp.modifiers.xp.exp);

                return xp;
            },
            passive_experience(level) {
                let mult = D.dZero;

                mult = mult.add(tmp.xp.modifiers.xp.passive.passive);
                if (this.id == player.xp.selected) mult = mult.add(tmp.xp.modifiers.xp.passive.active);

                if (mult.lte(0)) return D.dZero;

                const l = D(level ?? tmp.xp.monsters[this.id].level);

                return this.experience(l).times(mult);
            },
            kills() {
                let kills = D.dOne;

                kills = D.times(kills, item_effect('densium_slime').slime_mult);

                return kills;
            },
            damage() {
                let base = tmp.xp.modifiers.damage.base;

                if (hasUpgrade('l', 31)) base = base.add(upgradeEffect('l', 31)[this.id]);

                let damage = D.times(base, tmp.xp.modifiers.damage.mult);

                damage = damage.minus(tmp.xp.monsters[this.id].defense ?? 0).max(0);

                return damage;
            },
            damage_per_second() {
                let mult = D.dZero;

                if (this.id == player.xp.selected && D.gt(tmp.xp.modifiers.speed.active, 0)) mult = D.add(mult, tmp.xp.modifiers.speed.active);
                if (D.gt(tmp.xp.modifiers.speed.passive, 0)) mult = D.add(mult, tmp.xp.modifiers.speed.passive);

                return D.times(mult, tmp.xp.monsters[this.id].damage);
            },
            lore() {
                if (inChallenge('b', 41)) {
                    return `A crude ball made of water and leaves.<br>\
                        Hard, harmless, and cold; almost like a chunk of ice.<br>
                        Physically unable to consume food, it relies on photosynthesis for energy.<br>
                        You shouldn't eat this.`;
                }
                if (inChallenge('b', 21)) {
                    return `A light blue ball of jelly.<br>\
                        Hard and freezing. Brrr!<br>
                        Diet consists mostly of water.<br>
                        Tastes like mint. Your tongue is stuck to it.`;
                }
                if (inChallenge('b', 11)) {
                    return `An orange ball of jelly.<br>\
                        Soft, pricky, and warm.<br>\
                        Diet consists of grass, cattle, and water.<br>
                        Tastes very spicy. Might also be poisonous.`;
                }
                return `A green ball of jelly.<br>\
                    Soft, harmless, and cold; the perfect pillow.<br>\
                    Diet consists of grass, insects, and water.<br>\
                    Tastes like dirty water.`;
            },
        },
        skeleton: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.xp.monsters).find(mon => layers.xp.monsters[mon] == this); },
            color() { return '#DDEEEE'; },
            name() {
                if (inChallenge('b', 41)) return 'bone golem';
                return 'skeleton';
            },
            position() {
                let i = 0;

                if (hasChallenge('b', 12)) i = 1;
                if (inChallenge('b', 41)) i = 2;

                return [1, i];
            },
            level(kills) {
                let k = D(kills ?? player.xp.monsters[this.id].kills);

                const mod = tmp.xp.modifiers.level;

                return k.div(mod.base).pow(mod.exp).times(mod.mult).floor().add(1);
            },
            health(level) {
                let l = D(level ?? tmp?.xp?.monsters[this.id].level);

                const level_mult = D.minus(l, 1).pow_base(1.75);

                let health = D.times(level_mult, 10).times(tmp.xp?.modifiers.health.mult ?? 1);

                if (inChallenge('b', 41)) health = health.times(4);

                return health;
            },
            defense(level) {
                if (inChallenge('b', 41)) {
                    let l = D(level ?? tmp?.xp?.monsters[this.id].level),
                        defense = D.pow(1.5, l).minus(1);

                    defense = defense.times(tmp.xp.modifiers.defense.mult);

                    return defense;
                }
            },
            experience(level) {
                const l = D(level ?? tmp.xp.monsters[this.id].level);

                let xp = D.times(l, tmp.xp.modifiers.xp.mult).times(2.5);

                xp = xp.pow(1.25);

                xp = D.pow(xp, tmp.xp.modifiers.xp.exp);

                return xp;
            },
            passive_experience(level) {
                let mult = D.dZero;

                mult = mult.add(tmp.xp.modifiers.xp.passive.passive);
                if (this.id == player.xp.selected) mult = mult.add(tmp.xp.modifiers.xp.passive.active);

                if (mult.lte(0)) return D.dZero;

                const l = D(level ?? tmp.xp.monsters[this.id].level);

                return this.experience(l).times(mult);
            },
            kills() { return D.dOne; },
            damage() {
                let base = tmp.xp.modifiers.damage.base;

                if (hasUpgrade('l', 31)) base = base.add(upgradeEffect('l', 31)[this.id]);

                let damage = D.times(base, tmp.xp.modifiers.damage.mult);

                if (hasUpgrade('m', 53)) damage = damage.times(upgradeEffect('m', 53));

                damage = damage.times(item_effect('silver_coating').skeleton_damage_mult);
                damage = damage.div(item_effect('lead_coating').skeleton_damage_div);

                damage = damage.minus(tmp.xp.monsters[this.id].defense ?? 0).max(0);

                return damage;
            },
            damage_per_second() {
                let mult = D.dZero;

                if (this.id == player.xp.selected && D.gt(tmp.xp.modifiers.speed.active, 0)) mult = D.add(mult, tmp.xp.modifiers.speed.active);
                if (D.gt(tmp.xp.modifiers.speed.passive, 0)) mult = D.add(mult, tmp.xp.modifiers.speed.passive);

                return D.times(mult, tmp.xp.monsters[this.id].damage);
            },
            lore() {
                if (inChallenge('b', 41)) return `A bastardized dead body. Or dead bodies?<br>
                    Whoever did that deserves no respect in life or in death.<br>
                    You feel sick.`;

                if (hasChallenge('b', 12)) return `A dead sailor that has come back to life.<br>
                    Brought back after washing up on the shore.<br>
                    Tough in a fight, but will lose to guards.`;

                return `A dead body that has come back to life.<br>
                    Brought to life near the ocean.<br>
                    Tough in a fight, but not on the level of a guard.`;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        golem: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.xp.monsters).find(mon => layers.xp.monsters[mon] == this); },
            color() { return '#BB7744'; },
            name() {
                if (inChallenge('b', 41)) return 'bronze golem';
                return 'golem';
            },
            position() {
                let i = 0;

                if (inChallenge('b', 41)) i = 1;

                return [2, i];
            },
            level(kills) {
                let k = D(kills ?? player.xp.monsters[this.id].kills);

                const mod = tmp.xp.modifiers.level;

                return k.div(mod.base).pow(mod.exp).times(mod.mult).floor().add(1);
            },
            health(level) {
                let l = D(level ?? tmp?.xp?.monsters[this.id].level);

                const level_mult = D.minus(l, 1).pow_base(2);

                let health = D.times(level_mult, 10).times(tmp.xp?.modifiers.health.mult ?? 1);

                if (inChallenge('b', 41)) health = health.times(3);

                return health;
            },
            defense(level) {
                let l = D(level ?? tmp?.xp?.monsters[this.id].level);

                if (inChallenge('b', 41)) l = l.times(2);

                let defense = D.pow(2, l).minus(1);

                defense = defense.times(tmp.xp.modifiers.defense.mult);

                return defense;
            },
            experience(level) {
                const l = D(level ?? tmp.xp.monsters[this.id].level);

                let xp = D.times(l, tmp.xp.modifiers.xp.mult).times(4);

                xp = xp.pow(1.5);

                xp = D.pow(xp, tmp.xp.modifiers.xp.exp);

                return xp;
            },
            passive_experience(level) {
                let mult = D.dZero;

                mult = mult.add(tmp.xp.modifiers.xp.passive.passive);
                if (this.id == player.xp.selected) mult = mult.add(tmp.xp.modifiers.xp.passive.active);

                if (mult.lte(0)) return D.dZero;

                const l = D(level ?? tmp.xp.monsters[this.id].level);

                return this.experience(l).times(mult);
            },
            kills() { return D.dOne; },
            damage() {
                let base = tmp.xp.modifiers.damage.base;

                if (hasUpgrade('l', 31)) base = base.add(upgradeEffect('l', 31)[this.id]);

                let damage = D.times(base, tmp.xp.modifiers.damage.mult);

                damage = damage.minus(tmp.xp.monsters[this.id].defense ?? 0).max(0);

                return damage;
            },
            damage_per_second() {
                let mult = D.dZero;

                if (this.id == player.xp.selected && D.gt(tmp.xp.modifiers.speed.active, 0)) mult = D.add(mult, tmp.xp.modifiers.speed.active);
                if (D.gt(tmp.xp.modifiers.speed.passive, 0)) mult = D.add(mult, tmp.xp.modifiers.speed.passive);

                return D.times(mult, tmp.xp.monsters[this.id].damage);
            },
            lore() {
                if (inChallenge('b', 41)) return `A humanoid made of bronze.<br>
                    It's high defense makes it incredibly tough.<br>
                    It almost looks like a person. Creepy.`;

                return `A crude humanoid made of mud.<br>
                    Its defense seem to increase with its level.<br>
                    Its core is pretty and shiny.`;
            },
            unlocked() { return hasUpgrade('s', 33); },
        },
        bug: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.xp.monsters).find(mon => layers.xp.monsters[mon] == this); },
            color() {
                if (inChallenge('b', 41)) return '#8899EE';
                return '#990099';
            },
            name() {
                if (inChallenge('b', 41)) return 'chrome insect';
                return 'insect';
            },
            position() {
                let i = 0;

                if (inChallenge('b', 41)) i = 1;

                return [3, i];
            },
            level(kills) {
                let k = D(kills ?? player.xp.monsters[this.id].kills);

                const mod = tmp.xp.modifiers.level;

                return k.div(mod.base).pow(mod.exp).times(mod.mult).floor().add(1);
            },
            health(level) {
                let l = D(level ?? tmp?.xp?.monsters[this.id].level);

                const level_mult = D.minus(l, 1).pow_base(2);

                let health = D.times(level_mult, 20).times(tmp.xp?.modifiers.health.mult ?? 1);

                if (inChallenge('b', 41)) health = health.times(3);

                return health;
            },
            defense(level) {
                let l = D(level ?? tmp?.xp?.monsters[this.id].level);

                if (inChallenge('b', 41)) l = l.times(4);

                let defense = D.pow(1.5, l).minus(.5);

                defense = defense.times(tmp.xp.modifiers.defense.mult);

                return defense;
            },
            experience(level) {
                const l = D(level ?? tmp.xp.monsters[this.id].level);

                let xp = D.times(l, tmp.xp.modifiers.xp.mult).times(8);

                xp = xp.pow(1.75);

                xp = D.pow(xp, tmp.xp.modifiers.xp.exp);

                return xp;
            },
            passive_experience(level) {
                let mult = D.dZero;

                mult = mult.add(tmp.xp.modifiers.xp.passive.passive);
                if (this.id == player.xp.selected) mult = mult.add(tmp.xp.modifiers.xp.passive.active);

                if (mult.lte(0)) return D.dZero;

                const l = D(level ?? tmp.xp.monsters[this.id].level);

                return this.experience(l).times(mult);
            },
            kills() { return D.dOne; },
            damage() {
                let base = tmp.xp.modifiers.damage.base;

                if (hasUpgrade('l', 31)) base = base.add(upgradeEffect('l', 31)[this.id]);

                let damage = D.times(base, tmp.xp.modifiers.damage.mult);

                damage = damage.minus(tmp.xp.monsters[this.id].defense ?? 0).max(0);

                return damage;
            },
            damage_per_second() {
                let mult = D.dZero;

                if (this.id == player.xp.selected && D.gt(tmp.xp.modifiers.speed.active, 0)) mult = D.add(mult, tmp.xp.modifiers.speed.active);
                if (D.gt(tmp.xp.modifiers.speed.passive, 0)) mult = D.add(mult, tmp.xp.modifiers.speed.passive);

                return D.times(mult, tmp.xp.monsters[this.id].damage);
            },
            lore() {
                if (inChallenge('b', 41)) return `A large insect made of metal.<br>
                    Some believe these are naturally born, but you can only find them in the factory.<br>
                    They're very shiny and pretty, you'd need to search for a good use.`;

                return `A large insect.<br>
                    It's uh, a bit uncomfortable how big it is.<br>
                    Can bugs be aware of how many you've squished, if only by accident? Can they be mad?`;
            },
            unlocked() { return hasChallenge('b', 41); },
        },
    },
    kill: {
        color: '#DD4477',
        total() {
            const sum = Object.values(player.xp.monsters).map(data => data.kills).reduce((sum, kills) => D.add(sum, kills), D.dZero),
                spent = player.xp.upgrades.reduce((sum, id) => {
                    const upg = tmp.xp.upgrades[id];
                    if (upg.currencyLocation == tmp.xp.kill && hasUpgrade('xp', id)) return sum.add(tmp.xp.upgrades[id]?.cost);
                    return sum;
                }, D.dZero);

            return sum.minus(spent);
        },
    },
    level: {
        total() {
            const sum = Object.values(tmp.xp.monsters)
                .filter(data => (data.unlocked ?? true))
                .map(data => data.level)
                .reduce((sum, level) => D.add(sum, level), D.dZero);

            return sum;
        },
    },
    modifiers: {
        damage: {
            base() {
                let base = D.dOne;

                if (hasUpgrade('l', 11)) base = base.add(upgradeEffect('l', 11));

                base = base.add(item_effect('bone_pick').xp_damage);
                base = base.add(item_effect('tin_ring').xp_damage);

                base = base.add(buyableEffect('dea', 13));

                return base;
            },
            mult() {
                if (inChallenge('b', 22)) return D.dZero;

                let mult = D.dOne;

                if (hasUpgrade('xp', 11)) mult = mult.times(upgradeEffect('xp', 11));
                if (hasUpgrade('xp', 23)) mult = mult.times(upgradeEffect('xp', 23));
                if (hasUpgrade('xp', 32)) mult = mult.times(upgradeEffect('xp', 32));

                if (hasUpgrade('l', 21)) mult = mult.times(upgradeEffect('l', 21));

                mult = mult.times(tmp.a.spells.drain.effect.damage_mult);

                mult = mult.times(item_effect('slime_knife').damage);
                mult = mult.times(item_effect('lead_coating').damage_mult);

                if (hasChallenge('b', 21)) mult = mult.times(2);

                if (hasUpgrade('dea', 11)) mult = mult.times(upgradeEffect('dea', 11));

                return mult;
            },
        },
        speed: {
            active() {
                let speed = D.dZero;

                speed = speed.add(item_effect('disco_ball').speed);

                if (hasUpgrade('xp', 22)) speed = speed.add(upgradeEffect('xp', 22));

                return speed;
            },
            passive() {
                let speed = D.dZero;

                if (hasUpgrade('xp', 52)) speed = speed.add(upgradeEffect('xp', 52));

                return speed;
            },
        },
        xp: {
            passive: {
                active: D.dZero,
                passive() {
                    let mult = D.dZero;

                    mult = mult.add(tmp.a.spells.drain.effect.xp_passive);

                    return mult;
                },
                total() {
                    return Object.values(tmp.xp.monsters)
                        .filter(data => (data.unlocked ?? true) && D.gt(data.passive_experience, 0))
                        .reduce((sum, data) => sum.add(data.passive_experience), D.dZero);
                },
            },
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 12)) mult = mult.times(upgradeEffect('xp', 12));
                if (hasUpgrade('xp', 21)) mult = mult.times(upgradeEffect('xp', 21));
                if (hasUpgrade('xp', 33)) mult = mult.times(upgradeEffect('xp', 33));

                if (hasUpgrade('l', 12)) mult = mult.times(upgradeEffect('l', 12));

                mult = mult.times(item_effect('slime_crystal').xp_mult);
                mult = mult.times(item_effect('slime_injector').xp_mult);
                mult = mult.times(item_effect('crystal_skull').xp_mult);

                if (hasAchievement('ach', 14)) mult = mult.times(achievementEffect('ach', 14));

                if (player.b.dungeon.max > 0) {
                    mult = mult.times(tmp.b.dungeon[0].reward.xp_mult);
                }

                mult = mult.times(buyableEffect('dea', 23));

                return mult;
            },
            exp() {
                let exp = D.dOne;

                if (hasChallenge('b', 22)) exp = exp.add(.1);

                return exp;
            },
        },
        cap: {
            base() {
                let base = D(1_000);

                if (hasAchievement('ach', 15)) base = base.add(achievementEffect('ach', 15));

                return base;
            },
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('m', 32)) mult = mult.times(upgradeEffect('m', 32));

                if (hasUpgrade('l', 13)) mult = mult.times(upgradeEffect('l', 13));
                if (hasUpgrade('l', 23)) mult = mult.times(upgradeEffect('l', 23));

                if (hasUpgrade('s', 12)) mult = mult.times(upgradeEffect('s', 12));

                mult = mult.times(tmp.l.effect);

                mult = mult.times(item_effect('slime_crystal').xp_cap);
                mult = mult.times(item_effect('crystal_skull').xp_cap);

                return mult;
            },
            total() { return D.times(tmp.xp.modifiers.cap.base, tmp.xp.modifiers.cap.mult); },
            gain() { return D.minus(tmp.xp.modifiers.cap.total, player.xp.points); },
        },
        health: {
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 13)) mult = mult.times(upgradeEffect('xp', 13));
                if (hasUpgrade('xp', 31)) mult = mult.div(upgradeEffect('xp', 31));

                mult = mult.div(item_effect('stone_wall').health_div);
                mult = mult.div(item_effect('slime_injector').health);

                if (inChallenge('b', 71)) {
                    if (player.b.dungeon.floor >= 0) {
                        mult = mult.times(tmp.b.dungeon[0].effect.xp_health);
                    }
                }

                if (hasUpgrade('dea', 21)) mult = mult.div(upgradeEffect('dea', 21));

                return mult;
            },
        },
        drops: {
            mult() {
                let mult = D.dOne;

                mult = mult.times(item_effect('bronze_cart').xp_drop);

                return mult;
            },
        },
        level: {
            base() {
                let base = D.dTen;

                base = base.add(item_effect('gold_star').level_delay);

                return base;
            },
            mult() { return D.dOne; },
            exp() { return D(.5); },
        },
        defense: {
            mult() {
                let mult = D.dOne;

                mult = mult.div(tmp.a.spells.acid.effect.def_div);

                mult = mult.div(item_effect('bug_armor').defense_div);

                return mult;
            },
        },
    },
    list() {
        let list = Object.values(tmp.xp.monsters)
            .filter(mon => mon.unlocked ?? true)
            .map(mon => mon.id);

        if (inChallenge('b', 32) && Array.isArray(tmp.wor.overrides.xp.monsters)) list = list.filter(monster => tmp.wor.overrides.xp.monsters.includes(monster));

        return list;
    },
    doReset(layer) {
        if (tmp[layer].row <= this.row) return;

        const held = D(item_effect('tin_cache').hold).toNumber(),
            /** @type {number[]} */
            upgs = [],
            /** @type {(keyof Player['xp'])[]} */
            keep = ['selected', 'lore'];
        if (D.gt(held, 0)) {
            upgs.push(...player.xp.upgrades.filter(id => tmp.xp.upgrades[id].currencyLocation != tmp.xp.kill).slice(0, held));
        }

        layerDataReset(this.layer, keep);

        player.xp.upgrades.push(...upgs);

        // Correctly reset health
        Object.values(layers.xp.monsters).forEach(data => player.xp.monsters[data.id].health = data.health(data.level(1)));
    },
});
