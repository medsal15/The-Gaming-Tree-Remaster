'use strict';

const BOSS_SIZES = {
    width: 2,
    height: 3,
};

addLayer('b', {
    row: 2,
    position: 0,
    // Allows for resets
    type: 'static',
    baseAmount: D.dZero,
    requires: D.dOne,
    resource: 'boss',
    name: 'boss',
    symbol: 'B',
    color: '#CC5555',
    tooltip() {
        if (!player.b.shown) return `Reach ${formatWhole(360)} kills to challenge (you have ${formatWhole(tmp.xp.kill.total)} kills)`;
        return `${formatWhole(tmp.b.complete.total)} bosses beaten`;
    },
    startData() {
        return {
            unlocked: true,
            shown: false,
            points: D.dZero,
            visible_challenges: [],
            lore: 'slime_sovereign',
        };
    },
    layerShown() { return player.b.shown || (player.l.unlocked && player.c.shown); },
    hotkeys: [
        {
            key: 'B',
            description: 'Shift + B: Display boss layer',
            onPress() { if (player.b.shown) showTab('b'); },
            unlocked() { return player.b.shown; },
        },
        {
            key: 'b',
            description: 'B: Complete boss challenge (if possible)',
            onPress() {
                if (player.b.shown) {
                    const chal = activeChallenge('b');
                    if (!chal || !canCompleteChallenge('b', chal)) return;
                    completeChallenge('b', chal);
                }
            },
            unlocked() { return player.b.shown; },
        },
    ],
    tabFormat: {
        'Bosses': {
            content: [
                ['display-text', () => {
                    return `You have beaten ${resourceColor(tmp.b.color, formatWhole(tmp.b.complete.total), 'font-size:1.5em;')} bosses`;
                }],
                'blank',
                ['bar', 'progress'],
                'blank',
                ['challenges', () => tmp.b.groups.boss.rows],
            ],
        },
        'Mini Bosses': {
            content: [
                ['display-text', () => {
                    return `You have beaten ${resourceColor(tmp.b.groups.mini.color, formatWhole(tmp.b.groups.mini.completions), 'font-size:1.5em;')} mini bosses`;
                }],
                'blank',
                ['bar', 'progress'],
                'blank',
                ['challenges', () => tmp.b.groups.mini.rows],
            ],
            buttonStyle: {
                'borderColor'() { return tmp.b.groups.mini.color; },
            },
            unlocked() { return D.gte(tmp.b.groups.boss.completions, 1); },
        },
        'Relics': {
            content: [
                ['display-text', () => {
                    return `You have obtained ${resourceColor(tmp.b.groups.relic.color, formatWhole(tmp.b.groups.relic.completions), 'font-size:1.5em;')} relics`;
                }],
                'blank',
                ['bar', 'progress'],
                'blank',
                ['challenges', () => tmp.b.groups.relic.rows],
            ],
            buttonStyle: {
                'borderColor'() { return tmp.b.groups.relic.color; },
            },
            unlocked() { return D.gte(tmp.b.groups.mini.completions, 1); },
        },
        'Bosstiary': {
            content: [
                ['display-text', 'Boss information'],
                ['clickables', [1]],
                'blank',
                ['column', () => bosstiary_content(player.b.lore)],
            ],
            unlocked() { return player.b.visible_challenges.length > 0; },
        },
    },
    bars: {
        progress: {
            direction: RIGHT,
            height: 40,
            width: 320,
            progress() {
                const chal = activeChallenge('b');
                if (chal && inChallenge('b', chal)) return layers.b.challenges[chal].progress();

                if (!tmp.b.challenges[11].unlocked) {
                    return D.div(tmp.xp.kill.total, 360);
                }
                if (!tmp.b.challenges[12].unlocked) {
                    return D.div(player.items.gold_nugget.amount, 1);
                }
                return D.dZero;
            },
            display() {
                const chal = activeChallenge('b');
                if (chal && inChallenge('b', chal)) return layers.b.challenges[chal].display();

                if (!tmp.b.challenges[11].unlocked) {
                    return `${formatWhole(tmp.xp.kill.total)} / ${formatWhole(360)} kills`;
                }
                if (!tmp.b.challenges[12].unlocked) {
                    const name = (tmp.items.gold_nugget.unlocked ?? true) ? tmp.items.gold_nugget.name : 'unknown';
                    return `Mine ${formatWhole(player.items.gold_nugget.amount)} / ${formatWhole(1)} ${name}`;
                }
                return 'Not fighting a boss';
            },
            fillStyle: {
                'backgroundColor'() {
                    const chal = activeChallenge('b');
                    if (!chal) return tmp.b.color;

                    const group = tmp.b.challenges[chal].group;
                    return tmp.b.groups[group].color;
                },
            },
        },
    },
    challenges: {
        // Main
        11: {
            name: 'Slime Sovereign',
            challengeDescription: `Fight the Slime Sovereign and anger the slimes.<br>\
                Double slime health and experience, slime items effects are boosted.`,
            goalDescription: 'Kill 490 slimes',
            rewardDescription: `+50% slime experience, slime items effects boost is kept, unlock a new enemy, and XP upgrades stay unlocked`,
            canComplete() { return D.gte(tmp.xp.kill.total, 490); },
            progress() { return D.div(tmp.xp.kill.total, 490); },
            display() { return `${formatWhole(tmp.xp.kill.total)} / ${formatWhole(490)} kills`; },
            unlocked() { return player.b.shown && player.b.visible_challenges.includes(this.id); },
            onEnter() { player.b.shown = true; },
            group: 'boss',
            buttonStyle() {
                const group = tmp[this.layer].challenges[this.id].group
                return { 'backgroundColor': tmp.b.groups[group].color, };
            },
        },
        12: {
            name: 'Captain Goldtooth',
            challengeDescription: `Fight Captain Goldtooth's debt...?<br>
                Monsters drop coins instead of items, which must be purchased at Captain Goldtooth's shop. Luck applies to coin gain.`,
            goalDescription: 'Spend a total of 1 silver coin',
            rewardDescription: `Keep Captain Goldtooth's shop unlocked, skeletons have a chance to drop gold nuggets.`,
            canComplete() { return D.gte(tmp.s.coins.spent, 1e4); },
            progress() { return D.div(tmp.s.coins.spent, 1e4); },
            display() {
                const spent = tmp.s.coins.spent,
                    progress_list = value_coin(spent),
                    goal_list = value_coin(1e4);

                if (!progress_list.length) progress_list.push(['coin_copper', D.dZero]);
                if (!goal_list.length) goal_list.push(['coin_copper', D.dZero]);

                const progress_txt = listFormat.format(progress_list.map(([coin, spent]) => `${formatWhole(spent)} ${tmp.items[coin].name}`)),
                    goal_txt = listFormat.format(goal_list.map(([coin, spent]) => `${formatWhole(spent)} ${tmp.items[coin].name}`));

                return `${progress_txt} / ${goal_txt}`;
            },
            unlocked() { return player.b.shown && player.b.visible_challenges.includes(this.id); },
            group: 'boss',
            buttonStyle() {
                const group = tmp[this.layer].challenges[this.id].group
                return { 'backgroundColor': tmp.b.groups[group].color, };
            },
            onExit() {
                const has_33 = hasUpgrade('s', 33);
                layerDataReset('s');
                if (has_33) player.s.upgrades.push(33);
                tmp.s.coins.list.forEach(([item]) => player.items[item].amount = D.dZero);
            },
            onEnter() {
                const has_33 = hasUpgrade('s', 33);
                layerDataReset('s');
                if (has_33) player.s.upgrades.push(33);
                tmp.s.coins.list.forEach(([item]) => player.items[item].amount = D.dZero);
            },
        },
        // Mini
        21: {
            name: 'Slime Monarch',
            challengeDescription: `Fight the Slime Monarch and anger the slimes, again.<br>\
                Double slime health and half experience, slime items effects are nerfed.`,
            goalDescription: 'Kill 360 slimes',
            rewardDescription: `Double damage, slime die level is increased by 1`,
            canComplete() { return D.gte(player.xp.monsters.slime.kills, 360); },
            progress() { return D.div(player.xp.monsters.slime.kills, 360); },
            display() { return `${formatWhole(player.xp.monsters.slime.kills)} / ${formatWhole(360)} kills`; },
            unlocked() { return hasChallenge('b', 11); },
            group: 'mini',
            buttonStyle() {
                const group = tmp[this.layer].challenges[this.id].group
                return { 'backgroundColor': tmp.b.groups[group].color, };
            },
        },
        //todo 22: license (no monster killing, reward: ???)
        // Gods
        31: {
            name: 'Thanatos',
            challengeDescription: `Enemies can strike back and kill you.`,
            goalDescription: 'Kill 500 enemies',
            rewardDescription: 'Unlock kill upgrades',
            canComplete() { return D.gte(tmp.xp.kill.total, 500); },
            progress() { return D.div(tmp.xp.kill.total, 500); },
            display() { return `${formatWhole(tmp.xp.kill.total)} / 500`; },
            unlocked() { return hasChallenge('b', 21); },
            group: 'relic',
            buttonStyle() {
                const group = tmp[this.layer].challenges[this.id].group
                return { 'backgroundColor': tmp.b.groups[group].color, };
            },
        },
        //todo 32: Tyche (lootboxes, reward is luck switches)
    },
    clickables: {
        // Bosstiary
        11: {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-120px -120px',
            },
            onClick() {
                const list = tmp.b.list,
                    i = list.indexOf(player.b.lore);
                player.b.lore = list[i - 1];
            },
            canClick() {
                if (!Array.isArray(tmp.b.list)) return false;
                const i = tmp.b.list.indexOf(player.b.lore);
                return i > 0;
            },
            unlocked() {
                /** @type {monsters[]} */
                const list = tmp.b.list;
                return list.length > 1;
            },
        },
        12: {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'crisp-edges',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-120px 0',
            },
            onClick() {
                /** @type {monsters[]} */
                const list = tmp.b.list,
                    i = list.indexOf(player.b.lore);
                player.b.lore = list[i + 1];
            },
            canClick() {
                const list = tmp.b.list;
                if (!Array.isArray(list)) return false;
                const i = list.indexOf(player.b.lore);
                return i < list.length - 1;
            },
            unlocked() {
                /** @type {monsters[]} */
                const list = tmp.b.list;
                return list.length > 1;
            },
        },
    },
    complete: {
        total() {
            return D.add(tmp.b.groups.boss.completions, tmp.b.groups.mini.completions);
        },
    },
    groups: {
        boss: {
            completions() {
                return Object.keys(tmp.b.challenges)
                    .filter(id => !isNaN(id) && this.rows.includes(Math.floor(id / 10)))
                    .reduce((sum, id) => D.add(sum, challengeCompletions('b', id)), D.dZero);
            },
            color() { return tmp.b.color; },
            rows: [1],
        },
        mini: {
            completions() {
                return Object.keys(tmp.b.challenges)
                    .filter(id => !isNaN(id) && this.rows.includes(Math.floor(id / 10)))
                    .reduce((sum, id) => D.add(sum, challengeCompletions('b', id)), D.dZero);
            },
            color: '#CC5599',
            rows: [2],
        },
        relic: {
            completions() {
                return Object.keys(tmp.b.challenges)
                    .filter(id => !isNaN(id) && this.rows.includes(Math.floor(id / 10)))
                    .reduce((sum, id) => D.add(sum, challengeCompletions('b', id)), D.dZero);
            },
            color: '#55CCCC',
            rows: [3],
        },
    },
    branches: ['l'],
    nodeStyle: {
        'backgroundColor'() {
            if (!player.b.shown && D.lt(tmp.xp.kill.total, 360)) return colors[options.theme].locked;
            return tmp.b.color;
        },
    },
    automate() {
        if (!player.b.visible_challenges.includes('11') && D.gte(tmp.xp.kill.total, 360)) {
            player.b.shown = true;
            player.b.visible_challenges.push('11');
            doPopup('none', `${tmp.b.challenges[11].name}`, 'Boss unlocked', 5, tmp.b.color);
        }
        if (!player.b.visible_challenges.includes('12') && D.gte(player.items.gold_nugget.amount, 1)) {
            player.b.visible_challenges.push('12');
            doPopup('none', `${tmp.b.challenges[12].name}`, 'Boss unlocked', 5, tmp.b.color);
        }
    },
    prestigeNotify() { return !activeChallenge('b') && [11].some(id => tmp.b.challenges[id].unlocked && !hasChallenge('b', id)); },
    shouldNotify() {
        const chal = activeChallenge('b');
        if (!chal) return false;
        return canCompleteChallenge('b', chal);
    },
    bosses: {
        // Main
        'slime_sovereign': {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.b.bosses).find(([, r]) => r == this)[0]; },
            unlocked() { return tmp.b.challenges[11].unlocked; },
            name: 'slime sovereign',
            position: [0, 0],
            lore: `Most powerful slime in the world, and their leader.<br>
                Understandably angry considering not even you know how many slimes died by your blade.<br>
                Sends an army of powerful slimes to defeat you.`,
            challenge: 11,
        },
        'captain_goldtooth': {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.b.bosses).find(([, r]) => r == this)[0]; },
            unlocked() { return tmp.b.challenges[12].unlocked; },
            name: 'captain goodtooth',
            position: [1, 0],
            lore: `In deep debts from the many fines obtained and thefts committed.<br>
                Banks refuse to let go of a debtor's debts, even in death...<br>
                Continues stealing and getting fined while trying to clear her account.`,
            challenge: 12,
        },
        // Mini
        'slime_monarch': {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.b.bosses).find(([, r]) => r == this)[0]; },
            unlocked() { return tmp.b.challenges[21].unlocked; },
            name: 'slime monarch',
            position: [0, 1],
            lore: `Child of the Slime Sovereign.<br>
                Angry that you defeated its parent, it now seeks revenge.<br>
                Sends its personal guard to defeat you.`,
            challenge: 21,
        },
        // Relics
        'thanatos': {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.b.bosses).find(([, r]) => r == this)[0]; },
            unlocked() { return tmp.b.challenges[31].unlocked; },
            name: 'thanatos',
            position: [0, 2],
            lore: `An ancient god that presides over death.<br>
                Unhappy over the large amount of souls sent over to him.<br>
                Do you understand how much paperwork has to be filled for each soul?`,
            challenge: 31,
        },
    },
    list() { return Object.keys(layers.b.bosses).filter(boss => tmp.b.bosses[boss].unlocked ?? true); },
});
