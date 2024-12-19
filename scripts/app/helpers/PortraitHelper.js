import {FubhConstants} from "../FubhConstants.js";

export class PortraitHelper {
    constructor() { }
    static flagName = "Portraits";

    async registerPortrait(combat, name, action, maxActions){
        if(!combat.flags[FubhConstants.MID])
            combat = await this.registerFlag(combat, {});

        const flag = this.getPortraitsData(combat);

        if(!flag[name]){
            flag[name] = {};
            flag[name].actions = action;
            flag[name].maxActions = maxActions;
            
            combat = await this.registerFlag(combat, flag);
        }

        return combat;
    }

    async registerFlag(combat, flag){
        combat = await combat.setFlag(FubhConstants.MID, PortraitHelper.flagName, flag);
        return combat;
    }

    getPortraitsData(combat){
        return combat?.getFlag(FubhConstants.MID, PortraitHelper.flagName);
    }

    getPortraitData(combat,name){
        const data = this.getPortraitsData(combat);
        
        if(!data[name])
            return;
        
        return data[name];
    }

    async removeAction(combat, name){
        const data = this.getPortraitsData(combat);
        if(data[name]){
            const value = data[name].actions - 1;
            if(value >= 0)
                data[name].actions = value;
        }
        combat = await this.registerFlag(combat, data);
        return combat;
    }

    async resetActions(combat, name){
        const data = this.getPortraitsData(combat);
        if(data[name])
            data[name].actions = data[name].maxActions;

        combat = await this.registerFlag(combat, data);
        return combat;
    }
}