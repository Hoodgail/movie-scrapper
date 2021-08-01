import Dom from "./Dom.js";
import tippy from "tippy.js";
import { EventEmitter } from "events";

/**
 * The class for creating a simple chatbox
 */
export default class ChatBox extends Dom {

     /**
      * Represents a Chat box.
      * @constructor
      */
     constructor() {

          super("div", { id: "ChatBox" });

          console.log(this);

          this.body = new Dom("div", { className: "body" });

          this.inputParent = new Dom("div", { className: "inputParent" });
          this.input = new Dom("input", { className: "input", type: "text" });
          this.inputParent.add(this.input);

          this.members = new Dom("div", { className: "members" });

          this.event = new EventEmitter();

          this.add(this.members, this.body, this.inputParent);

          this.input.event("keydown", e => {
               if (e.keyCode !== 13) return;

               if (!this.input.element.value.trim()) return;

               this.event.emit("message", this.input.element.value.trim())
          })
     }

     generateAvatar(body, id) {
          const avatar = new Dom("img", { className: "avatar" });

          avatar.src = "/avatar/" + id + ".png";

          avatar.event("error", () => {
               const icon = new Dom("span", { className: "material-icons", innerText: "perm_identity" })
               body.add(icon);
               avatar.remove();
          });

          return avatar;
     }

     when() { this.event.addListener(...arguments) };

     /**
      * Creates a member then adds it to the members list
      * 
      * @param {Object} member - The member's data
      * @param {String} member.icon - The member's icon
      * @param {String} member.username - The member's username
      * @return {Dom} The member's generated body dom element
      */
     createMember({ username, id, color }) {
          const body = new Dom("div", { className: "createMember" });

          const usernameElement = new Dom("div", { innerText: username, className: "usernameElement" });
          const iconParentElement = new Dom("div", { className: "iconParentElement" });
          const iconElement = this.generateAvatar(iconParentElement, id);

          iconElement.style = { color };

          iconParentElement.add(iconElement)
          body.add(iconParentElement, usernameElement);

          this.members.add(body);

          return body;
     }

     /**
      * Creates a message then adds it to the chat box
      * 
      * @param {Object} message - The message data
      * @param {String} message.icon - The message's owner's icon
      * @param {String} message.content - The message's text content
      * @return {Dom} The message's generated body dom element
      */
     createMessage({ id, username, content, color } = {}) {
          const body = new Dom("div", { className: "createMessage" });

          const contentParent = new Dom("div", { className: "contentHolder" })
          const contentElement = new Dom("div", { innerText: content, className: "contentElement" })

          const usernameElement = new Dom("div", { innerText: username, className: "usernameElement" });

          const iconParentElement = new Dom("div", { className: "iconParentElement" });
          const iconElement = this.generateAvatar(iconParentElement, id);

          iconElement.style = { color };

          iconParentElement.add(iconElement);
          contentParent.add(usernameElement, contentElement)

          body.add(
               iconParentElement,
               contentParent
          )

          this.body.add(body);

          return body;
     }
}