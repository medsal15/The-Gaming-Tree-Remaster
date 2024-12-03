type Computable<T> = T | (() => T);
type Computed<T> = T extends (...args: any) => any ? ReturnType<T> : T;
type RComputed<T> = { [k in keyof T]: T[k] extends (...args: any) => any ? ReturnType<T[k]> : RComputed<T[k]> };
type CSSStyles = { [k in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[k] };
type AchievementTypes = 'normal' | 'bonus' | 'secret';
type TabFormatEntries<L extends keyof Layers> = ['display-text', Computable<string>] | ['display-image', Computable<string>] | ['raw-html', Computable<string>] |
    'h-line' | 'v-line' |
    'blank' | ['blank', height: number] | ['blank', width: number, height: number] |
['row', TabFormatEntries<L>[]] | ['column', TabFormatEntries<L>[]] |
    'main-display' | ['main-display', precision: number] |
    'resource-display' | 'prestige-button' |
['text-input', keyof Player[L]] |
['slider', [name: keyof Player[L], min: number, max: number]] |
['drop-down', [name: keyof Player[L], options: string[]]] |
['drop-down-double', [name: keyof Player[L], options: [value: string, display: string][]]] |
    'upgrades' | 'milestones' | 'challenges' | 'achievements' | 'buyables' | 'clickables' |
['upgrades' | 'milestones' | 'challenges' | 'achievements' | 'buyables' | 'clickables', rows: number[]] |
['upgrade' | 'milestone' | 'challenge' | 'achievment' | 'buyable' | 'clickable', id: number] |
['microtabs', microtabs: string[]] |
['bar', id: string] |
['infobox', id: string] |
['tree', (keyof Layers)[][]] |
['upgrade-tree' | 'buyable-tree' | 'clickable-tree', number[][]] |
['toggle', [layer: keyof Layers, id: string]] |
['layer-proxy', [layer: keyof Layers, data: TabFormatEntries<keyof Layers>[]]] |
    'respec-button' | 'master-button' |
['sell-one', id: number] | ['sell-all', id: number] |
[
    'layer-table',
    [
        layer?: keyof Layers,
        headers: string[],
        ...string[][]
    ]
] |
['tile', tile] |
['dynabar', {
    direction: 0 | 1 | 2 | 3
    progress(): number | Decimal
    width: number
    height: number
    display?: Computable<string>
    baseStyle?: Computable<CSSStyles>
    fillStyle?: Computable<CSSStyles>
    borderStyle?: Computable<CSSStyles>
    textStyle?: Computable<CSSStyles>
}];

type tile = {
    text?: Computable<string>
    tooltip?: Computable<string>
    style?: Computable<CSSStyles>
    canClick?(): boolean
    onClick?(): void
    onHold?(): void
};

declare class Layer<L extends string> {
    /**
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar to access the saved value.
     * It makes copying code to new layers easier. It is also assigned to all upgrades and buyables and such.
     */
    readonly layer: L
    /**
     * Used in reset confirmations (and the default infobox title).
     * If absent, it just uses the layer's id.
     */
    name?: string
    /**
     * A function to return the default save data for this layer.
     * Add any variables you have to it. Make sure to use `Decimal` values rather than normal numbers.
     */
    startData(): Player[L]
    /**
     * A color associated with this layer, used in many places. (A string in hex format with a #)
     */
    color: string
    /**
     * The row of the layer, starting at 0.
     * This affects where the node appears on the standard tree, and which resets affect the layer.
     *
     * Using "side" instead of a number will cause the layer to appear off to the side as a smaller node
     * (useful for achievements and statistics). Side layers are not affected by resets unless you add a doReset to them.
     */
    row: number | 'side'
    /**
     * **OVERRIDE**
     *
     * Changes where the layer node appears without changing where it is in the reset order.
     */
    displayRow?: Computable<number>
    /**
     * Name of the main currency you gain by resetting on this layer.
     */
    resource: string
    /**
     * A function that calculates and returns the current values of any bonuses inherent to the main currency.
     * Can return a value or an object containing multiple values.
     * *You will also have to implement the effect where it is applied.*
     */
    effect?(): any
    /**
     * A function that returns a description of this effect.
     * If the text stays constant, it can just be a string.
     */
    effectDescription?: Computable<string>
    /**
     * A function returning a bool which determines if this layer's node should be visible on the tree.
     * It can also return "ghost", which will hide the layer, but its node will still take up space in the tree.
     * Defaults to true.
     */
    layerShown?(): boolean | 'ghost'
    /**
     * An array containing information on any hotkeys associated with this layer
     */
    hotkeys?: Hotkey[]
    /**
     * A "CSS object" where the keys are CSS attributes, containing any CSS that should affect this layer's entire tab.
     */
    style?: Computable<CSSStyles>
    /**
     * Use this if you want to add extra things to your tab or change the layout.
     *
     * See the docs about it.
     */
    tabFormat?: {
        [id: string]: TabFormat<L>
    }
    /**
     * An alternative to `tabFormat`, which is inserted in between Milestones and Buyables in the standard tab layout. (cannot do subtabs)
     */
    midsection?: (string | [string, any])[]

    // Big features
    /**
     * A set of one-time purchases which can have unique upgrade conditions, currency costs, and bonuses.
     */
    upgrades: { [id: string]: Upgrade<L> }
    /**
     * A list of bonuses gained upon reaching certain thresholds of a resource. Often used for automation/QOL.
     */
    milestones: { [id: string]: Milestone<L> }
    /**
     * The player can enter challenges, which make the game harder.
     * If they reach a goal and beat the challenge, they recieve a bonus.
     */
    challenges?: { [id: string]: Challenge<L> }
    /**
     * Effectively upgrades that can be bought multiple times, and are optionally respeccable. Many uses.
     */
    buyables?: {
        /**
         * To add a respec button, or something similar,
         * add the respecBuyables function to the main buyables object (not individual buyables).
         */
        respecBuyables?(): void,
        /**
         * This is called when the button is pressed (after a toggleable confirmation message).
         */
        respec?(): void,
        /**
         * Text to display on the respec Button.
         */
        respecText?: Computable<string>
        /**
         * A function determining whether or not to show the button,
         * if `respecBuyables` is defined. Defaults to true if absent.
         */
        showRespec?(): boolean,
        /**
         * A custom confirmation message on respec, in place of the default one.
         */
        respecMessage?: Computable<string>
    } & {
        [id: string]: Buyable<L>,
    }
    /**
     * Extremely versatile and generalized buttons which can only be clicked sometimes.
     */
    clickables?: {
        /**
         * If present, an additional button will appear above the clickables. Pressing it will call this function.
         */
        masterButtonPress?(): void,
        /**
         * Text to display on the Master Button.
         */
        masterButtonText?: Computable<string>
        /**
         * A function determining whether or not to show the button, if `masterButtonPress` is defined. Defaults to true if absent.
         */
        showMasterButton?(): boolean,
    } & {
        [id: string]: Clickable<L>,
    }
    /**
     * An area that functions like a set of subtabs,
     * with buttons at the top changing the content within. (Advanced)
     */
    microtabs?: {
        [id: string]: {
            [id: string]: TabFormat<L>
        }
    }
    /**
     * Display some information as a progress bar, gague, or similar. They are highly customizable, and can be vertical as well.
     */
    bars?: { [id: string]: Bar<L> }
    /**
     * Kind of like milestones, but with a different display style and some other differences. Extra features are on the way at a later date!
     */
    achievements?: { [id: string]: Achievement<L> }
    /**
     * If false, disables popup message when you get the achievement. True by default.
     */
    achievementPopups?: Computable<boolean>;
    /**
     * If false, disables popup message when you get the milestone. True by default.
     */
    milestonePopups?: Computable<boolean>;
    /**
     * Displays some text in a box that can be shown or hidden.
     */
    infoboxes?: { [id: string]: Infobox<L> }
    /**
     * A grid of buttons that behave the same, but have their own data.
     */
    grid?: {
        /**
         * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
         */
        readonly layer: string,

        /**
         * The amount of rows of gridable to display.
         */
        rows: Computable<number>,
        /**
         * The amount of columns of gridable to display.
         */
        cols: Computable<number>,
        /**
         * If rows are dynamic, you need to define the maximum amount that there can be
         * (you can increase it when you update the game though). These CANNOT be dynamic.
         */
        maxRows: number,
        /**
         * If cols are dynamic, you need to define the maximum amount that there can be
         * (you can increase it when you update the game though). These CANNOT be dynamic.
         */
        maxCols: number,
        /**
         * Creates the default data for the gridable at this position. This can be an object, or a regular value.
         */
        getStartData(id: number): Player[L]['grid'][number],
        /**
         * Returns true if the gridable at this position should be visible.
         */
        getUnlocked?(id: number): boolean,
        /**
         * Returns text that should displayed at the top in a larger font, based on the position and data of the gridable.
         */
        getTitle?(data: Player[L]['grid'][number], id: number): string,
        /**
         * Returns everything that should be displayed on the gridable after the title, based on the position and data of the gridable.
         */
        getDisplay?(data: Player[L]['grid'][number], id: number): string,
        /**
         * Returns CSS to apply to this gridable, in the form of an object where the keys are CSS attributes,
         * and the values are the values for those attributes (both as strings).
         */
        getStyle?(data: Player[L]['grid'][number], id: number): CSSStyles,
        /**
         * A function returning a bool to determine if you can click a gridable,
         * based on its data and position. If absent, you can always click it.
         */
        getCanClick?(data: Player[L]['grid'][number], id: number): boolean,
        /**
         * A function that implements clicking on the gridable, based on its position and data.
         */
        onClick(data: Player[L]['grid'][number], id: number): void,
        /**
         * A function that is called 20x/sec when the button is held for at least 0.25 seconds.
         */
        onHold?(data: Player[L]['grid'][number], id: number): void,
        /**
         * A function that calculates and returns a gridable's effect,
         * based on its position and data. (Whatever that means for a gridable)
         */
        getEffect?(data: Player[L]['grid'][number], id: number): void,
        /**
         * Adds a tooltip to the gridables, appears when they hovered over.
         * Can use basic HTML. Default is no tooltip. If this returns an empty value, that also disables the tooltip.
         */
        getTooltip?(data: Player[L]['grid'][number], id: number): string,
    }

    /**
     * Determines which prestige formula you use. Defaults to "none".
     *
     * - "normal": The amount of currency you gain is independent of its current amount (like Prestige). The formula before bonuses is based on `baseResource^exponent`
     * - "static": The cost is dependent on your total after reset. The formula before bonuses is based on `base^(x^exponent)`
     * - "custom": You can define everything, from the calculations to the text on the button, yourself. (See more at the bottom)
     * - "none": This layer does not prestige, and therefore does not need any of the other features in this section.
     */
    type?: 'normal' | 'static' | 'custom' | 'none'
    /**
     * The name of the resource that determines how much of the main currency you gain on reset.
     */
    baseResource: string
    /**
     * A function that gets the current value of the base resource.
     */
    baseAmount(): Decimal
    /**
     * A Decimal, the amount of the base needed to gain 1 of the prestige currency.
     * Also the amount required to unlock the layer.
     * You can instead make this a function, to make it harder if another layer was unlocked first (based on unlockOrder).
     */
    requires: Computable<Decimal>
    /**
     * Used as described in type
     */
    exponent: Decimal
    /**
     * Required for "static" layers, used as described in type.
     * If absent, defaults to 2. Must be greater than 1.
     */
    base?: Decimal
    /**
     * A bool, which is true if the resource cost needs to be rounded up.
     * (use if the base resource is a "static" currency.)
     */
    roundUpCost?: boolean
    /**
     * For normal layers, this function calculates the multiplier
     * on resource gain from upgrades and boosts and such. Plug in most bonuses here.
     *
     * For static layers, it instead multiplies the cost of the resource.
     * (So to make a boost you want to make gainMult smaller.)
     */
    gainMult?(): Decimal
    /**
     * For normal layers, this function calculates the exponent
     * on resource gain from upgrades and boosts and such. Plug in most bonuses here.
     *
     * For static layers, it instead roots the cost of the resource.
     * (So to make a boost you want to make gainExp larger.)
     */
    gainExp?(): Decimal
    /**
     * Directly multiplies the resource gain, after exponents and softcaps.
     *
     * For static layers, actually multiplies resource gain instead of reducing the cost.
     */
    directMult?(): Decimal
    /**
     * For normal layers, gain beyond `softcap` points is put to the `softcapPower`th power.
     *
     * Default for softcap is e1e7.
     */
    softcap?: Computable<Decimal>
    /**
     * For normal layers, gain beyond `softcap` points is put to the `softcapPower`th power.
     *
     * Default for power is 0.5.
     */
    softcapPower?: Computable<Decimal>

    /**
     * Required for static layers, function used to determine if buying max is permitted.
     */
    canBuyMax?: Computable<boolean>
    /**
     * A function that triggers when this layer prestiges, just before you gain the currency.
     * Can be used to have secondary resource gain on prestige, or to recalculate things or whatnot.
     */
    onPrestige?(gain: Decimal): void
    /**
     * Use this to replace "Reset for " on the Prestige button with something else.
     */
    resetDescription?: Computable<string>
    /**
     * Use this to make the entirety of the text a Prestige button contains.
     * Only required for custom layers, but usable by all types.
     */
    prestigeButtonText?(): string
    /**
     * You automatically generate your gain times this number every second (does nothing if absent).
     * This is good for automating Normal layers.
     */
    passiveGeneration?: Computable<number>
    /**
     * If true, the layer will always automatically do a prestige if it can.
     * This is good for automating Static layers.
     */
    autoPrestige?: Computable<boolean>

    /**
     * The text that appears on this layer's node. Default is the layer id with the first letter capitalized.
     */
    symbol?: Computable<string>
    /**
     * **override**
     *
     * The url (local or global) of an image that goes on the node. (Overrides symbol)
     */
    image?: string
    /**
     * Determines the horizontal position of the layer in its row in a standard tree.
     * By default, it uses the layer id, and layers are sorted in alphabetical order.
     */
    position?: number
    /**
     * An array of layer/node ids.
     * On a tree, a line will appear from this layer to all of the layers in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the layer id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<(keyof Layers)[] | [keyof Layers, string | 1 | 2 | 3, number?][]>
    /**
     * A CSS object, where the keys are CSS attributes, which styles this layer's node on the tree.
     */
    nodeStyle: Computable<CSSStyles>
    /**
     * Functions that return text, which is the tooltip for the node when the layer is unlocked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     * If the value is "", the tooltip will be disabled.
     */
    tooltip?(): string
    /**
     * Functions that return text, which is the tooltip for the node when the layer is locked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     * If the value is "", the tooltip will be disabled.
     */
    tooltipLocked?(): string
    /**
     * Adds a mark to the corner of the node. If it's "true" it will be a star, but it can also be an image URL.
     */
    marked?: Computable<string>

    /**
     * Is triggered when a layer on a row greater than or equal to this one does a reset.
     * The default behavior is to reset everything on the row, but only if it was triggered by a layer in a higher row.
     * `doReset` is always called for side layers, but for these the default behavior is to reset nothing.
     *
     * If you want to keep things, determine what to keep based on `resettingLayer`,
     * `milestones`, and such, then call `layerDataReset(layer, keep)`, where `layer` is this layer,
     * and `keep` is an array of the names of things to keep.
     * It can include things like "points", "best", "total" (for this layer's prestige currency),
     * "upgrades", any unique variables like "generatorPower", etc.
     * If you want to only keep specific upgrades or something like that, save them in a separate variable,
     * then call `layerDataReset`, and then set `player[this.layer].upgrades` to the saved upgrades.
     */
    doReset?(resettingLayer: keyof Layers): void
    /**
     * This function is called every game tick.
     * Use it for any passive resource production or time-based things.
     * `diff` is the time since the last tick.
     */
    update?(diff: number): void
    /**
     * If true, the game will attempt to buy this layer's upgrades every tick. Defaults to false.
     */
    autoUpgrade?: Computable<boolean>
    /**
     * This function is called every game tick, after production.
     * Use it to activate automation things that aren't otherwise supported.
     */
    automate?(): void
    /**
     * Returns true if this layer shouldn't trigger any resets when you prestige.
     */
    resetsNothing?: Computable<boolean>
    /**
     * A function to return true if this layer should be highlighted in the tree.
     * The layer will automatically be highlighted if you can buy an upgrade whether you have this or not.
     */
    shouldNotify?(): boolean
    /**
     * The color that this layer will be highlighted if it should notify.
     * The default is red. You can use this if you want several different notification types!
     */
    glowColor?: Computable<string>
    /**
     * An object that contains a set of functions returning CSS objects. Each of these will be applied to any components on the layer with the type of its id. Example:
     *
     * ```js
     * componentStyles: {
     *     "challenge"() { return {'height': '200px'} },
     *     "prestige-button"() { return {'color': '#AA66AA'} }
     * }
     * ```
     */
    componentStyles?: Computable<{ [k: string]: CSSStyles }>
    /**
     * If true, this layer will use the left tab instead of the right tab.
     */
    leftTab?: Computable<boolean>
    /**
     * A layer's id. If a layer has a previousTab,
     * the layer will always have a back arrow and pressing the back arrow on this layer will take you to the layer with this id.
     */
    previousTab?: Computable<string>
    /**
     * If this is true, `hasUpgrade`, `hasChallenge`, `hasAchievement`,
     * and `hasMilestone` will return false for things in the layer,
     * and you will be unable to buy or click things, or gain achievements/milestones on the layer.
     * You will have to disable effects of buyables, the innate layer effect, and possibly other things yourself.
     */
    deactivated?: Computable<boolean>

    /**
     * Returns how many points you should get if you reset now.
     * You can call `getResetGain(this.layer, useType = "static")` or similar to calculate what
     * your gain would be under another prestige type (provided you have all of the required features in the layer).
     */
    getResetGain?(): Decimal
    /**
     * Returns how many of the base currency you need to get to the next point.
     * `canMax` is an optional variable used with Static-ish layers to differentiate between
     * if it's looking for the first point you can reset at, or the requirement for any gain at all (Supporting both is good).
     * You can also call `getNextAt(this.layer, canMax=false, useType = "static")` or
     * similar to calculate what your next at would be under another prestige type
     * (provided you have all of the required features in the layer).
     */
    getNextAt?(canMax: boolean): Decimal
    /**
     * Return true only if you have the resources required to do a prestige here.
     */
    canReset?(): boolean
    /**
     * Returns true if this layer should be subtly highlighted to indicate you
     * can prestige for a meaningful gain.
     */
    prestigeNotify?(): boolean
}

declare class TabFormat<L extends string> {
    /**
     * The tab layout code for the subtab, in the tab layout format.
     */
    content: Computable<TabFormatEntries<L>[]>
    /**
     * Applies CSS to the whole subtab when switched to, in the form of an "CSS Object", where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * A CSS object, which affects the appearance of the button for that subtab.
     */
    buttonStyle?: Computable<CSSStyles>
    /**
     * A function to determine if the button for this subtab should be visible.
     * By default, a subtab is always unlocked. You can't use the "this" keyword in this function.
     */
    unlocked?: Computable<boolean>
    /**
     * If true, the tab button will be highlighted to notify the player that there is something there.
     */
    shouldNotify?(): boolean
    /**
     * If true, the tab button will be highlighted to notify the player that there is something there.
     */
    prestigeNotify?(): boolean
    /**
     * specifies the color that the subtab glows. If this subtab is causing the main layer to node glow
     * (and it would't otherwise) the node also glows this color. Is NOT overridden by embedding a layer.
     */
    glowColor?: Computable<string>
    /**
     * **SIGNIFICANT**
     *
     * The id of another layer. If you have this, it will override "content", "style" and "shouldNotify",
     * instead displaying the entire layer in the subtab.
     */
    embedLayer?: string
    /**
     * Specifies the shown name of the subtab
     */
    name?: Computable<string>
}

declare class Achievement<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the achievement was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Displayed at the top of the achievement. * The only visible text.
     * It can also be a function that returns updating text. * Can use basic HTML.
     */
    name?: Computable<string>;
    /**
     * A function returning a boolean to determine if the achievement should be awarded.
     */
    done(): boolean
    /**
     * Default tooltip for the achievement, appears when it is hovered over.
     * Should convey the goal and any reward for completing the achievement.
     * It can also be a function that returns updating text.
     * Can use basic HTML. Setting this to "" disables the tooltip.
     */
    tooltip?: Computable<string>;
    /**
     * A function that calculates and returns the current values of any bonuses from the achievement.
     * Can return a value or an object containing multiple values.
     */
    effect?(): any
    /**
     * A function returning a bool to determine if the achievement is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * This function will be called when the achievement is completed.
     */
    onComplete?(): void
    /**
     * Puts the image from the given URL (relative or absolute) in the achievement.
     */
    image?: string;
    /**
     * Applies CSS to this achievement, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>;
    /**
     * Applies CSS to the text, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    textStyle?: Computable<CSSStyles>;
}

declare class Bar<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the bar was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * UP (0), DOWN (1), LEFT (2), or RIGHT (3) (not strings).
     *
     * Determines the direction that the bar is filled as it progresses.
     * RIGHT means from left to right.
     */
    direction: 0 | 1 | 2 | 3;
    /**
     * The size in pixels of the bar, but as numbers (no "px" at the end).
     */
    width: number;
    /**
     * The size in pixels of the bar, but as numbers (no "px" at the end).
     */
    height: number;
    /**
     * A function that returns the portion of the bar that is filled, from "empty" at 0 to "full" at 1, updating automatically.
     * (Nothing bad happens if the value goes out of these bounds, and it can be a number or `Decimal`.)
     */
    progress(): number | Decimal
    /**
     * A function that returns text to be displayed on top of the bar, can use HTML.
     */
    display?: Computable<string>
    /**
     * A function returning a bool to determine if the bar is visible or not.
     * Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * Apply CSS to the unfilled portion on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    baseStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the filled portion on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    fillStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the border on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    borderStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the display text on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    textStyle?: Computable<CSSStyles>
    /**
     * If this is true, the bar will instantly snap to the current value instead of animating in between.
     * Good for things involving precise timing.
     */
    instant?: Computable<boolean>
}

