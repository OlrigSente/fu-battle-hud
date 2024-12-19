import {FubhConstants} from "./FubhConstants.js";

export class CombatSetupScreen {
    constructor() {
        
    }

    activateListeners() {
        const element = document.getElementById(FubhConstants.SETUP);
        if(!element)
            return;

        element.querySelectorAll(".button").forEach((b) => {
            b.addEventListener("click", async (e) => await this.genericListener(e));
        });
    }

    removeListeners(){
        const element = document.getElementById(FubhConstants.SETUP);
        if(!element)
            return;

        element.querySelectorAll(".button").forEach((b) => {
            b.removeEventListener("click", async (e) => await this.genericListener(e));
        });
    }

    async genericListener(event){
        const action = event.currentTarget.dataset.action;
        switch (action) {
            case "start-combat":
                this.startCombat();
                break;
            case "delete-combat":
                this.deleteCombat();
                break;
        }
    }

    async startCombat(){
        if(!game.combat?.active)
            return;
        await game.combat?.startCombat();
        this.hideDialog();
    }

    async deleteCombat(){
        if(!game.combat?.active)
            return;
        await game.combat?.endCombat();
        this.hideDialog();
    }

    hideDialog(){
        const dialog = document.getElementById(FubhConstants.SETUP);
        if(!dialog)
            return;

        dialog.classList.toggle("hidden");
    }
}