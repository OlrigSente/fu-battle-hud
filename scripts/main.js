// at start of foundry
import { FuBattleHud } from './app/FuBattleHud.js';
import { PlaylistHelper } from './app/helpers/PlaylistHelper.js';
import { SettingsHelper } from './app/helpers/SettingsHelper.js';

const app = new FuBattleHud();

// on main screen
Hooks.on("init", function() {
    
});

// when world is loaded
Hooks.on("ready", async function() {
    const settings = new SettingsHelper();
    const playlist = new PlaylistHelper();
    
    settings.registerSettings();
    playlist.load(settings.get(SettingsHelper.PlaylistValue));

    if(game.combat?.active) {
        await app.render(true);
        app.setupCombatants(game.combat);
        app.initListener();
        app.autosize();

        if(game.combat.round > 0){
            app.showCombatTracker();
            app.updateRoundCounter();
            playlist.play();
        }
            
    }
});

Hooks.on('createCombat', async (combat) => {
    if (game.combat === combat) {
        await app.render(true);
        app.setupCombatants(game.combat);
        app.initListener();
        app.renderPortraits();
        app.autosize();
    }
});

Hooks.on('updateCombat', async (combat, updates) => {
    if(updates.active) {
        await app.render(true);
        app.setupCombatants(game.combat);
        app.renderPortraits();
        app.autosize();
    }
});

Hooks.on('deleteCombat', (combat) => {
    const playlist = new PlaylistHelper();
    app.removeListeners();
    app.close();
    playlist.stop();
});

// on Resize
Hooks.on("canvasPan", function(){
    app.autosize();
});