declare class Buyable<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the buyable was stored under, for convenient access.
     */
    readonly id: number;

    /**
     * Displayed at the top in a larger font.
     */
    title?: Computable<string>
    /**
     * Cost for buying the next buyable.
     * Can have an optional argument "x" to calculate the cost of the x+1th purchase. (x is a `Decimal`).
     * Can return an object if there are multiple currencies.
     */
    cost(x: Decimal): any
    /**
     * A function that calculates and returns the current values of bonuses of this buyable.
     * Can have an optional argument "x" to calculate the effect of having x of the buyable.
     * Can return a value or an object containing multiple values.
     */
    effect?(x: Decimal): any
    /**
     * A function returning everything that should be displayed on the buyable after the title,
     * likely including the description, amount bought, cost, and current effect. Can use basic HTML.
     */
    display: Computable<string>
    /**
     * A function returning a bool to determine if the buyable is visible or not. Default is unlocked.
     */
    unlocked?: Computable<boolean>
    /**
     * A function returning a bool to determine if you can buy one of the buyables.
     */
    canAfford(): boolean
    /**
     * A function that implements buying one of the buyable, including spending the currency.
     */
    buy(): void
    /**
     * A function that implements buying as many of the buyable as possible.
     */
    buyMax?(): void
    /**
     * Applies CSS to this buyable, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>;
    /**
     * The limit on how many of the buyable can be bought.
     * The default is no limit.
     */
    purchaseLimit?: Computable<Decimal>
    /**
     * Adds a mark to the corner of the buyable.
     * If it's "true" it will be a star, but it can also be an image URL.
     */
    marked?: Computable<boolean | string>
    /**
     * Adds a tooltip to this buyable, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
    /** Additionnal amount to be added to the buyable amount to compute the effects */
    bonusAmount?(): Decimal
    /**
     * Called when the button is pressed.
     * The standard use would be to decrease the amount of the buyable,
     * and possibly return some currency to the player.
     */
    sellOne?(): void
    /**
     * Called when the button is pressed.
     * The standard use would be to reset the amount of the buyable,
     * and possibly return some currency to the player.
     */
    sellAll?(): void
    /**
     * Booleans determining whether or not to show the buttons.
     * If `canSellOne` is absent but `sellOne` is present,
     * the appropriate button will always show.
     */
    canSellOne?(): boolean
    /**
     * Booleans determining whether or not to show the buttons.
     * If `canSellAll` is absent but `sellAll` is present,
     * the appropriate button will always show.
     */
    canSellAll?(): boolean
    /**
     * This is primarially useful for buyable trees. An array of buyable ids.
     * A line will appear from this buyable to all of the buyables in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the buyable id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
}

declare class Challenge<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the challenge was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Name of the challenge, can be a string or a function. Can use basic HTML.
     */
    name: Computable<string>
    /**
     * A description of what makes the challenge a challenge.
     * *You will need to implement these elsewhere.*
     * It can also be a function that returns updating text. Can use basic HTML.
     */
    challengeDescription: Computable<string>
    /**
     * A description of the win condition for the challenge.
     * It can also be a function that returns updating text.
     * Can use basic HTML.
     */
    goalDescription: Computable<string>
    /**
     * A function that returns true if you meet the win condition for the challenge.
     * Returning a number will allow bulk completing the challenge.
     */
    canComplete(): boolean | number
    /**
     * A description of the reward's effect.
     * *You will also have to implement the effect where it is applied.*
     * Can use basic HTML.
     */
    rewardDescription: Computable<string>
    /**
     * A function that calculates and returns the current values of any bonuses from the reward.
     * Can return a value or an object containing multiple values. Can use basic HTML.
     */
    rewardEffect?(): any
    /**
     * A function that returns a display of the current effects of the reward with formatting.
     * Default behavior is to just display the a number appropriately formatted.
     */
    rewardDisplay?(): string
    /**
     * **OVERRIDE**
     *
     * Overrides the other displays and descriptions,
     * and lets you set the full text for the challenge. Can use basic HTML.
     */
    fullDisplay?(): string
    /**
     * A function returning a bool to determine if the challenge is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * This function will be called when the challenge is completed when previously incomplete.
     */
    onComplete?(): void
    /**
     * This function will be called when entering the challenge.
     */
    onEnter?(): void
    /**
     * This function will be called when exiting the challenge in any way.
     */
    onExit?(): void
    /**
     * If a challenge combines the effects of other challenges in this layer, you can use this.
     * An array of challenge ids. The player is effectively in all of those challenges when in the current one.
     */
    countsAs?: number[]
    /**
     * The amount of times you can complete this challenge. Default is 1 completion.
     */
    completionLimit?: number
    /**
     * Applies CSS to this challenge, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Applies CSS to this challenge's button, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    buttonStyle?: Computable<CSSStyles>
    /**
     * Adds a mark to the corner of the challenge.
     * If it's "true" it will be a star, but it can also be an image URL.
     * By default, if the challenge has multiple completions, it will be starred at max completions.
     */
    marked?: Computable<boolean | string>
    /**
     * If defined and false, the challenge will not be able to start
     */
    canEnter?(): boolean
    /**
     * If defined and false, the challenge will not be able to end
     */
    canExit?(): boolean
}

