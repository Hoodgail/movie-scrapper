import Dom from "../interface/Dom.js";
import Popup from "../interface/Popup.js";
import * as FilePond from "filepond";
import tippy from "tippy.js";
import Storage from "../core/Storage.js";

/**
 * Represents the settings page.
 */
export default class Settings extends Dom {

     /**
      * Construct the class
      */
     constructor() { super("div", { id: "Settings" }); }

     /**
      * Creating an item for the settings page
      * 
      * @param {Dom} left 
      * @param {Dom} right 
      * @return {Dom}
      */
     static Item(left, right) {
          const l = new Dom("div", { className: "left", append: [left] });
          const r = new Dom("div", { className: "right", append: [right] });
          const b = new Dom("div", { className: "Item" });

          b.l = l;
          b.r = r;

          return b.add(l, r)
     }

     /**
      * Element for uploading and image 
      * ex : user's avatar
      * 
      * @param {Object} config
      * @param {String} config.src
      * @param {String} config.description
      * 
      * @return {Promise<Dom>}
      */
     image({ src, description } = {}) {

          /**
           * Item image to be replaced
           */
          const image = new Dom("img", { className: "image", src });

          /**
           * Item's description
           */
          const text = new Dom("div", { className: "text", innerText: description })

          /**
           * Item's element
           */
          const body = Settings.Item(image, text);

          //----------------------------------------------------------------------------------//

          const contex = new Dom("div", { className: "contex" })

          const input = new Dom("input", { type: "file" });

          input.element.setAttribute("accept", "image/png, image/jpeg, image/gif");
          input.element.setAttribute("data-max-file-size", "1MB");

          contex.add(input);

          /*
          We want to preview images, so we need to register the Image Preview plugin
          */
          FilePond.registerPlugin(

               // encodes the file as base64 data
               FilePondPluginFileEncode,

               // validates the size of the file
               FilePondPluginFileValidateSize,

               // corrects mobile image orientation
               FilePondPluginImageExifOrientation,

               // previews dropped images
               FilePondPluginImagePreview
          );

          FilePond.setOptions({
               server: '/api/v1/avatar/?token=' + Storage.get("token"),
               name: "file"
          });

          // Select the file inpu
          FilePond.create(input.element, { maxFiles: 1, multiple: false, });

          let tip = tippy(image.element, {
               content: contex.element,
               trigger: "click",
               interactive: true,
               arrow: false,
               placement: "bottom"
          })

          tip.popper.classList.add("settings")

          return this.add(body);
     }
}