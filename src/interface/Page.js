import Dom from "./Dom.js";
import tippy from "tippy.js";

/**
 * The class to create pages
 */
export default class Page extends Dom {

     /**
      * construct the Page class
      */
     constructor() {

          super("div", { id: "Page" });

          this.opened = false;

     }

     /**
      * adds a text to the page
      * 
      * @param {String} text - The text's text
      * @param {Boolean} center - If the center should be centered or not
      * @param {String} type - Prefered DOM type
      * @return {Dom}
      */
     addText({ text, type, center } = {}) {
          const body = new Dom(type ? type : "div", { className: "addText" });

          body.element.setAttribute("center", center);

          body.text = text;

          this.add(body);

          return body;
     }

     /**
      * adds an input to the page
      * 
      * @param {*} value - The input's text value
      * @param {String} type - The input's type
      * @param {String} placeholder - The input's placeholder
      * @return {Dom}
      */
     addInput({ placeholder = "", value = "", type = "text" } = {}) {
          const body = new Dom("div", { className: "addInput" });

          const input = new Dom("input", { placeholder, value, type });

          body.add(input);

          body.input = input;

          this.add(body);

          return body;
     }

     /**
      * adds a button to the page
      * 
      * @param {String} title - The button's title
      * @param {String} icon - Button's icon
      * @param {Function} onclick - function to be called on click
      * @return {Dom}
      */
     addButton({ title, icon, onclick } = {}) {
          const body = new Dom("div", { className: "addButton" });
          const iconBody = new Dom("span", { className: "iconBody material-icons", innerText: icon });

          tippy(body.element, { content: title, arrow: false });

          body.event("click", event => onclick(event));

          this.add(body);
          body.add(iconBody)

          return body;
     }
}