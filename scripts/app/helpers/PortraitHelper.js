import { FubhConstants } from "../FubhConstants.js";
import { CombatantsTurnTakenHelper } from "./CombatantsTurnTakenHelper.js";

export class PortraitHelper {
    constructor() { }
    static flagName = "Portraits";
    static ROLLBACK = {
        hasRollback: false,
        roundTarget: -1,
        actions:0
    };

    static PREVENT_COMBAT_UPDATE = false;

    async registerPortrait(combat, name, action, maxActions){
        const flag = this.getPortraitsData(combat) || {};
        for(let round = 0; round<=combat.round; round++){
            if(!flag[round])
                flag[round] = {};
    
            if(!flag[round][name]){
                flag[round][name] = {};
                flag[round][name].actions = action;
                flag[round][name].maxActions = maxActions;
            }
        }
        
        combat = await this.set(combat, flag, `registerPortrait(${name})`);
        return combat;
    }

    async unregisterPortrait(combat, name){
        const flag = this.getPortraitsData(combat) || {};
        await this.unset(combat, flag, `registerPortrait(${name})`);

        for(let round = 0; round<=combat.round; round++){
            if(!flag[round])
                flag[round] = {};

            if(flag[round][name]){
                delete flag[round][name];
            }
        }

        combat = await this.set(combat, flag, `registerPortrait(${name})`);
        return combat;
    }

    async unset(combat, flag, context=""){
        combat = await combat.unsetFlag(FubhConstants.MID, PortraitHelper.flagName, flag);
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

        if(prevRound){
            PortraitHelper.ROLLBACK.actions = this.countActionsSpent(combat, combat.round - 1);
            PortraitHelper.ROLLBACK.hasRollback = true;
            PortraitHelper.ROLLBACK.roundTarget = combat.round - 1;
        }
        
        await this.addAction(combat, CombatantsTurnTakenHelper.rollback, prevRound);
        return lastCombatant;
    }

    countActionsSpent(combat,round){
        const data = this.getPortraitsData(combat);
        if(!data)
            return 0;

        if(!data[round])
            return 0;

        let maxActions = 0;
        let actions = 0;

        game.combat.combatants.forEach((c) => {
            if(data[round][c._id]){
                maxActions += data[round][c._id].maxActions;
                actions += data[round][c._id].actions
            }
        });

        return (maxActions - actions);
    }
}