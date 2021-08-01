import MovieItem from "../interface/MovieItem.js";
import Page from "../interface/Page.js";
import Dom from "../interface/Dom.js";

export default class Home extends Page {

     constructor(main) {
          super();

          this.tabs = {};
          this.main = main;

          this.colors = [
               "linear-gradient(to right, rgb(34, 193, 195), rgb(253, 187, 45))",
               "linear-gradient(to right, rgb(198, 255, 221), rgb(251, 215, 134), rgb(247, 121, 125))",
               "linear-gradient(to right, rgb(225, 238, 195), rgb(240, 80, 83))",
               "linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61))",
               "linear-gradient(to right, rgb(17, 153, 142), rgb(56, 239, 125))",
               "linear-gradient(to right, rgb(103, 178, 111), rgb(76, 162, 205))",
               "linear-gradient(to right, rgb(0, 201, 255), rgb(146, 254, 157))",
               "linear-gradient(to right, rgb(179, 255, 171), rgb(18, 255, 247))",
               "linear-gradient(to right, rgb(170, 255, 169), rgb(17, 255, 189))",
               "linear-gradient(to right, rgb(127, 127, 213), rgb(134, 168, 231), rgb(145, 234, 228))",
               "linear-gradient(to right, rgb(131, 96, 195), rgb(46, 191, 145))",
               "linear-gradient(to right, rgb(0, 180, 219), rgb(0, 131, 176))",
               "linear-gradient(to right, rgb(116, 235, 213), rgb(172, 182, 229))",
               "linear-gradient(to right, rgb(142, 45, 226), rgb(74, 0, 224))",
               "linear-gradient(to right, rgb(101, 78, 163), rgb(234, 175, 200))"
          ]
     }

     randomColor() {
          var l = '0123456789ABCDEF';
          var c = '#';
          for (var i = 0; i < 6; i++) c += l[Math.floor(Math.random() * 16)];

          return c;
     }

     set() {

          this.clear();
     }

     async top() {
          const request = await fetch("/api/v1/top/header");
          const { success, data, message } = await request.json();

          if (success === false) throw new Error(message);

          const body = new Dom("div", { className: "TopItemList" });

          const list = data.map(item => {
               const body = new Dom("div", { className: "TopItem" });
               const thumbnail = new Dom("img", { className: "thumbnail", src: item.thumbnail });

               body.element.onclick = () => this.action(item.action);

               return body.add(thumbnail);
          });

          this.add(body.add(...list));
     }

     async list() {
          const request = await fetch("/api/v1/home");
          const { success, data, message } = await request.json();

          if (success === false) throw new Error(message);

          const scope = this;

          const items = data.items.map(function ({ title, list }) {
               const body = new Dom("div", { className: "body" })
               const label = new Dom("div", { className: "label" });
               const content = new Dom("div", { className: "content" });

               label.add(
                    new Dom("span", { className: "title", innerText: title })
               );

               const tabs = list.map(function ({ title: t, items: i }) {
                    const tab = new Dom("div", { className: "tab MovieListParent" });
                    const items = i.map(e => new MovieItem(e, scope.main));
                    const tab_label = new Dom("span", { className: "tab-label", innerText: t });

                    tab.label = tab_label;

                    tab.add(...items)

                    label.add(tab_label);

                    tab.hide();

                    tab_label.event("click", function () {
                         tab.show();
                         tab_label.element.classList.add("active")
                         scope.tabs[title].forEach(_tab => {
                              if (_tab === tab) return;
                              _tab.hide()
                              _tab.label.element.classList.remove("active")
                         })
                    });

                    return tab;
               });

               scope.tabs[title] = tabs;

               tabs[0].label.element.click();

               content.add(...tabs);

               return body.add(label, content)

          });

          this.add(new Dom("div", { className: "items", append: items }));
     }

     action(action) {
          if (!action) return;

          if (action.search) {
               this.main.setPage("search");
               this.main.page.get("search").search(action.search)
          }
     }

     async genres() {
          const request = await fetch("/api/v1/genres");
          const { success, data, message } = await request.json();

          if (success === false) throw new Error(message);

          const genres = data.map((genre, i) => {
               const body = new Dom("div", { className: "genre" });

               body.text = genre;

               body.style = { background: this.colors[i] || this.colors.random() }

               return body;
          });

          this.add(
               new Dom("div", { className: "genres", append: genres })
          )
     }

     async init() {

          if (this.opened) return;

          this.opened = true;

          this.set();

          await this.top();
          await this.genres();
          await this.list();
     }
}