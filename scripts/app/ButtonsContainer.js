import { FubhConstants as FubhConstants } from "./FubhConstants.js";
import { CurrentTurnHelper } from "./helpers/CurrentTurnHelper.js";

export class ButtonsContainer {
    constructor() {
    
    }

    activateListeners() {
        const element = document.getElementById(FubhConstants.MENU);
        if(!element)
            return;

        element.querySelectorAll(".button").forEach((b) => {
            b.addEventListener("click", (e) => this.genericListener(e));
        });
    }

    removeListeners(){
        const element = document.getElementById(FubhConstants.MENU);
        if(!element)
            return;

        element.querySelectorAll(".button").forEach((b) => {
            b.removeEventListener("click", async (e) => await this.genericListener(e));
        });
    }

    async genericListener(event){
        const action = event.currentTarget.dataset.action;
        switch (action) {
            case "next-turn":
                await this.nextTurn();
                break;
            case "new-round":
                await this.newRound();
                break;
            case "delete-combat":
                this.deleteCombat();
                break;
        }
    }

    async newRound(){
        if(!game.combat?.active)
            return;
        
        await game.combat.nextRound();
    }

    deleteCombat(){
        if(!game.combat?.active)
            return;
        game.combat.endCombat();
    }

    async nextTurn(){
        const helper = new CurrentTurnHelper();
        const current = helper.getCurrentTurn(game.combat);
        const isAlly = (current === helper.side.friendly.value);

        await helper.updateTurnOrder(game.combat, isAlly);
        Hooks.call('fabulaUltimaBattleHud');
    }
}