import Dom from "./Dom.js";
import Popup from "./Popup.js";
import Video from "video.js";
import { EventEmitter } from "events";

import Room from "../core/Room.js";
import Storage from "../core/Storage.js";



/**
 * The class with the movie data
 */
export default class MovieItem extends Dom {

     /**
      * construct the Item class
      * 
      * @param {Object} config - The movie's config data
      */
     constructor(config = {}, main) {

          super("div", { id: "MovieItem" });

          this.main = main;

          this.loading = new Dom("img", { className: "loading", src: "./image/spinner.svg" });

          this.progressTitle = new Dom("div", { className: "progressTitle" });
          this.progressHolder = new Dom("div", { className: "progressHolder" });
          this.progress = new Dom("div", { className: "progress" });

          this.progressHolder.add(this.progress);

          this._event = new EventEmitter();

          this.event("click", () => this.click())

          this.storage = "movie_data";

          this.set(config);
     }

     get data() {

          const data = Storage.get(this.storage);

          if (!data) Storage.set(this.storage, {});

          return data ? data[this.id] : {};
     }

     set data(value) {

          const data = Storage.get(this.storage);

          if (!data) Storage.set(this.storage, {});

          data[this.id] = value;

          Storage.set(this.storage, data)
     }

     saveProgress(source, { progress, progressTitle }) {

          const data = this.data || {};

          if (!data.source) data.source = {}
          if (!data.source[source]) data.source[source] = {}

          Object.assign(data.source[source], {
               progress, progressTitle,
               progressTime: Date.now()
          })

          this.data = data;
     }

     updateProgress() {
          const data = this.data

          if (!data) return;

          const sources = Object.values(data.source);

          const lastTime = Math.max(...sources.map(r => r.progressTime || 0));

          const lastSource = sources.filter(e => lastTime === e.progressTime).pop();

          this.progressHolder.display = "block";

          this.progress.style = { width: (lastSource.progress || 0) + "%" }
          this.progressTitle.text = lastSource.progressTitle || "";
     }

     generateThumbnail(src, type) {
          return this.tv == 2
               ? `/api/v1/thumbnail/${type}/${src}`
               : src
     }

     get dot() {
          return new Dom("span", {
               className: "dot",
               innerText: "•"
          })
     }


     /**
      * set the Item class
      * 
      * @param {Object} config
      * @param {String} config.title - The movie's title
      * @param {String} config.thumbnail - The movie's thumbnail image url
      * @param {String} config.href - The movie link url
      * @param {String} config.description - The movie's description or topic
      */
     set({ title, thumbnail, href, description, tv = 2, id } = {}) {

          this.clear();

          this.add(this.progressTitle, this.progressHolder)

          this._title = title;
          this._thumbnail = thumbnail;
          this._href = href;
          this._description = description;

          this.title = new Dom("div", { className: "title" });
          this.thumbnail = new Dom("img", { className: "thumbnail" });
          this.description = new Dom("div", { className: "description" });

          this.id = id;
          this.tv = tv;

          this.title.add(
               new Dom("div", { className: "text", innerText: this.formatTitle(title) })
          )

          if (this.episode) {
               this.title.add(
                    this.dot,
                    new Dom("span", {
                         className: "season",
                         innerText: this.episode ? "s" + this.episode : ""
                    })
               )
          }

          this.description.text = description;
          this.thumbnail.src = this.generateThumbnail(thumbnail, "poster");

          this.progressHolder.display = "none";

          this.element.setAttribute("loading", true);

          this.thumbnail.event("load", event => {
               this.loading.remove();

               this.element.prepend(this.thumbnail.element);

               this.updateProgress();

               this.element.setAttribute("loading", false);

               this._event.emit("thumbnail", event);
          })

          this.thumbnail.element.onerror = () => this.remove();

          this.add(this.title, this.loading);

          this._event.emit("set", { title, thumbnail, href, description });
     }

     formatTitle(title) {
          return title
               .replace(/\- [S|s]eason [0-9]+/, "")
               .trim()
     }

     get episode() {

          const episode = this
               ._title
               .match(/\- [S|s]eason ([0-9]+)/);

          return episode ? Number(episode[1]) : null;
     }



     addEventListener() { this._event.addListener(...arguments) }

     async sources() {

          return await fetch(`/api/v${this.tv == 2 ? 1 : this.tv}/sources/?q=${encodeURI(this._href)}&id=${this.id}`).then(r => r.json())

     }

     async source(id) {
          return await fetch(`/api/v${this.tv == 2 ? 1 : this.tv}/source/?id=${id}`).then(r => r.json())
     }

     async info() {
          return await fetch(`/api/v${this.tv == 2 ? 1 : this.tv}/info/?id=${this.id}`).then(r => r.json())
     }

     setInfo(popup, res) {
          const info = res.data;

          popup.setInfo({
               title: this._title,
               titleIcon: [info.quality[0].toLowerCase()],
               thumbnail: this.thumbnail.element.src,
               description: info.description,
               label: info.year
          })

     }

     async playSource({ id, parent, popup, title }) {
          if (parent) parent.hide();

          popup.show();

          popup.setLoading({ body: true, nav: false });

          const { data: { src, hls } } = await this.source(id);

          const data = this.data;

          const progress = { update: false };

          const source = data && data.source[id];

          const video = new Dom("video", {
               className: "player-frame video-js",
               controls: true,
               preload: "auto",
               poster: this.generateThumbnail(this.thumb, "cover")
          });

          popup.setBody(video);


          let player = Video(video.element, {}, () => {
               player.play()

               progress.update = !!source;
          });


          player.src({
               src: src,
               type: hls ? "application/x-mpegURL" : "video/mp4"
          });

          let connectButton = popup.navItem({
               title: "Start a live room",
               icon: "record_voice_over",
               onclick: () => this.room.connect()
          });

          const room = new Room({
               connectButton, popup, id,
               uid: this.main.user.id,
               uname: this.main.user.username
          });

          this.room = room;

          player.on("timeupdate", (e) => {

               const progress = (player.currentTime() / player.duration()) * 100;

               this.saveProgress(id, { progress, progressTitle: title });

               room.updateProgress({ progress });

               if (!progress.update) return;

               progress.update = false;

               const time = (source.progress / 100) * player.duration()

               player.currentTime(time);
          });
     }

     generateListItem({ title, id }, parent, info) {
          const body = new Dom("div", { className: "MovieItemSources" });
          const icon = new Dom("span", { className: "material-icons", innerText: "movie" });
          const text = new Dom("span", { className: "title", innerText: title });

          const popup = new Popup({ title });

          this.setInfo(popup, info);

          popup.element.classList.add("movie");
          popup.holder.element.classList.add("movie");

          body.event("click", async () => this.playSource({ id, parent, popup, title }))

          return body.add(icon, text)
     }


     async click() {

          let info;

          const popup = new Popup({
               title: `Sources for "${this._title}"`,
               loading: { nav: false, body: true }
          });

          const body = new Dom("div", {});

          popup.show();

          try { info = await this.info() } catch (e) { info = {} }

          this.setInfo(popup, info);

          let { data } = await this.sources();

          body.add(
               ...data.map(movie => this.generateListItem(movie, popup, info))
          )

          popup.setLoading({ nav: false, body: false })

          return popup.setBody(body)
     }
}