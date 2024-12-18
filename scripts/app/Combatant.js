import {FuBattleHudSettings} from "./FuBattleHudSettings.js";

export class Combatant {
    constructor(combatant) {
        this.combatant = combatant;
        this.combat = combatant.combat;
        this.element = document.createElement("div");
        this.element.classList.add("fubh-portrait");

        this.resolve = null;
        this.ready = new Promise((res) => (this.resolve = res));
    }

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
        return this.combat.round ?? 0 <= 1;
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

    get containerId(){
        return this.isEnemy ? "fubh-foes" : "fubh-allies";
    }

    get isGM(){
        return game.user.isGM;
    }

    get getModel(){
        return {
            name: this.combatant.name,
            img: this.img,
            isEnemy: this.isEnemy,
            isAlly: this.isAlly,
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

    async renderPortrait(){
        if(this.actor.name === "Pikachu"){
            console.log(`${this.actor.name} - ${this.actor.system.resources.hp.value} / ${this.actor.system.resources.hp.max}`);
        }

        if(this.isCompanion)
            return;

        const container = document.getElementById(this.containerId);
        const portrait = await renderTemplate(`modules/${FuBattleHudSettings.MID}/templates/FUBH_portrait.hbs`, { ...this.getModel });
        this.element.innerHTML = portrait;
        container.appendChild(this.element);
        this.resolve(true);
    }

}