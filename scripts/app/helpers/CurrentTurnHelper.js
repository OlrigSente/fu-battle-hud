import {FubhConstants} from "../FubhConstants.js";

export class CurrentTurnHelper {
    constructor() { }

    get side(){
        return {
            friendly: {
                value: "friendly",
                literal: "Allies"
            },
            hostile: {
                value: "hostile",
                literal: "Opponents"
            }
        }
    }

    async updateTurnOrder(combat, isAlly, rollback = false){
        let flag = combat?.getFlag("projectfu", "CurrentTurn");
        
        if(isAlly)
            flag = (rollback) ? this.side.friendly.value : this.side.hostile.value;
        else
            flag = (rollback) ? this.side.hostile.value : this.side.friendly.value;

        combat = await combat.unsetFlag("projectfu", "CurrentTurn");
        combat = await combat.setFlag("projectfu", "CurrentTurn", flag);

        return combat;
    }

    getCurrentTurn(combat){
        return combat?.getFlag("projectfu", "CurrentTurn");
    }

    getSide(side){
        if(side === this.side.friendly.value)
            return this.side.friendly;
        return this.side.hostile;
    }
}