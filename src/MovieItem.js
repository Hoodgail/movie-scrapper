import { EventEmitter } from "events";
import Extender from "./Extender.js";

/**
 * The class with the movie data
 */
export default class MovieItem extends EventEmitter {

     /**
      * construct the Item class
      * 
      * @param {String} title - The movie's title
      * @param {String} thumbnail - The movie's thumbnail image url
      * @param {String} href - The movie link url
      */
     constructor({ title, thumbnail, href }) {

          super();

          this.title = title
          this.thumbnail = thumbnail;
          this.href = href;

     }


     /**
      * Gets movie sources form 
      * https://123movies.mom
      * 
      * @return {Array<object>}
      */
     async mom() {

          const base = "https://123movies.mom";

          // if the href link wasnt found in the class
          if (!this.href) throw new Error("href was not found!");

          // Gets the movie's site data
          let body = await Extender.document(this.href + "/watching.html");

          // Gets the movie's ID
          let id = [...body.querySelectorAll("script")]
               .map(r => r.innerHTML)
               .filter(r => r.includes("var movie = {"))
               .pop()
               .match(/id: "([0-9]+)",/)[1];

          // Gets the document of episodes / sources
          let document = await Extender.document(base + "/ajax/v2_get_episodes/" + id);

          // fetches the sources
          let content = [...document.querySelectorAll(".les-content a")].map(async el => {
               try {
                    let title = el.innerHTML.replace(/\n/gm, "").trim();
                    let id = el.getAttribute("episode-id");

                    let { embed_url } = await Extender.json(base + "/ajax/load_embed/" + id);

                    let api = await Extender.json(
                         embed_url.replace("embed/player.html", "api")
                    );

                    let stream = api.filter(r => r.active).filter(r => r.server == "Stream");

                    let response = [title, stream.length == 1 ? stream[0] : stream];

                    this.emit("source", response);

                    return response;
               } catch (e) {
                    return null;
               }
          });

          return await Promise.all(content);
     }
}