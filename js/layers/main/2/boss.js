'use strict';

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
        if (!player.b.shown) return `Reach ${formatWhole(500)} kills to fight (you have ${formatWhole(tmp.xp.kill.total)} kills)`;
        return `${formatWhole(tmp.b.complete)} bosses beaten`;
    },
    startData() {
        return {
            unlocked: true,
            shown: false,
            points: D.dZero,
        };
    },
    layerShown() { return player.b.shown || D.gte(tmp.xp.kill.total, 250); },
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
                    return `You have beaten ${resourceColor(tmp.b.color, formatWhole(tmp.b.complete), 'font-size:1.5em;')} bosses`;
                }],
                'blank',
                ['bar', 'progress'],
                'blank',
                ['challenge', 11],
            ],
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
                    return D.div(tmp.xp.kill.total, 500);
                }
                return D.dZero;
            },
            display() {
                const chal = activeChallenge('b');
                if (chal && inChallenge('b', chal)) return layers.b.challenges[chal].display();

                if (!tmp.b.challenges[11].unlocked) {
                    return `${formatWhole(tmp.xp.kill.total)} / ${formatWhole(500)} kills`;
                }
                return 'No bosses left';
            },
            fillStyle: {
                'backgroundColor'() { return tmp.b.color; },
            },
        },
    },
    challenges: {
        11: {
            name: 'Slime King',
            challengeDescription: `Fight the Slime King and anger the slimes<br>\
                Double slime health and experience, slime items effects are boosted.`,
            rewardDescription: `+50% slime experience, slime items effects boost is kept, unlock a new enemy, and XP upgrades stay unlocked`,
            goalDescription: 'Kill 500 slimes',
            canComplete() { return D.gte(tmp.xp.kill.total, 500); },
            progress() { return D.div(tmp.xp.kill.total, 500); },
            display() { return `${formatWhole(tmp.xp.kill.total)} / ${formatWhole(500)} kills`; },
            unlocked() { return hasChallenge('b', 11) || inChallenge('b', 11) || D.gte(tmp.xp.kill.total, 500) || player.b.shown; },
            onEnter() { player.b.shown = true; },
            color() { return tmp.b.color; },
        },
    },
    complete() { return Object.values(player.b.challenges).reduce((sum, n) => D.add(sum, n), D.dZero); },
    branches: ['l'],
    nodeStyle: {
        'backgroundColor'() {
            if (!player.b.shown && D.lt(tmp.xp.kill.total, 500)) return colors[options.theme].locked;
            return tmp.b.color;
        },
    },
});
