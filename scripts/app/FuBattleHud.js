import {FuBattleHudSettings} from "./FuBattleHudSettings.js";
import { Combatant } from "./Combatant.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class FuBattleHud extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super(options);
    this.portraits = [];
    this.showContainer(false);
  }

  static DEFAULT_OPTIONS = {
    id: FuBattleHudSettings.MID,
    position: {
      width: 8000,
    },
    window: {
      frame: false,
    }
  }

  static PARTS = {
    FUBH_section_left: {template: `modules/${FuBattleHudSettings.MID}/templates/FUBH_section_left.hbs`,},
    FUBH_section_middle: {template: `modules/${FuBattleHudSettings.MID}/templates/FUBH_section_middle.hbs`,},
    FUBH_section_right: {template: `modules/${FuBattleHudSettings.MID}/templates/FUBH_section_right.hbs`,}
  }

  /*
   * HOOKS
   */

  setHooks() {
    this.hooks = [
        {
            hook: "renderCombatTracker",
            fn: this._onRenderCombatTracker.bind(this),
        },
        {
            hook: "createCombatant",
            fn: this.setupCombatant.bind(this),
        },
        {
            hook: "deleteCombatant",
            fn: this.setupCombatant.bind(this),
        },
        {
            hook: "updateCombatant",
            fn: this.updateCombatant.bind(this),
        },
        {
            hook: "updateCombat",
            fn: this._onCombatTurn.bind(this),
        },
        {
            hook: "deleteCombat",
            fn: this._onDeleteCombat.bind(this),
        },
        {
            hook: "combatStart",
            fn: this._onCombatStart.bind(this),
        },
        {
            hook: "hoverToken",
            fn: this._onHoverToken.bind(this),
        },
        {
          hook: "updateActor",
          fn: this._onActorUpdate.bind(this),
        },
    ];
    for (let hook of this.hooks) {
        hook.id = Hooks.on(hook.hook, hook.fn);
    }
  }

  removeHooks() {
      for (let hook of this.hooks) {
          Hooks.off(hook.hook, hook.id);
      }
  }

  /*
   * INTERFACE
   */

  autosize(){
    const w_size = document.getElementById("board").getBoundingClientRect().width;
    const container = document.getElementById("fu-battle-hud");
    if(!container)
      return;

    container.setAttribute("style", "width:"+w_size+"px")
  }

  emptyContainers(){
    document.getElementById("fubh-allies").innerHTML = "";
    document.getElementById("fubh-foes").innerHTML = "";
  }

  showContainer(show = true){
    const container = document.getElementById(FuBattleHudSettings.MID);
    if(!container)
      return;

    if(show)
      container.style.visibility = "visible";
    else
      container.style.visibility = "hidden";
  }

  async close(...args) {
    this.showContainer(false);
    if (this.element[0]) 
      this.element[0].remove();
    
    this._closed = true;
    this.removeHooks();
    return super.close(...args);
  }

  /*
   * EVENTS
   */
  _onHoverToken(token, hover){
    const portrait = this.portraits.find((p) => p.token === token);
    if (!portrait) return;
    portrait.element.classList.toggle("hovered", hover);
  }
  _onCombatStart(combat){return;}
  _onDeleteCombat(combat){return;}
  _onCombatTurn(combat, updates, update){return;}
  _onRenderCombatTracker(){return;}
  _onActorUpdate(actor){
    this.log("", "Actor update");
    const combatant = this.getCombatantFromActor(actor);
    this.updateCombatant(combatant);
  }
  /*
   * Combatants
   */
  setupCombatants(combat){
    this.log(combat, "setup combat");
    this.portraits = [];
    combat.combatants.forEach((combatant) => this.setupCombatant(combatant));
    this.setHooks();
    this.showContainer(true);
    this.renderPortraits();
  }

  setupCombatant(combatant){
    this.log(combatant, "setup combatant");
    const portrait = this.getPortrait(combatant);
    if(portrait){
      this.updateCombatant(combatant);
      return;
    }

    this.portraits.push(new Combatant(combatant));
  }

  updateCombatant(combatant, updates = {}){
    this.log(combatant, "update combatant");

    if ("initiative" in updates)
      this.setupCombatant(combatant);
    else
      this.getPortrait()?.update(combatant);
    this.renderPortraits();
  }

  renderPortraits(){
    this.emptyContainers();
    this.portraits.forEach((p) => p.renderPortrait());
  }

  getPortrait(combatant){
    return this.portraits.find((p) => p.combatant === combatant);
  }

  getPortraitFromActor(actor){
    const portrait = this.portraits.find((p) => p.combatant._id === actor_id);
  }

  getCombatantFromActor(actor){
    return game.combat.combatants.find((c) => c.combatant?.actor._id === actor?._id);
  }
  /*
   * Utilities
   */

  log(obj, title=""){
    console.log(`[FABULA ULTIMA BATTLE HUD][DEBUG] - ${title}`);
    console.log(obj);
  }
}