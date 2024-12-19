import {FubhConstants} from "./FubhConstants.js";
import { CurrentTurnHelper } from "./helpers/CurrentTurnHelper.js";

export class Combatant {
    constructor(combatant, parent) {
        this.combatant = combatant;
        this.combat = combatant.combat;
        this.parent = parent;

        this.actions = this.maxActions;
        this.pid = `${FubhConstants.MID}-${this.combatant._id}`;
        
        this.element = document.createElement("div");
        this.element.classList.add("fubh-portrait");

        this.resolve = null;
        this.ready = new Promise((res) => (this.resolve = res));

        this.initCombatant();
    }

    /* GETTERS */

    get actor() {
        return this.combatant?.actor;
    }

    get token() {
        return this.combatant?.token?.object;
    }

    get img() {
        return (this.combatant.actor?.img) ?? this.combatant.img;
    }

    get isExhausted() {
        return (this.actions <= 0);
    }

    get isEnemy(){
        return (this.actor?.type === "npc" && this.rank?.value !== "companion");
    }

    get isCompanion(){
        return (this.actor?.type === "npc" && this.rank?.value === "companion");
    }

    get isNPC(){
        return (this.isEnemy || this.isCompanion);
    }

    get isAlly(){
        return (this.actor?.type !== "npc" && this.rank?.value !== "companion");
    }

    get rank(){
        if(this.actor?.type === "npc")
            return this.actor?.system?.rank
    }

    get maxActions(){
        if(this.isAlly)
            return 1;
        return this.rank.replacedSoldiers;
    }

    get remainingActions(){
        return this.actions;
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

    get CombatantsTurnTaken(){
        let flag = this.combat.getFlag("projectfu", "CombatantsTurnTaken") || {};

        if(!flag[game.combat.round]){
            flag[game.combat.round] = [];
        }

        return flag;
    }

    /* LISTENER & ACTIONS */
    activateListeners() {
        if(!this.element)
            return;
        
        this.element.querySelectorAll(".button").forEach((b) => {
            b.addEventListener("click", async (e) => await this.genericListener(e));
        });
    }

    removeListeners(){
        if(!this.element)
            return;
        
        this.element.querySelectorAll(".button").forEach((b) => {
            b.removeEventListener("click", async (e) => await this.genericListener(e));
        });
    }

    async genericListener(event){
        const action = event.currentTarget.dataset.action;
        switch (action) {
            case "play-action":
                await this.playAction();
                break;
            case "reset-actions":
                await this.resetActions();
                break;
        }
    }

    initCombatant(){
        const flag = this.CombatantsTurnTaken;

        if(flag[this.combat.round]){
            const actions = flag[this.combat.round].filter((f) => f === this.combatant._id);
            const played = (actions) ? actions.length : 0 ;
            this.actions = this.maxActions - played;

            if(this.actions < 0)
                this.actions = 0;
        }
    }

    async resetActions(){
        this.actions = this.maxActions;
        await this.unregisterActions();
        
        const helper = new CurrentTurnHelper();
        this.combat = await helper.updateTurnOrder(this.combat, this.isAlly, true); // update with rollback
        this.renderAllPortraits();
    }

    async playAction(){
        let value = this.actions - 1;
        if(value < 0 || this.isExhausted || !this.myTurn)
            return;

        this.actions = value;
        await this.registerAction();
        if(this.getRemainingCombatants() <= 0)
            this.combat.nextRound();

        const helper = new CurrentTurnHelper();
        this.combat = await helper.updateTurnOrder(this.combat, this.isAlly, false); // update with rollback
        this.renderAllPortraits();
    }

    async registerAction(){
        let flag = this.CombatantsTurnTaken;

        flag[game.combat.round].push(this.combatant._id);
        this.combat = await this.combat.unsetFlag("projectfu", "CombatantsTurnTaken");
        this.combat = await this.combat.setFlag("projectfu", "CombatantsTurnTaken", flag);

    }

    async unregisterActions(){
        let flag = this.CombatantsTurnTaken;

        flag[game.combat.round] = flag[game.combat.round].filter((f) => f !== this.combatant._id);
        this.combat = await this.combat.unsetFlag("projectfu", "CombatantsTurnTaken");
        this.combat = await this.combat.setFlag("projectfu", "CombatantsTurnTaken", flag);
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

    /* MODEL (for the portrait template) */
    get getModel(){
        return {
            pid: this.pid,
            name: this.combatant.name,
            img: this.img,
            isEnemy: this.isEnemy,
            isAlly: this.isAlly,
            isMyOpponentTurn: this.myOpponentTurn,
            actions: {
                value: this.remainingActions,
                max: this.maxActions,
                percent: Math.round(this.remainingActions / this.maxActions * 100)
            },
            isExhausted : this.isExhausted,
            resources: {
                hp: {
                    value: this.actor.system.resources.hp.value,
                    max: this.actor.system.resources.hp.max,
                    percent: Math.round(this.actor.system.resources.hp.value / this.actor.system.resources.hp.max * 100),
                },
                mp: {
                    value: this.actor.system.resources.mp.value,
                    max: this.actor.system.resources.mp.max,
                    percent: this.isAlly ? Math.round(this.actor.system.resources.mp.value / this.actor.system.resources.mp.max * 100) : 0,
                },
                ip: {
                    value: this.isNPC ? 0 : this.actor.system.resources.ip.value,
                    max: this.isNPC ? 0 : this.actor.system.resources.ip.max,
                    percent: this.isAlly ? Math.round(this.actor.system.resources.ip.value / this.actor.system.resources.ip.max * 100) : 0,
                },
            }
        };
    }

    update(combatant){
        this.combatant = combatant;
        this.renderPortrait();
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
        if(this.isCompanion)
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