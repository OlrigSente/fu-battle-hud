import { FubhConstants } from "./FubhConstants.js";
import { CombatSetupScreen } from "./CombatSetupScreen.js";
import { ButtonsContainer } from "./ButtonsContainer.js";
import { Combatant } from "./Combatant.js";
import { CurrentTurnHelper } from "./helpers/CurrentTurnHelper.js";
import { PortraitHelper } from "./helpers/PortraitHelper.js";
import { CombatantsTurnTakenHelper } from "./helpers/CombatantsTurnTakenHelper.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class FuBattleHud extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super(options);
    this.portraits = [];
    this.combatSetupScreen = new CombatSetupScreen();
    this.buttonsContainer = new ButtonsContainer();
    window.addEventListener("resize", this.autosize.bind(this));
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
    FUBH_CombatSetup: { template: `modules/${FubhConstants.MID}/templates/FUBH_CombatSetup.hbs`, },
    FUBH_CombatTracker: { template: `modules/${FubhConstants.MID}/templates/FUBH_CombatTracker.hbs`, },
  }

  async _preparePartContext(partId, context) {
    return { isGM: game.user.isGM };
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
        fn: this._onUpdateCombat.bind(this), 
      },
      {
        hook: "preUpdateCombat",
        fn: this._onPreUpdateCombat.bind(this), 
      },
      {
        hook: "combatTurn",
        fn: this._onTurnChange.bind(this),
      },
      {
        hook: "combatRound",
        fn: this._onNewCombatRound.bind(this),
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
        hook: "updateToken",
        fn: this._onTokenUpdate.bind(this),
      },
      {
        hook: "fubhRefreshUI",
        fn: this._onRefreshUI.bind(this),
      }
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

  autosize() {
    const w_size = document.getElementById("board").getBoundingClientRect().width;
    const container = document.getElementById("fu-battle-hud");
    if (!container)
      return;

    container.setAttribute("style", "width:" + w_size + "px")
  }

  clearCombatantsUI() {
    document.getElementById("fubh-allies").innerHTML = "";
    document.getElementById("fubh-foes").innerHTML = "";
  }

  showContainer(show = true) {
    const container = document.getElementById(FubhConstants.MID);
    if (!container)
      return;

    if (show)
      container.style.visibility = "visible";
    else
      container.style.visibility = "hidden";
  }

  showCombatTracker(value = true) {
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
  }

  hideSceneNavBar(value = true) {
    if (value) {
      if (!document.getElementById("navigation").classList.contains("collapsed")) {
        setTimeout(() => {
          document.getElementById("nav-toggle").click();
        }, 500);
      }
    } else {
      if (document.getElementById("navigation").classList.contains("collapsed")) {
        setTimeout(() => {
          document.getElementById("nav-toggle").click();
        }, 500);
      }
    }
  }

  updateRoundCounter(){
    const rounds = document.getElementById(FubhConstants.ROUNDS);
    rounds.innerHTML = game.combat.round;
  }

  refreshUI(){
    this.renderPortraits();
    this.updateRoundCounter();
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
  initListener() {
    this.combatSetupScreen.activateListeners();
    this.buttonsContainer.activateListeners();
  }

  removeListeners() {
    this.combatSetupScreen.removeListeners();
    this.buttonsContainer.removeListeners();
    window.removeEventListener("resize", this.autosize.bind(this));
  }

  /* HOOKS EVENTS */
  _onHoverToken(token, hover) {
    const portrait = this.portraits.find((p) => p.combatant.tokenId === token.id);
    if (!portrait) return;
    portrait.element.classList.toggle("glow", hover);
  }
  async _onCombatStart(combat) {
    await game.combat.nextRound();

    this.showCombatTracker();
    if(game.combat.current.turn === 0)
      game.combat.current.turn = 1;
  }
  _onDeleteCombat(combat) {
  }
  async _onUpdateCombat(combat,data) {
    if(data.flags?.projectfu?.CombatantsTurnTaken && !PortraitHelper.PREVENT_COMBAT_UPDATE){
      const portraitHelper = new PortraitHelper();
      const turns = data.flags.projectfu.CombatantsTurnTaken[combat.round];
      const combatant_id = turns[turns.length - 1];

      await portraitHelper.removeAction(combat, combatant_id);
    }
    this.updateRoundCounter();
  }

  _onPreUpdateCombat(combat,data,turn){
    if(turn.direction && turn.direction == -1 && PortraitHelper.ROLLBACK.hasRollback){
      const turn = (PortraitHelper.ROLLBACK.actions -1 < 0) ? 0 : PortraitHelper.ROLLBACK.actions -1;
            
      PortraitHelper.ROLLBACK.actions = game.combat.combatants.length;
      PortraitHelper.ROLLBACK.hasRollback = false;
      PortraitHelper.ROLLBACK.roundTarget = -1;

      if(!turn)
        return;

      data.turn = turn;
    }
  }

  async _onTurnChange(combat, data, turn){
    if(turn.direction === -1){
      const portraitHelper = new PortraitHelper();
      CombatantsTurnTakenHelper.rollback = await portraitHelper.rollbackLastAction(combat);
    }
    Hooks.call('fubhRefreshUI');
  }
  async _onNewCombatRound(combat, combatData, turnData) {
    if (!game.user.isGM)
      return;

    const portraitHelper = new PortraitHelper();
    const turnHelper = new CurrentTurnHelper();
    const data = portraitHelper.getPortraitsData(game.combat);
    const turn = turnHelper.getFirstTurn(game.combat);
    const round = game.combat.round + 1;

    if(turnData.direction === -1){
      CombatantsTurnTakenHelper.rollback = await portraitHelper.rollbackLastAction(combat, true);
      this.showCombatTracker(false);
      return;
    }

    if(!data[round] && data[round - 1]){
      data[round] = {};
    }

    this.portraits.forEach((p) => {
      if(!data[round][p.combatant._id])
        data[round][p.combatant._id] = {};

      data[round][p.combatant._id].actions = p.maxActions;
      data[round][p.combatant._id].maxActions = p.maxActions;
    });

    await portraitHelper.set(game.combat, data,"_onNewCombatRound");
    await turnHelper.setTurnOrder(game.combat, turn);
    game.combat.current.round = round;

    Hooks.call('fubhRefreshUI');
  }
  async _onActorUpdate(actor) {
    const combatant = this.getCombatantFromActor(actor);
    await this.updateCombatant(combatant);
  }
  _onRenderCombatTracker() {
    if (game.combat.round > 0)
      this.showCombatTracker();
    Hooks.call('fubhRefreshUI');
  }
  _onTokenUpdate(){
    this.refreshUI();
  }
  _onRefreshUI() {
    this.refreshUI();
  }

  /*
   * Combatants
   */
  setupCombatants(combat) {
    this.portraits = [];
    combat.combatants.forEach(async (combatant) => await this.setupCombatant(combatant));
    this.setHooks();
    this.showContainer(true);
  }

  async setupCombatant(combatant) {
    const portrait = this.getPortrait(combatant);
    if (portrait) {
      await this.updateCombatant(combatant);
      return;
    }

    const helper = new PortraitHelper();
    const obj = new Combatant(combatant, this.portraits);

    if (game.user.isGM) {
      //register flag
      await helper.registerPortrait(game.combat, combatant._id, obj.maxActions, obj.maxActions);
    }

    await obj.update(combatant);
    this.portraits.push(obj);
  }

  async updateCombatant(combatant, updates = {}) {
    if ("initiative" in updates)
      await this.setupCombatant(combatant);
    else
      await this.getPortrait(combatant)?.update(combatant);
  }

  removeCombatant(combatant) {
    const deleted = this.getPortrait(combatant);
    if (!deleted)
      return;

    const index = this.portraits.indexOf(deleted);
    this.portraits.splice(index, 1);
  }

  renderPortraits() {
    this.clearCombatantsUI();
    this.portraits.forEach(async (p) => await p.renderPortrait());
  }

  getPortrait(combatant) {
    return this.portraits.find((p) => p.combatant === combatant);
  }

  getPortraitFromActor(actor) {
    return this.portraits.find((p) => p.combatant._id === actor._id);
  }

  getPortraitFromCombatantId(id) {
    return this.portraits.find((p) => p.combatant._id === id);
  }

  getCombatantFromActor(actor) {
    return game.combat.combatants.find((c) => c.combatant?.actor._id === actor?._id);
  }
}