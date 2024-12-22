import { FubhConstants } from "../FubhConstants.js";

export class TurnCountHelper{
    static flagName = "RefreshTurnCount";

    constructor(){

    }

    get(combat){
        return combat.getFlag(FubhConstants.MID, TurnCountHelper.flagName);
    }

    async set(combat, data){
        combat = await combat.setFlag(FubhConstants.MID, TurnCountHelper.flagName, data);
        return combat;
    }
    
}