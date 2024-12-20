import { FubhConstants } from "../FubhConstants.js";
import { PlaylistHelper } from "./PlaylistHelper.js";

export class SettingsHelper{

    static EnemyHpValueShow = "enemyHpValueShow";
    static EnemyHpBarShow = "enemyHpBarShow";

    static PlaylistValue = "playlistValue";

    constructor(){

    }

    registerSettings(){
        this.enemyPortrait_HpValueShow();
        this.enemyPortrait_HpBarShow();

        this.playlist_Configure();
    }

    get(name){
        return game.settings.get(FubhConstants.MID, name);
    }

    set(name, value){
        return game.settings.set(FubhConstants.MID, name, value);
    }

    /*
     * ENEMY SETTINGS
     */
    enemyPortrait_HpValueShow(){
        game.settings.register(FubhConstants.MID, SettingsHelper.EnemyHpValueShow, {
            name: "Opponents - Show HP Value",
            hint: "To show or hide the HP amount on health bar for opponents",
            config: true,
            scope: "client",
            type: new foundry.data.fields.BooleanField(),
            default: true,
            requiresReload: true,
        });
    }

    enemyPortrait_HpBarShow(){
        game.settings.register(FubhConstants.MID, SettingsHelper.EnemyHpBarShow, {
            name: "Opponents - Show HP Bar",
            hint: "To show or hide the opponents HP bar",
            config: true,
            scope: "client",
            type: new foundry.data.fields.BooleanField(),
            default: true,
            requiresReload: true,
        });
    }

    /*
     * MUSIC SETTINGS
     */

    playlist_Configure(){
        const helper = new PlaylistHelper();
        game.settings.register(FubhConstants.MID, SettingsHelper.PlaylistValue, {
            name: "Playlist",
            hint: "Configure a playlist to play during battles",
            config: true,
            scope: "world",
            type: new foundry.data.fields.StringField(helper.getPlaylists()),
            default: "nothing",
            requiresReload: false,
            onChange: value => {
                if(!value)
                    value = "nothing";
                const helper = new PlaylistHelper();
                helper.load(value);
              }
        });
    }
}