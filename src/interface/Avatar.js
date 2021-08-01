import tippy from "tippy.js";
import Dom from "./Dom.js";
import Storage from "../core/Storage.js";
import Settings from "../page/Settings.js";
import Popup from "./Popup.js";

export default class Avatar extends Dom {
     constructor() {
          super("div", { id: "Avatar" });

          this.image = new Dom("div", { className: "image" });

          this.body = new Dom("div", { className: "AvatarBody" });
          this.label = new Dom("div", { className: "label" });
          this.username = new Dom("div", { className: "username" });
          this.logout = new Dom("div", { className: "logout", innerText: "Log Out" });
          this.settings = new Dom("div", { className: "settings", append: [this.icon("settings")] })

          this.logout.event("click", () => {
               Storage.remove("token");
               location.reload();
          })

          this.settings.event("click", () => {
               const settings = this.generateSettings();
               const popup = new Popup();

               popup.setBody(settings);
               popup.show();
          })

          this.body.add(
               new Dom("div", { append: [this.label, this.username] }),
               new Dom("div", { append: [this.logout] }),
               new Dom("div", { append: [this.settings], className: "buttons" })
          );

          this.add(this.image);

          tippy(this.element, { content: this.body.element, arrow: false, trigger: "click", interactive: true });

     }

     generateSettings() {
          const settings = new Settings();
          if (this.avatar) {
               settings.image({
                    src: this.avatar.element.src,
                    description: "Changing your account's avatar image your icon or figure representing you in messages, comments, forums, etc."
               })
          };
          return settings;
     }

     icon(icon) { return new Dom("div", { className: "material-icons", innerText: icon }); }

     set({ username, id }) {
          this.username.text = username;
          this.label.text = "Logged in as";

          this.avatar = new Dom("img", { className: "avatar" });

          this.avatar.src = "/avatar/" + id + ".png";

          this.avatar.event("error", () => {
               const icon = new Dom("span", { className: "material-icons", innerText: "perm_identity" })
               this.image.add(icon);
               this.avatar.remove();
          });

          this.image.add(this.avatar);

          this.show();
     }
}