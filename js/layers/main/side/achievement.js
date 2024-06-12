'use strict';

addLayer('ach', {
    row: 'side',
    position: 0,
    type: 'none',
    resource: 'achievement',
    symbol: '🏆',
    color: '#FFFF00',
    startData() {
        return {
            unlocked: true,
        };
    },
    tooltip() { return `${formatWhole(tmp.ach.categories.normal.owned.length)} achievements`; },
    tabFormat: {
        'Achievements': {
            content: [
                ['display-text', () => {
                    const color = tmp.ach.categories.normal.color,
                        owned = tmp.ach.categories.normal.owned.length,
                        visible = tmp.ach.categories.normal.visible.length;

                    return `You have ${resourceColor(color, formatWhole(owned), 'font-size:1.5em;')} / ${resourceColor(color, formatWhole(visible))} achievements`;
                }],
                'blank',
                ['achievements', () => tmp.ach.categories.normal.rows],
            ],
        },
        'Secrets': {
            content: [
                ['display-text', () => {
                    const color = tmp.ach.categories.secret.color,
                        owned = tmp.ach.categories.secret.owned.length,
                        visible = tmp.ach.categories.secret.visible.length;

                    return `You have ${resourceColor(color, formatWhole(owned), 'font-size:1.5em;')} / ${resourceColor(color, formatWhole(visible))} secrets`;
                }],
                'blank',
                ['achievements', () => tmp.ach.categories.secret.rows],
            ],
            buttonStyle: { 'border-color'() { return tmp.ach.categories.secret.color; } },
            unlocked() { return D.gt(tmp.ach.categories.secret.visible.length, 0); },
        },
    },
    achievements: {
        //#region Normal
        11: {
            name: 'A Little Murder',
            tooltip: 'Kill a slime',
            done() { return D.gt(player.xp.monsters.slime.kills, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.xp.color,
                };
            },
        },
        12: {
            name: 'Level Up?',
            tooltip: 'Level up the slimes',
            done() { return D.gt(tmp.xp.monsters.slime.level, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.xp.color,
                };
            },
        },
        13: {
            name: 'Local Brewery',
            tooltip: 'Make a potion of weakness',
            done() { return hasUpgrade('xp', 13); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.xp.color,
                };
            },
        },
        14: {
            name: 'Knowledge Is Power',
            tooltip: 'Unlock the Bestiary<br>Reward: The Bestiary stays unlocked',
            done() { return hasUpgrade('xp', 23); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.xp.color,
                };
            },
        },
        15: {
            name: 'Beyond The Limit',
            tooltip() { return `Obtain more than ${formatWhole(1_000)} XP<br>Reward: XP cap is increased by 500`; },
            effect() { return D(500); },
            done() { return D.gt(player.xp.points, 1_000); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.xp.color,
                };
            },
        },
        21: {
            name: 'Level Up',
            tooltip: 'Get a level',
            done() { return D.gt(player.l.points, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.l.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.l.color,
                };
            },
            unlocked() { return player.l.unlocked; },
        },
        22: {
            name: 'Skilled',
            tooltip: 'Get 3 skills<br>Reward: Get a free skill point',
            effect() { return D.dOne; },
            done() { return player.l.upgrades.length >= 3; },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.l.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.l.color,
                };
            },
            unlocked() { return player.l.unlocked; },
        },
        23: {
            name: 'CAPS LOCK',
            tooltip: 'Get 3 skills that boost your XP cap',
            done() { return [12, 13, 22].every(id => hasUpgrade('l', id)); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.l.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.l.color,
                };
            },
            unlocked() { return player.l.unlocked; },
        },
        24: {
            name: 'Third Row',
            tooltip: 'Get a 3rd row skill',
            done() { return player.l.upgrades.some(id => Math.floor(id / 10) >= 3); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.l.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.l.color,
                };
            },
            unlocked() { return player.l.unlocked; },
        },
        25: {
            name: 'All Nine',
            tooltip: 'Get 9 skill points<br>Reward: Level effect counts a bonus level',
            effect() { return D.dOne; },
            done() { return D.gte(tmp.l.skill.points.total, 9); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.l.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.l.color,
                };
            },
            unlocked() { return player.l.unlocked; },
        },
        31: {
            name: 'Good For Swords',
            tooltip: 'Get a level of Looting',
            done() { return D.gte(getBuyableAmount('c', 11), 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.c.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.c.color,
                };
            },
            unlocked() { return player.c.shown; },
        },
        32: {
            name: 'Unnatural Material',
            tooltip: 'Get a dense slime core',
            done() { return D.gte(player.items.dense_slime_core.amount, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.c.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.c.color,
                };
            },
            unlocked() { return player.c.shown; },
        },
        33: {
            name: 'The More You Know',
            tooltip: 'Craft a slime page',
            done() { return D.gte(player.c.recipes.slime_page.crafted, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.c.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.c.color,
                };
            },
            unlocked() { return player.c.shown; },
        },
        34: {
            name: 'Gambler',
            tooltip: 'Get a slime dice<br>Reward: Luck is increased by 0.1',
            effect() { return D(.1); },
            done() { return D.gte(player.items.slime_dice.amount, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.c.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.c.color,
                };
            },
            unlocked() { return player.c.shown; },
        },
        35: {
            name: 'True Professionnal',
            tooltip: 'Craft 10 non material items<br>Reward: Crafting time is halved',
            effect() { return D.dTwo; },
            done() { return D.gte(tmp.c.crafting.crafted, 10); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.c.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.c.color,
                };
            },
            unlocked() { return player.c.shown; },
        },
        //#endregion Normal
        //#region Secret
        41: {
            name: 'Levels Up',
            tooltip() {
                if (hasAchievement(this.layer, this.id)) return 'Get multiple levels at once';
                return '???';
            },
            done() { return false; }, // Check level.js
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Secret Completed!', 3, tmp.l.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.l.color,
                };
            },
            unlocked() { return player.l.unlocked; },
        },
        51: {
            name: `I didn't need this anyway`,
            tooltip() {
                if (hasAchievement(this.layer, this.id)) return 'Get an item without looting';
                return '???';
            },
            done() {
                if (D.gt(getBuyableAmount('c', 11), 0)) return false;
                const sum = Object.values(player.items).reduce((sum, n) => D.add(sum, n.amount), D.dZero);
                return D.gt(sum, 0);
            },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Secret Completed!', 3, tmp.c.color); },
            style() {
                if (hasAchievement(this.layer, this.id)) return {
                    'background-color': tmp.c.color,
                };
            },
            unlocked() { return player.c.shown; },
        },
        //#endregion Secret
    },
    achievementPopups: false, // This is done manually
    categories: {
        normal: {
            color() { return tmp.ach.color; },
            rows: [1, 2, 3],
            visible() {
                return Object.values(tmp.ach.achievements)
                    .filter(ach => typeof ach == 'object' && this.rows.includes(Math.floor(ach.id / 10)) && (ach.unlocked ?? true));
            },
            owned() { return player.ach.achievements.filter(id => this.rows.includes(Math.floor(id / 10))); },
        },
        secret: {
            color: '#FF0077',
            rows: [4, 5],
            visible() {
                return Object.values(tmp.ach.achievements)
                    .filter(ach => typeof ach == 'object' && this.rows.includes(Math.floor(ach.id / 10)) && (ach.unlocked ?? true));
            },
            owned() { return player.ach.achievements.filter(id => this.rows.includes(Math.floor(id / 10))); },
        },
    },
});