declare class Clickable<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the clickable was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Displayed at the top in a larger font.
     */
    title?: Computable<string>
    /**
     * A function that calculates and returns the current values of bonuses of this clickable.
     * Can return a value or an object containing multiple values.
     */
    effect?(): any
    /**
     * A function returning everything that should be displayed on the clickable after the title,
     * likely changing based on its state. Can use basic HTML.
     */
    display: Computable<string>
    /**
     * A function returning a bool to determine if the clickable is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * A function returning a bool to determine if you can click the clickable.
     */
    canClick(): boolean
    /**
     * A function that implements clicking the clickable.
     */
    onClick(): void
    /**
     * A function that is called 20x/sec when the button is held for at least 0.25 seconds.
     */
    onHold(): void
    /**
     * Applies CSS to this clickable, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Adds a mark to the corner of the clickable.
     * If it's "true" it will be a star, but it can also be an image URL.
     */
    marked?: Computable<boolean | string>
    /**
     * Adds a tooltip to this clickable, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
    /**
     * This is primarially useful for clickable trees. An array of clickable ids.
     * A line will appear from this clickable to all of the clickables in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the clickable id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
}

declare class Infobox<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the infobox was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * The text displayed above the main box. Can use basic HTML.
     */
    title: Computable<string>
    /**
     * The text displayed inside the box. Can use basic HTML.
     */
    body: Computable<string>
    /**
     * Apply CSS to the infobox in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Apply CSS to the title button of the infobox,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    titleStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the body of the infobox,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    bodyStyle?: Computable<CSSStyles>
    /**
     * A function returning a bool to determine if the infobox is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
}

declare class Hotkey {
    /**
     * What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
     */
    key: string
    /**
     * The description of the hotkey that is displayed in the game's How To Play tab.
     */
    description: Computable<string>
    onPress(): void
    /**
     * Determines if you can use the hotkey.
     */
    unlocked?: Computable<boolean>
}

