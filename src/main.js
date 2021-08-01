import BarList from "./interface/BarList.js";
import Avatar from "./interface/Avatar.js";
import Dom from "./interface/Dom.js";

import "./stylesheet/Page.css";
import "./stylesheet/Auth.css";
import "./stylesheet/index.css";
import "./stylesheet/Popup.css";
import "./stylesheet/Avatar.css";
import "./stylesheet/BarList.css";
import "./stylesheet/TopItem.css";
import "./stylesheet/Settings.css";
import "./stylesheet/MovieItem.css";
import "./stylesheet/ScrollBar.css";

import 'tippy.js/animations/scale-subtle.css';
import "filepond/dist/filepond.min.css";
import "csshake/dist/csshake.min.css";
import 'video.js/dist/video-js.css';
import "tippy.js/dist/tippy.css";


import SearchPage from "./page/Search.js";
import HomePage from "./page/Home.js";

import Auth from "./page/Auth.js";

import Storage from "./core/Storage.js";
import Api from "./core/Api.js";

import "./global.js";

window.HELP_IMPROVE_VIDEOJS = false;

import "@videojs/http-streaming";

window.search = new URLSearchParams(location.search);

class Main {
     constructor() {
          this.root = new Dom("div", { id: "root" });
          this.body = new Dom(document.body);

          this.sidebar = new BarList();
          this.right = new Dom("div", { id: "right" });
          this.avatar = new Avatar();

          this.page = new Map();

          this.add();
     }

     setPage(name, ...args) {
          if (!this.page.has(name)) return;

          const page = this.page.get(name);

          page.init(...args);

          this.right.clear();

          this.right.add(page);
     }

     add() {
          this.body.add(this.root);

          this.root.add(this.sidebar, this.right);

          this.sidebar.setAvatar(this.avatar);
     }

     async login() {

          const token = Storage.get("token");

          if (!token) return (this.setPage("auth", 1), this.sidebar.lock());

          const api = new Api(1, "/auth");

          try {
               let response = await api.get({ token });

               this.page.get("auth").gevent.emit("auth", response.data);
          } catch (e) {
               this.setPage("auth", 1);
               this.sidebar.lock()
          }
     }
}

window.addEventListener("load", async function () {

     const main = new Main();
     const auth = new Auth(main);

     main.page.set("home", new HomePage(main));
     main.page.set("search", new SearchPage(main));
     main.page.set("auth", auth);

     auth.gevent.addListener("auth", user => {
          main.avatar.set(user);
          main.sidebar.unlock();

          main.setPage("home");

          main.user = user;
     })

     await main.login();

     main.sidebar.createButton({
          title: "Home", icon: "home",
          onclick() { main.setPage("home") }
     });

     main.sidebar.createButton({
          title: "Search", icon: "search",
          onclick() { main.setPage("search") }
     });


})