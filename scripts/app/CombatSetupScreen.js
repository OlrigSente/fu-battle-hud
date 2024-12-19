import {FubhConstants} from "./FubhConstants.js";

export class CombatSetupScreen {
    constructor() {
        
    }

    activateListeners() {
        const dialog = document.getElementById(FubhConstants.SETUP);
        if(!dialog)
            return;

        dialog.querySelectorAll(".button").forEach((b) => {
            b.addEventListener("click", (e) => {
                const action = e.currentTarget.dataset.action;
                switch (action) {
                    case "start-combat":
                        this.startCombat();
                        break;
                    case "delete-combat":
                        this.deleteCombat();
                        break;
                }
            });
        });
    }

    startCombat(){
        if(!game.combat?.active)
            return;
        game.combat.startCombat();
        this.hideDialog();
    }

    deleteCombat(){
        if(!game.combat?.active)
            return;
        game.combat.endCombat();
        this.hideDialog();
    }

    hideDialog(){
        const dialog = document.getElementById(FubhConstants.SETUP);
        if(!dialog)
            return;

        dialog.classList.toggle("hidden");
    }
}