declare class Milestone<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the milestone was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * A string describing the requirement for unlocking this milestone.
     * Suggestion: Use a "total". Can use basic HTML.
     */
    requirementDescription: Computable<string>
    /**
     * Current effect of the milestone
     */
    effect?: Computable<any>
    /**
     * A string describing the reward for having the milestone.
     * *You will have to implement the reward elsewhere.*
     * Can use basic HTML.
     */
    effectDescription: Computable<string>
    /**
     * A function returning a boolean to determine if the milestone should be awarded.
     */
    done(): boolean
    /**
     * This function will be called when the milestone is completed.
     */
    onComplete?(): void
    /**
     * Creates toggle buttons that appear on the milestone when it is unlocked.
     * The toggles can toggle a given boolean value in a layer.
     * It is defined as an array of paired items, one pair per toggle.
     * The first is the internal name of the layer the value being toggled is stored in,
     * and the second is the internal name of the variable to toggle. (e.g. [["b", "auto"], ["g", "auto"])
     *
     * **Tip:** Toggles are not de-set if the milestone becomes locked! In this case, you should also check if the player has the milestone.
     */
    toggles?: [string, string][]
    /**
     * Applies CSS to this milestone, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * A function returning a boolean to determine if the milestone should be shown. If absent, it is always shown.
     */
    unlocked?: Computable<boolean>
    /**
     * Adds a tooltip to this milestone, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
}

declare class Particle {
    /**
     * The amount of time, in seconds, that the particle will last. Default is 3.
     */
    time?: number
    /**
     * The amount of seconds that fading out at the end should take (part of the total lifetime). Default is 1.
     */
    fadeOutTime?: number
    /**
     * The amount of seconds that fading in should take (part of the total lifetime). Default is 0.
     */
    fadeInTime?: number

    /**
     * The image the particle should display. `""` will display no image. Default is a generic particle.
     */
    image?: string
    /**
     * Displays text on the particle. Can use basic HTML.
     */
    text?: string
    /**
     * Lets you apply other CSS styling to the particle.
     */
    style?: CSSStyles
    /**
     * The dimensions of the particle. Default is 35.
     */
    width?: number
    /**
     * The dimensions of the particle. Default is 35.
     */
    height?: number
    /**
     * Sets the color of the image to this color.
     */
    color?: string

    /**
     * The angle that the particle should face. Default is 0.
     */
    angle?: number
    /**
     * The initial angle that the particles should move in, before spread is factored in. Default is whatever angle is.
     */
    dir?: number
    /**
     * If there are several particles, they will be spread out by this many degrees, centered on dir. Default is 30.
     */
    spread?: number

    /**
     * The amount that the (visual) angle of the particle should change by. Default is 0.
     */
    rotation?: number
    /**
     * The starting speed of the particle. Default is 15.
     */
    speed?: number
    /**
     * The amount the particle should accelerate downwards. Default is 0.
     */
    gravity?: number

    /**
     * The starting coordinates of the particle. Default is at the mouse position.
     */
    x?: number
    /**
     * The starting coordinates of the particle. Default is at the mouse position.
     */
    y?: number
    /**
     * How far from the start each particle should appear. Default is 10.
     */
    offset?: number
    /**
     * Set initially based on other properties, then used to update movement.
     */
    xVel?: number
    /**
     * Set initially based on other properties, then used to update movement.
     */
    yVel?: number

    /**
     * When changing tabs, if leaving the `layer` tab, this particle will be erased.
     */
    layer?: string

    /**
     * Called each tick. Lets you do more advanced visual and movement behaviors by changing other properties.
     */
    update?(): void
    /**
     * Called when the particle is interacted with.
     */
    onClick?(): void
    /**
     * Called when the particle is interacted with.
     */
    onMouseOver?(): void
    /**
     * Called when the particle is interacted with.
     */
    onMouseLeave?(): void
}

