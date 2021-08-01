export default class Api {
     constructor(version, path) {
          this.version = version;
          this._path = path;
          this.__path = "v" + version + path;
     }

     static get base() { return "/api/" }

     get path() { return Api.base + this.__path }

     query(params) {
          const keys = Object.keys(params);
          return keys.map(function (key) {
               return key + '=' + params[key]
          }).join('&');
     }

     async get(query = {}) {
          const path = this.path + "?" + this.query(query);
          return await this.fetch(path);
     }

     async fetch(path) {
          const request = await fetch(path);
          const response = await request.json();
          if (response.success === false) throw new Error(response.message);
          return response;
     }
}