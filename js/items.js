/**
 * @type {{[id in items]: Item<id>}}
 */
const item_list = {
    'unknown': {
        id: null,
        color: '#445566',
        name: 'unknown',
        row: 'side',
        lore: `What could this be?<br>
            Is it a snowball, a rare gem, or another undiscovered object?<br>
            So mysterious...`,
        categories: [],
    },
    // Slime
    'slime_goo': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime goo',
        grid: [0, 0],
        icon() {
            let icon = [0, 0];

            if (inChallenge('b', 11)) icon[1] += 4;
            if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 2);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                return { 'kill:slime': chance };
            },
        },
        lore() {
            if (inChallenge('b', 11)) return `A chunk of orange goo.<br>
                Feels warm to the touch.<br>
                Tastes bad and spicy.`;

            if (inChallenge('b', 21)) return `A chunk of light blue goo.<br>
                Feels cold to the touch.<br>
                Tastes minty, but stays stuck to your tongue.`;

            return `A chunk of green goo.<br>
                Feels weird to the touch.<br>
                Not only does it taste like dirty water, but it's hard to chew.`;
        },
        categories: ['materials', 'slime'],
    },
    'slime_core_shard': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime core shard',
        grid: [0, 1],
        icon() {
            let icon = [0, 1];

            if (inChallenge('b', 11)) icon[1] += 4;
            if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 7);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                return { 'kill:slime': chance };
            },
        },
        lore() {
            if (inChallenge('b', 11)) return `A dark red shard.<br>
                Very sharp, be careful when handling.<br>
                Can be recombined into an intact core with a bit of goo.`;

            if (inChallenge('b', 21)) return `A blue shard.<br>
                Surprisingly dull.<br>
                Can be recombined into an intact core with a bit of goo.`;

            return `A dark green shard.<br>
                Surprisingly sharp, so careful when handling.<br>
                Can be recombined into an intact core with a bit of goo.`;
        },
        categories: ['materials', 'slime'],
    },
    'slime_core': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime core',
        grid: [0, 2],
        icon() {
            let icon = [0, 2];

            if (inChallenge('b', 11)) icon[1] += 4;
            if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 24);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                chance = chance.times(item_effect('slime_die').core_chance);

                return { 'kill:slime': chance };
            },
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `The very core of a slime.<br>
                Hot to the touch and valuable.<br>
                Hard, but shatters easily.`;

            if (inChallenge('b', 21)) return `The very core of a slime.<br>
                Cold to the touch and valuable.<br>
                Hard, does not shatter when thrown to the ground.<br>
                Why is still so hard to get it then?`;

            return `The very core of a slime.<br>
                Smooth to the touch and valuable.<br>
                Fragile! Handle with care.`;
        },
        categories: ['materials', 'slime'],
    },
    'dense_slime_core': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'dense slime core',
        grid: [0, 3],
        icon() {
            let icon = [0, 3];

            if (inChallenge('b', 11)) icon[1] += 4;
            if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `Are you sure this is a good idea?<br>
                It glows in an angry red light.<br>
                You can feel it pulse in your hands.`;

            if (inChallenge('b', 21)) return `This is a bad idea.<br>
                It glows in a cold blue light.<br>
                Even through thick gloves, you can feel it slowly freeze your hands.`;

            return `The- This- What even is this?<br>
                It glows in a worrying green light.<br>
                You can feel it pulse in your hands.`;
        },
        categories: ['materials', 'slime'],
    },
    'slime_crystal': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime crystal',
        grid: [0, 4],
        icon() {
            let icon = [1, 0];

            if (inChallenge('b', 11)) icon[1] += 4;
            if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `A bright red crystal made of pure slime.<br>
                Can hold experience better than you.<br>
                A clunky nightlight.`;

            if (inChallenge('b', 21)) return `A bright blue crystal made of pure slime.<br>
                Can hold experience as well as you.<br>
                A clunky lamp.`;

            return `A bright green crystal made of pure slime.<br>
                Can hold experience better than you.<br>
                A clunky nightlight.`;
        },
        categories: ['equipment', 'slime'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let xp_mult, xp_cap;

            if (inChallenge('b', 21)) {
                xp_mult = D.div(x, 11).add(1);
                xp_cap = D.pow(1.05, x);
            } else if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                xp_mult = D.div(x, 9).add(1);
                xp_cap = D.pow(1.15, x);
            } else {
                xp_mult = D.div(x, 10).add(1);
                xp_cap = D.pow(1.1, x);
            }

            return { xp_mult, xp_cap, };
        },
        effectDescription(amount) {
            let gain, cap;
            if (shiftDown) {
                if (inChallenge('b', 21)) {
                    gain = '[amount / 11 + 1]';
                    cap = '[1.05 ^ amount]';
                } else if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                    gain = '[amount / 9 + 1]';
                    cap = '[1.15 ^ amount]';
                } else {
                    gain = '[amount / 10 + 1]';
                    cap = '[1.1 ^ amount]';
                }
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                gain = format(effect.xp_mult);
                cap = format(effect.xp_cap);
            }

            return `Multiply xp gain by ${gain} and cap by ${cap}`;
        },
    },
    'slime_knife': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime knife',
        grid: [0, 5],
        icon() {
            let icon = [1, 1];

            if (inChallenge('b', 11)) icon[1] += 4;
            if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `A sharp red weapon.<br>
                Requires a license to use in some kingdoms.<br>
                Chefs love this, as it allows cooking spicy food without spices.`;

            if (inChallenge('b', 21)) return `A cold blue weapon.<br>
                Covers cuts with a layer of frost.<br>
                Even with its cold handle, it's considered a revolution for ice cream.`;

            return `A crude green weapon.<br>
                Very sharp, be careful with it.<br>
                Not recommended for cooking unless you like the taste of slime.`;
        },
        categories: ['equipment', 'slime'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let damage;

            if (inChallenge('b', 21)) {
                damage = D.pow(1.1, x);
            } else if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                damage = D.pow(1.3, x);
            } else {
                damage = D.pow(1.2, x);
            }

            return { damage, };
        },
        effectDescription(amount) {
            let damage;
            if (shiftDown) {
                if (inChallenge('b', 21)) {
                    damage = '[1.1 ^ amount]';
                } else if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                    damage = '[1.3 ^ amount]';
                } else {
                    damage = '[1.2 ^ amount]';
                }
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                damage = format(effect.damage);
            }

            return `Multiply damage dealt by ${damage}`;
        },
    },
    'slime_injector': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime injector',
        grid: [0, 6],
        icon() {
            let icon = [1, 2];

            if (inChallenge('b', 11)) icon[1] += 4;
            if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `This experimental drug destabilizes slimes.<br>
                It makes you feel... angrier? Weird.<br>
                Using too many may have side effects.`;

            if (inChallenge('b', 21)) return `This experimental drug stabilizes slimes.<br>
                It makes you feel... Wait...<br>
                That's not good for you at all!`;

            return `This experimental drug destabilizes slimes.<br>
                It also makes you feel... stronger. Whatever that means.<br>
                Using too many may have side effects.`;
        },
        categories: ['equipment', 'slime'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let health, level, xp_mult;

            if (inChallenge('b', 21)) {
                health = D.pow(.95, x);
                level = D.div(x, 11).add(1);
                xp_mult = D.div(x, 5).root(2).pow_base(.95);
            } else if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                health = D.pow(1.1, x);
                level = D.div(x, 9).add(1);
                xp_mult = D.div(x, 5).root(2).floor().pow_base(.9);
            } else {
                health = D.pow(1.05, x);
                level = D.div(x, 10).add(1);
                xp_mult = D.div(x, 5).root(2).floor().pow_base(.95);
            }

            return { health, level, xp_mult, };
        },
        effectDescription(amount) {
            const x = D(amount ?? player.items[this.id].amount),
                effect = item_list[this.id].effect(x),
                show_xp = D.neq(effect.xp_mult, 1) || inChallenge('b', 21),
                show_level = player.l.unlocked;
            let health, level, xp;
            if (shiftDown) {
                if (inChallenge('b', 21)) {
                    health = '[.95 ^ amount]';
                    level = '[amount / 11 + 1]';
                    xp = '[0.95 ^ 2√(amount / 5)]';
                } else if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                    health = '[1.1 ^ amount]';
                    level = '[amount / 9 + 1]';
                    xp = '[0.9 ^ floor(2√(amount / 5))]';
                } else {
                    health = '[1.05 ^ amount]';
                    level = '[amount / 10 + 1]';
                    xp = '[0.95 ^ floor(2√(amount / 5))]';
                }
            } else {
                const effect = item_list[this.id].effect(x);

                health = format(effect.health);
                level = format(effect.level);
                xp = format(effect.xp_mult);
            }

            const text = [`Divide enemy health by ${health}`];

            if (show_level) text.push(`multiply level gain by ${level}`);
            if (show_xp) text.push(`divide xp gain by ${xp}`);

            return listFormat.format(text);
        },
    },
    'slime_die': {
        id: null,
        color() { return tmp.xp.monsters.slime.color; },
        name: 'slime die',
        grid: [0, 7],
        icon() {
            let icon = [1, 3];

            if (inChallenge('b', 11)) icon[1] += 4;
            if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `A dice that glows in a worrying light.<br>
                It feels lucky, somehow.<br>
                Makes you feel like you can grab more from slimes.`;

            if (inChallenge('b', 21)) return `A dice that glows in a cold light.<br>
                It feels lucky, somehow.<br>
                Makes you feel like you can grab more from slimes.`;

            return `A green dice that glows in a more... worrying light.<br>
                It feels lucky, somehow.<br>
                Makes you feel like you can get more from slimes.`;
        },
        categories: ['equipment', 'slime'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let luck, core_chance;

            if (inChallenge('b', 21)) {
                luck = D.div(x, 25).add(1);
            } else if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                luck = D.div(x, 17.5).add(1);
            } else {
                luck = D.div(x, 20).add(1);
            }
            core_chance = D.root(x, 2).floor();

            return { luck, core_chance, };
        },
        effectDescription(amount) {
            let luck, core;
            if (shiftDown) {
                if (inChallenge('b', 21)) {
                    luck = '[amount / 25 + 1]';
                } else if (inChallenge('b', 11) || hasChallenge('b', 11)) {
                    luck = '[amount / 17.5 + 1]';
                } else {
                    luck = '[amount / 20 + 1]';
                }
                core = '[floor(2√(amount))]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                luck = format(effect.luck);
                core = formatWhole(effect.core_chance);
            }

            return `Multiply luck by ${luck} and core drop chances by ${core}`;
        },
    },
    // Skeleton
    'bone': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'bone',
        grid: [1, 0],
        icon: [2, 0],
        row: 1,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 3);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                return { 'kill:skeleton': chance };
            },
        },
        lore: `A big rod mostly made of calcium.<br>
            Stolen from a dead body, but (hopefully) not a grave.<br>
            Wait long enough, and it becomes archeology.`,
        categories: ['materials', 'skeleton'],
    },
    'rib': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'rib',
        grid: [1, 1],
        icon: [2, 1],
        row: 1,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 10);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                return { 'kill:skeleton': chance };
            },
        },
        lore: `A curved bone.<br>
            Part of a cage that protected important organs.<br>
            A worthless boomerang.`,
        categories: ['materials', 'skeleton'],
    },
    'skull': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'skull',
        grid: [1, 2],
        icon: [2, 2],
        row: 1,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 33);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                chance = chance.times(item_effect('magic_slime_ball').skull_chance);

                return { 'kill:skeleton': chance };
            },
            other: ['crafting'],
        },
        lore: `The head of a skeleton.<br>
            Used to store one of the most important organs in the body.<br>
            Its hollow sockets make you feel unseasy.`,
        categories: ['materials', 'skeleton'],
    },
    'slimy_skull': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'slimy skull',
        grid: [1, 3],
        icon() {
            let icon = [2, 3];

            if (inChallenge('b', 11)) icon[1] += 4;
            if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore: `A slimy skull.<br>
            The goo is slowly flowing from its sockets...<br>
            Why would you do that?`,
        categories: ['materials', 'skeleton'],
    },
    'bone_pick': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'bone pick',
        grid: [1, 4],
        icon: [3, 0],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore: `A pick made of bones.<br>
            Not a good weapon, unless you're fighting rocks.<br>
            Talking about rocks... There's an outcrop over there.`,
        categories: ['equipment', 'skeleton'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let m_damage, xp_damage = D.div(x, 10);
            if (D.gt(x, 0)) m_damage = D.div(x, 10).add(.9);
            else m_damage = D.dZero;

            return { xp_damage, m_damage, };
        },
        effectDescription(amount) {
            let xp_damage, m_damage;
            if (shiftDown) {
                xp_damage = '[amount / 10]';
                m_damage = '[(amount - 1) / 10 + 1]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                xp_damage = format(effect.xp_damage);
                m_damage = format(effect.m_damage);
            }

            return `Increase damage dealt to enemies by ${xp_damage}, and mining damage by ${m_damage}<br>
                Mining damage increases by 1 the first time`;
        },
    },
    'crystal_skull': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'crystal skull',
        grid: [1, 5],
        icon() {
            let icon = [3, 1];

            if (inChallenge('b', 11)) icon[1] += 4;
            if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `A skull containing some crystallized slime.<br>
                Somehow, their placement allows for better experience yield and storage.<br>
                When you look at its sockets, you can almost feel bloodlust...`;

            if (inChallenge('b', 21)) return `A skull containing some crystallized slime.<br>
                Somehow, their placement allows for better experience yield and storage.<br>
                You try to not look at it, as you feel judged...`;

            return `A skull containing some crystallized slime.<br>
                Somehow, their placement allows for better experience yield and storage.<br>
                Behind its sockets, it almost feels like it's thinking...`;
        },
        categories: ['equipment', 'skeleton', 'slime'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let xp_mult = D.div(x, 7).add(1),
                xp_cap = D.pow(1.3, x);

            return { xp_mult, xp_cap, };
        },
        effectDescription(amount) {
            let gain, cap;
            if (shiftDown) {
                gain = '[amount / 7 + 1]';
                cap = '[1.3 ^ amount]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                gain = format(effect.xp_mult);
                cap = format(effect.xp_cap);
            }

            return `Multiply xp gain by ${gain} and cap by ${cap}`;
        },
    },
    'bone_slate': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name: 'bone slate',
        grid: [1, 6],
        icon: [3, 2],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore: `A slab made of bones.<br>
            Useful for recording things.<br>
            It's a bit crooked, but there's a limit to what ribs can do.`,
        categories: ['equipment', 'skeleton'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let level = D.div(x, 10).add(1);

            return { level, };
        },
        effectDescription(amount) {
            let level;
            if (shiftDown) {
                level = '[amount / 10 + 1]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                level = format(effect.level);
            }

            return `Multiply level gain by ${level}`;
        },
    },
    'magic_slime_ball': {
        id: null,
        color() { return tmp.xp.monsters.skeleton.color; },
        name() {
            if (inChallenge('b', 11)) return 'Magic 11 Ball';
            else if (inChallenge('b', 21)) return 'Magic 10 Ball';
            return 'Magic 14 Ball';
        },
        grid: [1, 7],
        icon() {
            let icon = [3, 3];

            if (inChallenge('b', 11)) icon[1] += 4;
            else if (inChallenge('b', 21)) icon[1] += 8;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore() {
            if (inChallenge('b', 11)) return `A magic 11 ball that can predict the future!<br>
                Just ask a simple yes or no question to get an answer.<br>
                Strange... It only seems to respond in the negative...`;

            if (inChallenge('b', 21)) return `A magic 10 ball that can predict the future!<br>
                Just ask a simple yes or no question to get an answer.<br>
                Huh, nothing is happening... Is it frozen?`;

            return `A magic 14 ball that can predict the future!<br>
                Just ask a simple yes or no question to get an answer.<br>
                An 8 ball? No, everyone knows only 14 ball are magical enough to answer questions.`;
        },
        categories: ['equipment', 'skeleton'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let luck, skull_chance;

            if (inChallenge('b', 11)) {
                luck = D.div(x, 11).add(1);
            } else {
                luck = D.div(x, 14).add(1);
            }
            skull_chance = D.root(x, 2.1).floor();

            return { luck, skull_chance, };
        },
        effectDescription(amount) {
            let luck, skull;
            if (shiftDown) {
                if (inChallenge('b', 11)) {
                    luck = '[amount / 11 + 1]';
                } else {
                    luck = '[amount / 14 + 1]';
                }
                skull = '[floor(2.1√(amount))]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                luck = format(effect.luck);
                skull = formatWhole(effect.skull_chance);
            }

            return `Multiply luck by ${luck} and skull drop chances by ${skull}`;
        },
    },
    // Mining
    'stone': {
        id: null,
        color: '#BBBBDD',
        name: 'stone',
        grid: [2, 0],
        icon: [4, 0],
        row: 0,
        sources: {
            range() {
                let min = D(5),
                    max = D(15);

                min = D.times(min, tmp.m.modifiers.range.mult);
                max = D.times(max, tmp.m.modifiers.range.mult);

                if (hasUpgrade('m', 23)) {
                    min = D.times(min, upgradeEffect('m', 23).stone);
                    max = D.times(max, upgradeEffect('m', 23).stone);
                }

                return { 'mining:any': { min, max } };
            },
        },
        lore: `A piece of a large rock.<br>
            Considered worthless by most people.<br>
            With the amount you have... Is there even any value?`,
        categories: ['materials', 'mining'],
        unlocked() { return tmp.m.layerShown; },
    },
    'copper_ore': {
        id: null,
        color: '#FFAA11',
        name: 'copper ore',
        grid: [2, 1],
        icon: [4, 1],
        row: 0,
        sources: {
            range() {
                let min = D(3),
                    max = D(10);

                min = D.times(min, tmp.m.modifiers.range.mult);
                max = D.times(max, tmp.m.modifiers.range.mult);

                if (hasUpgrade('m', 23)) {
                    min = D.times(min, upgradeEffect('m', 23).ore);
                    max = D.times(max, upgradeEffect('m', 23).ore);
                }

                return { 'mining:copper': { min, max } };
            },
        },
        lore: `An orange mineral.<br>
            Useful for tools and electricity.<br>
            Slowly turns teal over time, lowering its usefulness.`,
        categories: ['materials', 'mining'],
        unlocked() { return tmp.m.layerShown; },
    },
    'tin_ore': {
        id: null,
        color: '#FFFFCC',
        name: 'tin ore',
        grid: [2, 2],
        icon: [4, 2],
        row: 0,
        sources: {
            range() {
                let min = D(1),
                    max = D(5);

                min = D.times(min, tmp.m.modifiers.range.mult);
                max = D.times(max, tmp.m.modifiers.range.mult);

                if (hasUpgrade('m', 23)) {
                    min = D.times(min, upgradeEffect('m', 23).ore);
                    max = D.times(max, upgradeEffect('m', 23).ore);
                }

                return { 'mining:tin': { min, max } };
            },
        },
        lore: `A light yellow mineral.<br>
            Useful for jewelry.<br>
            Surprisingly valuable for some reason.`,
        categories: ['materials', 'mining'],
        unlocked() { return tmp.m.layerShown; },
    },
    'bronze_blend': {
        id: null,
        color: '#BB7744',
        name: 'bronze blend',
        grid: [2, 3],
        icon: [4, 3],
        row: 0,
        sources: {
            other: ['crafting'],
        },
        lore: `A solid brown alloy.<br>
            Useful for all kinds of things.<br>
            Also valuable.`,
        categories: ['materials', 'mining'],
        unlocked() { return tmp.m.layerShown; },
    },
    'gold_nugget': {
        id: null,
        color: '#FFFF44',
        name: 'gold nugget',
        grid: [2, 4],
        icon: [4, 4],
        row: 0,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 100);

                chance = chance.times(tmp.c.chance_multiplier);

                if (hasUpgrade('m', 23)) chance = chance.times(upgradeEffect('m', 23));

                return { 'mining:any': chance };
            },
        },
        lore: `An extremely rare mineral.<br>
            Also very valuable.<br>
            Some people would kill for one of these.`,
        categories: ['materials', 'mining'],
        unlocked() { return D.gte(player.items.gold_nugget.amount, 1) || player.b.visible_challenges.includes('12'); },
    },
    'stone_mace': {
        id: null,
        color: '#BBBBDD',
        name: 'stone mace',
        grid: [3, 0],
        icon: [5, 0],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore: `A large rock on a stick.<br>
            Good for whacking your enemies (which include rocks for some reason).<br>
            As expected, it's quite heavy.`,
        categories: ['equipment', 'mining'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let m_damage = D.pow(1.1, x),
                xp_damage = D.div(x, 5);

            return { xp_damage, m_damage, };
        },
        effectDescription(amount) {
            let xp_damage, m_damage;
            if (shiftDown) {
                xp_damage = '[amount / 5]';
                m_damage = '[1.1 ^ amount]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                xp_damage = format(effect.xp_damage);
                m_damage = format(effect.m_damage);
            }

            return `Increase damage dealt to enemies by ${xp_damage}, and multiplies mining damage by ${m_damage}`;
        },
        unlocked() { return tmp.m.layerShown; },
    },
    'copper_pick': {
        id: null,
        color() {
            const high = [0xFF, 0xAA, 0x11],
                low = [0x11, 0xFF, 0xAA],
                progress = D.minus(1, item_effect(this.id).decay).toNumber();

            return `#${color_between(low, high, progress).map(n => n.toString(16).padStart(2, '0')).join('')}`;
        },
        name: 'copper pick',
        grid: [3, 1],
        icon: [5, 1],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore: `A solid orange pickaxe.<br>
            Because it's made of copper, its effect decays over time.<br>
            Do you find the orange tint or the teal tint prettier?`,
        categories: ['equipment', 'mining'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let decay = D.add(player.m.resetTime, 10).log10(),
                damage = D.pow(1.1, x),
                ores = D.div(x, 10).add(1);

            // Apply decay
            damage = damage.root(decay);
            ores = ores.root(decay);

            return { decay, damage, ores, };
        },
        effectDescription(amount) {
            let damage,
                ores,
                decay;
            if (shiftDown) {
                decay = 'log10(reset time + 10)'
                ores = '[decay√(amount / 10 + 1)]';
                damage = '[decay√(1.1 ^ amount)]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                decay = format(effect.decay);
                damage = format(effect.damage);
                ores = format(effect.ores);
            }

            return `Multiplies mining damage by ${damage}, and ores gained by ${ores}<br>Decay: ${decay}`;
        },
        unlocked() { return tmp.m.layerShown; },
    },
    'tin_cache': {
        id: null,
        color: '#FFFFCC',
        name: 'tin cache',
        grid: [3, 2],
        icon: [5, 2],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore: `A big box made of copper and tin.<br>
            Each one improves your level up.<br>
            It can even hold things!`,
        categories: ['equipment', 'mining'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let hold = D.floor(x),
                level = D.div(x, 8).add(1);

            return { hold, level, };
        },
        effectDescription(amount) {
            let hold, level;
            if (shiftDown) {
                hold = '[amount]';
                level = '[amount / 8 + 1]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                hold = formatWhole(effect.hold);
                level = format(effect.level);
            }

            return `Holds ${hold} lower layer upgrades, and multiplies level gain by ${level}`;
        },
        unlocked() { return tmp.m.layerShown; },
    },
    'bronze_cart': {
        id: null,
        color: '#FFFFCC',
        name: 'bronze cart',
        grid: [3, 3],
        icon: [5, 3],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore: `A hollow box with an opening on top and 4 wheels to the sides.<br>
            Good for transporting items of all kinds.<br>
            Don't forget to get rails!`,
        categories: ['equipment', 'mining'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let xp_drop = D.add(x, 5).log(5),
                m_drop = D.add(x, 4).log(4);

            return { xp_drop, m_drop, };
        },
        effectDescription(amount) {
            let xp_drop, m_drop;
            if (shiftDown) {
                xp_drop = '[log5(amount + 5)]';
                m_drop = '[log4(amount + 4)]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                xp_drop = formatWhole(effect.xp_drop);
                m_drop = format(effect.m_drop);
            }

            return `Multiplies enemy drops by ${xp_drop}, and mining drops by ${m_drop}`;
        },
        unlocked() { return tmp.m.layerShown; },
    },
    'doubloon': {
        id: null,
        color: '#FFFF44',
        name: 'gold nugget',
        grid: [3, 4],
        icon: [5, 4],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        lore: `A large gold coin, found deep underwater.<br>
            Its rarity makes it more valuable.<br>
            Nobody knows whose face is on its side.`,
        categories: ['equipment', 'mining'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let coin_mult = D.div(x, 10).add(1);

            return { coin_mult, };
        },
        effectDescription(amount) {
            let coin_mult;
            if (shiftDown) {
                coin_mult = '[amount / 10 + 1]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                coin_mult = format(effect.coin_mult);
            }

            return `Multiplies coin gain by ${coin_mult}`;
        },
        unlocked() { return inChallenge('b', 12) || hasChallenge('b', 12); },
    },
};

