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
                //todo unlock 13 with magic core
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
                //todo unlock 13 with magic core
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
        /**
         * TODO 13: Enter the Golem Factory
         *
         * slime -> slime golems (+defense, ↑health, +mud, ↓slime goo, ↑slime core shards, ↑slime core)
         * skeleton -> bone golems (+defense, ↑health, +mud, ↓skull, ↑rib, ↑bone)
         * golem -> bronze golem (↑↑defense, ↑health, +bronze blend, ↓mud)
         */
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
        22: {
            name: 'Hunting License Fee',
            challengeDescription: `Turns out you need a license to hunt monsters.<br>\
                You cannot kill enemies for the duration of the challenge, but mining XP is automatically unlocked.`,
            goalDescription: 'Earn 40 bronze coins to pay the fee',
            rewardDescription: 'Keep mining experience unlocked, start with 5 minutes in shop time, +^.1 XP gain exponent',
            canComplete() { return D.gte(player.items.coin_bronze.amount, 40); },
            progress() { return D.div(tmp.s.coins.total, 40_00); },
            display() {
                const progress_list = value_coin(tmp.s.coins.total),
                    goal_list = value_coin(40_00);

                if (!progress_list.length) progress_list.push(['coin_copper', D.dZero]);
                if (!goal_list.length) goal_list.push(['coin_copper', D.dZero]);

                const progress_txt = listFormat.format(progress_list.map(([coin, spent]) => `${formatWhole(spent)} ${tmp.items[coin].name}`)),
                    goal_txt = listFormat.format(goal_list.map(([coin, spent]) => `${formatWhole(spent)} ${tmp.items[coin].name}`));

                return `${progress_txt} / ${goal_txt}`;
            },
            unlocked() { return hasChallenge('b', 12); },
            group: 'mini',
            buttonStyle() {
                const group = tmp[this.layer].challenges[this.id].group
                return { 'backgroundColor': tmp.b.groups[group].color, };
            },
            onExit() { tmp.s.coins.list.forEach(([item]) => player.items[item].amount = D.dZero); },
            onEnter() { tmp.s.coins.list.forEach(([item]) => player.items[item].amount = D.dZero); },
        },
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
        32: {
            name: 'Ek Chuah',
            challengeDescription() {
                let text = `You have 4 packages to deliver around the world.\
                    You also have to buy them first.\
                    Some layers may be locked depending on your location.`;

                if (hasChallenge(this.layer, this.id)) text += '<br><span class="warning">Redoing this challenge will not be profitable</span>';

                return text;
            },
            goalDescription: `Deliver all 4 packages`,
            rewardDescription: ``, //todo
            canComplete() {
                /** @type {items[]} */
                const list = ['package_1', 'package_2', 'package_3', 'package_4'],
                    delivered = list.filter(item => D.eq(player.items[item].amount, 0) && D.eq(player.items[item].total, 1));
                return delivered.length == list.length;
            },
            progress() {
                /** @type {items[]} */
                const list = ['package_1', 'package_2', 'package_3', 'package_4'],
                    delivered = list.filter(item => D.eq(player.items[item].amount, 0) && D.eq(player.items[item].total, 1));
                return delivered.length / list.length;
            },
            display() {
                /** @type {items[]} */
                const list = ['package_1', 'package_2', 'package_3', 'package_4'],
                    delivered = list.filter(item => D.eq(player.items[item].amount, 0) && D.eq(player.items[item].total, 1));

                return `${formatWhole(delivered.length)} / ${formatWhole(list.length)} packages delivered`;
            },
            unlocked() { return hasChallenge('b', 22); },
            group: 'relic',
            buttonStyle() {
                const group = tmp[this.layer].challenges[this.id].group;
                return { 'backgroundColor': tmp.b.groups[group].color, };
            },
            onExit() {
                /** @type {items[]} */
                const list = ['package_1', 'package_2', 'package_3', 'package_4'];
                list.forEach(item => {
                    player.items[item].amount = D.dZero;
                    player.items[item].total = D.dZero;
                });
            },
            onEnter() { player.wor.position = [12, 12]; },
        },
    },
    clickables: {
        // Bosstiary
        11: {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
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
                'image-rendering': 'pixelated',
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
        //todo unlock 13 with magic core
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
        'undead_bureaucrat': {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.b.bosses).find(([, r]) => r == this)[0]; },
            unlocked() { return tmp.b.challenges[22].unlocked; },
            name: 'undead bureaucrat',
            position: [1, 1],
            lore() {
                if (inChallenge('b', this.challenge)) return `"I see you're trying to pay the license fee.<br>
                    It costs 40 bronze coins. Spent money doesn't count. Lady Goldtooth does not work for us.<br>
                    Just be glad it's not a subscription anymore. The amount of complains I still have to deal with..."`;
                if (hasChallenge('b', this.challenge)) return `"Thank you for your contribution.<br>
                        Your hunting license has been delivered to your residence, if you have one, or will be handed over shortly at the hunter guild.<br>
                        Losing your hunting license will incur a fee of 5 bronze coins for rescribing.<br>
                        We do not take returns on your license, even if your face was badly drawn."`;
                return `"Look, I get it. You've been doing that for a while, and can't stop.<br>
                    We don't want you to either. You've been helpful in keeping the monster populations down.<br>
                    But you broke the law. We can't change that. You'll need to pay the fine and the fee for a monster hunting license.<br>
                    I haven't had a break in 3 years, so if I misspell 'hunting' as 'mining', it's not my fault."`;
            },
            challenge: 22,
        },
        // Relics
        'thanatos': {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.b.bosses).find(([, r]) => r == this)[0]; },
            unlocked() { return tmp.b.challenges[31].unlocked; },
            name: 'Thanatos',
            position: [0, 2],
            lore: `An ancient god that presides over death.<br>
                Unhappy over the large amount of souls sent over to him.<br>
                Do you understand how much paperwork has to be filled for each soul?`,
            challenge: 31,
        },
        'ek_chuah': {
            _id: null,
            get id() { return this._id ??= Object.entries(layers.b.bosses).find(([, r]) => r == this)[0]; },
            unlocked() { return tmp.b.challenges[32].unlocked; },
            name: 'Ek Chuah',
            position: [1, 2],
            lore: `An ancient god that presides over trade and cacao.<br>
                Your entrepreneurship has inspired him to hire you.<br>
                It's just a small delivery, how hard could it be?`,
            challenge: 32,
        },
    },
    list() { return Object.keys(layers.b.bosses).filter(boss => tmp.b.bosses[boss].unlocked ?? true); },
});
