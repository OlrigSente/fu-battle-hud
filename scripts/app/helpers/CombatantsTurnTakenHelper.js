import { FubhConstants } from "../FubhConstants.js";

export class CombatantsTurnTakenHelper{
    static scope = "projectfu";
    static flagName = "CombatantsTurnTaken";
    static rollback = undefined;

    constructor(){
        
    }

    get(combat){
        return combat.getFlag(CombatantsTurnTakenHelper.scope, CombatantsTurnTakenHelper.flagName);
    }

    async set(combat, data){
        combat = await combat.unsetFlag(CombatantsTurnTakenHelper.scope, CombatantsTurnTakenHelper.flagName);
        combat = await combat.setFlag(CombatantsTurnTakenHelper.scope, CombatantsTurnTakenHelper.flagName, data);
        return combat;
    }

    async addTurn(combat, combatant){
        const data = this.get(combat) || {};
        if(!data[combat.round])
            data[combat.round] = [];

        data[combat.round].push(combatant._id);

        game.combat.previous.combatantId = combatant._id;
        game.combat.previous.tokenId = combatant.tokenId;

        CombatantsTurnTakenHelper.rollback= combatant._id;
        return this.set(combat,data);
    }

    async removeLastTurn(combat){
        const data = this.get(combat) || {};
        if(!data[combat.round])
            data[combat.round] = [];

        data[combat.round].pop();
        const combatant = data[combat.round][data[combat.round].length-1];

        game.combat.previous.combatantId = combatant._id;
        game.combat.previous.tokenId = combatant.tokenId;

        return this.set(combat,data);
    }

    async removeAllTurnsForCombatant(combat, combatant){
        const data = this.get(combat) || {};
        if(!data[combat.round])
            data[combat.round] = [];

        data[combat.round] = data[combat.round].filter((f) => f !== combatant._id);
        return this.set(combat,data);
    }

    getLastCombatant(combat){
        const round = combat.round;
        if(!round)
            return;

        const data = this.get(combat);
        let last = undefined;


        if(data[round])
            last = data[round][data[round].length - 1];

        if(!last){
            if(data[round - 1]?.length){
                last = data[round - 1][data[round - 1].length - 1];
            }
        }

        return last;
    }
}