const ITEM_SIZES = {
    width: 12,
    height: 6,
};
/**
 * @type {{[row in Layer['row']]: items[]}}
 */
const ROW_ITEMS = {};

/**
 * @param {Layer['row']} row
 */
function reset_items(row) {
    if (isNaN(row)) return;

    const rows = Object.keys(ROW_ITEMS)
        // Ignore side rows and equal/above reset row
        .filter(irow => !isNaN(irow) && irow < row)
        .map(n => +n)
        // Sort from highest to lowest
        .sort((a, b) => b - a);

    for (let r of rows) {
        if (isNaN(r) || r >= row) continue;

        ROW_ITEMS[r].forEach(item => {
            player.items[item].amount = D.dZero;
            player.items[item].total = D.dZero;
        })
    }
}

function setupItems() {
    Object.entries(item_list).forEach(setupItem);
}
/**
 * @template {items} I
 * @param {[I, Item<I>]}
 */
function setupItem([id, item]) {
    item.id = id;
    if (typeof item.row == 'number') {
        const row = item.row;
        (ROW_ITEMS[row] ??= []).push(id);
    }
    if (typeof item.sources == 'object') {
        item.sources.id = id;

        if (item.sources.per_second) {
            item.sources.per_second_total = function () {
                /** @type {Item<I>} */
                const itemp = tmp.items[this.id],
                    ps = Object.values(itemp.sources.per_second);
                return ps.reduce((sum, ps) => D.add(sum, ps), D.dZero);
            }
        }
    }
}

