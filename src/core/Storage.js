export default class Storage {

     /**
     * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
     * 
     * @param {string} key
     * @param {*} value
     */
     static set(key, value) {

          const data = JSON.stringify(value);

          localStorage.setItem(key, data);

     }

     /**
     * Returns the current value associated with the given key, or null if the given key does not exist in the list associated with the object.
     * 
     * @param {string} key
     * 
     * @return {*|null}
     */
     static get(key) {

          const value = localStorage.getItem(key)

          return value ? JSON.parse(value) : null;

     }

     static remove(key) {
          delete localStorage[key];
     }
}