declare class TreeNode {
    /**
     * The node's color. (A string in hex format with a #)
     */
    color?: string
    /**
     * The text on the button (The id capitalized by default)
     */
    symbol?: string
    /**
     * Returns true if the player can click the node. ()
     */
    canClick?(): boolean
    /**
     * The function called when the node is clicked.
     */
    onClick?(): boolean
    /**
     * A function returning a bool which determines if this node should be visible.
     * It can also return "ghost", which will hide the layer,
     * but its node will still take up space in its tree.
     */
    layerShown?: Computable<number | 'ghost'>
    /**
     * An array of layer/node ids. On a tree, a line will appear from this node to all of the nodes in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
    /**
     * A CSS object, where the keys are CSS attributes, which styles this node on the tree.
     */
    nodeStyle?: Computable<CSSStyles>
    /**
     * Functions that return text, which is the tooltip for the node when the layer is unlocked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     */
    tooltip?: Computable<string>
    /**
     * Functions that return text, which is the tooltip for the node when the layer is locked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     */
    tooltipLocked?: Computable<string>
    /**
     * The row that this node appears in (for the default tree).
     */
    row?: number
    /**
     * Determines the horizontal position of the layer in its row in a default tree. By default, it uses the id,
     * and layers/nodes are sorted in alphabetical order.
     */
    position?: number
}

declare class Upgrade<L extends keyof Layer> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the upgradae was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Displayed at the top in a larger font. It can also be a function that returns updating text. Can use basic HTML.
     */
    title?: Computable<string>
    /**
     * A description of the upgrade's effect.
     * *You will also have to implement the effect where it is applied.*
     * It can also be a function that returns updating text. Can use basic HTML.
     */
    description: Computable<string>
    /**
     * A function that calculates and returns the current values of any bonuses from the upgrade.
     * Can return a value or an object containing multiple values.
     */
    effect?: Computable<any>
    /**
     * A function that returns a display of the current effects of the upgrade with formatting. Default displays nothing. Can use basic HTML.
     */
    effectDisplay?(): string
    /**
     * **OVERRIDE**
     *
     * Overrides the other displays and descriptions, and lets you set the full text for the upgrade. Can use basic HTML.
     */
    fullDisplay?: Computable<string>
    /**
     * **sort of optional**
     *
     * A Decimal for the cost of the upgrade.
     * By default, upgrades cost the main prestige currency for the layer.
     */
    cost?: Computable<Decimal>
    /**
     * **OVERRIDE**
     *
     * Overrides the cost display without overriding anything else.
     */
    costDisplay?(): string
    /**
     * A function returning a bool to determine if the upgrade is visible or not. Default is unlocked.
     */
    unlocked?: Computable<boolean>
    /**
     * This function will be called when the upgrade is purchased.
     * Good for upgrades like "makes this layer act like it was unlocked first".
     */
    onPurchase?(): void
    /**
     * Applies CSS to this upgrade, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Adds a tooltip to this upgrade, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
    /**
     * **OVERRIDE**
     *
     * A function determining if you are able to buy the upgrade.
     *
     * (If you also have a cost, it will check both the cost and this function)
     */
    canAfford?(): boolean
    /**
     * **OVERRIDE**
     *
     * A function that reduces your currencies when you buy the upgrade.
     */
    pay?(): void
    /**
     * This is primarially useful for upgrade trees. An array of upgrade ids.
     * A line will appear from this upgrade to all of the upgrades in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the upgrade id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
    /**
     * The name to display for the currency for the upgrade.
     */
    currencyDisplayName?: string
}
declare class CurrencyUpgrade<T, L extends keyof Layer> extends Upgrade<L> {
    /**
     * The internal name for that currency.
     */
    currencyInternalName: keyof T
    /**
     * The internal name of the layer that currency is stored in.
     * If it's not in a layer (like Points), omit.
     * If it's not stored directly in a layer, instead use `currencyLocation`.
     */
    currencyLayer?: string
    /**
     * If your currency is stored in something inside a layer (e.g. a buyable's amount), you can access it this way.
     * This is a function returning the object in "player" that contains the value (like `player[this.layer].buyables`)
     */
    currencyLocation?(): T
}

declare class LayerData {
    unlocked: boolean
    points: Decimal
    total?: Decimal
    best?: Decimal
    //unlockOrder?: string[]
    resetTime?: number
    upgrades?: number[]
    milestones?: number[]
    achievements?: number[]
    activeChallenge?: number | null
    buyables?: { [id: number]: Decimal }
    challenges?: { [id: number]: number }
}

