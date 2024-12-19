import {FubhConstants} from "./FubhConstants.js";
import { CombatSetupScreen } from "./CombatSetupScreen.js";
import { ButtonsContainer } from "./ButtonsContainer.js";
import { Combatant } from "./Combatant.js";
import { CurrentTurnHelper } from "./helpers/CurrentTurnHelper.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class FuBattleHud extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super(options);
    this.portraits = [];
    this.combatSetupScreen = new CombatSetupScreen();
    this.buttonsContainer = new ButtonsContainer();
  }

  static DEFAULT_OPTIONS = {
    id: FubhConstants.MID,
    position: {
      width: 8000,
    },
    window: {
      frame: false,
    }
  }

  static PARTS = {
    FUBH_CombatSetup: {template: `modules/${FubhConstants.MID}/templates/FUBH_CombatSetup.hbs`,},
    FUBH_CombatTracker: {template: `modules/${FubhConstants.MID}/templates/FUBH_CombatTracker.hbs`,},
  }

  async _preparePartContext(partId, context) {
    return { isGM: game.user.isGM};
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
            fn: this.removeCombatant.bind(this),
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
        {
          hook: "combatRound",
          fn: this._onNewCombatRound.bind(this),
        },
        {
          hook: "fabulaUltimaBattleHud",
          fn: this._onRenderModule.bind(this),
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

  clearCombatantsUI(){
    document.getElementById("fubh-allies").innerHTML = "";
    document.getElementById("fubh-foes").innerHTML = "";
  }

  showContainer(show = true){
    const container = document.getElementById(FubhConstants.MID);
    if(!container)
      return;

    if(show)
      container.style.visibility = "visible";
    else
      container.style.visibility = "hidden";
  }

  showCombatTracker(value = true){
    const header = document.getElementById(FubhConstants.HEADER);
    const footer = document.getElementById(FubhConstants.FOOTER);
    const setup = document.getElementById(FubhConstants.SETUP);

    header.classList.toggle("hidden", !value);
    footer.classList.toggle("hidden", !value);
    setup.classList.toggle("hidden", value);

    const helper = new CurrentTurnHelper();
    const element = document.getElementById(FubhConstants.TURN);
    const turn = helper.getCurrentTurn(game.combat);
    element.innerHTML = turn;

    this.hideSceneNavBar(true);
    this.renderPortraits();
  }

  hideSceneNavBar(value = true){
    if(value){
      if (!document.getElementById("navigation").classList.contains("collapsed")) {
        setTimeout(() => {
            document.getElementById("nav-toggle").click();
        }, 500);
      }
    }else{
      if (document.getElementById("navigation").classList.contains("collapsed")) {
        setTimeout(() => {
            document.getElementById("nav-toggle").click();
        }, 500);
      }
    }
  }
  async close(...args) {
    this.showContainer(false);
    if (this.element[0]) 
      this.element[0].remove();
    
    this._closed = true;
    this.removeHooks();
    this.hideSceneNavBar(false);
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
  _onCombatStart(combat){
    this.showCombatTracker();
  }
  _onDeleteCombat(combat){return;}
  _onCombatTurn(combat, updates, update){return;}
  _onRenderCombatTracker(){return;}
  _onRenderModule(){
    this.portraits.forEach(async (p) => await p.renderPortrait());
  }
  _onNewCombatRound(combat){
    this.portraits.forEach((p) => p.resetActions());
  }
  _onActorUpdate(actor){
    const combatant = this.getCombatantFromActor(actor);
    this.updateCombatant(combatant);
  }
  
  /*
   * Combatants
   */
  initListener(){
    this.combatSetupScreen.activateListeners();
    this.buttonsContainer.activateListeners();
  }

  setupCombatants(combat){
    this.portraits = [];
    combat.combatants.forEach((combatant) => this.setupCombatant(combatant));
    this.setHooks();
    this.showContainer(true);
    this.renderPortraits();
  }

  setupCombatant(combatant){
    const portrait = this.getPortrait(combatant);
    if(portrait){
      this.updateCombatant(combatant);
      return;
    }

    this.portraits.push(new Combatant(combatant, this.portraits));
    this.renderPortraits();
  }

  updateCombatant(combatant, updates = {}){
    if ("initiative" in updates)
      this.setupCombatant(combatant);
    else
      this.getPortrait()?.update(combatant);
    this.renderPortraits();
  }

  removeCombatant(combatant){
    const deleted = this.getPortrait(combatant);
    if(!deleted)
      return;

    const index = this.portraits.indexOf(deleted);
    this.portraits.splice(index, 1);

    this.renderPortraits();
  }

  renderPortraits(){
    this.clearCombatantsUI();
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
}