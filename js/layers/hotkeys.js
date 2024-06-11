'use strict';

/*
This layer is only for global hotkeys that can't be disabled
It also makes it so global hotkeys are first
*/
addLayer('_hotkeys', {
    row: 0,
    startData() { return { unlocked: true, points: D.dZero, }; },
    hotkeys: [
        {
            key: '',
            description: 'Shift (hold): Display formulas',
        },
        {
            key: 'ArrowLeft',
            description: '←: Move to previous tab',
            onPress() {
                if (!layers[player.tab] || !layers[player.tab].tabFormat) return;

                let tabs = Object.keys(layers[player.tab].tabFormat).filter(id => {
                    return tmp[player.tab].tabFormat[id].unlocked ?? true;
                });
                if (tabs.length <= 1) return;
                let currentTab = player.subtabs[player.tab].mainTabs;
                let currentIndex = tabs.indexOf(currentTab);

                player.subtabs[player.tab].mainTabs = tabs[(currentIndex + tabs.length - 1) % tabs.length];
            },
        },
        {
            key: 'ArrowRight',
            description: '→: Move to next tab',
            onPress() {
                if (!layers[player.tab] || !layers[player.tab].tabFormat) return;

                let tabs = Object.keys(layers[player.tab].tabFormat).filter(id => {
                    return tmp[player.tab].tabFormat[id].unlocked ?? true;
                });
                if (tabs.length <= 1) return;
                let currentTab = player.subtabs[player.tab].mainTabs;
                let currentIndex = tabs.indexOf(currentTab);

                player.subtabs[player.tab].mainTabs = tabs[(currentIndex + 1) % tabs.length];
            },
        },
        {
            //hehe
            key: '',
            description: 'Alt+F4: Double all owned resources',
            unlocked() {
                const now = new Date();
                return now.getDate() == 1 && now.getMonth() == 3;
            },
        },
    ],
    type: 'none',
    nodeStyle: { 'display': 'none', },
    layerShown: false,
});
