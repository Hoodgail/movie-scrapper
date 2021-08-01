import fetch from "node-fetch";
import Extender from "./Extender.js";
import MovieItem from "./MovieItem.js";

import ffmpeg from "ffmpeg";
import fs from "fs";


/**
 * The class that will be used to scrape and parse data
 */
export default class Srapper {

     /**
      * construct the Scrapper class
      * 
      * @param {Object} config
      * @param {String} config.base - the website's hostname
      * 
      * @param {String} config.searchSyntax - search url
      * @param {String} config.genreSyntax - genre url
      * 
      * @param {String} config.selector - selector object for scrapping (required)
      * @param {Array} config.genres - genres array
      * 
      * @param {String} config.series - the tv series page
      * @param {String} config.movies - the movies page
      * @param {String} config.home - The home page
      */
     constructor(config) {

          const {
               base,
               searchSyntax,
               selector,
               genres,
               genreSyntax,
               series,
               movies,
               home,
               hostname
          } = config;

          this.base = base;
          this.hostname = hostname;

          this.syntax = new Map();
          this.page = new Map();

          this.syntax.set("search", searchSyntax);
          this.syntax.set("genre", genreSyntax);

          this.page.set("home", home);
          this.page.set("movies", movies);
          this.page.set("series", series);

          this.genres = genres;

          this.selector = selector;
     }

     async genre(genre) {
          if (!this.genres.includes(genre)) return { items: [] };
          const path = this.base + `/genre/${genre.replace(/[ ]/gm, "-").toLowerCase()}/`;

          const document = await Extender.document(path)

          const items = this.movieItem(document);

          return { items }
     }


     /**
      * Gets the site's raw
      * 
      * @param {String} subdir - the subpath to be added tot he base path
      * @return {String} - the site's data
      */
     async get(subdir) {
          const url = this.base + subdir;

          const request = await fetch(url); // makes the request
          const response = await request.text(); // parses the raw data to text

          return response; // returns the value
     }

     /**
      * Searches a movie
      * 
      * @param {String} query - Search query
      * @return {Array<object>} - The array of movie items
      */
     async search(query) {

          const syntax = this.syntax.get("search");

          const raw = await this.get(
               syntax.replace(/\{\Q\U\E\R\Y\}/g,
                    query.replace(/[ ]/g, "+")
               )
          );

          const data = this.parse(raw);

          return data.items;
     }

     /**
      * Gets all of the movie items/cards
      * 
      * @param {Document} document - The website's document elment
      * @return {Array<object>} - the items as Arrays of objects
      */
     movieItem(document) {

          return [...document.querySelectorAll(this.selector.ITEM.base)].map(element => {

               const thumbElement = element.querySelector(this.selector.ITEM.thumb);
               const titleElement = element.querySelector(this.selector.ITEM.title);
               const hrefELement = element.querySelector(this.selector.ITEM.href);
               const idString = element.getAttribute("data-movie-id");

               return new MovieItem({
                    id: idString,
                    thumbnail: thumbElement ? thumbElement.src.trim() : null,
                    title: titleElement ? titleElement.innerHTML.trim() : null,
                    href: hrefELement ? hrefELement.href.trim() : null
               })
          });
     }

     /**
      * Gets all of the movie items of new movies
      * 
      * @param {Document} document - The website's document elment
      * @return {Array<object>} - the items as Arrays of objects
      */
     newMovieItem(document) {
          return [...document.querySelectorAll(this.selector.NEW.base)].map(element => {
               const titleElement = element.querySelector(this.selector.NEW.title);
               const hrefELement = element.querySelector(this.selector.NEW.href);
               const descElement = element.querySelector(this.selector.NEW.desc);

               const bi = element.style._values["background-image"].match(/\((.*)\)/);

               return new MovieItem({
                    href: hrefELement ? hrefELement.href.trim() : null,
                    title: titleElement ? titleElement.innerHTML.trim() : null,
                    desc: descElement ? descElement.innerHTML.trim() : null,
                    thumbnail: bi ? bi[1].replace(/\"/gm, "") : null,
               })
          })
     }

     async home() {

          const raw = await this.get(
               this.page.get("home")
          )

          const document = Extender.parseDocument(raw);

          const wrap = [...document.querySelectorAll(".movies-list-wrap")].map(wrap => {
               const title = wrap.querySelector(".ml-title .pull-left span").textContent
               const list = [...wrap.querySelectorAll(".ml-title .nav-tabs li a")].map(a => {

                    const id = a.href.split("about:blank").pop();

                    const element = wrap.querySelector(id);
                    const title = a.textContent;
                    const items = this.movieItem(element);

                    items.forEach(i => Object.assign(i, i.assign()))

                    return { title, items };
               });

               return { title, list }
          })

          const new_movies = this.newMovieItem(document);

          return { new_movies, items: wrap }
     }

     /**
      * Parses the data to json
      * 
      * @param {String} text - the site's data
      * @return {Object} - the parsed json site data
      */
     parse(text) {
          const document = Extender.parseDocument(text)

          const items = this.movieItem(document);

          return { items }
     }


}