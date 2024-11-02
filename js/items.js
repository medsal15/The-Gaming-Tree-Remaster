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
                if (D.eq(tmp.c.chance_multiplier, 0) || inChallenge('b', 12)) return {};

                let chance = D(1 / 2);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                return { 'kill:slime': chance };
            },
            other() {
                /** @type {drop_sources[]} */
                const other = [];

                if (inChallenge('b', 12)) other.push('shop');

                return other;
            },
        },
        value: {
            cost() {
                if (inChallenge('b', 12)) return D(5);
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
                if (D.eq(tmp.c.chance_multiplier, 0) || inChallenge('b', 12)) return {};

                let chance = D(1 / 7);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                return { 'kill:slime': chance };
            },
            other() {
                /** @type {drop_sources[]} */
                const other = [];

                if (inChallenge('b', 12)) other.push('shop');

                return other;
            },
        },
        value: {
            cost() {
                if (inChallenge('b', 12)) return D(15);
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
                if (D.eq(tmp.c.chance_multiplier, 0) || inChallenge('b', 12)) return {};

                let chance = D(1 / 24);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                chance = chance.times(item_effect('slime_die').core_chance);

                return { 'kill:slime': chance };
            },
            other() {
                /** @type {drop_sources[]} */
                const other = ['crafting'];

                if (inChallenge('b', 12)) other.push('shop');

                return other;
            },
        },
        value: {
            cost() {
                if (inChallenge('b', 12)) return D(50);
            },
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
            other() {
                /** @type {drop_sources[]} */
                const other = ['crafting'];

                if (inChallenge('b', 12)) other.push('shop');

                return other;
            },
        },
        value: {
            cost() {
                return D(100);
            },
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
        value: {
            value() {
                return D(100);
            },
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
        value: {
            value() {
                return D(200);
            },
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
        value: {
            value() {
                return D(300);
            },
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
        value: {
            value() {
                return D(800);
            },
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
            let x = D(amount ?? player.items[this.id].amount);

            if (hasChallenge('b', 21)) x = x.add(1);

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
                if (D.eq(tmp.c.chance_multiplier, 0) || inChallenge('b', 12)) return {};

                let chance = D(1 / 3);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                return { 'kill:skeleton': chance };
            },
            other() {
                /** @type {drop_sources[]} */
                const other = [];

                if (inChallenge('b', 12)) other.push('shop');

                return other;
            },
        },
        value: {
            cost() {
                if (inChallenge('b', 12)) return D(7);
            },
        },
        lore: `A big rod mostly made of calcium.<br>
            Stolen from a dead body, but (hopefully) not a grave.<br>
            Wait long enough, and it becomes archeology.`,
        categories: ['materials', 'skeleton'],
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
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
                if (D.eq(tmp.c.chance_multiplier, 0) || inChallenge('b', 12)) return {};

                let chance = D(1 / 10);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                return { 'kill:skeleton': chance };
            },
            other() {
                /** @type {drop_sources[]} */
                const other = [];

                if (inChallenge('b', 12)) other.push('shop');

                return other;
            },
        },
        value: {
            cost() {
                if (inChallenge('b', 12)) return D(20);
            },
        },
        lore: `A curved bone.<br>
            Part of a cage that protected important organs.<br>
            A worthless boomerang.`,
        categories: ['materials', 'skeleton'],
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
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
                if (D.eq(tmp.c.chance_multiplier, 0) || inChallenge('b', 12)) return {};

                let chance = D(1 / 33);

                chance = chance.times(tmp.c.chance_multiplier);
                chance = chance.times(tmp.xp.modifiers.drops.mult);

                chance = chance.times(item_effect('magic_slime_ball').skull_chance);

                return { 'kill:skeleton': chance };
            },
            other() {
                /** @type {drop_sources[]} */
                const other = ['crafting'];

                if (inChallenge('b', 12)) other.push('shop');

                return other;
            },
        },
        value: {
            cost() {
                if (inChallenge('b', 12)) return D(60);
            },
        },
        lore: `The head of a skeleton.<br>
            Used to store one of the most important organs in the body.<br>
            Its hollow sockets make you feel unseasy.`,
        categories: ['materials', 'skeleton'],
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
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
            other() {
                /** @type {drop_sources[]} */
                const other = ['crafting'];

                if (inChallenge('b', 12)) other.push('shop');

                return other;
            },
        },
        value: {
            cost() {
                return D(150);
            },
        },
        lore: `A slimy skull.<br>
            The goo is slowly flowing from its sockets...<br>
            Why would you do that?`,
        categories: ['materials', 'skeleton'],
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
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
        value: {
            value() {
                return D(150);
            },
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
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
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
        value: {
            value() {
                return D(300);
            },
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
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
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
        value: {
            value() {
                return D(300);
            },
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
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
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
        value: {
            value() {
                return D(500);
            },
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
        unlocked() { return tmp.xp.monsters.skeleton.unlocked; },
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
                let min = D(1),
                    max = D(4);

                let mult = tmp.m.modifiers.range.mult;
                if (hasUpgrade('xp', 51)) mult = mult.times(upgradeEffect('xp', 51));
                if (hasUpgrade('m', 23)) mult = mult.times(upgradeEffect('m', 23).stone);
                if (hasUpgrade('m', 51)) mult = mult.times(upgradeEffect('m', 51));

                min = D.times(min, mult);
                max = D.times(max, mult);

                return {
                    'mining:any': { min, max },
                    'mining:stone': { min, max },
                };
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
                let min = D(1),
                    max = D(3);

                min = D.times(min, tmp.m.modifiers.range.mult);
                max = D.times(max, tmp.m.modifiers.range.mult);

                if (hasUpgrade('m', 23)) {
                    min = D.times(min, upgradeEffect('m', 23).ore);
                    max = D.times(max, upgradeEffect('m', 23).ore);
                }

                return { 'mining:copper': { min, max } };
            },
        },
        value: {
            value() {
                if (inChallenge('b', 12)) return D(1);
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
                    max = D(2);

                min = D.times(min, tmp.m.modifiers.range.mult);
                max = D.times(max, tmp.m.modifiers.range.mult);

                if (hasUpgrade('m', 23)) {
                    min = D.times(min, upgradeEffect('m', 23).ore);
                    max = D.times(max, upgradeEffect('m', 23).ore);
                }

                return { 'mining:tin': { min, max } };
            },
        },
        value: {
            value() {
                if (inChallenge('b', 12)) return D(9);
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
        value: {
            value() {
                if (inChallenge('b', 12)) return D(20);
            },
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
        grid: [3, 0],
        icon: [4, 4],
        row: 0,
        sources: {
            chance() {
                if (D.eq(tmp.c.chance_multiplier, 0)) return {};

                let chance = D(1 / 100),
                    skeleton_chance = D.dZero;

                chance = chance.times(tmp.c.chance_multiplier);

                if (hasUpgrade('m', 23)) chance = chance.times(upgradeEffect('m', 23).ore);
                if (hasUpgrade('m', 43)) chance = chance.times(upgradeEffect('m', 43));
                if (hasAchievement('ach', 65)) chance = chance.times(achievementEffect('ach', 65));

                chance = chance.div(item_effect('gold_nugget'));
                chance = chance.times(item_effect('gold_ingot'));

                if (hasChallenge('b', 12)) skeleton_chance = D.div(chance, 10);

                return {
                    'mining:any': chance,
                    'kill:skeleton': skeleton_chance,
                };
            },
        },
        value: {
            value() {
                if (inChallenge('b', 12)) return D(1_000);
            },
        },
        lore: `An extremely rare mineral.<br>
            Somehow, the more you have, the harder it is to find.<br>
            Some people would kill for one of these.`,
        categories: ['materials', 'mining'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].total);

            return D.div(x, 2).add(1);
        },
        effectDescription(amount) {
            let div;
            if (shiftDown) {
                div = '[amount / 2 + 1]';
            } else {
                const x = D(amount ?? player.items[this.id].total),
                    effect = item_list[this.id].effect(x);

                div = format(effect);
            }

            return `Divides gold nugget chance by ${div}`;
        },
        unlocked() { return D.gte(player.items.gold_nugget.amount, 1) || player.b.visible_challenges.includes('12'); },
    },
    'densium': {
        id: null,
        color: '#445566',
        name: 'densium',
        grid: [5, 0],
        icon: [4, 5],
        row: 0,
        sources: {
            other: ['mining:compactor'],
        },
        value: {
            value() {
                if (inChallenge('b', 12)) return D(500);
            },
        },
        lore: `An extremely dense piece of stone.<br>
            Perfectly circular and smooth.<br>
            Rarely used, except in expensive industries.`,
        categories: ['materials', 'mining'],
        unlocked() { return tmp.m.compactor.unlocked; },
    },
    'coal': {
        id: null,
        color: '#333344',
        name: 'coal',
        grid: [3, 1],
        icon: [4, 6],
        row: 0,
        sources: {
            range() {
                let min = D(2),
                    max = D(4);

                let mult = tmp.m.modifiers.range.mult;
                if (hasUpgrade('xp', 51)) mult = mult.times(upgradeEffect('xp', 51));
                if (hasUpgrade('m', 23)) mult = mult.times(upgradeEffect('m', 23).stone);
                if (hasUpgrade('m', 51)) mult = mult.times(upgradeEffect('m', 51));

                mult = mult.times(item_effect('furnace').coal_mult);

                min = D.times(min, mult);
                max = D.times(max, mult);

                return { 'mining:coal': { min, max } };
            },
            per_second() {
                const per_second = {};

                if (D.gt(buyableEffect('c', 21).coal, 0)) {
                    per_second['forge'] = D.neg(buyableEffect('c', 21).coal);
                }

                return per_second;
            },
        },
        lore: `A piece of flammable rock.<br>
            Of low value, but required for any fire.<br>
            Surely that's not the only use, right?`,
        categories: ['materials', 'mining'],
        unlocked() { return hasUpgrade('m', 61); },
    },
    'iron_ore': {
        id: null,
        color: '#BB2222',
        name: 'iron ore',
        grid: [3, 2],
        icon: [4, 7],
        row: 0,
        sources: {
            range() {
                let min = D(.5),
                    max = D(3);

                min = D.times(min, tmp.m.modifiers.range.mult);
                max = D.times(max, tmp.m.modifiers.range.mult);

                if (hasUpgrade('m', 23)) {
                    min = D.times(min, upgradeEffect('m', 23).ore);
                    max = D.times(max, upgradeEffect('m', 23).ore);
                }

                return { 'mining:iron': { min, max } };
            },
        },
        value: {
            value() {
                if (inChallenge('b', 12)) return D(2);
            },
        },
        lore: `A piece of red metal.<br>
            Worthless without removing all this rust.<br>
            Careful when handling, as cuts may lead to infections.`,
        categories: ['materials', 'mining'],
        unlocked() { return hasUpgrade('m', 61); },
    },
    'clear_iron_ore': {
        id: null,
        color: '#8899AA',
        name: 'rustless iron ore',
        grid: [3, 3],
        icon: [4, 8],
        row: 0,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                if (inChallenge('b', 12)) return D(4);
            },
        },
        lore: `A piece of gray metal.<br>
            Durable, tough, common. The perfect material?<br>
            Slowly turns red over time, lowering its usefulness.`,
        categories: ['materials', 'mining'],
        unlocked() { return hasUpgrade('m', 61); },
    },
    'silver_ore': {
        id: null,
        color: '#DDEEEE',
        name: 'silver ore',
        grid: [3, 4],
        icon: [4, 9],
        row: 0,
        sources: {
            range() {
                let min = D(.5),
                    max = D(2);

                min = D.times(min, tmp.m.modifiers.range.mult);
                max = D.times(max, tmp.m.modifiers.range.mult);

                if (hasUpgrade('m', 23)) {
                    min = D.times(min, upgradeEffect('m', 23).ore);
                    max = D.times(max, upgradeEffect('m', 23).ore);
                }

                return { 'mining:silver': { min, max } };
            },
        },
        value: {
            value() {
                if (inChallenge('b', 12)) return D(150);
            },
        },
        lore: `A (mostly) white chunk of metal.<br>
            Useful for jewelry.<br>
            After a bit of treatment, it can reflect light like no other mineral.`,
        categories: ['materials', 'mining'],
        unlocked() { return hasUpgrade('m', 61); },
    },
    'electrum_blend': {
        id: null,
        color: '#EEDDAA',
        name: 'electrum blend',
        grid: [3, 5],
        icon: [4, 10],
        row: 0,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                if (inChallenge('b', 12)) return D(1_750);
            },
        },
        lore: `A pretty light yellow alloy.<br>
            Useful for jewelry.<br>
            Also very valuable.`,
        categories: ['materials', 'mining'],
        unlocked() { return hasUpgrade('m', 61); },
    },
    // Forge
    'stone_brick': {
        id: null,
        color: '#BBBBDD',
        name: 'stone brick',
        grid: [5, 0],
        icon: [8, 0],
        row: 1,
        sources: {
            other: ['forge',],
        },
        value: {
            value() {
                return D(50);
            },
        },
        lore: `A brick of solid rock.<br>
            Now this is some useful stone.<br>
            Commonly used as a material for other things.`,
        categories: ['materials', 'forge'],
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'copper_ingot': {
        id: null,
        color: '#FFAA11',
        name: 'copper ingot',
        grid: [5, 1],
        icon: [8, 1],
        row: 1,
        sources: {
            other: ['forge',],
        },
        value: {
            value() {
                return D(100);
            },
        },
        lore: `A solid block of copper.<br>
            Just as useful as copper, but easier to store.<br>
            Proper storage allows slower color change.`,
        categories: ['materials', 'forge'],
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'tin_ingot': {
        id: null,
        color: '#FFFFCC',
        name: 'tin ingot',
        grid: [5, 2],
        icon: [8, 2],
        row: 1,
        sources: {
            other: ['forge',],
        },
        value: {
            value() {
                return D(900);
            },
        },
        lore: `A light yellow ingot.<br>
            The way you store these makes them look even prettier...`,
        categories: ['materials', 'forge'],
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'bronze_ingot': {
        id: null,
        color: '#BB7744',
        name: 'bronze ingot',
        grid: [5, 3],
        icon: [8, 3],
        row: 1,
        sources: {
            other: ['forge',],
        },
        value: {
            value() {
                return D(400);
            },
        },
        lore: `A big brown ingot.<br>
            This is much easier to handle.<br>
            Congratulations on actually reaching the bronze age!`,
        categories: ['materials', 'forge'],
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'gold_ingot': {
        id: null,
        color: '#FFFF44',
        name: 'gold ingot',
        grid: [5, 4],
        icon: [8, 4],
        row: 1,
        sources: {
            other: ['forge',],
        },
        value: {
            value() {
                return D(5_000);
            },
        },
        lore: `A small, but very rare ingot.<br>
            Somehow, the more you own, the harder it is to find.<br>
            Many people would kill for one of these.`,
        categories: ['materials', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].total);

            return D.div(x, 8).add(1);
        },
        effectDescription(amount) {
            let mult;
            if (shiftDown) {
                mult = '[amount / 8 + 1]';
            } else {
                const x = D(amount ?? player.items[this.id].total),
                    effect = item_list[this.id].effect(x);

                mult = format(effect);
            }

            return `Multiplies gold nugget chance by ${mult}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'iron_ingot': {
        id: null,
        color: '#8899AA',
        name: 'iron ingot',
        grid: [5, 5],
        icon: [8, 5],
        row: 1,
        sources: {
            other: ['forge',],
        },
        value: {
            value() {
                return D(400);
            },
        },
        lore: `A gray block of metal.<br>
            Keeps all the positives of iron, but is easier to store.<br>
            Congratulations on reaching the iron age!`,
        categories: ['materials', 'forge'],
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'silver_ingot': {
        id: null,
        color: '#DDEEEE',
        name: 'silver ingot',
        grid: [5, 6],
        icon: [8, 6],
        row: 1,
        sources: {
            other: ['forge',],
        },
        value: {
            value() {
                return D(15_000);
            },
        },
        lore: `An almost white metal block.<br>
            Looks like you managed to separate the impurities.<br>
            The way they are stored makes them shine almost too brightly`,
        categories: ['materials', 'forge'],
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'lead_ingot': {
        id: null,
        color: '#113366',
        name: 'lead ingot',
        grid: [5, 7],
        icon: [8, 7],
        row: 1,
        sources: {
            other: ['forge',],
        },
        value: {
            value() {
                return D(1_500);
            },
        },
        lore: `A black metal cube.<br>
            It feels very heavy.<br>
            So that's what was mixed with the silver...`,
        categories: ['materials', 'forge'],
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'electrum_ingot': {
        id: null,
        color: '#EEDDAA',
        name: 'electrum ingot',
        grid: [5, 8],
        icon: [8, 8],
        row: 1,
        sources: {
            other: ['forge',],
        },
        value: {
            value() {
                return D(43_750);
            },
        },
        lore: `A pretty light yellow alloy.<br>
            The method of storage used makes them even prettier.<br>
            Very valuable.`,
        categories: ['materials', 'forge'],
        unlocked() { return tmp.c.forge.unlocked; },
    },
    // Mining Tools
    'stone_mace': {
        id: null,
        color: '#BBBBDD',
        name: 'stone mace',
        grid: [2, 4],
        icon: [5, 0],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(300);
            },
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
                progress = D.minus(2, D.log10(item_effect(this.id).decay)).toNumber();

            return `#${color_between(low, high, progress).map(n => n.toString(16).padStart(2, '0')).join('')}`;
        },
        name: 'copper pick',
        grid: [2, 5],
        icon: [5, 1],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(150);
            },
        },
        lore: `A solid orange pickaxe.<br>
            Because it's made of copper, its effect decays over time.<br>
            Do you find the orange tint or the teal tint prettier?`,
        categories: ['equipment', 'mining'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let decay = D.add(player.m.resetTime, 1).log10().max(1),
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
                decay = 'max(log10(reset time + 1), 1)'
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
        grid: [2, 6],
        icon: [5, 2],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(150);
            },
        },
        lore: `A big box made of copper and tin.<br>
            Each one improves your leveling up.<br>
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
        color: '#BB7744',
        name: 'bronze cart',
        grid: [2, 7],
        icon: [5, 3],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(200);
            },
        },
        lore: `A hollow box with an opening on top and 4 wheels to the sides.<br>
            Good for transporting items of all kinds.<br>
            Don't forget to get rails!`,
        categories: ['equipment', 'mining'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let xp_drop = D.add(x, 5).log(5),
                m_drop = D.add(x, 4).log(4);

            let mult = D.dOne;

            mult = mult.times(item_effect('iron_rails').cart_mult);

            xp_drop = xp_drop.times(mult);
            m_drop = m_drop.times(mult);

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

                xp_drop = format(effect.xp_drop);
                m_drop = format(effect.m_drop);
            }

            return `Multiplies enemy drops by ${xp_drop}, and mining drops by ${m_drop}`;
        },
        unlocked() { return tmp.m.layerShown; },
    },
    'doubloon': {
        id: null,
        color: '#FFFF44',
        name: 'doubloon',
        grid: [4, 0],
        icon: [5, 4],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(5_000);
            },
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
    'furnace': {
        id: null,
        color: '#9999AA',
        name: 'furnace',
        grid: [4, 1],
        icon: [9, 0],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(50);
            },
        },
        lore: `A furnace made of stone and coal.<br>
            Even after usage, it still feels warm.<br>
            You can even stack them up!`,
        categories: ['equipment', 'mining', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let coal_mult = D.div(x, 10).add(1),
                heat_mult = D.pow(1.01, x);

            return { coal_mult, heat_mult, };
        },
        effectDescription(amount) {
            let coal_mult, heat_mult;
            if (shiftDown) {
                coal_mult = '[amount / 10 + 1]';
                heat_mult = '[1.01 ^ amount]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                coal_mult = format(effect.coal_mult);
                heat_mult = format(effect.heat_mult);
            }

            let text = `Multiplies coal gain by ${coal_mult}`;
            if (tmp.c.forge.unlocked) text += `, and heat gain by ${heat_mult}`;
            return text;
        },
        unlocked() { return hasUpgrade('m', 61); },
    },
    'iron_rails': {
        id: null,
        color: '#8899AA',
        name: 'iron rails',
        grid: [4, 2],
        icon: [9, 1],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(160);
            },
        },
        lore: `Solid bars of iron connected together with bones.<br>
            These are good for your carts.<br>
            The rails are also reinforcing ores.`,
        categories: ['equipment', 'mining', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let cart_mult = D.div(x, 10).add(1),
                health_mult = D.pow(1.1, x);

            return { cart_mult, health_mult, };
        },
        effectDescription(amount) {
            let cart_mult, health_mult;
            if (shiftDown) {
                cart_mult = '[amount / 10 + 1]';
                health_mult = '[1.1 ^ amount]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                cart_mult = format(effect.cart_mult);
                health_mult = format(effect.health_mult);
            }

            return `Multiplies bronze cart effect by ${cart_mult}, and ore health by ${health_mult}`;
        },
        unlocked() { return hasUpgrade('m', 61); },
    },
    'silver_coating': {
        id: null,
        color: '#DDEEEE',
        name: 'silver coating',
        grid: [4, 3],
        icon: [9, 2],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(1_200);
            },
        },
        lore: `Silver coating for a weapon.<br>
            It's great for fighting undeads.<br>
            Hopefully you'll find more than one type.`,
        categories: ['equipment', 'mining', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let skeleton_damage_mult = D.pow(1.25, x);

            return { skeleton_damage_mult, };
        },
        effectDescription(amount) {
            let skeleton_damage_mult;
            if (shiftDown) {
                skeleton_damage_mult = '[1.25 ^ amount]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                skeleton_damage_mult = format(effect.skeleton_damage_mult);
            }

            return `Multiplies skeleton damage by ${skeleton_damage_mult}`;
        },
        unlocked() { return hasUpgrade('m', 61); },
    },
    'electrum_coin_mold': {
        id: null,
        color: '#EEDDAA',
        name: 'electrum coin mold',
        grid: [4, 4],
        icon: [9, 3],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(12_500);
            },
        },
        lore: `A mold to allow making coins.<br>
            I'm not allowing you to use it for forging fake coins.<br>
            You're not a licensed coin maker.`,
        categories: ['equipment', 'mining', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let coin_mult = D.div(x, 15).add(1);

            return { coin_mult, };
        },
        effectDescription(amount) {
            let coin_mult;
            if (shiftDown) {
                coin_mult = '[amount / 15 + 1]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                coin_mult = format(effect.coin_mult);
            }

            return `Multiplies coin gain by ${coin_mult}`;
        },
        unlocked() { return hasUpgrade('m', 61); },
    },
    'bellow': {
        id: null,
        color() { return tmp.c.modifiers.heat.color; },
        name: 'bellow',
        grid: [4, 5],
        icon() {
            let icon = [9, 4];

            if (inChallenge('b', 11)) icon[1] = 10;
            else if (inChallenge('b', 21)) icon[1] = 11;

            return icon;
        },
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(450);
            },
        },
        lore: `A crude bellow for heating up your forge.<br>
            Manually working it is tiring.<br>
            Good luck with it.`,
        categories: ['equipment', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let heat_mult = D.div(x, 20).add(1),
                speed_mult = D.pow(1.1, x);

            return { heat_mult, speed_mult, };
        },
        effectDescription(amount) {
            let heat_mult, speed_mult;
            if (shiftDown) {
                heat_mult = '[amount / 20 + 1]';
                speed_mult = '[1.1 ^ amount]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                heat_mult = format(effect.heat_mult);
                speed_mult = format(effect.speed_mult);
            }

            return `Multiplies heat gain by ${heat_mult}, and forge speed by ${speed_mult}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'lead_coating': {
        id: null,
        color: '#113366',
        name: 'lead coating',
        grid: [4, 6],
        icon: [9, 5],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(700);
            },
        },
        lore: `Lead coating for a weapon.<br>
            It's great for fighting living beings.<br>
            It's also bad for fighting undeads.`,
        categories: ['equipment', 'mining', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let damage_mult = D.pow(1.15, x),
                skeleton_damage_div = D.pow(1.2, x);

            return { damage_mult, skeleton_damage_div, };
        },
        effectDescription(amount) {
            let damage_mult, skeleton_damage_div;
            if (shiftDown) {
                damage_mult = '[1.15 ^ amount]';
                skeleton_damage_div = '[1.2 ^ amount]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                damage_mult = format(effect.damage_mult);
                skeleton_damage_div = format(effect.skeleton_damage_div);
            }

            return `Multiplies damage by ${damage_mult}, but divides skeleton damage by ${skeleton_damage_div}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'densium_slime': {
        id: null,
        color: '#445566',
        name: 'densium slime',
        grid: [5, 1],
        icon: [7, 0],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(1_000);
            },
        },
        lore: `An extremely dense slime.<br>
            Its smaller size hides an extreme weight.<br>
            Did you know it cannot move on its own?`,
        categories: ['equipment', 'mining', 'slime',],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let slime_mult = D.add(x, 1);

            return { slime_mult, };
        },
        effectDescription(amount) {
            let slime_mult;
            if (shiftDown) {
                slime_mult = '[amount + 1]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                slime_mult = format(effect.slime_mult);
            }

            return `Multiplies slime health, experience, kills, and drops by ${slime_mult}`;
        },
        unlocked() { return tmp.m.compactor.unlocked || D.gt(player.items[this.id].amount, 0); },
    },
    'densium_rock': {
        id: null,
        color: '#445566',
        name: 'densium rock',
        grid: [5, 2],
        icon: [7, 1],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(750);
            },
        },
        lore: `An extremely dense piece of rock.<br>
            It's also very hard!<br>
            Just... Break... Already!`,
        categories: ['equipment', 'mining'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let rock_mult = D.add(x, 1);

            return { rock_mult, };
        },
        effectDescription(amount) {
            let rock_mult;
            if (shiftDown) {
                rock_mult = '[amount + 1]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                rock_mult = format(effect.rock_mult);
            }

            return `Multiplies stone health, breaks, and drops by ${rock_mult}`;
        },
        unlocked() { return tmp.m.compactor.unlocked || D.gt(player.items[this.id].amount, 0); },
    },
    'magic_densium_ball': {
        id: null,
        color: '#445566',
        name: 'magic densium ball',
        grid: [5, 3],
        icon: [7, 2],
        row: 1,
        sources: {
            other: ['crafting'],
        },
        value: {
            value() {
                return D(888);
            },
        },
        lore: `A very heavy magic 8 ball that can predict the past!<br>
            Just ask a simple yes or no question to get an answer.<br>
            Despite its weight, you still have to hold <b>and</b> shake it. Good luck.`,
        categories: ['equipment', 'mining'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let comp_mult = D.div(x, 8).add(1),
                coin_mult = D.div(x, 10).add(1);

            return { comp_mult, coin_mult, };
        },
        effectDescription(amount) {
            let comp_mult, coin_mult;
            if (shiftDown) {
                comp_mult = '[amount / 8 + 1]';
                coin_mult = '[amount / 10 + 1]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                comp_mult = format(effect.comp_mult);
                coin_mult = format(effect.coin_mult);
            }

            return `Divides compactor time by ${comp_mult}, and multiplies coin gain by ${coin_mult}`;
        },
        unlocked() { return tmp.m.compactor.unlocked || D.gt(player.items[this.id].amount, 0); },
    },
    // Forge Equipment
    'stone_wall': {
        id: null,
        color: '#BBBBDD',
        name: 'stone wall',
        icon: [9, 0],
        row: 1,
        sources: {
            other: ['forge',],
        },
        lore: `A wall made of stone bricks.<br>
            Makes it easier to fight enemies.<br>
            With some tiles, you could even make a house!`,
        categories: ['equipment', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let health_div = D.div(x, 20).add(1),
                cost_div = D.root(x, 3).pow10();

            return { health_div, cost_div, };
        },
        effectDescription(amount) {
            let health_div, cost_div;
            if (shiftDown) {
                health_div = '[amount / 20 + 1]';
                cost_div = '[10 ^ 3√(amount)]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                health_div = format(effect.health_div);
                cost_div = format(effect.cost_div);
            }

            return `Divides enemy health by ${health_div}, and stone brick use costs by ${cost_div}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'copper_golem': {
        id: null,
        color: '#FFAA11',
        name: 'copper golem',
        icon: [9, 1],
        row: 1,
        sources: {
            other: ['forge',],
        },
        lore: `A mechanical being made of copper.<br>
            Helpful with crafting and forging.<br>
            This one won't attack you. Shouldn't, at least.`,
        categories: ['equipment', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let speed_mult = D.pow(1.05, x),
                cost_div = D.root(x, 3).pow_base(15);

            return { speed_mult, cost_div, };
        },
        effectDescription(amount) {
            let speed_mult, cost_div;
            if (shiftDown) {
                speed_mult = '[1.05 ^ amount]';
                cost_div = '[15 ^ 3√(amount)]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                speed_mult = format(effect.speed_mult);
                cost_div = format(effect.cost_div);
            }

            return `Multiplies crafting and forging speed by ${speed_mult}, and divides copper ingot use costs by ${cost_div}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'tin_ring': {
        id: null,
        color: '#FFFFCC',
        name: 'tin ring',
        icon: [9, 2],
        row: 1,
        sources: {
            other: ['forge',],
        },
        lore: `A small ring made of tin.<br>
            Somehow makes you stronger.<br>
            Please don't hit anyone or anything with it, it will break.`,
        categories: ['equipment', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let xp_damage = D.div(x, 20),
                cost_div = D.root(x, 3).pow_base(20);

            return { xp_damage, cost_div, };
        },
        effectDescription(amount) {
            let xp_damage, cost_div;
            if (shiftDown) {
                xp_damage = '[amount / 20]';
                cost_div = '[20 ^ 3√(amount)]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                xp_damage = format(effect.xp_damage);
                cost_div = format(effect.cost_div);
            }

            return `Increases enemy damage by ${xp_damage}, and divides tin ingot use costs by ${cost_div}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'bronze_mold': {
        id: null,
        color: '#BB7744',
        name: 'bronze mold',
        icon: [9, 3],
        row: 1,
        sources: {
            other: ['forge',],
        },
        lore: `A flat plate with an ingot-shaped hole in it.<br>
            Commonly used to make ingots easier to obtain.<br>
            Should not be used for eating.`,
        categories: ['equipment', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let forge_cost = D.div(x, 10).add(1),
                cost_div = D.root(x, 4).pow_base(10);

            return { forge_cost, cost_div, };
        },
        effectDescription(amount) {
            let forge_cost, cost_div;
            if (shiftDown) {
                forge_cost = '[amount / 10 + 1]';
                cost_div = '[10 ^ 4√(amount)]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                forge_cost = format(effect.forge_cost);
                cost_div = format(effect.cost_div);
            }

            return `Divides forging costs by ${forge_cost}, and bronze ingot use costs by ${cost_div}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'gold_star': {
        id: null,
        color: '#FFFF44',
        name: 'gold star',
        icon: [9, 4],
        row: 1,
        sources: {
            other: ['forge',],
        },
        lore: `A fancy golden star.<br>
            Its shine somehow lowers the levels of monsters.<br>
            It's really, really pretty.`,
        categories: ['equipment', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let level_delay = D(x),
                cost_div = D.root(x, 2).pow_base(25);

            return { level_delay, cost_div, };
        },
        effectDescription(amount) {
            let level_delay, cost_div;
            if (shiftDown) {
                level_delay = '[amount]';
                cost_div = '[25 ^ 2√(amount)]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                level_delay = formatWhole(effect.level_delay);
                cost_div = format(effect.cost_div);
            }

            return `Increases monster level delay by ${level_delay}, and divides gold ingot use costs by ${cost_div}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'iron_heataxe': {
        id: null,
        color: '#8899AA',
        name: 'iron heataxe',
        icon: [9, 5],
        row: 1,
        sources: {
            other: ['forge',],
        },
        lore: `A pickaxe that channels the heat of your forge.<br>
            It's heavier than a normal pickaxe.<br>
            You are wearing gloves, right?`,
        categories: ['equipment', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let damage = D.add(player.c.heat, 1).log10().times(x),
                cost_div = D.root(x, 4).pow_base(10);

            return { damage, cost_div, };
        },
        effectDescription(amount) {
            let damage, cost_div;
            if (shiftDown) {
                damage = '[log10(heat + 1) * amount]';
                cost_div = '[10 ^ 4√(amount)]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                damage = format(effect.damage);
                cost_div = format(effect.cost_div);
            }

            return `Increases mining damage by ${damage}, and divides iron ingot use costs by ${cost_div}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'disco_ball': {
        id: null,
        color: '#DDEEEE',
        name: 'disco ball',
        icon: [8, 6],
        row: 1,
        sources: {
            other: ['forge',],
        },
        lore: `A shiny ball covered in small silver mirrors.<br>
            The flashing lights hurt your eyes.<br>
            Move to the rhythm!`,
        categories: ['materials', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let speed = D.root(x, 2).div(10),
                cost_div = D.root(x, 4).pow_base(25);

            return { speed, cost_div, };
        },
        effectDescription(amount) {
            let speed, cost_div;
            if (shiftDown) {
                speed = '[2√(amount) / 10]';
                cost_div = '[25 ^ 4√(amount)]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                speed = format(effect.speed);
                cost_div = format(effect.cost_div);
            }

            return `Increases auto mining and attacking speed by ${speed}, and divides silver ingot use costs by ${cost_div}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    'electrum_package': {
        id: null,
        color: '#EEDDAA',
        name: 'electrum package',
        icon: [8, 7],
        row: 1,
        sources: {
            other: ['forge',],
        },
        lore: `A light yellow box that helps in crafting.<br>
            Its weight makes it clunky to use.<br>
            Wait, why didn't you just make a box out of something easier to find?`,
        categories: ['materials', 'forge'],
        effect(amount) {
            const x = D(amount ?? player.items[this.id].amount);

            let limit = D.times(x, 10),
                cost_div = D.root(x, 4).pow_base(20);

            return { limit, cost_div, };
        },
        effectDescription(amount) {
            let limit, cost_div;
            if (shiftDown) {
                limit = '[amount * 10]';
                cost_div = '[20 ^ 4√(amount)]';
            } else {
                const x = D(amount ?? player.items[this.id].amount),
                    effect = item_list[this.id].effect(x);

                limit = format(effect.limit);
                cost_div = format(effect.cost_div);
            }

            return `Maximum crafting by ${limit}, and divides electrum ingot use costs by ${cost_div}`;
        },
        unlocked() { return tmp.c.forge.unlocked; },
    },
    // Shop
    'coin_copper': {
        id: null,
        color: '#FFAA11',
        name: 'copper coin',
        icon: [6, 0],
        row: 2,
        sources: {
            range() {
                if (inChallenge('b', 12)) {
                    let min = D.dOne,
                        max = D.dTwo;

                    min = min.times(tmp.s.modifiers.coin.mult);
                    max = max.times(tmp.s.modifiers.coin.mult);

                    return {
                        'kill:slime': { min, max, },
                        'kill:skeleton': { min: min.times(2), max: max.times(2), },
                    };
                }
                return {};
            },
            other: ['shop'],
        },
        lore: `An orange coin.<br>
            Worth little.`,
        categories: ['shop'],
        unlocked() { return tmp.s.layerShown; },
    },
    'coin_bronze': {
        id: null,
        color: '#BB7744',
        name: 'bronze coin',
        icon: [6, 1],
        row: 2,
        sources: {
            other: ['shop'],
        },
        lore: `A brown coin.<br>
            Commonly used everywhere.`,
        categories: ['shop'],
        unlocked() { return tmp.s.layerShown; },
    },
    'coin_silver': {
        id: null,
        color: '#DDEEEE',
        name: 'silver coin',
        icon: [6, 2],
        row: 2,
        sources: {
            other: ['shop'],
        },
        lore: `A light gray coin.<br>
            Uncommon, but still used everywhere.`,
        categories: ['shop'],
        unlocked() { return tmp.s.layerShown; },
    },
    'coin_gold': {
        id: null,
        color: '#FFFF44',
        name: 'gold coin',
        icon: [6, 3],
        row: 2,
        sources: {
            other: ['shop'],
        },
        lore: `A yellow coin.<br>
            Rare and valuable.`,
        categories: ['shop'],
        unlocked() { return tmp.s.layerShown; },
    },
    'coin_platinum': {
        id: null,
        color: '#FFFFFF',
        name: 'platinum coin',
        icon: [6, 4],
        row: 2,
        sources: {
            other: ['shop'],
        },
        lore: `A white coin.<br>
            Few people have seen it in their lives.`,
        categories: ['shop'],
        unlocked() { return tmp.s.layerShown; },
    },
    // Special
    'cueball': {
        id: null,
        color: '#FFFFFF',
        name: 'cueball',
        //todo icon & grid
        row: 'side',
        lore: `A spherical white ball.<br>
            Where did it come from? You don't remember picking it up...<br>
            Grants access to the Pool.`,
        categories: [],
        unlocked() { return D.gt(player.items[this.id].amount, 0); },
    },
};

const ITEM_SIZES = {
    width: 12,
    height: 11,
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

    updateTempData(item_list, tmp.items, funcs);
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
    if (typeof item.value == 'object') {
        item.value.id = id;
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
 * @param {number} [size=80] Size of the tile
 * @returns {tile}
 */
function item_tile(item, size = 80) {
    const itemp = tmp.items[item],
        style = {
            'color': rgb_opposite_bw(itemp.color),
            'background-color': itemp.color,
            'width': `${size}px`,
            'height': `${size}px`,
        };

    if (itemp.icon) {
        Object.assign(style, {
            'background-image': `url(./resources/images/items.png)`,
            'background-origin': `border-box`,
            'background-repeat': `no-repeat`,
            'image-rendering': 'crisp-edges',
            'background-size': `${ITEM_SIZES.width * size}px ${ITEM_SIZES.height * size}px`,
            'background-position-x': `${itemp.icon[1] * -size}px`,
            'background-position-y': `${itemp.icon[0] * -size}px`,
            'transform': 'initial',
        });
    }

    return {
        text: `${capitalize(itemp.name)}`,
        style,
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
        case 'forge':
            return 'forge';
        case 'mining': {
            /** @type {ores|'any'|'compactor'} */
            const ore = sub[0];
            if (ore == 'any') return 'mine anything';
            if (ore == 'compactor') return 'mining compactor'
            return tmp.m.ores[ore].name;
        };
        case 'shop':
            return 'shop';
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
function item_effect(item) { return tmp.items?.[item].effect; }
