import fetch from "node-fetch";
import { JSDOM } from "jsdom";

/**
 * The class with useful functions
 */
export default class Extender {

     /**
      * Gets raw data from a link site
      * 
      * @param {String} link - The site url
      * @return {String}
      */
     static async fetch(link) {
          const data = await fetch(link);

          const raw = await data.text();

          return raw;
     }

     /**  
      * Gets json data from link site
      * 
      * @param {String} link - The site url
      * @return {*}
      */
     static async json(link) {
          const data = await fetch(link);

          const raw = await data.json();

          return raw;
     }

     /**
      * Gets raw data from a link site then parses it to a document
      * 
      * @param {String} link - The site url
      * @return {Document}
      */
     static async document(link) {

          const raw = await this.fetch(link);

          const document = Extender.parseDocument(raw);

          return document;
     }

     /**
      * parses raw string it to a document
      * 
      * @param {String} raw - The string data
      * @return {Document}
      */
     static parseDocument(raw) {

          const { window: { document } } = new JSDOM(raw);

          return document;
     }

}