/**
 * Creates a tile for an item display
 *
 * Can be safely modified
 *
 * The tile text is already set to the item name
 *
 * @param {items} item
 * @returns {tile}
 */
function item_tile(item) {
    const itemp = tmp.items[item];

    return {
        text: `${capitalize(itemp.name)}`,
        style: {
            'color': rgb_opposite_bw(itemp.color),
            'background-color': itemp.color,
            'background-image': `url(./resources/images/items.png)`,
            'background-origin': `border-box`,
            'background-repeat': `no-repeat`,
            'image-rendering': 'crisp-edges',
            'background-size': `${ITEM_SIZES.width * 80}px ${ITEM_SIZES.height * 80}px`,
            'background-position-x': `${itemp.icon[1] * -80}px`,
            'background-position-y': `${itemp.icon[0] * -80}px`,
            'transform': 'initial',
        },
    };
}

/**
 * Creates a tile for an unknown item display
 *
 * Can be safely modified
 *
 * The tile text is already set to the item name
 *
 * @returns {tile}
 */
function item_tile_unknown() {
    const itemp = tmp.items.unknown;

    return {
        text: 'Unknown',
        style: {
            'color': rgb_opposite_bw(itemp.color),
            'background-color': itemp.color,
            'background-image': `url(./resources/images/unknown.png)`,
            'background-origin': `border-box`,
            'background-repeat': `no-repeat`,
            'image-rendering': 'crisp-edges',
            'background-size': `80px 80px`,
            'transform': 'initial',
        },
    };
}


