// at start of foundry
import {FuBattleHud} from './app/FuBattleHud.js';
const app = new FuBattleHud();

// on main screen
Hooks.on("init", function() {
  
});

// when world is loaded
Hooks.on("ready", async function() {
    //CONFIG.debug.hooks = true;
    if(game.combat?.active) {
        await app.render(true);
        app.setupCombatants(game.combat);
        app.renderPortraits();
        app.autosize();
    }
});

Hooks.on('createCombat', async (combat) => {
    if (game.combat === combat) {
        await app.render(true);
        app.setupCombatants(game.combat);
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
    app.render(false);
    app.close();
});

// on Resize
Hooks.on("canvasPan", function(){
    app.autosize();
});