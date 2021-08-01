import MovieItem from "../interface/MovieItem.js";
import Page from "../interface/Page.js";
import Dom from "../interface/Dom.js";

export default class Search extends Page {

     constructor() {
          super();

          this.set();

          this.content = new Dom("div", { className: "content" });

          this.add(this.content)
     }

     search(query) {
          this.inputElement.value = query;
          this.init();
     }

     set() {

          this.clear();

          this.input = this.addInput({ placeholder: "Search film" });
          this.searchButton = new Dom("div", { className: "searchButton material-icons", innerText: "search" })

          this.input.add(this.searchButton);

          this.inputElement = this.input.input.element

          this.inputElement.addEventListener("keypress", e => {
               if (e.keyCode !== 13) return;

               this.init();
          });

          this.searchButton.event("click", e => this.init())
     }

     async init(reset) {

          if (!this.inputElement.value) return;

          const request = await fetch("/api/v1/search/?q=" + encodeURI(this.inputElement.value));

          this.content.clear();

          const { success, data, message } = await request.json();

          if (success === false) throw new Error(message);

          const items = data.map(movie => new MovieItem(movie));
          const list = new Dom("div", { className: "MovieListParent", append: items });

          list.style = {
               width: "73%",
               marginTop: "30px",
               "grid-template-columns": "auto auto auto auto auto"
          };

          this.content.add(list);
     }
}