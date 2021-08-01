import { EventEmitter } from "events";
import Dom from "../interface/Dom.js";
import Api from "../core/Api.js";
import Storage from "../core/Storage.js";

export default class Auth extends Dom {

     constructor(main) {
          super("div", { id: "Auth" });

          this.gevent = new EventEmitter();
          this.main = main;

          this.set();
     }

     set() {

          this.clear();

          this.title = new Dom("div", { className: "title" });

          this.add(this.title)

     }

     login() {

          this.title.text = "Login";

          const api = new Api(1, "/login");
          const username = new Dom("input", { className: "input", placeholder: "Username" });
          const password = new Dom("input", { className: "input", placeholder: "Password" });

          const submit = new Dom("div", { className: "submit", innerText: "Let me in." });

          const footer = new Dom("div", {
               className: "footer",
               append: [
                    new Dom("span", { className: "text", innerText: "Dont have an account?" }),
                    new Dom("span", { className: "event", innerText: "Register." })
               ]
          })

          footer.event("click", () => this.init(2))

          submit.event("click", async () => {

               let response = {};

               try {
                    response = await api.get({ username: username.value, password: password.value });
               } catch (e) {
                    response.success = false; response.message = e.toString()
               }

               if (response.success) {
                    Storage.set("token", response.data.token);
                    return this.main.login();
               };

               submit.element.classList.add("shake");
               submit.text = response.message;

               setTimeout(function () {
                    submit.element.classList.remove("shake");
                    submit.text = "Let me in.";
               }, 500)

          });

          this.add(username, password, submit, footer);
     }

     register() {
          this.title.text = "Register";

          const api = new Api(1, "/register");
          const username = new Dom("input", { className: "input", placeholder: "Username" });
          const password = new Dom("input", { className: "input", placeholder: "Password" });

          const submit = new Dom("div", { className: "submit", innerText: "Create account." });

          const footer = new Dom("div", {
               className: "footer",
               append: [
                    new Dom("span", { className: "text", innerText: "Already have an account?" }),
                    new Dom("span", { className: "event", innerText: "Login." })
               ]
          })

          footer.event("click", () => this.init(1))

          submit.event("click", async () => {

               let response = {};

               try {
                    response = await api.get({ username: username.value, password: password.value });
               } catch (e) {
                    response.success = false; response.message = e.toString()
               }

               if (response.success) {
                    Storage.set("token", response.data.token);
                    return this.main.login();
               };

               submit.element.classList.add("shake");
               submit.text = response.message;

               setTimeout(function () {
                    submit.element.classList.remove("shake");
                    submit.text = "Create account.";
               }, 500)

          });

          this.add(username, password, submit, footer);
     }

     init(type) {

          this.set();

          switch (type) {
               case 1:
                    this.login()
                    break;
               case 2:
                    this.register()
                    break;
          }

     }
}