import { FubhConstants } from "../FubhConstants.js";
import { PlaylistHelper } from "./PlaylistHelper.js";

export class SettingsHelper{

    // HP bar
    static EnemyHpValueShow = "enemyHpValueShow";
    static EnemyHpBarShow = "enemyHpBarShow";

    static EnemyMpValueShow = "enemyMpValueShow";
    static EnemyMpBarShow = "enemyMpBarShow";

    static PlaylistValue = "playlistValue";

    constructor(){

    }

    registerSettings(){
        this.enemyPortrait_HpValueShow();
        this.enemyPortrait_HpBarShow();
        
        this.enemyPortrait_MpValueShow();
        this.enemyPortrait_MpBarShow();

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

    // HP Bar
    enemyPortrait_HpValueShow(){
        game.settings.register(FubhConstants.MID, SettingsHelper.EnemyHpValueShow, {
            name: "Opponents - Show HP Value",
            hint: "To show or hide the HP amount on health bar for opponents",
            config: true,
            scope: "world",
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
            scope: "world",
            type: new foundry.data.fields.BooleanField(),
            default: true,
            requiresReload: true,
        });
    }

    //MP Bar
    enemyPortrait_MpValueShow(){
        game.settings.register(FubhConstants.MID, SettingsHelper.EnemyMpValueShow, {
            name: "Opponents - Show MP Value",
            hint: "To show or hide the MP amount on health bar for opponents",
            config: true,
            scope: "world",
            type: new foundry.data.fields.BooleanField(),
            default: true,
            requiresReload: true,
        });
    }

    enemyPortrait_MpBarShow(){
        game.settings.register(FubhConstants.MID, SettingsHelper.EnemyMpBarShow, {
            name: "Opponents - Show MP Bar",
            hint: "To show or hide the opponents MP bar",
            config: true,
            scope: "world",
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