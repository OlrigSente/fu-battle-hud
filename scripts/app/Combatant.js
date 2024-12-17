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
        return this.actor?.type === "npc";
    }

    get isAlly(){
        return this.actor?.type !== "npc";
    }

    get containerId(){
        return this.isEnemy ? "fubh-foes" : "fubh-allies";
    }

    get getModel(){
        return {
            name: this.name,
            img: this.img,
            isEnemy: this.isEnemy,
            isAlly: this.isAlly,
            resources: {
                hp: {
                    value: this.actor.system.resources.hp.value,
                    max: this.actor.system.resources.hp.max
                },
                mp: {
                    value: this.actor.system.resources.mp.value,
                    max: this.actor.system.resources.mp.max
                },
                ip: {
                    value: this.isEnemy ? 0 : this.actor.system.resources.ip.value,
                    max: this.isEnemy ? 0 : this.actor.system.resources.ip.max
                },
            }
        };
    }

    update(combatant){
        this.combatant = combatant;
        this.renderPortrait();
    }

    async renderPortrait(){
        const container = document.getElementById(this.containerId);
        const portrait = await renderTemplate(`modules/${FuBattleHudSettings.MID}/templates/FUBH_portrait.hbs`, { ...this.getModel });
        this.element.innerHTML = portrait;
        container.appendChild(this.element);

        if(this.actor.name === "Primordial Demon" || this.actor.name === "Jill"){
            console.log(this.actor);
            console.log(this.isExhausted);
            console.log(`${this.actor.name} - ${this.actor.system.resources.hp.value} / ${this.actor.system.resources.hp.max}`);
        }

        this.resolve(true);
    }

}