declare class Item<I> {
    readonly id: I
    color: Computable<string>
    name: Computable<string>
    /** Position of the icon, 0-based */
    icon?: Computable<[number, number]>
    /** Amount is reset when that row is */
    row?: Layer<string>['row']
    unlocked?: boolean
    categories: categories[]

    lore: Computable<string>

    /**
     * Item sources
     *
     * Note that the items don't deal with applying them
     */
    sources?: {
        readonly id: I
        /** Chance-based source (0.5 has a 50% chance) */
        chance?: Computable<{ [key in drop_sources]: Decimal }>
        /** Produced per second by another layer */
        per_second?: Computable<{ [key in drop_sources]: Decimal }>
        /** Drops between min and max */
        range?: Computable<{ [key in drop_sources]: { min: Decimal, max: Decimal } }>
        /**
         * Automatically set
         *
         * Total produced every second
         */
        per_second_total?(): Decimal
        other?: Computable<drop_sources[]>
    }

    /**
     * Item values
     *
     * Note that multipliers are applied separately
     *
     * 0 values are ignored
     */
    value?: {
        readonly id: I
        /**
         * Cost for buying 1
         */
        cost?: Computable<Decimal>
        /**
         * Value for selling 1
         */
        value?: Computable<Decimal>
        /** Maximum amount the player can buy */
        limit?: Computable<Decimal>
    }

    effect(amount?: DecimalSource): any
    effectDescription(amount?: DecimalSource): string
}

type items = 'unknown' |
    // Slime
    'slime_goo' | 'slime_core_shard' | 'slime_core' | 'dense_slime_core' |
    'slime_crystal' | 'slime_knife' | 'slime_injector' | 'slime_die' |
    // Skeleton
    'bone' | 'rib' | 'skull' | 'slimy_skull' |
    'bone_pick' | 'crystal_skull' | 'bone_slate' | 'magic_slime_ball' |
    // Golem
    'mud' | 'mud_brick' | 'golem_eye' | 'golem_core' |
    'mud_kiln' | 'weakness_finder' | 'arcane_generator' | 'record_golem' |
    // Insect
    'chitin' | 'antenna' | 'exoskeleton' | 'egg' |
    'bug_armor' |
    // Mining
    'stone' | 'copper_ore' | 'tin_ore' | 'bronze_blend' | 'gold_nugget' | 'densium' |
    'coal' | 'iron_ore' | 'clear_iron_ore' | 'silver_ore' | 'electrum_blend' |
    'stone_brick' | 'copper_ingot' | 'tin_ingot' | 'bronze_ingot' | 'gold_ingot' |
    'iron_ingot' | 'silver_ingot' | 'lead_ingot' | 'electrum_ingot' |
    'stone_mace' | 'copper_pick' | 'tin_cache' | 'bronze_cart' | 'doubloon' |
    'furnace' | 'iron_rails' | 'silver_coating' | 'electrum_coin_mold' | 'bellow' | 'lead_coating' |
    'stone_wall' | 'copper_golem' | 'tin_ring' | 'bronze_mold' | 'gold_star' | 'iron_heataxe' | 'disco_ball' | 'electrum_package' |
    'coin_copper' | 'coin_bronze' | 'coin_silver' | 'coin_gold' | 'coin_platinum' |
    'densium_slime' | 'densium_rock' | 'magic_densium_ball' | 'densium_golem' |
    // Arcane
    'extractor' | 'inserter' | 'combiner' | 'smelter' |
    // Special
    'package_1' | 'package_2' | 'package_3' | 'package_4' |
    'factory_core_casing' | 'factory_core_frame' | 'factory_core_scaffolding' | 'factory_core' |
    'cueball';
//todo ??? (antenna), ??? (exoskeleton), bug finder (golem eye + exoskeleton + egg, +exoskeleton & +chance)
//todo chrome lump, chrome ingot, chrome plating (+ore drops), chrome coating (*damage)
//todo? ruby (<-chrome, material), yellow dye (yellow slime override)
//todo item effects

type monsters = 'slime' | 'skeleton' | 'golem' | 'bug';

type ores = 'stone' | 'copper' | 'tin' |
    'coal' | 'iron' | 'silver';

type drop_sources = `kill:${monsters}` | 'kill:any' | 'crafting' | 'forge' | `mining:${ores}` | 'mining:any' | 'mining:compactor' | 'shop';
type drop_types = 'kill' | 'crafting' | 'forge' | 'mining' | 'shop';
type categories = 'materials' | 'equipment' | 'craftable' |
    'mining' | 'densium' | 'deep_mining' |
    'forge' | 'shop' | 'arca' | 'boss' |
    monsters;

type spells = 'convertion' | 'drain' | 'acid' | 'lava' |
    'rank' | 'magic_hands' | 'fireburn' | 'speed' |
    'bossardry' | 'thaumconomics';
type spell_effects = {
    convertion: {
        xp_loss: Decimal
        m_xp_loss: Decimal
        arca: Decimal
    }
    drain: {
        damage_mult: Decimal
        xp_passive: Decimal
    }
    acid: {
        def_div: Decimal
        ore_health_div: Decimal
    }
    lava: {
        vein_size: Decimal
        heat_gain: Decimal
    }
    rank: {
        level_cost: Decimal
        skill_point: Decimal
    }
    magic_hands: {
        crafting_speed: Decimal
    }
    fireburn: {
        heat_mult: Decimal
        forge_speed: Decimal
    }
    speed: {
        cycle_duration: Decimal
        cycle_time: Decimal
    }
    bossardry: {
        arca: Decimal
    }
    thaumconomics: {
        value_gain: Decimal
        craft_speed: Decimal
        forge_speed: Decimal
    }
}

type death_resources = 'karma' | 'souls';

