import Dom from "./Dom.js";

export default class Lister extends Dom {
     constructor() {
          super("div", { id: "Lister" });

          this.items = new Dom("div", { className: "items" });
          this.close = new Dom("span", { innerText: "hide", className: "close" });

          this.close.event("click", () => this.hideLister())

          this.add(this.close, this.items);

          this.hideLister();
     }

     addItem(config) {
          const body = new Dom("div", { className: "addItem", onclick: config.onclick });
          const icon = new Dom("img", { className: "icon", src: `/icon/${config.icon}.svg` });
          const title = new Dom("span", { className: "title", innerText: config.title });

          body.event("click", () => this.hideLister())

          this.items.add(
               body.add(icon, title)
          )
     }

     get hidden() {
          return this.style.animationName == "hide";
     }

     showLister() {

          this.style = {
               animation: "show 0.5s ease 0s 1 normal forwards"
          }
     }

     hideLister() {

          this.style = {
               animation: "hide 0.5s ease 0s 1 normal forwards"
          }
     }
}