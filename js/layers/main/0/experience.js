'use strict';

const MONSTER_SIZES = {
    width: 2,
    height: 3,
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

                    return `You are fighting a level ${resourceColor(tmp.l.color, formatWhole(tmp.xp.monsters[selected].level))} ${tmp.xp.monsters[selected].name}`;
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
            unlocked() { return hasUpgrade('xp', 21) || hasAchievement('ach', 51); },
        },
    },
    upgrades: {
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
                return 'Passively deal 100% of your damage';
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
                return `${format(tmp.xp.monsters[player.xp.selected].damage_per_second)} /s`;
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
                if (shiftDown) text += `<br>log15(experience + 15)`;

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

                return `Double XP gain<br>\
                    Unlock 2 new layers`;
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
                'image-rendering': 'crisp-edges',
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
                'image-rendering': 'crisp-edges',
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
                if (inChallenge('b', 21)) return '#AAFFDD';

                return '#55CC11';
            },
            name: 'slime',
            position() {
                let i = 0;

                if (inChallenge('b', 11)) i++;
                if (inChallenge('b', 21)) i += 2;

                return [0, i];
            },
            level(kills) {
                let k = D(kills ?? player.xp.monsters[this.id].kills);

                return k.div(10).root(2).floor().add(1);
            },
            health(level) {
                let l = D(level ?? tmp?.xp?.monsters[this.id].level);

                const level_mult = D.minus(l, 1).pow_base(1.5);

                let health = D.times(level_mult, 5).times(tmp.xp?.modifiers.health.mult ?? 1);

                if (inChallenge('b', 11) || inChallenge('b', 21)) health = health.times(2);

                return health;
            },
            experience(level) {
                const l = D(level ?? tmp.xp.monsters[this.id].level);

                let xp = D.times(l, tmp.xp.modifiers.xp.base)
                    .times(tmp.xp.modifiers.xp.mult);

                if (inChallenge('b', 11)) xp = xp.times(1.5);
                if (hasChallenge('b', 11)) xp = xp.times(1.5);
                if (inChallenge('b', 21)) xp = xp.div(2);

                return xp;
            },
            damage() {
                let base = tmp.xp.modifiers.damage.base;

                if (hasUpgrade('l', 31)) base = base.add(upgradeEffect('l', 31)[this.id]);

                return D.times(base, tmp.xp.modifiers.damage.mult);
            },
            damage_per_second() {
                let mult = D.dZero;

                if (hasUpgrade('xp', 22) && this.id == player.xp.selected) mult = D.add(mult, upgradeEffect('xp', 22));

                return D.times(mult, tmp.xp.monsters[this.id].damage);
            },
            lore() {
                if (inChallenge('b', 11)) {
                    return `An orange ball of jelly.<br>\
                        Soft, pricky, and warm.<br>\
                        Diet consists of grass, cattle, and water.<br>
                        Tastes very spicy. Might also be poisonous.`;
                }
                if (inChallenge('b', 21)) {
                    return `A light blue ball of jelly.<br>\
                        Hard and freezing. Brrr!<br>
                        Diet consists mostly of water.<br>
                        Tastes like mint. Your tongue is stuck to it.`;
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
            name: 'skeleton',
            position() {
                let i = 0;

                return [1, i];
            },
            level(kills) {
                let k = D(kills ?? player.xp.monsters[this.id].kills);

                return k.div(10).root(2).floor().add(1);
            },
            health(level) {
                let l = D(level ?? tmp?.xp?.monsters[this.id].level);

                const level_mult = D.minus(l, 1).pow_base(1.75);

                let health = D.times(level_mult, 10).times(tmp.xp?.modifiers.health.mult ?? 1);

                return health;
            },
            experience(level) {
                const l = D(level ?? tmp.xp.monsters[this.id].level);

                let xp = D.times(2.5, tmp.xp.modifiers.xp.base)
                    .times(l)
                    .times(tmp.xp.modifiers.xp.mult);

                xp = xp.pow(1.25);

                return xp;
            },
            damage() {
                let base = tmp.xp.modifiers.damage.base;

                if (hasUpgrade('l', 31)) base = base.add(upgradeEffect('l', 31)[this.id]);

                return D.times(base, tmp.xp.modifiers.damage.mult);
            },
            damage_per_second() {
                let mult = D.dZero;

                if (hasUpgrade('xp', 22) && this.id == player.xp.selected) mult = D.add(mult, upgradeEffect('xp', 22));

                return D.times(mult, tmp.xp.monsters[this.id].damage);
            },
            lore() {
                return `A dead body that has come back to life.<br>
                    Brought to life near the ocean.<br>
                    Tough in a fight, but not on the level of a guard.`;
            },
            unlocked() { return hasChallenge('b', 11); },
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

                if (hasUpgrade('l', 11)) base = base.add(upgradeEffect('l', 11));

                base = base.add(item_effect('bone_pick').xp_damage);

                return base;
            },
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 11)) mult = mult.times(upgradeEffect('xp', 11));
                if (hasUpgrade('xp', 23)) mult = mult.times(upgradeEffect('xp', 23));
                if (hasUpgrade('xp', 32)) mult = mult.times(upgradeEffect('xp', 32));

                if (hasUpgrade('l', 21)) mult = mult.times(upgradeEffect('l', 21));

                mult = mult.times(item_effect('slime_knife').damage);

                return mult;
            },
        },
        xp: {
            base() { return D.dOne; },
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

                return mult;
            },
            cap() {
                let cap = D(1_000);

                if (hasAchievement('ach', 15)) cap = cap.add(achievementEffect('ach', 15));

                if (hasUpgrade('l', 13)) cap = cap.times(upgradeEffect('l', 13));
                if (hasUpgrade('l', 23)) cap = cap.times(upgradeEffect('l', 23));

                cap = cap.times(tmp.l.effect);

                cap = cap.times(item_effect('slime_crystal').xp_cap);
                cap = cap.times(item_effect('crystal_skull').xp_cap);

                return cap;
            },
            gain_cap() { return D.minus(tmp.xp.modifiers.xp.cap, player.xp.points); },
        },
        health: {
            mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 13)) mult = mult.times(upgradeEffect('xp', 13));
                if (hasUpgrade('xp', 31)) mult = mult.div(upgradeEffect('xp', 31));

                mult = mult.div(item_effect('slime_injector').health);

                return mult;
            },
        },
    },
    list() {
        return Object.values(tmp.xp.monsters)
            .filter(mon => mon.unlocked ?? true)
            .map(mon => mon.id);
    },
    doReset(layer) {
        if (tmp[layer].row <= this.row) return;

        const held = 0,
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
