# movie-scrapper

NodeJS movie scrapper lib on server side

# Installation
```bash
npm install scrapper
```

# Usage
```js
import { Scrapper, Selector } from "movie-scrapper";

const scrapper = new Scrapper({

     // main site
     base: "https://123movies.mom",

     // pages
     home: "/123movies",
     movies: "/movies",
     series: "/series",

     //genres
     genres: ["action", "adventure", "animation", "biography", "comedy", "costume", "crime", "documentary", "drama", "family", "fantasy", "history", "horror", "kungfu", "musical", "mystery", "mythological", "psychological", "romance", "sci-fi", "sitcom", "sport", "tv-show", "thriller", "war", "western", "xmas"],

     // url syntax
     searchSyntax: "/search/?keyword={QUERY}",
     genreSyntax: "/genre/{QUERY}",

     // selectors (required)
     selector: Selector
});

console.time("Search")

scrapper.search("spider man")
     .then(results => results[0].mom())
     .then(movie => {
          console.log(movie);
          console.timeEnd("Search")
     })
```