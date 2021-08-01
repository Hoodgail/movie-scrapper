import ChatBox from "../interface/ChatBox.js";

const drone = new Scaledrone('ZWEiNTM5nYMU3iPa');

export default class Room {
     constructor({ id, popup, connectButton, uid, uname }) {
          this.chat = new ChatBox();

          this.uid = uid;

          this.id = id;
          this.connectButton = connectButton;
          this.popup = popup;

          this.icon = this.randomIcon();

          this.username = uname || "Guest";

          this.lastProgress = 0;

          this.buttons = [];

          this.chat.when("message", content => {

               if (!this.connected) return;

               drone.publish({
                    room: this.room.name,
                    message: { content, ...this.icon, t: "CREATE_MESSAGE", username: this.username, id: this.uid }
               })
          });

          this.chat.createMember({ username: this.username, ...this.icon, id: this.uid });
     }

     randomIcon() {
          const icons = ["account_circle", "perm_identity", "account_box", "contact_page"];
          const colors = ["#ffeb7f", "#ff837f", "#7fff81", "#7f84ff", "#ff7ffd", "#7fffd4"];

          return { icon: icons.random(), color: colors.random() }
     }

     connect() {
          this.room = drone.subscribe('observable-' + this.id);

          this.room.on('open', error => {
               if (error) return console.error(error);
               else this.open();
          });

          this.room.on('message', message => {
               switch (message.data.t) {
                    case "CREATE_MESSAGE":
                         this.CREATE_MESSAGE(message)
                         break;
                    case "CREATE_MEMBER":
                         this.CREATE_MEMBER(message)
                         break;
               }
          });
     }

     open() {
          this.connected = true;

          this.exit = this.popup.navItem({
               title: "Leave",
               icon: "exit_to_app",
               color: "#ff6459",
               onclick: () => this.leave()
          });

          this.popup.holder.add(this.chat);

          this.buttons.push(this.exit)
     }

     leave() {
          this.room.connected = false;

          this.chat.remove()

          this.room.unsubscribe();

          this.buttons.forEach(b => b.remove());

          this.connectButton.show();
     }


     updateProgress(progress) {
          const canSend = this.connected && this.lastProgress.now() > 1000;
          if (!canSend) return;

          this.lastProgress = Date.now();

          drone.publish({
               room: this.room.name,
               message: { progress }
          })


     }

     ////////////////// MESSAGES ////////////////////

     CREATE_MESSAGE(message = {}) {

          const {
               icon,
               username,
               content,
               color
          } = message.data;

          return this.chat.createMessage({ icon, username, content, color })
     }


     CREATE_MEMBER(message = new Object) {

          const {
               username,
               icon,
               color
          } = message.data;

          this.chat.createMember({ username, icon, color })
     }
}