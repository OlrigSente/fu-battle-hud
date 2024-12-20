import {FubhConstants} from "./FubhConstants.js";
import { PlaylistHelper } from "./helpers/PlaylistHelper.js";

export class CombatSetupScreen {
    constructor() {
        
    }

    static draggableId = "draggable";

    activateListeners() {
        const element = document.getElementById(FubhConstants.SETUP);
        if(!element)
            return;

        element.querySelectorAll(".button").forEach((b) => {
            b.addEventListener("click", async (e) => await this.genericListener(e));
        });

        //activate draggable window
        this.dragElement(document.getElementById(FubhConstants.SETUP));
    }

    removeListeners(){
        const element = document.getElementById(FubhConstants.SETUP);
        if(!element)
            return;

        element.querySelectorAll(".button").forEach((b) => {
            b.removeEventListener("click", async (e) => await this.genericListener(e));
        });
    }

    async genericListener(event){
        const action = event.currentTarget.dataset.action;
        switch (action) {
            case "start-combat":
                this.startCombat();
                break;
            case "delete-combat":
                this.deleteCombat();
                break;
        }
    }

    async startCombat(){
        const helper = new PlaylistHelper();
        if(!game.combat?.active)
            return;
        await game.combat?.startCombat();
        this.hideDialog();
        helper.play();
    }

    async deleteCombat(){
        if(!game.combat?.active)
            return;
        await game.combat?.endCombat();
        this.hideDialog();
    }

    hideDialog(){
        const dialog = document.getElementById(FubhConstants.SETUP);
        if(!dialog)
            return;

        dialog.classList.toggle("hidden");
    }

    dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id +'-'+ CombatSetupScreen.draggableId)) {
          // if present, the header is where you move the DIV from:
          document.getElementById(elmnt.id +'-'+ CombatSetupScreen.draggableId).onmousedown = dragMouseDown;
        } else {
          // otherwise, move the DIV from anywhere inside the DIV:
          elmnt.onmousedown = dragMouseDown;
        }
      
        function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          // get the mouse cursor position at startup:
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag;
        }
      
        function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          // calculate the new cursor position:
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          // set the element's new position:
          elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
          elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
      
        function closeDragElement() {
          // stop moving when mouse button is released:
          document.onmouseup = null;
          document.onmousemove = null;
        }
      }
}