type Layers = {
    // Side
    ach: Layer<'ach'> & {
        categories: {
            normal: {
                color: Computable<string>
                rows: number[]
                visible(): number[]
                owned(): number[]
            }
            bonus: {
                color: Computable<string>
                rows: number[]
                visible(): number[]
                owned(): number[]
            }
            secret: {
                color: Computable<string>
                rows: number[]
                visible(): number[]
                owned(): number[]
            }
        }
    }
    dea: Layer<'dea'> & {
        upgrades: { [id: string]: CurrencyUpgrade<Player['dea'], 'dea'> }
        monsters: { [monster in monsters]: {
            private _id: monster | null
            readonly id: monster
            damage(): Decimal
        } }
        player: {
            health(): Decimal
            regen(): Decimal
            /** How many times the player survives fatal damage */
            survives(): Decimal
        }
        modifiers: {
            damage: {
                base(): Decimal
                mult(): Decimal
            }
            health: {
                base(): Decimal
                mult(): Decimal
            }
            regen: {
                base(): Decimal
                mult(): Decimal
            }
        }
        currencies: {
            [res in death_resources]: {
                private _id: res | null
                readonly id: res
                color: string
                name: Computable<string>
                reset_gain(): Decimal
                formula: Computable<string>
            }
        }
    }
    wor: Layer<'wor'> & {
        overrides: {
            xp: {
                /** Monsters available on the current location */
                monsters(): monsters[]
            }
            m: {
                /** Ores available on the current location */
                ores(): ores[]
            }
            c: {
                /** Whether normal crafting can be done */
                craftable(): boolean
                /** Whether forging can be done */
                forgable(): boolean
            }
            s: {
                /** Whether buying can be done */
                can_buy(): boolean
                /** Whether selling can be done */
                can_sell(): boolean
            }
        }
    }
    // Row 0
    xp: Layer<'xp'> & {
        upgrades: { [id: string]: Upgrade<'xp'> & { kills: Decimal, show(): boolean } }
        monsters: { [monster in monsters]: {
            private _id: monster | null
            readonly id: monster
            color: string
            /** Name of the monster, lowercase */
            name: string
            /** Position of the monster in the monster spritesheet */
            position: Computable<[number, number]>
            /** Level of the monster when killed an amount of times */
            level(kills?: DecimalSource): Decimal
            /** Maximum health of the monster at a given level */
            health(level?: DecimalSource): Decimal
            /** Damage reduction */
            defense?(level?: DecimalSource): Decimal
            /** XP gained on kill */
            experience(level?: DecimalSource): Decimal
            /** XP gained per second */
            passive_experience(level?: DecimalSource): Decimal
            /** How many kills on kill (affects item gain) */
            kills(): Decimal
            /** Damage on attack */
            damage(): Decimal
            /** Passive damage per second (theorical) */
            damage_per_second(): Decimal
            lore: Computable<string>
            unlocked?(): boolean
        } }
        list(): monsters[]
        kill: {
            color: string
            total(): Decimal
        }
        level: {
            /** Total enemy levels */
            total(): Decimal
        }
        modifiers: {
            damage: {
                base(): Decimal
                mult(): Decimal
            }
            speed: {
                /**
                 * Auto attacks to target enemy per second
                 */
                active(): Decimal
                /**
                 * Auto attacks to all enemies per second
                 */
                passive(): Decimal
            }
            xp: {
                /** XP gain without killing enemies */
                passive: {
                    /** Multiplier for target enemy */
                    active(): Decimal
                    /** Multiplier for all enemies */
                    passive(): Decimal
                    /** Total passive gain per second */
                    total(): Decimal
                }
                mult(): Decimal
                exp(): Decimal
            }
            cap: {
                base(): Decimal
                mult(): Decimal
                /** XP limit */
                total(): Decimal
                /** XP left until limit */
                gain(): Decimal
            }
            health: {
                mult(): Decimal
            }
            drops: {
                mult(): Decimal
            }
            /**
             * Monster level formula:
             * `floor((kills / base) ^ exp * mult) + 1`
             */
            level: {
                base(): Decimal
                mult(): Decimal
                exp(): Decimal
            }
            defense: {
                mult(): Decimal
            }
        }
    }
    m: Layer<'m'> & {
        upgrades: {
            [id: string]: Upgrade<'m'> & {
                item: items
                show?(): boolean
                currencyInternalName: 'amount'
                currencyLocation(): Player['items'][items]
            }
        }
        ores: { [ore in ores]: {
            private _id: ore | null
            readonly id: ore
            color: string
            /** Name of the ore, lowercase */
            name: string
            /** Position of the ore in the ore spritesheet */
            position: Computable<[number, number]>
            /** Total health of the ore */
            health(vein?: DecimalSource): Decimal
            lore: Computable<string>
            unlocked?(): boolean
            /** Weighted chance to be selected */
            weight(): Decimal
            /** How many breaks on destruction (affects item gain) */
            breaks(): Decimal
            /** Experience gain on break */
            experience(vein?: DecimalSource): Decimal
            /** How many veins have been broken */
            vein(): Decimal
        } }
        modifiers: {
            damage: {
                base(): Decimal
                mult(): Decimal
                total(): Decimal
                /**
                 * Auto mine to ore per second
                 */
                speed(): Decimal
            }
            range: {
                mult(): Decimal
            }
            health: {
                mult(): Decimal
                /** Total health of target ores */
                total(): Decimal
            }
            xp: {
                /** Base on breaking ore */
                base(): Decimal
                mult(): Decimal
                /** Gain on breaking current ores */
                gain(): Decimal
                cap_base(): Decimal
                /** XP limit */
                cap(): Decimal
                /** XP left until limit */
                gain_cap(): Decimal
                color: string
            }
            vein: {
                /** How many ores must be broken before the health increases */
                size(): Decimal
                /** How much health is added per vein emptied */
                health_mult(): Decimal
                /** How much xp is added per vein emptied */
                xp_add_mult(): Decimal
                color: string
            }
            /** Amount of mined ores */
            size(): number
        }
        list(): ores[]
        /** Items counted as ores */
        items: items[]
        /** Items listed in the layers */
        minerals: items[]
        broken: {
            color: Computable<string>
            total(): Decimal
        }
        compactor: {
            materials(): Decimal
            time(): Decimal
            unlocked(): boolean
        }
    }
    // Row 1
    l: Layer<'l'> & {
        skill_points: {
            color: string
            total(): Decimal
            remaining(): Decimal
            skills(): Decimal
        }
    }
    c: Layer<'c'> & {
        upgrades: {
            [id: string]: Upgrade<'c'> & {
                item: items
                currencyInternalName: 'amount'
                currencyLocation(): Player['items'][items]
            }
        }
        chance_multiplier(): Decimal
        crafting: {
            /** Max multiplier for crafting amount */
            max(): Decimal
            /** Total times static recipes have been crafted */
            crafted(): Decimal
            /** Divides crafting time */
            speed(): Decimal
        }
        forge: {
            unlocked(): boolean
            /** Divides forging time */
            speed(): Decimal
            /** Multiplies forging costs */
            cost_mult(): Decimal
        }
        recipes: {
            [id: string]: {
                private _id: string | null
                readonly id: string
                unlocked?: Computable<boolean>

                /** Items consumed for an output multiplier */
                consumes(amount?: DecimalSource, all_time?: DecimalSource): [items, Decimal][]
                /** Items produced with a given multiplier */
                produces(amount?: DecimalSource, all_time?: DecimalSource): [items, Decimal][]
                /** Duration to craft an amount of items, if 0 or absent, crafting is instant */
                duration?(amount?: DecimalSource, all_time?: DecimalSource): Decimal
                /** If present and above 0, the recipe will be visible in the forge instead of the normal tab */
                heat?(amount?: DecimalSource, all_time?: DecimalSource): Decimal
                formulas: {
                    duration?: string
                    heat?: string
                    consumes: { [item in items]?: string }
                    produces: { [item in items]?: string }
                }
                /**
                 * If true, all time crafted amount will be counted for consuming and producing
                 */
                static?: boolean
                categories: categories[]
                /** If true, the recipe cannot be automated with arca */
                manual?: boolean
            }
        }
        modifiers: {
            craft: {
                cost_mult(): Decimal
            }
            materials: {
                cost_mult(): Decimal
            }
            equipment: {
                cost_mult(): Decimal
            }
            heat: {
                /** Gain per second */
                gain: {
                    base(): Decimal
                    mult(): Decimal
                    total(): Decimal
                }
                /** Loss per second */
                loss: {
                    base(): Decimal
                    mult(): Decimal
                    total(): Decimal
                }
                /** Total per second */
                per_second(): Decimal
                color: Computable<string>
            }
        }
    }
    a: Layer<'a'> & {
        /**
         * TODO: Arcanism
         * transmutation (slime goo -> bone, etc.)
         */
        /**
         * Overrides for chains
         *
         * Id must be the same as the recipe it overrides
         */
        chains: {
            [id in string]?: {
                /**
                 * Items needed to build a production chain
                 *
                 * By default it uses:
                 * - 1 extractor per input
                 * - 1 inserter per output
                 * - 1 combiner for non-forge recipes
                 * - 1 smelter for forge recipes
                 */
                items?: [items, Decimal][]
                /**
                 * Multiplier to crafting time
                 */
                time_multiplier?: Decimal
                /**
                 * Arca cost per second to run
                 *
                 * By default it counts based on machines:
                 * - extractor/inserter: .1/s
                 * - combiner/smelter: 1/s
                 */
                arca_cost?: Computable<Decimal>
                /**
                 * If true, the recipe will consume a part of the amount needed and produce part of the output
                 *
                 * e.g. instead of consume 100 stone for 1 brick over 30 seconds, it will multiply by tick length and divide by 30 (seconds)
                 *
                 * Enabled by default for smelting and untimed recipes
                 */
                continuous?: Computable<boolean>
            }
        }
        upkeep: { [id in items]?: Computable<Decimal> }
        modifiers: {
            arca: {
                gain: {
                    base(): Decimal
                    mult(): Decimal
                    total(): Decimal
                }
                loss: {
                    base(): Decimal
                    mult(): Decimal
                    total(): Decimal
                }
                total(): Decimal
            }
            cycle: {
                /** Time in seconds a cycle takes */
                duration(): Decimal
                /** Time in seconds a cycle progresses */
                time(): Decimal
            }
            spell: {
                cost_mult(): Decimal
                duration_mult(): Decimal
            }
        }
        spells: {
            [id in spells]: {
                private _id: id | null
                readonly id: id
                unlocked?: Computable<boolean>
                name: string

                /** Cost in arca */
                cost(): Decimal
                /** Duration in seconds */
                duration(): Decimal
                /**
                 * Current effect
                 *
                 * @param {boolean} [active] If true, returns the active effect
                 */
                effect(active?: boolean): spell_effects[id]
                /**
                 * Current effect description
                 *
                 * @param {boolean} [active] If true, returns the active effect
                 */
                effectDescription(active?: boolean): string
            }
        }
    }
    // Row 2
    b: Layer<'b'> & {
        challenges?: {
            [id: string]: Challenge<'b'> & {
                progress(): Decimal
                display(): string
                group: 'boss' | 'mini' | 'relic'
            }
        }
        groups: {
            [type in 'boss' | 'mini' | 'relic']: {
                completions(): Decimal
                color: Computable<string>
                rows: number[]
            }
        }
        complete: {
            total(): Decimal
        }
        bosses: {
            [id: string]: {
                private _id: string | null
                readonly id: string
                unlocked?: Computable<boolean>
                /** Name of the boss, lowercase */
                name: Computable<string>
                /** Position of the boss in the monster spritesheet */
                position: Computable<[number, number]>
                lore: Computable<string>
                /** Linked challenge */
                challenge: string
            }
        }
        list(): string[]
    }
    s: Layer<'s'> & {
        modifiers: {
            coin: {
                mult(): Decimal
            }
            trade: {
                /** Multiplier to buying costs */
                buy_mult(): Decimal
                /** Multiplier to selling gains */
                sell_mult(): Decimal
            }
        }
        coins: {
            /** Total amount of money owned */
            total(): Decimal
            spent(): Decimal
            /** Coins and amount needed to upgrade (if it can improve) */
            list: [items, DecimalSource?][]
        }
        items: { [item in items]?: {
            readonly id: item
            /** Cost for buying 1 */
            cost?(): Decimal
            /** Value for selling 1 */
            value?(): Decimal
        } }
        upgrades: {
            [id: string]: Upgrade<'s'> & {
                currencyInternalName: 'total'
                currencyLocation(): Layers['s']['coins']
            }
        }
    }
};
type Temp = {
    displayThings: (string | (() => string))[]
    gameEnded: boolean
    other: {
        lastPoints: Decimal,
        oomps: Decimal,
        screenWidth: number,
        screenHeight: number,
    }
    scrolled: boolean
    items: RComputed<typeof item_list>
} & RComputed<Layers>;
type Player = {
    devSpeed: string
    hasNaN: boolean
    keepGoing: boolean
    lastSafeTab: string
    navTab: string
    offTime: {
        remain: number,
    }
    points: Decimal
    subtabs: {
        [key in keyof Layers]: {
            mainTabs: string,
        }
    }
    tab: string
    time: number
    timePlayed: number
    version: string
    versionType: string
    items: { [item in items]: {
        amount: Decimal
        total: Decimal
    } }
    // Side
    ach: LayerData & {
        pool_balls: number[]
    }
    dea: LayerData & {
        health: Decimal
        survives: Decimal
    } & { [res in death_resources]: Decimal }
    wor: LayerData & {
        position: [row: number, col: number]
        delivered: Record<items, boolean>
        visited: [row: number, col: number][]
        zoom: number
    }
    // Row 0
    xp: LayerData & {
        selected: monsters | false
        lore: monsters | false
        monsters: { [monster in monsters]: {
            kills: Decimal
            health: Decimal
            last_drops: [items, Decimal][]
            last_drops_times: Decimal
        } }
        attack_time_selected: Decimal
        attack_time_all: Decimal
    }
    m: LayerData & {
        targets: ores[]
        previous: ores[]
        last_drops: [items, Decimal][]
        health: Decimal
        lore: ores | false
        ores: { [ore in ores]: {
            broken: Decimal
        } }
        mine_time: Decimal
        compactor: {
            enabled: boolean
            /** Amount of times the compactor has completed */
            runs: Decimal
            time: Decimal
            /** Material currently in the compactor */
            materials: Decimal
            /** If true, the compactor is compacting */
            running: boolean
        }
        experience: Decimal
    }
    // Row 1
    l: LayerData & {}
    c: LayerData & {
        shown: boolean
        visiblity: {
            inventory: {
                [cat in categories]: 'show' | 'hide' | 'ignore'
            }
            crafting: {
                [cat in categories]: 'show' | 'hide' | 'ignore'
            }
            forge: {
                [cat in categories]: 'show' | 'hide' | 'ignore'
            }
        }
        recipes: {
            [id: string]: {
                target: Decimal
                making: Decimal
                time: Decimal
                /** Total times crafted */
                crafted: Decimal
            }
        }
        compendium: items | false
        visited_forge: boolean
        heat: Decimal
        //todo forge fuels
    }
    a: LayerData & {
        chains: {
            [id: string]: {
                built: Decimal
                /** Time the chain has run */
                time: Decimal
            }
        }
        spells: {
            [id in spells]: {
                /** Amount of times the spell was cast */
                cast: Decimal
                /** Time left for the spell */
                time: Decimal
            }
        }
        /** Time since the last cycle */
        cycle_time: Decimal
    }
    // Row 2
    b: LayerData & {
        shown: boolean
        /** List of visible challenges */
        visible_challenges: string[]
        lore: string
    }
    s: LayerData & {
        /** Total value spent */
        spent: Decimal
        buy: Decimal
        buy_amount: Decimal
        sell: Decimal
        sell_amount: Decimal
        trades: { [item in items]?: {
            bought?: Decimal
            sold?: Decimal
        } }
    }
};

/** Adds the items in question to the player data */
function gain_items(items: [items, DecimalSource][]): void
/** Adds the item in question to the player data */
function gain_items(item: items, amount: DecimalSource): void

type WorldMap = {
    map: string[][]
    info: Record<string, {
        color: string
        name: string
        lore?: string
        /** Icon on the map */
        icon?: [number, number]
        overrides?: {
            /** Monsters on the location, if there are any */
            monsters?: monsters[]
            /** Ores on the location, if there are any */
            ores?: ores[]
            /** If true, crafting can be done */
            craftable?: boolean
            /** If true, forging can be done */
            forgable?: boolean
            /** If true, buying can be done */
            buy?: boolean
            /** If true, selling can be done */
            sell?: boolean
        }
        /** If true, the tile cannot be walked on */
        solid?: boolean
        /** If set, an item can be delivered there for value */
        package?: {
            item: items
            value: Computable<Decimal>
        }
    }>
};
