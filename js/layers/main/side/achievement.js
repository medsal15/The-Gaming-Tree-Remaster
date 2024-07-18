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
        //#endregion Normal
        //#region Secret
        //#endregion Secret
    },
    achievementPopups: false, // This is done manually
    categories: {
        normal: {
            rows: [],
            color() { return tmp.ach.color; },
            visible() {
                return Object.values(tmp.ach.achievements)
                    .filter(ach => typeof ach == 'object' && this.rows.includes(Math.floor(ach.id / 10)) && (ach.unlocked ?? true));
            },
            owned() { return player.ach.achievements.filter(id => this.rows.includes(Math.floor(id / 10))); },
        },
        secret: {
            rows: [],
            color: '#FF0077',
            visible() {
                return Object.values(tmp.ach.achievements)
                    .filter(ach => typeof ach == 'object' && this.rows.includes(Math.floor(ach.id / 10)) && (ach.unlocked ?? true));
            },
            owned() { return player.ach.achievements.filter(id => this.rows.includes(Math.floor(id / 10))); },
        },
    },
});
