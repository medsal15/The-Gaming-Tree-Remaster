'use strict';

//todo? forge achievements
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
                ['display-text', 'Achievements with yellow borders have bonuses'],
                'blank',
                ['achievements', () => tmp.ach.categories.normal.rows],
            ],
        },
        'Bonus': {
            content: [
                ['display-text', () => {
                    const color = tmp.ach.categories.bonus.color,
                        owned = tmp.ach.categories.bonus.owned.length,
                        visible = tmp.ach.categories.bonus.visible.length;

                    return `You have ${resourceColor(color, formatWhole(owned), 'font-size:1.5em;')} /${resourceColor(color, formatWhole(visible))} achievements`;
                }],
                'blank',
                ['achievements', () => tmp.ach.categories.bonus.rows],
            ],
            buttonStyle: { 'border-color'() { return tmp.ach.categories.bonus.color; } },
            unlocked() { return D.gt(tmp.ach.categories.bonus.visible.length, 0); },
        },
        'Secrets': {
            content: [
                ['display-text', () => {
                    const color = tmp.ach.categories.secret.color,
                        owned = tmp.ach.categories.secret.owned.length;

                    return `You have ${resourceColor(color, formatWhole(owned), 'font-size:1.5em;')} secrets`;
                }],
                ['display-text', () => {
                    const owned = player.ach.pool_balls.length;
                    if (owned <= 0) return;
                    let name = '???';
                    if (owned > 7) name = 'Balls';
                    return `${name}: ${resourceColor(tmp.items.cueball.color, formatWhole(owned))} /${resourceColor(tmp.items.cueball.color, formatWhole(15))}`;
                }],
                'blank',
                ['achievements', () => tmp.ach.categories.secret.rows],
            ],
            buttonStyle: { 'border-color'() { return tmp.ach.categories.secret.color; } },
            unlocked() { return D.gt(tmp.ach.categories.secret.visible.length, 0) || player.ach.pool_balls.length > 0; },
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
            done() { return D.gte(tmp.l.skill_points.skills, 5); },
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
        52: {
            name: `You're Boned`,
            tooltip: 'Kill a skeleton',
            done() { return D.gte(player.xp.monsters.skeleton.kills, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.monsters.skeleton.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.monsters.skeleton.color;

                return style;
            },
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
        },
        53: {
            name: 'Brown Metal',
            tooltip: 'Make some bronze',
            done() { return D.gt(player.items.bronze_blend.amount, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.items.bronze_blend.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.items.bronze_blend.color;

                return style;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        54: {
            name: 'A Bone to Pick',
            tooltip: 'Obtain a bone pick<br>Reward: Increase mining damage by 0.25',
            done() { return D.gte(player.items.bone_pick.amount, 1) },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.xp.monsters.skeleton.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.xp.monsters.skeleton.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
            effect() { return D(.25); },
        },
        55: {
            name: '24k Real',
            tooltip: 'Get gold<br>Reward: +0.25 drop chance multiplier',
            done() { return D.gte(player.items.gold_nugget.amount, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.items.gold_nugget.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.items.gold_nugget.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            unlocked() { return tmp.m.layerShown; },
            effect() { return D(.25); },
        },
        71: {
            name: 'PayDay',
            tooltip: 'Fight Captain Goldtooth<br>Reward: The handbook stays unlocked',
            done() { return inChallenge('b', 12); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.b.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.b.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        72: {
            name: 'What a sale',
            tooltip: 'Sell something',
            done() { return Object.values(player.s.trades).some(data => D.gt(data.sold, 0)); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.s.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.s.color;

                return style;
            },
            unlocked() { return inChallenge('b', 12) || hasChallenge('b', 12); },
        },
        73: {
            name: 'Read It Again',
            tooltip: 'Buy ROI.<br>It says coins. Coins!',
            done() { return hasUpgrade('s', 21); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.s.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.s.color;

                return style;
            },
            unlocked() { return inChallenge('b', 12) || hasChallenge('b', 12); },
        },
        74: {
            name: 'Lot of money',
            tooltip: 'Get a gold coin<br>Reward: Double gold nugget chance',
            done() { return D.gte(player.items.coin_gold, 1); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.s.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.s.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            unlocked() { return inChallenge('b', 12) || hasChallenge('b', 12); },
            effect() { return D.dTwo; },
        },
        75: {
            name() {
                if (!hasAchievement(this.layer, this.id)) return 'A Great Deal';
                return 'Scammed!';
            },
            tooltip: 'Buy a map<br>Reward: Keep the compactor unlocked',
            done() { return hasUpgrade('s', 33); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.s.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.s.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            unlocked() { return inChallenge('b', 12) || hasChallenge('b', 12); },
        },
        91: {
            name: 'Not Quite A Black Hole',
            tooltip: 'Use the Compactor to turn ore into a strange mineral',
            done() { return D.gt(player.m.compactor.runs, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.items.densium.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.items.densium.color;

                return style;
            },
            unlocked() { return tmp.m.compactor.unlocked; },
        },
        92: {
            name: 'Darkstone',
            tooltip: 'Obtain Coal',
            done() { return D.gt(player.items.coal.amount, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.items.coal.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.items.coal.color;

                return style;
            },
            unlocked() { return tmp.m.compactor.unlocked; },
        },
        93: {
            name: 'Red Metal',
            tooltip: 'Get some iron... rust???',
            done() { return D.gt(player.items.iron_ore.amount, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.items.iron_ore.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.items.iron_ore.color;

                return style;
            },
            unlocked() { return tmp.m.compactor.unlocked; },
        },
        94: {
            name: 'Rustless',
            tooltip: 'Get some iron<br>Reward: Mining upgrades stay unlocked',
            done() { return D.gt(player.items.clear_iron_ore.amount, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.items.clear_iron_ore.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.items.clear_iron_ore.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            unlocked() { return tmp.m.compactor.unlocked; },
        },
        95: {
            name: 'Shocking!',
            tooltip() {
                return `Craft some electrum<br>
                    Reward: Keep ${resourceColor(tmp.items.densium.color, tmp.m.upgrades[61].title)} on all resets`;
            },
            done() { return D.gt(player.items.electrum_blend.amount, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.items.electrum_blend.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.items.electrum_blend.color;
                style['border'] = `solid 3px ${tmp.ach.color}`;

                return style;
            },
            unlocked() { return tmp.m.compactor.unlocked; },
        },
        //todo forge achievements
        //#endregion Normal
        //#region Bonus
        81: {
            name: 'Regicide',
            tooltip: 'Defeat the Slime Monarch',
            done() { return hasChallenge('b', 21); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.b.groups.mini.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.b.groups.mini.color;

                return style;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        82: {
            name: 'You Died',
            tooltip: 'Die',
            done() { return D.lte(player.dea.health, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.dea.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.dea.color;

                return style;
            },
            unlocked() { return hasChallenge('b', 21); },
        },
        83: {
            name: 'Another Chance',
            tooltip: 'Undie',
            done() { return D.gt(player.dea.points, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.dea.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.dea.color;

                return style;
            },
            unlocked() { return hasChallenge('b', 21); },
        },
        84: {
            name: 'Riskless',
            tooltip: 'Start regenerating health',
            done() { return D.gt(tmp.dea.player.regen, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.dea.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.dea.color;

                return style;
            },
            unlocked() { return hasChallenge('b', 21); },
        },
        85: {
            name: 'Undying',
            tooltip: 'Survive a fatal hit',
            done() { return D.gt(player.dea.survives, 0); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Achievement Completed!', 3, tmp.dea.color); },
            style() {
                let style = {};

                if (hasAchievement(this.layer, this.id)) style['background-color'] = tmp.dea.color;

                return style;
            },
            unlocked() { return hasChallenge('b', 21); },
        },
        //#endregion Bonus
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
        24: {
            name: 'No Stone Left Unturned',
            tooltip: 'Get the odds of mining stone lower than tin',
            done() { return D.gte(tmp.m.ores.tin.weight, tmp.m.ores.stone.weight); },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Secret Completed!', 3, tmp.ach.categories.secret.color); },
            style() {
                let style = {};

                style['background-color'] = tmp.m.nodeStyle.backgroundColor;
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
        101: {
            name: 'So What Was The Point Of It Then?',
            tooltip: 'Get a level without any XP experience',
            done() { return false; },
            onComplete() { doPopup('achievement', tmp[this.layer].achievements[this.id].name, 'Secret Completed!', 3, tmp.ach.categories.secret.color); },
            style() {
                let style = {};

                style['background-color'] = tmp.ach.categories.secret.color;

                return style;
            },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        //#endregion Secret
    },
    achievementPopups: false, // This is done manually
    categories: {
        normal: {
            rows: [1, 3, 4, 5, 7, 9],
            color() { return tmp.ach.color; },
            visible() {
                return Object.values(tmp.ach.achievements)
                    .filter(ach => typeof ach == 'object' && this.rows.includes(Math.floor(ach.id / 10)) && (ach.unlocked ?? true));
            },
            owned() { return player.ach.achievements.filter(id => this.rows.includes(Math.floor(id / 10))); },
        },
        bonus: {
            rows: [8],
            color: '#0077FF',
            visible() {
                return Object.values(tmp.ach.achievements)
                    .filter(ach => typeof ach == 'object' && this.rows.includes(Math.floor(ach.id / 10)) && (ach.unlocked ?? true));
            },
            owned() { return player.ach.achievements.filter(id => this.rows.includes(Math.floor(id / 10))); },
        },
        secret: {
            rows: [6, 2, 10],
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
        if (D.gte(player.items.magic_densium_ball, 1) && !player.ach.pool_balls.includes(8)) {
            player.ach.pool_balls.push(8);
        }
    },
});
