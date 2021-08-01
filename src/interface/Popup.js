import Dom from "./Dom.js";

/**
 * The class to create Popups
 */
export default class Popup extends Dom {

     /**
      * construct the Popup class
      */
     constructor(config) {

          super("div", { id: "Popup" });

          this.nav = new Dom("div", { className: "nav" })
          this.title = new Dom("div", { className: "title" });
          this.loading = new Dom("div", { className: "loading" });
          this.body = new Dom("div", { className: "body" });
          this.info = new Dom("div", { className: "info" });

          this.loadingImage = new Dom("img", { src: "/image/spinner.svg" });

          this.closeButton = new Dom("div", { className: "close", innerText: "close" });
          this.closeButton.event("click", () => this.hide())

          this.holder = new Dom("div", { className: "background" })

          this.header = new Dom("div", { className: "header" });

          this.header.add(
               this.title,
               this.loading
          );

          this.loading.add(this.loadingImage);

          this.add(
               this.closeButton,
               this.header,
               this.body
          );

          this.holder.add(this, this.nav, this.info)

          if (config) this.set(config);

     }

     set({ title, body, loading, info }) {
          if (title) this.setTitle(title);
          if (body) this.setBody(body);
          if (loading) this.setLoading(loading);
          if (info) this.setInfo(info)
     }

     navItem({ title, icon, onclick, color }) {
          const body = new Dom("div", { className: "navItem", title, onclick });

          if (color) body.style = { color }

          body.add(
               new Dom("span", {
                    className: "material-icons",
                    innerText: icon
               })
          )

          this.nav.add(body);

          return body;
     }

     setInfo(config) {

          const {
               thumbnail: src,
               title: text,
               description: descript,
               titleIcon,
               label: labelText
          } = config;

          const thumbnail = new Dom("img", { className: "thumbnail", src });
          const title = new Dom("div", { className: "title" });
          const description = new Dom("div", { innerText: descript, className: "description" });
          const label = new Dom("div", { className: "label", innerText: labelText });

          title.add(
               new Dom("span", { className: "text", innerText: text }),

               ...titleIcon.map(icon => {
                    return new Dom("span", { className: "material-icons", innerText: icon })
               })
          )

          this.info.clear();

          this.info.add(label, thumbnail, title, description)
     }

     setLoading({ nav, body }) {
          this.loading.element.setAttribute("set", nav);

          if (body == true) {
               const clone = this.loading.clone(true, {});
               clone.element.setAttribute("set", true);
               this.setBody(clone);
          } else if (body == false) {
               this.body.clear()
          }
     }

     setBody(child) {
          this.body.clear();
          this.body.add(child)
     }

     setTitle(title) {
          this.title.text = title.trim()
     }

     show() { new Dom(document.body).add(this.holder); }

     hide() { this.holder.remove() }


}