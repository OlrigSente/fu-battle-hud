import { FubhConstants } from "./FubhConstants.js";
import { CombatantsTurnTakenHelper } from "./helpers/CombatantsTurnTakenHelper.js";
import { CurrentTurnHelper } from "./helpers/CurrentTurnHelper.js";
import { PlaylistHelper } from "./helpers/PlaylistHelper.js";
import { PortraitHelper } from "./helpers/PortraitHelper.js";
import { SettingsHelper } from "./helpers/SettingsHelper.js";

export class Combatant {
    constructor(combatant, parent) {
        this.combatant = combatant;
        this.combat = this.combatant.combat;
        this.parent = parent;
        this.name = this.combatant.name;
        this.damageTaken = 0;
        this.playTextAnimation = false;
        this.pid = `${FubhConstants.MID}-${this.combatant._id}`;
        
        this.element = document.createElement("div");
        this.element.classList.add("fubh-portrait");

        this.resolve = null;
        this.ready = new Promise((res) => (this.resolve = res));

        //this.initCombatant();
    }

    /* GETTERS */
    get portraitID(){
        return this.pid;
    }

    get actor() {
        return this.combatant?.actor;
    }

    get isOwner(){
        return this.actor.isOwner;
    }

    get token() {
        return this.combatant?.token?.object;
    }

    get img() {
        return (this.combatant.actor?.img) ?? this.combatant.img;
    }

    get floatingTextPanel(){
        return this.element.querySelector(".floating-text");
    }

    get isExhausted() {
        return (this.actions <= 0);
    }

    get rank(){
        if(this.actor?.type === "npc")
            return this.actor?.system?.rank
    }

    get isNPC(){
        return (this.actor?.type === "npc");
    }

    get isNeutral(){
        return (this.combatant.token.disposition === 0);
    }
  
    get isFriendly(){
        return (this.combatant.token.disposition === 1);
    }

    get isSecret(){
        return (this.combatant.token.disposition === -2);
    }

    get isHostile(){
        return (this.combatant.token.disposition === -1);
    }

    get isCompanion(){
        return (this.actor?.type === "npc" && this.rank?.value === "companion");
    }

    get isEnemy(){
        return (!this.isCompanion && (this.isHostile || this.isSecret || this.isNeutral));
    }

    get isAlly(){
        return (!this.isCompanion && (this.isFriendly))
    }

    get isIgnore(){
        return (!this.isAlly && !this.isEnemy);
    }

    get actions(){
        const helper = new PortraitHelper();
        const flag = helper.getPortraitData(this.combat, this.combatant._id);
        if(flag?.actions)
            return flag.actions;
        else
            return 0;
    }

    get maxActions(){
        if(!this.isNPC)
            return 1;
        return this.rank.replacedSoldiers;
    }

    get havePlayed(){
        return (this.actions < this.maxActions);
    }

    get containerId(){
        return this.isEnemy ? "fubh-foes" : "fubh-allies";
    }

    get isGM(){
        return game.user.isGM;
    }

    get mySide(){
        const helper = new CurrentTurnHelper();
        return (this.isAlly) ? helper.side.friendly.value : helper.side.hostile.value;
    }

    get myTurn(){
        const helper = new CurrentTurnHelper();
        return (this.mySide === helper.getCurrentTurn(this.combat));
    }

    get myOpponentTurn(){
        return !this.myTurn;
    }

    get damages(){
        return {
            amount: Math.abs(this.damageTaken),
            isHealing: (this.damageTaken < 0),
            playAnimation: this.playTextAnimation
        }
    }

    /* ANIMATIONS */
    async playDamageAnimation(dmg){
        this.damageTaken = dmg;
        this.floatingTextPanel.classList.toggle("fadeInUp-animation");
        this.playTextAnimation = true;
        this.element.classList.toggle("shake-animation", true);
        await this.renderPortrait();
        
        setTimeout(async () => {
            this.playTextAnimation = false;
            this.element.classList.toggle("shake-animation", false);
        }, 2500);
    }

    /* LISTENER & ACTIONS */
    activateListeners() {
        if(!this.element)
            return;
        
        this.element.querySelectorAll(".eventListener").forEach((b) => {
            b.addEventListener("click", async (e) => await this.genericListener(e));
        });
    }

    removeListeners(){
        if(!this.element)
            return;
        
        this.element.querySelectorAll(".eventListener").forEach((b) => {
            b.removeEventListener("click", async (e) => await this.genericListener(e));
        });
    }

    async genericListener(event){
        const action = event.currentTarget.dataset.action;
        switch (action) {
            case "play-action":
                await this.playAction();
                break;
            case "open-character-sheet":
                this.openCharacterSheet();
                break;
        }
    }

    initCombatant(){
        const helper = new CombatantsTurnTakenHelper();
        const flag = helper.get(this.combat) || {};

        if(!flag[this.combat.round])
            flag[this.combat.round] = [];

        const actions = flag[this.combat.round].filter((f) => f === this.combatant._id);
            const played = (actions) ? actions.length : 0 ;
            this.actions = this.maxActions - played;

            if(this.actions < 0)
                this.actions = 0;
    }

    openCharacterSheet(){
        this.actor.sheet.render(true);
    }

