'use strict';

addLayer('b', {
    row: 2,
    position: 0,
    type: 'none',
    name: 'boss',
    color: '#CC5555',
    hotkeys: [
        {
            key: 'B',
            description: 'Shift + B: Display boss layer',
            onPress() { showTab('b'); },
            unlocked() { return player.b.shown; },
        },
        {
            key: 'b',
            description: 'B: Complete boss challenge',
            onPress() {
                const chal = activeChallenge('b');
                if (!chal || !canCompleteChallenge('b', chal)) return;

                completeChallenge('b', chal);
            },
            unlocked() { return player.b.shown; },
        },
    ],
    tooltip() {
        if (D.lt(tmp.xp.kill.total, 333) && !player.b.shown) return 'Kill 333 slimes for a boss';

        const wins = Object.values(player.b.challenges).reduce((sum, comp) => D.add(sum, comp), D.dZero);
        return `${formatWhole(wins)} bosses`;
    },
    startData() {
        return {
            unlocked: true,
            shown: false,
        };
    },
    layerShown() { return player.b.shown || D.gt(tmp.xp.kill.total, 250); },
    tabFormat: {
        'Bosses': {
            content: [
                ['display-text', () => {
                    const wins = Object.values(player.b.challenges).reduce((sum, comp) => D.add(sum, comp), D.dZero);
                    return `You have defeated ${resourceColor(tmp.b.color, formatWhole(wins), 'font-size:1.5em;')} bosses`;
                }],
                ['bar', 'boss'],
                'blank',
                ['challenges', [1, 2]],
            ],
        },
    },
    challenges: {
        //#region Bosses
        11: {
            name: 'The Slime King',
            challengeDescription: 'Double slime health and XP',
            goalDescription: 'Kill 250 slimes',
            rewardDescription: 'Slimes grow stronger, XP upgrades stay unlocked, unlock goblins, a boss and a miniboss (Not Implemented)',
            onEnter() { player.b.shown = true; },
            canComplete() { return D.gte(tmp.xp.kill.total, 250); },
            buttonStyle() {
                return {
                    'background-color': this.color,
                };
            },
            color: '#BB2222',
            progress() { return D.div(tmp.xp.kill.total, 250); },
            bar_text() { return `${formatWhole(tmp.xp.kill.total)} / ${formatWhole(250)}`; },
        },
        //#endregion Bosses
        //#region Minibosses
        //#endregion Minibosses
        //#region Artifacts
        //#endregion Artifacts
    },
    bars: {
        boss: {
            direction: RIGHT,
            width: 400,
            height: 80,
            progress() {
                const chal = activeChallenge('b');
                if (!chal) return 0;

                return tmp.b.challenges[chal].progress;
            },
            display() {
                const chal = activeChallenge('b');
                if (!chal) return 'Not in a challenge';

                return tmp.b.challenges[chal].bar_text;
            },
            fillStyle: {
                'background-color'() {
                    const chal = activeChallenge('b');
                    if (chal) return tmp.b.challenges[chal].color;
                },
                'color'() {
                    const chal = activeChallenge('b');
                    if (chal) return rgb_opposite_bw(tmp.b.challenges[chal].color);
                },
            },
        },
    },
    branches: ['l'],
});