/**
 * @param {[items, DecimalSource][]|items} item
 * @param {DecimalSource} [amount]
 */
function gain_items(item, amount) {
    if (Array.isArray(item)) {
        item.forEach(pair => gain_items(...pair))
    } else {
        player.items[item].amount = D.add(player.items[item].amount, amount);
        if (D.gt(amount, 0)) player.items[item].total = D.add(player.items[item].total, amount);
    }
}
/**
 * @param {drop_sources} source
 */
function source_name(source) {
    /** @type {[drop_types, string[]]} */
    const [type, ...sub] = source.split(':');
    switch (type) {
        case 'kill': {
            /** @type {monsters|'any'} */
            const monster = sub[0];
            if (monster == 'any') return 'kill anything';
            return tmp.xp.monsters[monster].name;
        };
        case 'crafting':
            return 'crafting';
        case 'mining': {
            /** @type {ores|'any'} */
            const ore = sub[0];
            if (ore == 'any') return 'mine anything';
            return tmp.m.ores[ore].name;
        };
    }
}
/**
 * Returns a list of items that are dropped by `source`
 *
 * Items that are not unlocked cannot be dropped
 *
 * @param {drop_sources} source
 * @returns {{
 *  chances: {[item in items]: Decimal}
 *  range: {[item in items]: {min: Decimal, max: Decimal}}
 * }}
 */
