'use strict';

const MONSTER_SIZES = {
    width: 2,
    height: 2,
};
addLayer('xp', {
    row: 0,
    position: 0,
    type: 'none',
    resource: 'experience',
    name: 'experience',
    symbol: 'XP',
    color() { return tmp.xp.monsters[player.xp.selected].color; },
    tooltip() { return `${formatWhole(player.xp.points)} experience<br>${formatWhole(tmp.xp.kill.total)} kills`; },
    startData() {
        return {
            unlocked: true,
            points: D.dZero,
            best: D.dZero,
            total: D.dZero,
            selected: 'slime',
            lore: 'slime',
            monsters: Object.fromEntries(Object.keys(layers.xp.monsters)
                .map(mon => [mon, {
                    kills: D.dZero,
                    health: layers.xp.monsters[mon].health(1),
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
                        gain = D.min(tmp.xp.monsters[selected].experience, tmp.xp.modifiers.xp.gain_cap),
                        gain_txt = D.gt(gain, 0) ? ` (+${resourceColor(color, format(gain))})` : '',
                        cap = tmp.xp.modifiers.xp.cap;

                    return `You have ${resourceColor(color, formatWhole(player.xp.points), 'font-size:1.5em;')}${gain_txt}\
                        /${resourceColor(color, formatWhole(cap))} experience`;
                }],
                ['display-text', () => {
                    const current = player.xp.monsters[player.xp.selected].kills,
                        /** @type {string[]} */
                        kill_ext = [];
                    let kill_txt = '';

                    if (D.neq(current, tmp.xp.kill.total)) kill_ext.push(resourceColor(tmp.xp.kill.color, formatWhole(current)));

                    if (kill_ext.length) kill_txt = ` (${kill_ext.join(',')})`;

                    return `You have killed ${resourceColor(tmp.xp.kill.color, formatWhole(tmp.xp.kill.total), 'font-size:1.5em;')}${kill_txt} enemies`;
                }],
                'blank',
                ['display-text', () => {
                    const selected = player.xp.selected;

                    return `You are fighting a level ${formatWhole(tmp.xp.monsters[selected].level)} ${tmp.xp.monsters[selected].name}`;
                }],
                ['raw-html', () => {
                    return `<div style="width: 240px; height: 240px; overflow: hidden">
                            <img src="./resources/images/enemies.png"
                                style="width: ${MONSTER_SIZES.width * 100}%;
                                    height: ${MONSTER_SIZES.height * 100}%;
                                    margin-left: ${-240 * tmp.xp.monsters[player.xp.selected].position[0]}px;
                                    margin-top: ${-240 * tmp.xp.monsters[player.xp.selected].position[1]}px;
                                    image-rendering: crisp-edges;"/>
                        </div>`;
                }],
                ['bar', 'health'],
                'blank',
                'blank',
                ['clickables', [1]],
                'blank',
                ['display-text', () => {
                    const selected = player.xp.selected,
                        damage = tmp.xp.monsters[selected].damage;

                    return `Attack for ${format(damage)} damage`;
                }],
                ['display-text', 'Hold to click 5 times per second'],
                'blank',
                ['display-text', () => {
                    if (D.lte(tmp.c.chance_multiplier, 0)) return '';

                    let drops = 'nothing',
                        count = '';
                    const last_drops = player.xp.monsters[player.xp.selected].last_drops,
                        last_count = player.xp.monsters[player.xp.selected].last_drops_times;
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${tmp.items[item].name}`));
                    if (last_count.gt(1)) count = ` (${formatWhole(last_count)})`;

                    return `${capitalize(tmp.xp.monsters[player.xp.selected].name)} dropped ${drops}${count}`;
                }],
            ],
        },
        'Upgrades': {
            content: [
                ['display-text', () => {
                    const color = tmp.xp.color,
                        cap = tmp.xp.modifiers.xp.cap;

                    return `You have ${resourceColor(color, formatWhole(player.xp.points), 'font-size:1.5em;')}\
                        /${resourceColor(color, formatWhole(cap))} experience`;
                }],
                ['display-text', () => `You have killed ${resourceColor(tmp.xp.kill.color, formatWhole(tmp.xp.kill.total), 'font-size:1.5em;')} enemies`],
                'blank',
                'upgrades',
            ],
            shouldNotify() { return canAffordLayerUpgrade('xp'); },
        },
        'Bestiary': {
            content: [
                ['display-text', 'Monster information'],
                ['clickables', [2]],
                'blank',
                ['column', () => bestiary_content(player.xp.lore)],
            ],
            unlocked() { return hasUpgrade('xp', 23) || hasAchievement('ach', 14); },
        },
    },
    upgrades: {
        11: {
            title: 'Double-Edged Sword',
            kills: D.dOne,
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                return 'Deal +50% damage';
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D.dOne,
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
            title: 'Brainy Slimes',
            kills: D(3),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                return 'Gain +50% more XP';
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
            title: 'Potion of Weakness',
            kills: D.dTen,
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                if (tmp.xp.monster_list.length > 1) return '-25% enemy health';
                return '-25% slime health';
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
            effect() { return D(.75); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${formatWhole(upgradeEffect(this.layer, this.id))}`;
            },
        },
        21: {
            title: 'Slime Trap',
            kills: D(20),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                return 'Passively deal 100% of your damage per second';
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(25),
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
                const dps = D.times(upgradeEffect(this.layer, this.id), tmp.xp.monsters[player.xp.selected].damage);
                return `${format(dps)}/s`;
            },
        },
        22: {
            title: 'Blood Sword',
            kills: D(35),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                if (!shiftDown) {
                    return 'Kills boost damage';
                }
                let formula = 'log10(kills + 10)';

                return `Formula: ${formula}`;
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(50),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D.add(tmp.xp.kill.total, 10).log10(); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        23: {
            title: 'Bestiary',
            kills: D(50),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                if (!shiftDown) {
                    return 'Kills boost XP gain<br>Unlock the bestiary';
                }
                let formula = '10√(kills + 10)';

                return `Formula: ${formula}`;
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
            effect() { return D.add(tmp.xp.kill.total, 10).root(10); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        31: {
            title: 'Smart Sword',
            kills: D(75),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                if (!shiftDown) {
                    return 'XP boost damage';
                }
                let formula = 'log10(XP + 10)';

                return `Formula: ${formula}`;
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(100),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            effect() { return D.add(player.xp.points, 10).log10(); },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id))}`;
            },
        },
        32: {
            title: 'Champions',
            kills: D(100),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                if (!shiftDown) {
                    return 'Enemy max health boosts XP';
                }
                let formula = '4√(max health)';

                return `Formula: ${formula}`;
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(150),
            style() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return {
                        'background-color': 'transparent',
                        'border': `5px dashed ${colors[options.theme][1]}`,
                        'color': colors[options.theme][1],
                    };
                }
            },
            /** @returns {{[mon in monsters]: Decimal}} */
            effect() {
                return Object.fromEntries(
                    Object.keys(tmp.xp.monsters)
                        .map(mon => [mon, D.max(tmp.xp.monsters[mon].health, 4).root(4)])
                );
            },
            effectDisplay() {
                if (!tmp[this.layer].upgrades[this.id].show) return '';
                return `*${format(upgradeEffect(this.layer, this.id)[player.xp.selected])}`;
            },
        },
        33: {
            title: 'Limit Break',
            kills: D(125),
            show() { return hasUpgrade(this.layer, this.id) || D.gte(tmp.xp.kill.total, this.kills) || hasChallenge('b', 11); },
            description() {
                if (!tmp[this.layer].upgrades[this.id].show) {
                    return `Unlocked at ${formatWhole(this.kills)} kills`;
                }
                return 'Unlock 2 new layers<br>Double XP gain';
            },
            canAfford() { return tmp[this.layer].upgrades[this.id].show; },
            cost: D(444),
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
    },
    bars: {
        health: {
            direction: RIGHT,
            progress() {
                const selected = player.xp.selected;

                return D.div(player.xp.monsters[selected].health, tmp.xp.monsters[selected].health);
            },
            display() {
                const selected = player.xp.selected;

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
    },
    clickables: {
        // Fight
        11: {
            style: {
                width: '120px',
                height: '120px',
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-240px -120px',
            },
            onClick() {
                const selected = player.xp.selected,
                    i = tmp.xp.monster_list.indexOf(selected);

                player.xp.selected = tmp.xp.monster_list[i - 1];
            },
            canClick() {
                const selected = player.xp.selected;

                return selected != tmp.xp.monster_list[0];
            },
        },
        12: {
            style: {
                width: '180px',
                height: '180px',
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 100}% ${UI_SIZES.height * 100}%`,
            },
            onClick() {
                const selected = player.xp.selected,
                    damage = tmp.xp.monsters[selected].damage,
                    monster = player.xp.monsters[selected];

                monster.health = D.minus(monster.health, damage);
            },
            onHold() {
                const selected = player.xp.selected,
                    // About 5 clicks per second
                    damage = D.div(tmp.xp.monsters[selected].damage, 20 / 5),
                    monster = player.xp.monsters[selected];

                monster.health = D.minus(monster.health, damage);
            },
            canClick() {
                const selected = player.xp.selected;

                return D.gt(player.xp.monsters[selected].health, 0);
            },
        },
        13: {
            style: {
                width: '120px',
                height: '120px',
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-240px 0',
            },
            onClick() {
                const selected = player.xp.selected,
                    i = tmp.xp.monster_list.indexOf(selected);

                player.xp.selected = tmp.xp.monster_list[i + 1];
            },
            canClick() {
                const selected = player.xp.selected;

                return selected != tmp.xp.monster_list[tmp.xp.monster_list.length - 1];
            },
        },
        // Bestiary
        21: {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-120px -120px',
            },
            onClick() {
                const list = tmp.xp.monster_list,
                    i = list.indexOf(player.xp.lore);
                player.xp.lore = list[i - 1];
            },
            canClick() {
                if (!Array.isArray(tmp.xp.monster_list)) return false;
                const i = tmp.xp.monster_list.indexOf(player.xp.lore);
                return i > 0;
            },
            unlocked() {
                /** @type {monsters[]} */
                const list = tmp.xp.monster_list;
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
                const list = tmp.xp.monster_list,
                    i = list.indexOf(player.xp.lore);
                player.xp.lore = list[i + 1];
            },
            canClick() {
                const list = tmp.xp.monster_list;
                if (!Array.isArray(list)) return false;
                const i = list.indexOf(player.xp.lore);
                return i < list.length - 1;
            },
            unlocked() {
                /** @type {monsters[]} */
                const list = tmp.xp.monster_list;
                return list.length > 1;
            },
        },
    },
    automate() {
        let limit = tmp.xp.modifiers.xp.gain_cap;
        Object.entries(player.xp.monsters)
            .forEach(/**@param {[monsters, Player['xp']['monsters'][monsters]]}*/([id, data]) => {
                if (D.gt(data.health, tmp.xp.monsters[id].health)) {
                    data.health = tmp.xp.monsters[id].health;
                }
                if (D.lte(data.health, 0)) {
                    const monster = layers.xp.monsters[id];

                    let gain = tmp.xp.monsters[id].experience;
                    // limit XP gain to prevent going over the cap
                    if (D.gt(gain, limit)) gain = limit;
                    addPoints('xp', gain);
                    limit = D.minus(limit, gain).max(0);

                    data.kills = D.add(data.kills, 1);
                    const level = monster.level(data.kills);

                    data.health = D.add(data.health, monster.health(level));

                    if (D.gt(tmp.c.chance_multiplier, 0)) {
                        const drops = get_source_drops(`kill:${id}`),
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
                }
            });
    },
    update(diff) {
        Object.values(tmp.xp.monsters)
            .forEach(monster => {
                const pmon = player.xp.monsters[monster.id];
                if (D.gt(monster.damage_per_second, 0)) {
                    const damage = D.times(monster.damage_per_second, diff);
                    pmon.health = D.minus(pmon.health, damage);
                }
            });
    },
    monsters: {
        slime: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.xp.monsters).find(mon => layers.xp.monsters[mon] == this); },
            color() {
                if (inChallenge('b', 11)) return '#FF6600';

                return '#55CC11';
            },
            name: 'slime',
            position() {
                let i = 0;

                if (inChallenge('b', 11)) i = 1;

                return [0, i];
            },
            level(kills) {
                let k = D(kills ?? player.xp.monsters[this.id].kills);

                return k.div(10).root(2).floor().add(1);
            },
            health(level) {
                let l = D(level ?? tmp?.xp?.monsters[this.id].level);

                const level_mult = D.minus(l, 1).pow_base(1.5);

                let health = D.times(level_mult, 10).times(tmp.xp?.modifiers.health.mult ?? 1);

                if (inChallenge('b', 11)) health = health.times(2);

                if (hasChallenge('b', 11)) health = health.div(2);

                return health;
            },
            experience(level) {
                const l = D(level ?? tmp.xp.monsters[this.id].level);

                let xp = D.times(l, tmp.xp.modifiers.xp.base)
                    .times(tmp.xp.modifiers.xp.mult);

                if (hasUpgrade('xp', 32)) xp = xp.times(upgradeEffect('xp', 32)[this.id]);

                if (inChallenge('b', 11)) xp = xp.times(2);

                return xp;
            },
            damage() { return tmp.xp.modifiers.damage.total; },
            damage_per_second() {
                let mult = D.dZero;

                if (hasUpgrade('xp', 21) && player.xp.selected == this.id) mult = mult.add(upgradeEffect('xp', 21));

                return D.times(mult, tmp.xp.monsters[this.id].damage);
            },
            lore() {
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
            color: '#BBBBDD',
            name: 'skeleton',
            unlocked() { return hasChallenge('b', 11); },
            position: [1, 0],
            level(kills) {
                let k = D(kills ?? player.xp.monsters[this.id].kills);

                return k.div(10).root(2).floor().add(1);
            },
            health(level) {
                let l = D(level ?? tmp?.xp?.monsters[this.id].level);

                const level_mult = D.minus(l, 1).pow_base(2);

                let health = D.times(level_mult, 15).times(tmp.xp?.modifiers.health.mult ?? 1);

                return health;
            },
            experience(level) {
                const l = D(level ?? tmp.xp.monsters[this.id].level);

                let xp = D.times(l, tmp.xp.modifiers.xp.base)
                    .times(3)
                    .times(tmp.xp.modifiers.xp.mult);

                if (hasUpgrade('xp', 32)) xp = xp.times(upgradeEffect('xp', 32)[this.id]);

                return xp;
            },
            damage() { return tmp.xp.modifiers.damage.total; },
            damage_per_second() {
                let mult = D.dZero;

                if (hasUpgrade('xp', 21) && player.xp.selected == this.id) mult = mult.add(upgradeEffect('xp', 21));

                return D.times(mult, tmp.xp.monsters[this.id].damage);
            },
            lore: `Reanimated bones of a dead person.<br>\
                Surprisingly clean; maybe these bones can be useful.<br>\
                Does not attack to kill, only to free its brethen.<br>\
                Smells like bones.`,
        },
    },
    kill: {
        color: '#DD4477',
        total() { return Object.values(player.xp.monsters).map(data => data.kills).reduce((sum, kills) => D.add(sum, kills), D.dZero); },
    },
    modifiers: {
        damage: {
            base() {
                let base = D.dOne;

                base = base.add(item_effect('bone_pick').damage);

                return base;
            },
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 11)) mult = mult.times(upgradeEffect('xp', 11));
                if (hasUpgrade('xp', 22)) mult = mult.times(upgradeEffect('xp', 22));
                if (hasUpgrade('xp', 31)) mult = mult.times(upgradeEffect('xp', 31));

                if (hasUpgrade('m', 13)) mult = mult.times(upgradeEffect('m', 13));
                if (hasUpgrade('m', 32)) mult = mult.times(upgradeEffect('m', 32).enemy);

                if (hasUpgrade('l', 21)) mult = mult.times(upgradeEffect('l', 21));

                mult = mult.times(item_effect('slime_pocket').damage);
                mult = mult.times(item_effect('bone_shiv'));
                mult = mult.times(item_effect('rock_club'));

                if (hasAchievement('ach', 65)) mult = mult.times(achievementEffect('ach', 65));

                return mult;
            },
            total() { return D.times(tmp.xp.modifiers.damage.base, tmp.xp.modifiers.damage.mult); },
        },
        xp: {
            base() { return D.dOne; },
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 12)) mult = mult.times(upgradeEffect('xp', 12));
                if (hasUpgrade('xp', 23)) mult = mult.times(upgradeEffect('xp', 23));
                if (hasUpgrade('xp', 33)) mult = mult.times(upgradeEffect('xp', 33));

                if (hasUpgrade('l', 11)) mult = mult.times(upgradeEffect('l', 11));

                mult = mult.times(item_effect('slime_crystal').mult);
                mult = mult.times(item_effect('crystal_skull').mult);

                if (hasAchievement('ach', 65)) mult = mult.times(achievementEffect('ach', 65));

                return mult;
            },
            cap() {
                let cap = D(1_000);

                if (hasAchievement('ach', 15)) cap = cap.add(achievementEffect('ach', 15))

                if (hasUpgrade('m', 23)) cap = cap.times(upgradeEffect('m', 23));

                cap = cap.times(tmp.l.effect.cap);
                if (hasUpgrade('l', 12)) cap = cap.times(upgradeEffect('l', 12));
                if (hasUpgrade('l', 22)) cap = cap.times(upgradeEffect('l', 22));

                cap = cap.times(item_effect('slime_crystal').cap);
                cap = cap.times(item_effect('crystal_skull').cap);

                return cap;
            },
            gain_cap() { return D.minus(tmp.xp.modifiers.xp.cap, player.xp.points); },
        },
        health: {
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 13)) mult = mult.times(upgradeEffect('xp', 13));

                mult = mult.times(item_effect('slime_page').health);

                return mult;
            },
        },
    },
    monster_list() {
        return Object.values(tmp.xp.monsters)
            .filter(mon => mon.unlocked ?? true)
            .map(mon => mon.id);
    },
    doReset(layer) {
        if (tmp[layer].row <= this.row) return;

        const held = item_effect('slime_pocket').hold,
            /** @type {number[]} */
            upgs = [],
            /** @type {(keyof Player['xp'])[]} */
            keep = ['selected', 'lore'];
        if (D.gt(held, 0)) {
            upgs.push(...player.xp.upgrades.slice(0, held));
        }

        layerDataReset(this.layer, keep);

        player.xp.upgrades.push(...upgs);
    },
});
