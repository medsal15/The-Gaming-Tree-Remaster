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
            pool_balls: [],
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

                    return `You have ${resourceColor(color, formatWhole(owned), 'font-size:1.5em;')} /${resourceColor(color, formatWhole(visible))} achievements`;
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

                    return `You have ${resourceColor(color, formatWhole(owned), 'font-size:1.5em;')} secrets`;
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
            name: 'Innocence Mangled',
            tooltip: 'Kill a slime',
            done() { return D.gte(player.xp.monsters.slime.kills, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.monsters.slime.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.monsters.slime.color;

                return style;
            },
        },
        12: {
            name: 'Power Up (Not Yours)',
            tooltip: 'Fight a level 2 enemy',
            done() { return D.gte(tmp.xp.monsters.slime.level, 2); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.monsters.slime.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.monsters.slime.color;

                return style;
            },
        },
        13: {
            name: 'I Can Wait All Day',
            tooltip: 'Buy a trap',
            done() { return hasUpgrade('xp', 22); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.monsters.slime.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.monsters.slime.color;

                return style;
            },
        },
        14: {
            name: 'Half Off',
            tooltip: 'Halve an enemy\'s health<br>Reward: +10% experience gain',
            done() { return D.lte(tmp.xp.modifiers.health.mult, .5); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.monsters.slime.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.monsters.slime.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            effect() { return D(1.1); },
        },
        15: {
            name: 'Unhardcapped',
            tooltip() { return `Get more than ${formatWhole(1000)} experience<br>Reward: +500 experience cap`; },
            done() { return D.gt(player.xp.points, 1000); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.monsters.slime.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.monsters.slime.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            effect() { return D(500); },
        },
        31: {
            name: 'Upwards',
            tooltip: 'Level up',
            done() { return D.gte(player.l.points, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.l.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.l.color;

                return style;
            },
            unlocked() { return player.l.unlocked; },
        },
        32: {
            name: 'Skilled',
            tooltip: 'Buy 3 skills',
            done() { return D.gte(player.l.upgrades.length, 3); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.l.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.l.color;

                return style;
            },
            unlocked() { return player.l.unlocked; },
        },
        33: {
            name: 'More Damage',
            tooltip: 'Buy all damage skills',
            done() { return [11, 21, 31].every(id => hasUpgrade('l', id)); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.l.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.l.color;

                return style;
            },
            unlocked() { return player.l.unlocked; },
        },
        34: {
            name: 'Advanced Skills',
            tooltip: 'Buy 5 skills<br>Reward: +1 skill point',
            done() { return D.gte(player.l.upgrades.length, 5); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.l.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.l.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            effect() { return D.dOne; },
            unlocked() { return player.l.unlocked; },
        },
        35: {
            name: 'Ultracap',
            tooltip: 'Buy 3 skill upgrades that affect the experience cap<br>Reward: +1 effective level',
            done() { return [13, 23, 33].every(id => hasUpgrade('l', id)); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.l.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.l.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            effect() { return D.dOne; },
            unlocked() { return player.l.unlocked; },
        },
        41: {
            name: 'Enchanting Table',
            tooltip: 'Get a level of looting',
            done() { return D.gte(getBuyableAmount('c', 11), 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.c.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.c.color;

                return style;
            },
            unlocked() { return player.c.shown; },
        },
        42: {
            name: 'The Hard Way',
            tooltip: 'Craft a slime core',
            done() { return D.gte(player.c.recipes.slime_core.crafted, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.c.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.c.color;

                return style;
            },
            unlocked() { return player.c.shown; },
        },
        43: {
            name: 'Armory',
            tooltip: 'Obtain a slime knife',
            done() { return D.gte(player.items.slime_knife.amount, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.c.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.c.color;

                return style;
            },
            unlocked() { return player.c.shown; },
        },
        44: {
            name: 'The Easy(?) Way',
            tooltip: 'Loot a slime core<br>Reward: +0.1 luck',
            done() { return player.xp.monsters.slime.last_drops.some(([item]) => item == 'slime_core'); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.c.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.c.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            effect() { return D(.1); },
            unlocked() { return player.c.shown; },
        },
        45: {
            name: 'Diminishing Returns',
            tooltip: 'Get slime injector\'s negative effect<br>Reward: slime injector\'s primary effect is applied to crafting speed',
            done() { return D.neq(item_effect('slime_injector').xp_mult, 1); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.c.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            effect() { return item_effect('slime_injector').health; },
            unlocked() { return player.c.shown; },
        },
        51: {
            name: 'Finally, A Boss Fight',
            tooltip: 'Enter a boss fight<br>Reward: The bestiary stays unlocked',
            done() { return activeChallenge('b') !== false; },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.b.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.b.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            unlocked() { return player.b.shown; },
        },
        //todo skeleton achievements
        //#endregion Normal
        //#region Secret
        21: {
            name: 'Overkill',
            tooltip: 'Deal more damage than the enemy\'s health in one attack',
            done() { return Object.values(tmp.xp.monsters).some(mon => D.gte(mon.damage, mon.health)); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Secret Completed!', 3, tmp.ach.categories.secret.color); },
            style() {
                let style = {};

                style['background-color'] = tmp.xp.monsters.slime.color;
                style['border'] = `solid 3px ${tmp.ach.categories.secret.color}`;

                return style;
            },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        22: {
            name: 'Skip',
            tooltip: 'Get more than 1 level at once',
            done() { return false; },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Secret Completed!', 3, tmp.ach.categories.secret.color); },
            style() {
                let style = {};

                style['background-color'] = tmp.l.color;
                style['border'] = `solid 3px ${tmp.ach.categories.secret.color}`;

                return style;
            },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        23: {
            name: 'Disenchanted',
            tooltip: 'Get an item without looting',
            done() { return D.eq(getBuyableAmount('c', 11), 0) && Object.values(player.items).some(it => D.gt(it.amount, 0)); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Secret Completed!', 3, tmp.ach.categories.secret.color); },
            style() {
                let style = {};

                style['background-color'] = tmp.c.color;
                style['border'] = `solid 3px ${tmp.ach.categories.secret.color}`;

                return style;
            },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        61: {
            // Not implemented
            name: 'Cueless',
            tooltip: 'Collect all 15 pool balls<br>Reward: Get a cueball',
            done() { return player.ach.pool_balls.length == 15; },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Secret Completed!', 3, tmp.ach.categories.secret.color); },
            style() {
                let style = {};

                style['background-color'] = tmp.ach.color;
                style['border'] = `solid 3px ${tmp.ach.categories.secret.color}`;

                return style;
            },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        //#endregion Secret
    },
    achievementPopups: false, // This is done manually
    categories: {
        normal: {
            rows: [1, 3, 4, 5],
            color() { return tmp.ach.color; },
            visible() {
                return Object.values(tmp.ach.achievements)
                    .filter(ach => typeof ach == 'object' && this.rows.includes(Math.floor(ach.id / 10)) && (ach.unlocked ?? true));
            },
            owned() { return player.ach.achievements.filter(id => this.rows.includes(Math.floor(id / 10))); },
        },
        secret: {
            rows: [6, 2],
            color: '#FF0077',
            visible() {
                return Object.values(tmp.ach.achievements)
                    .filter(ach => typeof ach == 'object' && this.rows.includes(Math.floor(ach.id / 10)) && (ach.unlocked ?? true));
            },
            owned() { return player.ach.achievements.filter(id => this.rows.includes(Math.floor(id / 10))); },
        },
    },
    automate() {
        if (D.gte(player.items.magic_slime_ball.amount, 1)) {
            let num = 14;
            if (inChallenge('b', 11)) num = 11;
            else if (inChallenge('b', 21)) num = 21;

            if (!player.ach.pool_balls.includes(num)) player.ach.pool_balls.push(num);
        }
    },
});
