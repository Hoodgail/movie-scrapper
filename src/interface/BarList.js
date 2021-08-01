import Dom from "./Dom.js";
import tippy from "tippy.js";
import LogoSvg from "../../public/logo.svg";

/**
 * The class with the left bar buttons holder
 */
export default class BarList extends Dom {

     /**
      * construct the BarList class
      */
     constructor() {

          super("div", { id: "BarList" });

          this.overlay = new Dom("div", { className: "overlay" });

          this.logo = new Dom("div", { innerHTML: LogoSvg, className: "logo" });
          this.title = new Dom("div", { innerText: "Movie Scrapper", className: "title" })

          this.list = new Dom("div", { className: "list" });

          this.add(this.overlay, this.logo, this.title, this.list);

     }

     get border() { return new Dom("hr", { className: "border" }); }

     setAvatar(avatar) {
          this.add(this.border, avatar);
     }

     /**
      * set the Item class
      * 
      * @param {String} title - The button's title
      * @param {String} icon - Button's icon
      * @param {Function} onclick - function to be called on click
      * @return {Dom}
      */
     createButton({ title, icon, onclick } = {}) {
          const body = new Dom("div", { className: "createButton" });
          const iconBody = new Dom("span", { className: "iconBody material-icons", innerText: icon });

          tippy(body.element, { content: title, arrow: false, placement: "bottom" });

          body.event("click", event => onclick(event));

          this.list.add(body);
          body.add(iconBody)

          return body;
     }

     lock() {

          this.overlay.clear();

          const topbar = new Dom("div", { className: "topbar" });
          const bottombar = new Dom("div", { className: "bottombar" });
          const lock = new Dom("div", { className: "lock" });
          const icon = new Dom("span", { className: "material-icons", innerText: "lock" });

          this.overlay.add(topbar, lock.add(icon), bottombar);

          this.overlay.show();
     }

     unlock() {

          this.overlay.clear();

          this.overlay.hide();

     }
}