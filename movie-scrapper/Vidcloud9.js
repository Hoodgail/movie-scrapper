import JSON5 from "json5";
import Extender from "./Extender.js";

/**
 * The class with the Vidcloud9 link
 */
export default class Vidcloud9 extends String {

     /**
      * construct the Vidcloud9 class
      * 
      * @param {String} url - The movie Vidcloud9 link url
      */
     constructor(url) { super(url) }

     /**
      * Get the main source of the link
      */
     async source() {
          let document = await Extender.document(this.toString());

          const script = document.querySelector(".videocontent script");

          if (!script) return [];

          const match = script.innerHTML.match(/\[(.*)\]/)

          if (!match) return [];

          return JSON5.parse("[" + match[1] + "]")
     }
}