import { FubhConstants } from "../FubhConstants.js";
import { PlaylistHelper } from "./PlaylistHelper.js";

export class SettingsHelper{

    // HP bar
    static EnemyHpValueShow = "enemyHpValueShow";
    static EnemyHpBarShow = "enemyHpBarShow";

    static EnemyMpValueShow = "enemyMpValueShow";
    static EnemyMpBarShow = "enemyMpBarShow";

    static PortraitNameShow = "portraitNameShow";
    static PortraitTooltipName = "PortraitTooltipName";
    static PortraitUseTokenImage = "portraitUseTokenImage";

    static PlaylistValue = "playlistValue";
    static MacroBarIsCenter = "macroBarIsCenter";

    static HeightAllies = "heightAllies";
    static HeightFoes = "heightFoes";
    static Width = "width";
    static FontSize = "fontSize";

    constructor(){

    }

    registerSettings(){
        this.enemyPortrait_HpValueShow();
        this.enemyPortrait_HpBarShow();

        this.enemyPortrait_MpValueShow();
        this.enemyPortrait_MpBarShow();

        this.portrait_NameShow();
        this.portrait_TooltipName();
        this.portrait_UseTokenImage();

        this.hud_ConfigureHeightAllies();
        this.hud_ConfigureHeightFoes();
        this.hud_ConfigureWidthSize();
        this.hud_ConfigureFontSize();
        this.hud_MacroBarIsCenter();

        this.playlist_Configure();
    }

    get(name){
        return game.settings.get(FubhConstants.MID, name);
    }

    set(name, value){
        return game.settings.set(FubhConstants.MID, name, value);
    }

    /*
     * Responsiv
     */

    hud_ConfigureHeightAllies(){
        game.settings.register(FubhConstants.MID, SettingsHelper.HeightAllies, {
            name: "HUD - Allies Height",
            hint: "Height size of the HUD for Allies",
            config: true,
            scope: "client",
            default: 180,
            type: new foundry.data.fields.NumberField({
                min:  120, max: 350, step: 5,
                initial: 0, nullable: false
              }),
            requiresReload: false,
            onChange: value => {
                Hooks.call('fubhRefreshUI');
            }
        });
    }

    hud_ConfigureHeightFoes(){
        game.settings.register(FubhConstants.MID, SettingsHelper.HeightFoes, {
            name: "HUD - Foes Height",
            hint: "Height size of the HUD for Foes",
            config: true,
            scope: "client",
            default: 150,
            type: new foundry.data.fields.NumberField({
                min: 110, max: 350, step: 5,
                initial: 0, nullable: false
              }),
            requiresReload: false,
            onChange: value => {
                Hooks.call('fubhRefreshUI');
            }
        });
    }

    hud_ConfigureWidthSize(){
        game.settings.register(FubhConstants.MID, SettingsHelper.Width, {
            name: "HUD - Width",
            hint: "Width size of every portraits",
            config: true,
            scope: "client",
            default: 150,
            type: new foundry.data.fields.NumberField({
                min: 100, max: 250, step: 5,
                initial: 0, nullable: false
            }),
            requiresReload: false,
            onChange: value => {
                Hooks.call('fubhRefreshUI');
            }
        });
    }

    hud_ConfigureFontSize(){
        game.settings.register(FubhConstants.MID, SettingsHelper.FontSize, {
            name: "HUD - Font Size",
            hint: "To change the font size on every portraits",
            config: true,
            scope: "client",
            default: 12,
            type: new foundry.data.fields.NumberField({
                min: 9, max: 15, step: 1,
                initial: 0, nullable: false
              }),
              requiresReload: false,
              onChange: value => {
                  Hooks.call('fubhRefreshUI');
              }
        });
    }

    hud_MacroBarIsCenter(){
        game.settings.register(FubhConstants.MID, SettingsHelper.MacroBarIsCenter, {
            name: "Foundry - Center Macro bar",
            hint: "To center the foundry macro bar",
            config: true,
            scope: "client",
            type: new foundry.data.fields.BooleanField(),
            default: false,
            requiresReload: false,
            onChange: value => {
                Hooks.call('fubhRefreshUI');
            }
        });
    }

    /*
     * Portraits Settings
     */
    portrait_TooltipName(){
        game.settings.register(FubhConstants.MID, SettingsHelper.PortraitTooltipName, {
            name: "Portrait - Tooltip for nameplate",
            hint: "Overing a portrait will show a tooltip with the character name",
            config: true,
            scope: "client",
            type: new foundry.data.fields.BooleanField(),
            default: false,
            requiresReload: false,
            onChange: value => {
                Hooks.call('fubhRefreshUI');
            }
        });
    }

    portrait_NameShow(){
        game.settings.register(FubhConstants.MID, SettingsHelper.PortraitNameShow, {
            name: "Portrait - Show name plate",
            hint: "To show or hide the name on every portrait",
            config: true,
            scope: "client",
            type: new foundry.data.fields.BooleanField(),
            default: true,
            requiresReload: false,
            onChange: value => {
                Hooks.call('fubhRefreshUI');
            }
        });
    }

    portrait_UseTokenImage(){
        game.settings.register(FubhConstants.MID, SettingsHelper.PortraitUseTokenImage, {
            name: "Portrait - Use Token Image",
            hint: "To use the token's image instead of actor's if possible",
            config: true,
            scope: "client",
            type: new foundry.data.fields.BooleanField(),
            default: true,
            requiresReload: false,
            onChange: value => {
                Hooks.call('fubhRefreshUI');
            }
        });
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