'use strict';

const MAP_SIZES = {
    width: 3,
    height: 3,
};

/** @type {WorldMap} */
const world = {
    map: [
        Array.from({ length: 25 }, () => '#'),
        ['#', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'P', 'S', 'S', 'S', 'S', 'S', 'M', 'M', 'M', 'C', 'C', 'L', '#'],
        ['#', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'P', 'P', 'S', 'S', 'S', 'S', 'S', 'M', 'M', 'M', 'C', 'C', 'C', '#'],
        ['#', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'P', 'P', 'P', 'S', 'S', 'S', 'S', 'M', 'M', 'M', 'C', 'C', 'C', '#'],
        ['#', 'W', 'W', 'W', 'CR', 'W', 'W', 'W', 'W', 'W', 'P', 'P', 'P', 'P', 'S', 'S', 'S', 'S', 'M', 'M', 'CY', 'M', 'M', 'M', '#'],
        ['#', 'W', 'W', 'W', 'W', '.', '.', 'W', 'W', 'W', 'P', 'P', 'P', 'P', 'S', 'S', 'S', 'S', 'S', 'M', '.', '.', 'M', 'M', '#'],
        ['#', 'W', 'W', 'W', 'W', 'W', '.', 'W', 'W', 'P', 'P', 'P', 'P', 'P', 'P', 'S', 'S', 'S', 'S', 'S', 'M', '.', 'M', 'M', '#'],
        ['#', 'B', 'B', 'W', 'W', 'W', '.', 'W', 'P', 'VR', 'P', 'P', 'P', 'P', 'P', 'P', 'S', 'S', 'S', 'S', 'S', '.', 'S', 'S', '#'],
        ['#', 'R', 'B', 'B', 'W', 'W', '.', 'W', 'P', '.', 'P', 'P', 'P', 'P', 'VY', 'P', 'P', 'S', 'S', 'S', '.', '.', 'S', 'S', '#'],
        ['#', 'B', 'R', 'B', 'W', 'W', '.', '.', 'SR', '.', 'P', 'P', 'P', 'P', '.', '.', 'P', 'P', 'S', 'S', '.', 'S', 'S', 'S', '#'],
        ['#', 'B', 'R', 'B', 'W', 'W', 'P', 'P', '.', 'P', 'P', 'P', 'P', 'P', 'P', '.', 'P', 'P', 'P', 'S', '.', 'S', 'S', 'S', '#'],
        ['#', 'R', 'R', 'B', 'W', 'P', 'P', 'P', '.', 'P', 'P', 'P', 'P', 'P', 'P', '.', 'P', 'P', '.', '.', '.', 'S', 'S', 'S', '#'],
        ['#', 'R', 'B', 'B', 'P', 'P', 'P', 'P', '.', '.', 'SB', '.', 'CO', '.', '.', 'SY', '.', '.', '.', 'P', 'P', 'P', 'P', 'P', '#'],
        ['#', 'R', 'B', 'P', 'P', 'P', 'P', 'P', 'P', 'P', '.', 'P', 'P', 'P', 'P', '.', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', '#'],
        ['#', 'R', 'B', 'P', 'P', 'P', 'P', 'P', 'P', 'P', '.', 'P', 'P', 'P', 'P', '.', 'P', 'P', 'P', 'P', 'P', 'P', 'F', 'P', '#'],
        ['#', 'R', 'B', 'B', 'P', 'P', 'P', 'P', 'P', 'P', '.', 'P', 'P', 'P', '.', 'SG', '.', '.', 'P', 'P', 'P', 'P', 'P', 'P', '#'],
        ['#', 'O', 'O', 'B', 'B', 'B', 'B', 'B', 'B', '.', '.', 'P', 'P', 'P', '.', 'P', 'P', '.', 'F', 'F', 'F', 'F', 'F', 'F', '#'],
        ['#', 'O', 'O', 'O', 'O', 'O', 'O', 'B', 'B', '.', 'P', 'P', 'P', 'VG', '.', 'P', 'P', '.', '.', '.', '.', 'F', 'F', 'F', '#'],
        ['#', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'B', '.', 'P', 'P', 'P', 'P', 'P', 'P', 'F', 'F', 'F', 'F', '.', 'F', 'F', 'F', '#'],
        ['#', 'O', 'O', 'O', 'O', 'O', 'O', 'D', 'B', '.', 'P', 'P', 'P', 'P', 'P', 'F', 'F', 'F', 'F', 'F', '.', 'F', 'F', 'F', '#'],
        ['#', 'O', 'O', 'O', 'O', 'O', 'CS', 'D', 'CB', '.', 'P', 'P', 'P', 'P', 'P', 'P', 'F', 'F', 'F', 'F', 'CG', 'F', 'F', 'F', '#'],
        ['#', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'B', 'B', 'P', 'P', 'P', 'P', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', '#'],
        ['#', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'B', 'B', 'B', 'P', 'P', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', '#'],
        ['#', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'B', 'B', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', '#'],
        Array.from({ length: 25 }, () => '#'),
    ],
    info: {
        '#': {
            solid: true,
            color: '#00000000',
            name: 'deadly mountains',
        },
        'W': {
            color: '#776655',
            name: 'rotten wastelands',
            overrides: {
                monsters: ['skeleton'],
            },
        },
        'P': {
            color: '#99DD44',
            name: 'slime plains',
            overrides: {
                monsters: ['slime'],
            },
        },
        'S': {
            color: '#8899AA',
            name: 'mountain base',
            overrides: {
                ores: ['stone', 'copper', 'tin'],
                monsters: ['golem'],
            },
        },
        'M': {
            color: '#667788',
            name: 'mountain',
            overrides: {
                ores: ['stone', 'copper', 'tin', 'coal', 'iron', 'silver'],
                monsters: ['golem'],
            },
        },
        'C': {
            color: '#445566',
            name: 'caldera',
            overrides: {
                ores: ['coal', 'iron', 'silver'],
                monsters: ['golem'],
            },
        },
        '.': {
            color: '#FFDD99',
            name: 'path',
        },
        'B': {
            color: '#EEDDAA',
            name: 'beach',
            overrides: {
                monsters: ['golem'],
            },
        },
        'R': {
            color: '#AAFFDD',
            name: 'river',
        },
        'F': {
            color: '#226644',
            name: 'forest',
        },
        'D': {
            color: '#BB7744',
            name: 'dock',
        },
        'O': {
            color: '#22DDCC',
            name: 'ocean',
            solid: true,
        },
        'L': {
            color: '#BB2222',
            name: 'throat',
            overrides: {
                forgable: true,
            },
        },
        'SR': {
            color: '#553333',
            name: 'wastelands sign',
            lore: `← <span style="color:#DD3322">Colocamp</span><br>\
                → Fecht<br>\
                ↓ <span style="color:#FFAA11">Sequorcap</span>`,
            icon: [1, 2],
        },
        'SY': {
            color: '#553333',
            name: 'mountain sign',
            lore: `→ <span style="color:#FFFF44">Solinfra</span><br>\
                ← <span style="color:#FFAA11">Sequorcap</span><br>\
                ↓ Forest`,
            icon: [1, 2],
        },
        'SB': {
            color: '#553333',
            name: 'ocean sign',
            lore: `← Wastelands<br>\
                → <span style="color:#FFAA11">Sequorcap</span><br>\
                ↓ <span style="color:#2299DD">Saiwipeysk</span>`,
            icon: [1, 2],
        },
        'SG': {
            color: '#553333',
            name: 'forest sign',
            lore: `← Grasweud<br>\
                → <span style="color:#11AA22">Harfyri</span><br>\
                ↑ <span style="color:#FFAA11">Sequorcap</span>`,
            icon: [1, 2],
        },
        'VR': {
            color: '#771122',
            name: 'Fecht',
            lore: `A small village on the edge of the wastelands.<br>\
                Many retired warriors have joined to help fight the undeads.<br>\
                Most of the time, they help the village with less dangerous tasks.`,
            icon: [2, 0],
            overrides: {
                craftable: true,
                buy: true,
            },
        },
        'VY': {
            color: '#EEDDAA',
            name: 'Rikijaz',
            lore: `A small village near the mountain.<br>\
                Many merchants pass by for a break before visiting Solinfra.<br>\
                The inhabitants are very welcoming.`,
            icon: [2, 0],
            overrides: {
                craftable: true,
                buy: true,
            },
        },
        'VG': {
            color: '#117733',
            name: 'Grasweud',
            lore: `A small village near the forest.<br>\
                The source of most wood in the kingdom.<br>\
                Lots of fruits grow there too.`,
            icon: [2, 0],
            overrides: {
                craftable: true,
                buy: true,
            },
        },
        'CO': {
            color: '#774433',
            name: 'Sequorcap',
            lore: `The capital of the kingdom. Contains all sorts of things.<br>\
                Altough called a kingdom, there is no king currently leading it.<br>\
                You haven't kept up with the elections, aside of the fact that they were delayed <i>again</i>.`,
            icon: [0, 0],
            overrides: {
                craftable: true,
                forgable: true,
                buy: true,
                sell: true,
            },
        },
        'CR': {
            color: '#DD3322',
            name: 'Colocamp',
            lore: `A scout camp deep in the undead wastelands that turned into a city.<br>\
                Full of warriors fighting until the undeads are no more.<br>\
                There's an arena in the center, for the more competitive ones.`,
            icon: [0, 1],
            overrides: {
                craftable: true,
                forgable: true,
                buy: true,
                sell: true,
            },
            package: {
                item: 'package_1',
                value() {
                    if (player.wor.delivered[this.item]) return D(500);
                    return D(750);
                },
            },
        },
        'CY': {
            color: '#FFFF44',
            name: 'Solinfra',
            lore: `An underground city ruin that was renovated by an exiled noble.<br>\
                No traces of the former inhabitants could be found anywhere.<br>
                Miners and academics often work together find new minerals and informations.`,
            icon: [1, 0],
            overrides: {
                craftable: true,
                forgable: true,
                buy: true,
                sell: true,
            },
            package: {
                item: 'package_3',
                value() {
                    if (player.wor.delivered[this.item]) return D(1_000);
                    return D(1_250);
                },
            },
        },
        'CB': {
            color: '#2299DD',
            name: 'Saiwipeysk',
            lore: `A coastal city that mainly trades fish.<br>\
                They have a dock for merchant ships passing by.<br>\
                If you're delivering a package, you might wish to check with the boat there.`,
            icon: [2, 1],
            overrides: {
                craftable: true,
                forgable: true,
                buy: true,
                sell: true,
            },
        },
        'CG': {
            color: '#11AA22',
            name: 'Harfyri',
            lore: `A large city built on top and inside of a large tree.<br>\
                The whole tree is coated in anti-fire substances.<br>\
                Strange fruits are grown inside of it, but they cost extra.`,
            icon: [1, 1],
            overrides: {
                craftable: true,
                forgable: true,
                buy: true,
                sell: true,
            },
            package: {
                item: 'package_4',
                value() {
                    if (player.wor.delivered[this.item]) return D(1_250);
                    return D(1_500);
                },
            },
        },
        'CS': {
            color: '#DDAA66',
            name: `captain Goldtooth's ship`,
            lore: `A ship belonging to captain Goldtooth.<br>\
                Thanks to your help, she has paid back more of her debt and started a shipping company.<br>\
                Is there any pair of people you want to see more often together?`,
            icon: [0, 2],
            overrides: {
                buy: true,
                sell: true,
            },
            package: {
                item: 'package_2',
                value() {
                    if (player.wor.delivered[this.item]) return D(750);
                    return D(1_000);
                },
            },
        },
    },
};

addLayer('wor', {
    row: 'side',
    position: 2,
    type: 'none',
    hotkeys: [{
        key: 'm',
        description: 'M: Open the map',
        onPress() { if (tmp.wor.layerShown) showTab('wor'); },
        unlocked() { return tmp.wor.layerShown; },
    }],
    symbol: '🌍',
    color: '#338866',
    startData() {
        return {
            unlocked: true,
            position: [12, 12],
            delivered: {},
            visited: [
                [12, 12],
            ],
            zoom: 10,
        };
    },
    tooltip() {
        const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];

        if (!key) return 'Nowhere';

        return capitalize(world.info[key].name);
    },
    layerShown() { return inChallenge('b', 32); },
    tabFormat: {
        'Map': {
            content: [
                'grid',
                'blank',
                ['clickable', 'up'],
                ['row', [
                    ['clickable', 'left'],
                    ['clickable', 'ghost'],
                    ['clickable', 'right'],
                ]],
                ['clickable', 'down'],
            ],
        },
        'Info': {
            content: [
                ['display-text', () => {
                    const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];

                    if (!key) return 'Nowhere';

                    return capitalize(world.info[key].name);
                }],
                ['column', () => {
                    const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];

                    if (!key || !world.info[key].lore) return;

                    return [
                        'blank',
                        ['display-text', '<u>Info:</u>'],
                        ['display-text', world.info[key].lore],
                    ];
                }],
                'blank',
                ['clickable', 'submit'],
            ],
        },
        'Minimap': {
            content: [
                ['row', [
                    ['clickable', 'zoom_in'],
                    'blank',
                    ['clickable', 'zoom_out'],
                ]],
                ['display-text', () => `Zoom level: ${formatWhole(player.wor.zoom)}`],
                'blank',
                ['raw-html', () => `<canvas id="world-map" width="${25 * player.wor.zoom}" height="${25 * player.wor.zoom}" />`],
            ],
        }
    },
    clickables: {
        // Map
        'up': {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-120px -240px',
            },
            canClick() {
                if (inChallenge('b', 31) && D.lte(player.dea.health, 0)) return false;

                const next = player.wor.position[0] - 1,
                    key = world.map?.[next]?.[player.wor.position[1]];

                if (!key) return false;

                const info = world.info[key];
                return !info.solid;
            },
            onClick() {
                player.wor.position = [
                    player.wor.position[0] - 1,
                    player.wor.position[1],
                ];
            },
        },
        'down': {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-360px -240px',
            },
            canClick() {
                if (inChallenge('b', 31) && D.lte(player.dea.health, 0)) return false;

                const next = player.wor.position[0] + 1,
                    key = world.map?.[next]?.[player.wor.position[1]];

                if (!key) return false;

                const info = world.info[key];
                return !info.solid;
            },
            onClick() {
                player.wor.position = [
                    player.wor.position[0] + 1,
                    player.wor.position[1],
                ];
            },
        },
        'left': {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '0px -240px',
            },
            canClick() {
                if (inChallenge('b', 31) && D.lte(player.dea.health, 0)) return false;

                const next = player.wor.position[1] - 1,
                    key = world.map?.[player.wor.position[0]]?.[next];

                if (!key) return false;

                const info = world.info[key];
                return !info.solid;
            },
            onClick() {
                player.wor.position = [
                    player.wor.position[0],
                    player.wor.position[1] - 1,
                ];
            },
        },
        'right': {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-240px -240px',
            },
            canClick() {
                if (inChallenge('b', 31) && D.lte(player.dea.health, 0)) return false;

                const next = player.wor.position[1] + 1,
                    key = world.map?.[player.wor.position[0]]?.[next];

                if (!key) return false;

                const info = world.info[key];
                return !info.solid;
            },
            onClick() {
                player.wor.position = [
                    player.wor.position[0],
                    player.wor.position[1] + 1,
                ];
            },
        },
        'ghost': {
            style: {
                'background-color': 'transparent',
                'cursor': 'unset',
            },
        },
        // Info
        'submit': {
            style: {
                'background-image': `url(./resources/images/UI.png)`,
                'background-repeat': 'no-repeat',
                'image-rendering': 'pixelated',
                'background-size': `${UI_SIZES.width * 120}px ${UI_SIZES.height * 120}px`,
                'background-position': '-360px -120px',
            },
            canClick() {
                if (inChallenge('b', 31) && D.lte(player.dea.health, 0)) return false;

                const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];
                if (!key) return false;

                const info = world.info[key];
                if (!info.package) return false;

                return D.gte(player.items[info.package.item].amount, 1);
            },
            onClick() {
                const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];
                if (!key) return;

                const info = world.info[key];
                if (!info.package || D.lt(player.items[info.package.item].amount, 1)) return;

                const coins = value_coin(run(info.package.value, info.package)),
                    list = coins.map(([item, amount]) => `${formatWhole(amount)} ${tmp.items[item].name}`);

                gain_items(info.package.item, -1);
                gain_items(coins);
                player.wor.delivered[info.package.item] = true;

                doPopup('challenge', `You earned ${listFormat.format(list)}`, 'Delivery complete', 3, tmp.wor.color);
            },
            tooltip() {
                const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];
                if (!key) return;

                const info = world.info[key];
                if (!info.package) return 'Nothing to deliver here';

                const item = info.package.item,
                    name = tmp.items[item].name;
                if (D.lt(player.items[item].amount, 1)) {
                    return `You need ${formatWhole(1)} ${name}`;
                } else {
                    return `Deliver ${name}`;
                }
            },
        },
        // Minimap
        'zoom_in': {
            style: {
                'height': '80px',
                'min-height': 'unset',
                'width': '80px',
            },
            onClick() {
                player.wor.zoom++;
            },
            canClick() { return true; },
            display: '+',
        },
        'zoom_out': {
            style: {
                'height': '80px',
                'min-height': 'unset',
                'width': '80px',
            },
            onClick() {
                player.wor.zoom--;
            },
            canClick() { return player.wor.zoom > 1; },
            display: '-',
        },
    },
    grid: {
        rows: 5,
        cols: 5,
        getStartData(_) { return ''; },
        getStyle(_, id) {
            const row = D.floor(id / 100) - 3 + player.wor.position[0],
                col = D.floor(id % 100) - 3 + player.wor.position[1],
                key = world.map?.[row]?.[col];

            if (!key) return { 'background-color': 'transparent' };

            const info = world.info[key],
                style = { 'background-color': info.color, };
            if (id == '303') {
                Object.assign(style, {
                    'border': `${tmp.b.groups.relic.color} 3px dashed`,
                });
            }
            if (info.icon) {
                Object.assign(style, {
                    'background-image': `url(./resources/images/map_icons.png)`,
                    'background-origin': `border-box`,
                    'background-repeat': `no-repeat`,
                    'image-rendering': 'pixelated',
                    'background-size': `${MAP_SIZES.width * 80}px ${MAP_SIZES.height * 80}px`,
                    'background-position-x': `${info.icon[1] * -80}px`,
                    'background-position-y': `${info.icon[0] * -80}px`,
                    'transform': 'initial',
                });
            }

            return style;
        },
    },
    automate() {
        if (!player.wor.visited.some(([row, col]) => row == player.wor.position[0] && col == player.wor.position[1])) {
            player.wor.visited.push([...player.wor.position]);
        }

        /** @type {HTMLCanvasElement?} */
        const world_canvas = document.getElementById('world-map');
        if (world_canvas) {
            const ctx = world_canvas.getContext('2d'),
                zoom = player.wor.zoom,
                /** @type {[row: number, col: number][]} */
                drawn = [],
                img = new Image,
                /** @type {(row: number, col: number) => void} */
                draw_tile = (row, col) => {
                    const info = world.info[world.map[row][col]];
                    ctx.fillStyle = info.color;
                    ctx.fillRect(col * zoom, row * zoom, zoom, zoom);
                    if (info.icon) {
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(img,
                            16 * info.icon[1], 16 * info.icon[0], 16, 16,
                            col * zoom, row * zoom, zoom, zoom,
                        );
                    }
                };
            img.src = './resources/images/map_icons.png';
            player.wor.visited.forEach(([row, col]) => {
                for (let x = -2; x <= 2; x++) {
                    for (let y = -2; y <= 2; y++) {
                        const tx = row + x,
                            ty = col + y;
                        if (ty >= 0 && ty < 25 &&
                            tx >= 0 && tx < 25 &&
                            !drawn.some(([r, c]) => r == tx && c == ty)) {
                            drawn.push([tx, ty]);
                            draw_tile(tx, ty);
                        }
                    }
                }
            });
        }
    },
    overrides: {
        xp: {
            monsters() {
                const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];

                if (!key) return;

                return world.info[key].overrides?.monsters ?? [];
            },
        },
        m: {
            ores() {
                const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];

                if (!key) return;

                return world.info[key].overrides?.ores ?? [];
            },
        },
        c: {
            craftable() {
                const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];

                if (!key) return;

                return world.info[key].overrides?.craftable ?? false;
            },
            forgable() {
                const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];

                if (!key) return;

                return world.info[key].overrides?.forgable ?? false;
            },
        },
        s: {
            can_buy() {
                const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];

                if (!key) return;

                return world.info[key].overrides?.buy ?? false;
            },
            can_sell() {
                const key = world.map?.[player.wor.position[0]]?.[player.wor.position[1]];

                if (!key) return;

                return world.info[key].overrides?.sell ?? false;
            },
        },
    },
});
