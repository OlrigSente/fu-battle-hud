import { FubhConstants } from "../FubhConstants.js";
import { CombatantsTurnTakenHelper } from "./CombatantsTurnTakenHelper.js";

export class PortraitHelper {
    constructor() { }
    static flagName = "Portraits";

    async registerPortrait(combat, name, action, maxActions){
        const flag = this.getPortraitsData(combat) || {};

        if(!flag[combat.round])
            flag[combat.round] = {};

        if(!flag[combat.round][name]){
            flag[combat.round][name] = {};
            flag[combat.round][name].actions = action;
            flag[combat.round][name].maxActions = maxActions;
            
            combat = await this.set(combat, flag, "registerPortrait");
        }
        return combat;
    }

    async set(combat, flag, context=""){
        combat = await combat.setFlag(FubhConstants.MID, PortraitHelper.flagName, flag);
        return combat;
    }

    getPortraitsData(combat){
        return combat?.getFlag(FubhConstants.MID, PortraitHelper.flagName);
    }

    getPortraitData(combat, name){
        const data = this.getPortraitsData(combat);
        if(!data)
            return;

        if(!data[combat.round])
            return;

        if(!data[combat.round][name])
            return;
        
        return data[combat.round][name];
    }

    async removeAction(combat, name){
        const data = this.getPortraitsData(combat);
        if(data[combat.round][name]){
            const value = data[combat.round][name].actions - 1;
            if(value >= 0){
                data[combat.round][name].actions = value;
            }
        }
        combat = await this.set(combat, data, "removeAction");
        return combat;
    }

    async addAction(combat, name, prevRound = false){
        const data = this.getPortraitsData(combat);
        const round = (prevRound) ? combat.round - 1 : combat.round;

        if(data[round][name]){
            const value = data[round][name].actions + 1;
            if(value <= data[round][name].maxActions)
                data[round][name].actions = value;
        }
        combat = await this.set(combat, data, "addAction");
        return combat;
    }

    async resetActions(combat, name){
        const data = this.getPortraitsData(combat);
        if(data[combat.round][name])
            data[combat.round][name].actions = data[combat.round][name].maxActions;

        combat = await this.set(combat, data, "resetActions");
        return combat;
    }

    async rollbackLastAction(combat, prevRound = false){
        const turnTakenHelper = new CombatantsTurnTakenHelper();
        const lastCombatant = turnTakenHelper.getLastCombatant(combat);

        await this.addAction(combat, CombatantsTurnTakenHelper.rollback, prevRound);
        return lastCombatant;
    }
}