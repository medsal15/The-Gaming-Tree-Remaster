'use strict';

const MONSTER_SIZES = {
    width: 1,
    height: 1,
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
            unlocked() { return hasUpgrade('xp', 23); },
        },
    },
    upgrades: {
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
            unlocked() { tmp.xp.monster_list.length > 0 },
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
            unlocked() { tmp.xp.monster_list.length > 0 },
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
                return '#55CC11';
            },
            name: 'slime',
            position() {
                let i = 0;

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

                return health;
            },
            experience(level) {
                const l = D(level ?? tmp.xp.monsters[this.id].level);

                let xp = D.times(l, tmp.xp.modifiers.xp.base)
                    .times(tmp.xp.modifiers.xp.mult);

                return xp;
            },
            damage() { return tmp.xp.modifiers.damage.total; },
            damage_per_second() {
                let mult = D.dZero;

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
    },
    kill: {
        color: '#DD4477',
        total() { return Object.values(player.xp.monsters).map(data => data.kills).reduce((sum, kills) => D.add(sum, kills), D.dZero); },
    },
    modifiers: {
        damage: {
            base() {
                let base = D.dOne;

                return base;
            },
            mult() {
                let mult = D.dOne;

                return mult;
            },
            total() { return D.times(tmp.xp.modifiers.damage.base, tmp.xp.modifiers.damage.mult); },
        },
        xp: {
            base() { return D.dOne; },
            mult() {
                let mult = D.dOne;

                return mult;
            },
            cap() {
                let cap = D(1_000);

                return cap;
            },
            gain_cap() { return D.minus(tmp.xp.modifiers.xp.cap, player.xp.points); },
        },
        health: {
            mult() {
                let mult = D.dOne;

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