    async playAction(){
        if(this.isExhausted || !this.myTurn)
            return;

        const combatantTurnTakenHelper = new CombatantsTurnTakenHelper();
        const currentTurnhelper = new CurrentTurnHelper();
        const portraitHelper = new PortraitHelper();

        PortraitHelper.PREVENT_COMBAT_UPDATE = true;
        this.combat = await combatantTurnTakenHelper.addTurn(this.combat, this.combatant);
        PortraitHelper.PREVENT_COMBAT_UPDATE = false;

        if(!this.sideIsEmpty())
            this.combat = await currentTurnhelper.updateTurnOrder(this.combat, this.isAlly, false); // update with rollback

        this.combat = await portraitHelper.removeAction(this.combat, this.combatant._id);

        if(this.getRemainingCombatants() <= 0)
            await this.combat.nextRound();
        else
            await this.combat.nextTurn();
    }

    getRemainingCombatants(){
        let remaining = 0;
        this.parent.forEach((p) => {
            if(p.isCompanion || p.isExhausted)
                return;
            
            remaining++;
        });
        return remaining;
    }

    sideIsEmpty(){
        const data = this.parent.filter((p) => p.isAlly === !this.isAlly && !p.isExhausted && !p.isCompanion);
        if(!data)
            return true;
        return (data.length === 0);
    }

    /* MODEL (for the portrait template) */
    get getModel(){
        const settingsHelper = new SettingsHelper();

        const model = {
            pid: this.pid,
            name: this.name,
            img: this.img,
            isNPC: this.isNPC,
            isEnemy: this.isEnemy,
            isAlly: this.isAlly,
            isMyOpponentTurn: this.myOpponentTurn,
            isGM: this.isGM,
            damages: this.damages,
            actions: {
                value: this.actions,
                max: this.maxActions,
                percent: this.getPercentValue(this.actions,this.maxActions),
                havePlayed: this.havePlayed
            },
            isExhausted : this.isExhausted,
            resources: {
                hp: {
                    value: this.actor.system.resources.hp.value,
                    max: this.actor.system.resources.hp.max,
                    percent: this.getPercentValue(this.actor.system.resources.hp.value,this.actor.system.resources.hp.max),
                },
                mp: {
                    value: this.actor.system.resources.mp.value,
                    max: this.actor.system.resources.mp.max,
                    percent: this.getPercentValue(this.actor.system.resources.mp.value,this.actor.system.resources.mp.max),
                },
                ip: {
                    value: this.isNPC ? 0 : this.actor.system.resources.ip.value,
                    max: this.isNPC ? 0 : this.actor.system.resources.ip.max,
                    percent: !this.isNPC ? this.getPercentValue(this.actor.system.resources.ip.value,this.actor.system.resources.ip.max) : 0,
                },
            },
            settings: {}
        };

        model.settings[SettingsHelper.EnemyHpValueShow] = settingsHelper.get(SettingsHelper.EnemyHpValueShow);
        model.settings[SettingsHelper.EnemyHpBarShow] = settingsHelper.get(SettingsHelper.EnemyHpBarShow);

        model.settings[SettingsHelper.EnemyMpValueShow] = settingsHelper.get(SettingsHelper.EnemyMpValueShow);
        model.settings[SettingsHelper.EnemyMpBarShow] = settingsHelper.get(SettingsHelper.EnemyMpBarShow);

        let imgTopMargin = 0;
        imgTopMargin += (settingsHelper.get(SettingsHelper.EnemyHpBarShow)) ? 0 : 25;
        imgTopMargin += (settingsHelper.get(SettingsHelper.EnemyMpBarShow)) ? 0 : 25;

        model.settings.imgTopMargin = imgTopMargin;
        model.settings.portraitTopMargin = Math.round(imgTopMargin/2);

        return model;
    }

    getPercentValue(value,max){
        if(!value || !max)
            return 0;

        return Math.round(value / max * 100)
    }

    async update(combatant){
        this.combatant = combatant;
        this.combat = combatant.combat;
        
        await this.renderPortrait();
    }

    findPortrait(){
        const portrait = document.getElementById(this.pid);
        if(!portrait)
            return;

        return portrait;
    }

    refresh(portrait){
        this.element.innerHTML = portrait;
    }

    createPortrait(portrait){
        this.element.innerHTML = portrait;
        this.element.id = this.pid;

        const container = document.getElementById(this.containerId);
        container.appendChild(this.element);

        this.element = this.findPortrait();
    }

    renderAllPortraits(){
        this.parent.forEach(async (p) => await p.renderPortrait());
    }

    async renderPortrait(){
        if(this.isIgnore)
            return;

        const template = await renderTemplate(`modules/${FubhConstants.MID}/templates/FUBH_CombatantPortrait.hbs`, { ...this.getModel });
        const portrait = this.findPortrait();
        
        if(!portrait)
            this.createPortrait(template);
        else
            this.refresh(template);

        this.RenderTurnOrder();
        this.activateListeners();
        this.resolve(true);
    }

    RenderTurnOrder(){
        const helper = new CurrentTurnHelper();
        const element = document.getElementById(FubhConstants.TURN);
        const turn = helper.getCurrentTurn(this.combat);
        const side = helper.getSide(turn);

        const dice = document.createElement("i");
        dice.classList.add("fa-solid");
        dice.classList.add("fa-dice");
        dice.classList.add("ma-right-1");

        element.innerHTML = "";
        element.append(dice);
        element.append(side.literal);

        element.classList.toggle("green", (turn === helper.side.friendly.value));
        element.classList.toggle("red", (turn === helper.side.hostile.value));
    }

}