function source_drops(source) {
    const items = {
        chances: {},
        range: {},
    };

    Object.values(tmp.items).forEach(item => {
        if (!('sources' in item)) return;

        if ('chance' in item.sources && source in item.sources.chance && D.gt(item.sources.chance[source], 0)) items.chances[item.id] = item.sources.chance[source];
        if ('range' in item.sources && source in item.sources.range && D.gt(item.sources.range[source].max, 0)) items.range[item.id] = item.sources.range[source];
    });

    return items;
}
/**
 * Merges multiple sets of drops into one
 *
 * @param {...[items, Decimal][]} drops
 * @returns {[items, Decimal][]}
 */
function merge_drops(...drops) {
    /** @type {Record<items, Decimal>} */
    const total = {},
        /**
         * @type {(item: items, amount: DecimalSource) => void}
         */
        add = (item, amount) => total[item] = D.add(total[item] ?? 0, amount);

    drops.forEach(set => set.forEach(([item, amount]) => add(item, amount)));

    return Object.entries(total);
}
/**
 * Computes the drops from a type
 *
 * @param {drop_sources} source
 * @param {DecimalSource} [chance_multiplier=D.dOne]
 * @returns {[items, Decimal][]}
 */
function get_source_drops(source, chance_multiplier = D.dOne) {
    if (D.lte(chance_multiplier, 0)) return [];

    /**
     * Sum of all items to return
     * @type {{[item_id in items]: Decimal}}
     */
    const results = {},
        /**
         * List of all entries to roll at once
         * @type {[items, Decimal][]}
         */
        to_roll = [],
        /**
         * @type {(item: items, amount: DecimalSource) => void}
         */
        add_to_results = (item, amount) => results[item] = D.add(results[item] ?? 0, amount),
        items = source_drops(source);

    Object.entries(items.chances).forEach(/**@param{[items, Decimal]}*/([item, chance]) => {
        const rchance = D.times(chance, chance_multiplier);
        if (rchance.gte(1) || options.noRNG) {
            add_to_results(item, chance);
        } else {
            to_roll.push([item, chance]);
        }
    });
    Object.entries(items.range).forEach(/**@param{[items,{min:Decimal,max:Decimal}]}*/([item, range]) => {
        const min = range.min,
            delta = D.minus(range.max, range.min);
        let result;
        if (options.noRNG) {
            result = D.div(delta, 2);
        } else {
            result = D.times(delta, Math.random());
        }
        result = result.add(min).times(chance_multiplier);
        add_to_results(item, result);
    });

    if (to_roll.length > 7) {
        // Not dealing with more than 2^7 attempts
        to_roll.forEach(([item_id, chance]) => add_to_results(item_id, chance));
    } else {
        let rng = Math.random(),
            i = 0;
        for (; i < 2 ** to_roll.length && rng > 0; i++) {
            const bin = i.toString(2).padStart(to_roll.length, '0').split(''),
                chance = to_roll.map(([, chance], i) => {
                    if (bin[i] == '1') return chance;
                    else return D.dOne.minus(chance);
                }).reduce(D.times, D.dOne);
            rng -= chance.toNumber();
        }

        if (rng <= 0 && i > 0) i--;
        const bin = i.toString(2).padStart(to_roll.length, '0').split('');
        to_roll.forEach(([item], i) => {
            if (bin[i] == '1') add_to_results(item, 1);
        });
    }

    return Object.entries(results);
}

/**
 * Shortcut for `tmp.items[item].effect`
 *
 * @param {items} item
 */
function item_effect(item) { return tmp.items[item].effect; }
