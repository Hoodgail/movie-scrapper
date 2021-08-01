import { EventEmitter } from "events";
import Extender from "./Extender.js";
import Vidcloud9 from "./Vidcloud9.js";

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
      * @param {String} desc - The movie's description or topic
      */
     constructor({ title, thumbnail, href, desc, id }) {

          super();

          this.title = title
          this.thumbnail = thumbnail;
          this.href = href;
          this.desc = desc;
          this.id = id;
     }

     assign() {
          const href = this.href.split("/").filter(e => e).pop();

          const thumbnail = this.thumbnail.split("/")
               .filter(e => e)
               .pop()
               .split(".")[0]
               .split("-").filter(a => !["poster", "cover"].includes(a)).join("-");

          return { href, thumbnail }
     }

     /**
      * Gets the movie's information from its ID
      * 
      * @return {Promise<{ quality: string[][]; star: number; year: number;  thumbnail: string; description: string; href: string; }>}
      */
     async momInfo() {

          const base = "https://123movies.mom";

          // if the movie id wasnt found in the class
          if (!this.id) throw new Error("id was not found!");

          // Gets the movie's site data
          let document = await Extender.document(base + "/ajax/movie/info/" + this.id + "/");

          const quality = document.querySelector(".jtip-quality")
               .innerHTML
               .replace(/\n/gm, "")
               .trim()
               .split(" ");

          const star = document.querySelector(".jt-imdb")
               .innerHTML
               .replace(/\n/gm, "")
               .trim()
               .split("IMDb:")
               .pop()
               .replace(/[ ]/gm, "")

          const year = document.querySelectorAll(".jt-info")[1]
               .innerHTML
               .trim()

          const description = document.querySelector(".f-desc")
               .innerHTML
               .trim()

          const href = document.querySelector(".jtip-bottom a")
               .href
               .replace("/watching.html", "")
               .split(base + "/film/")[1]

          const thumbnail = new String(href)
               .split("-")
               .filter(e => e);

          thumbnail.pop();

          return {
               quality: quality,
               star: Number(star),
               year: Number(year),
               thumbnail: String(thumbnail.join("-")),
               description: String(description),
               href: String(href)
          }
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

          let id = this.id

          // Gets the document of episodes / sources
          let document = await Extender.document(base + "/ajax/v2_get_episodes/" + id);

          // fetches the sources
          let content = [...document.querySelectorAll(".les-content a")].map(el => {
               let title = el.innerHTML.replace(/\n/gm, "").trim();
               let id = el.getAttribute("episode-id");

               return { title, id }
          });

          return content;
     }

     async momSource({ id }) {

          const base = "https://123movies.mom";

          let { embed_url } = await Extender.json(base + "/ajax/load_embed/" + id);

          let api = await Extender.json(
               embed_url.replace("embed/player.html", "api")
          );

          let stream = api.filter(r => !r.active).map(r => r.link).pop();

          let res = {};

          this.emit("source", stream);

          if (stream.includes("vidcloud9")) {
               const sources = await new Vidcloud9(stream).source();

               let source = sources.pop();

               res.hls = source.type == "hls";

               res.src = source.file;
          } else {
               res.stream = stream
          }

          return res;
     }
}