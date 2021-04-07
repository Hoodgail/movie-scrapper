import fetch from "node-fetch";
import { JSDOM } from "jsdom";

import MovieItem from "./MovieItem.js";

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
               home
          } = config;

          this.base = base;

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
          return [...document.querySelectorAll(this.selector.item.base)].map(element => {
               const thumbElement = element.querySelector(this.selector.item.thumb);
               const titleElement = element.querySelector(this.selector.item.title);
               const hrefELement = element.querySelector(this.selector.item.href);

               return new MovieItem({
                    thumbnail: thumbElement ? thumbElement.src.trim() : null,
                    title: titleElement ? titleElement.innerHTML.trim() : null,
                    href: hrefELement ? hrefELement.href.trim() : null
               })
          });
     }

     /**
      * Parses the data to json
      * 
      * @param {String} text - the site's data
      * @return {Object} - the parsed json site data
      */
     parse(text) {
          const { window: { document } } = new JSDOM(text);

          const items = this.movieItem(document);

          return { items }
     }

}