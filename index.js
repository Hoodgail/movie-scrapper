console.time("toplevel")

import express from "express";
import Scrapper from "./movie-scrapper/Scrapper.js";
import MovieItem from "./movie-scrapper/MovieItem.js";
import Genres from "./movie-scrapper/Genres.js";
import * as Selector from "./movie-scrapper/Selector.js";

import { MetadataGenerator } from 'metatags-generator';
import request from "request";
import FileSync from "lowdb/adapters/FileSync.js"
import Low from "lowdb";
import upload from "express-fileupload";
import parser from "body-parser";
import morgan from "morgan";
import token from "token-generator";
import crypto from "crypto";
import _ from "lodash";

import fs from "fs";

const settings = {
     structuredData: true,
     androidChromeIcons: true,
     msTags: true,
     safariTags: true,
     appleTags: true,
     openGraphTags: true,
     twitterTags: true,
     facebookTags: true
};

const generator = new MetadataGenerator();

const AuthAdapter = new FileSync('./db/auth/db.json');
const Auth = Low(AuthAdapter);

const TopListAdapter = new FileSync('./db/movie/top_list.json');
const TopList = Low(TopListAdapter);

const TokenGenerator = token({
     salt: "8fdbbc15b2605ec429f93a2836151b5ad2cedb99",
     timestampMap: 'abcdefghij'
})


Auth.defaults({ accounts: [], user: {} })
     .write();

TopList.defaults({ header: [] })
     .write();


import "./src/global.js";
import "./OpenSubtitles.js";

const app = express();

// enable files upload
app.use(upload({
     createParentPath: true
}));

//add other middleware
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(morgan('dev'));

const scrapper = new Scrapper({

     base: "https://123movies.mom",
     hostname: "123movies.mom",

     home: "/123movies",
     movies: "/movies",
     series: "/series",

     searchSyntax: "/search/?keyword={QUERY}",
     genreSyntax: "/genre/{QUERY}",

     //genres
     genres: Genres,
     selector: Selector,

     //opensubtitles: OpenSubtitles
});


const assign = i => i.forEach(i => Object.assign(i, i.assign()));

/**
 * Hashes a password
 * 
 * @param {*} i - password
 * @param {*} s - salt
 * @return {String}
 */
const pass = (i, s) => crypto.pbkdf2Sync(i, s, 1000, 64, `sha512`).toString(`hex`);

/**
 * Validate password with hashed password
 * 
 * @param {String} i - password
 * @param {String} s - salt
 * @param {String} p - hashed password
 * 
 * @return {Boolean}
 */
const vpass = (i, s, p) => pass(i, s) == p;

app.use("/", express.static("public"));
app.use("/avatar", express.static("db/auth/avatar"));

app.use("/api/v1/top/header", async function (req, res) {
     const time = Date.now();

     const list = TopList.get("header").value();

     res.send({ success: true, data: list, time: time.now() })

});

app.use("/api/v1/genre/:genre", async function (req, res) {
     const time = Date.now();

     const { genre } = req.params;

     const data = await scrapper.genre(genre);

     res.send({ success: true, data, time: time.now() })

});

app.use("/api/v1/auth", async function (req, res) {
     const time = Date.now();

     const { token } = req.query;

     if (!token) return res.send({ success: false, message: "Token Not found!" })
     if (!TokenGenerator.isValid(token.split(".")[0])) return res.send({ success: false, message: "Invalid token", time: time.now() })

     const account = Auth.get('accounts')
          .find({ token })
          .value();

     if (!account) return res.send({ success: false, message: "Invalid account", time: time.now() })

     let data = { ...account };

     delete data.password;

     res.send({ success: true, data, time: time.now() })

});

app.post("/api/v1/avatar", async function (req, res) {
     const time = Date.now();

     const { token } = req.query;
     const accept = ["image/png", "image/jpeg", "image/gif"];

     if (!token) return res.send({
          success: false,
          message: "Token Not found!"
     })
     if (!TokenGenerator.isValid(token.split(".")[0])) return res.send({
          success: false,
          message: "Invalid token",
     })

     const account = Auth.get('accounts')
          .find({ token })
          .value();

     if (!account) return res.send({
          success: false,
          message: "Invalid account",
     })

     const { file } = req.files || {};

     if (!file) return res.send({
          success: false,
          message: "No image was found"
     });

     // 1 mb
     if (file.size > 1000000) return res.send({
          success: false,
          message: "image is too big"
     });

     if (!accept.includes(file.mimetype)) return res.send({
          success: false,
          message: `Only accepting '${accept.join(", ")}'`
     });

     const path = "./db/auth/avatar/" + account.id + ".png";

     fs.writeFile(path, file.data, "binary", error => {
          if (error) return res.send({
               success: true,
               message: "Failed to save avatar"
          });

          res.send({
               success: true,
               message: "Successfully uploaded",
               time: time.now()
          });
     })
});

app.use("/api/v1/genres", async function (req, res) {

     return res.send({ success: true, data: Genres, time: 0 })
});

app.use("/api/v1/login", async function (req, res) {
     const time = Date.now();

     const { username, password } = req.query;

     if (!(username && password)) return res.send({ success: false, message: "Username or password missing" })

     if (username.length > 10) return res.send({ success: false, message: "Username is too big" });
     if (username.length < 5) return res.send({ success: false, message: "Username is too small" });

     if (password.length > 10) return res.send({ success: false, message: "Password is too big" });
     if (password.length < 5) return res.send({ success: false, message: "Password is too small" });

     if (!/^[a-zA-Z]/.test(username)) return res.send({ success: false, message: "Invalid character in username" });
     if (username.includes(" ")) return res.send({ success: false, message: "Username can not have spaces" });

     const accounts = Auth.get('accounts');

     const account = accounts
          .find({ username })
          .value();

     if (!account) return res.send({ success: false, message: "Invalid account", time: time.now() });

     const passw = pass(password, account.date.toString());

     if (account.password !== passw) return res.send({ success: false, message: "Incorrect password", time: time.now() });

     return res.send({ success: true, data: { token: account.token }, time: time.now() })
});

app.use("/api/v1/register", async function (req, res) {
     const time = Date.now();

     const { username, password } = req.query;

     if (!(username && password)) return res.send({ success: false, message: "Username or password missing" })

     if (username.length > 10) return res.send({ success: false, message: "Username is too big" });
     if (username.length < 5) return res.send({ success: false, message: "Username is too small" });

     if (password.length > 10) return res.send({ success: false, message: "Password is too big" });
     if (password.length < 5) return res.send({ success: false, message: "Password is too small" });

     if (!/^[a-zA-Z]/.test(username)) return res.send({ success: false, message: "Invalid character in username" });
     if (username.includes(" ")) return res.send({ success: false, message: "Username can not have spaces" });

     const accounts = Auth.get('accounts');

     if (accounts.find({ username }).value()) return res.send({ success: false, message: "Account with this username exists" });

     const user = {
          username,
          password: pass(password, time.toString()),
          token: TokenGenerator.generate() + "." + time.toString(36),
          date: time,
          id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
     }

     const account = accounts
          .push(user)
          .write();

     if (!account) return res.send({ success: false, message: "unable to create account", time: time.now() })
     return res.send({ success: true, data: user, time: time.now() })
});

app.use("/api/v1/account", async function (req, res) {
     const time = Date.now();

     const { id } = req.query;

     if (!id) return res.send({ success: false, message: "ID Not found!" })
     if (id.length >= 50) return res.send({ success: falsez, message: "Invalid ID" })

     const ParsedId = Number(id);

     if (!parsedId) return res.send({ success: false, message: "ID must be a number" })

     const account = Auth.get('accounts')
          .find({ id: ParsedId })
          .value();

     if (!account) return res.send({ success: false, message: "Invalid account" });

     return res.send({
          success: true,
          data: {
               username: account.username,
               date: account.date,
               id: account.id
          },
          time: time.now()
     })
});

app.use("/api/v1/home", async function (req, res) {
     const time = Date.now();
     const home = await scrapper.home();

     assign(home.new_movies);

     res.send({ success: true, data: home, time: time.now() });
});

app.use("/api/v1/info", function (req, res) {
     const time = Date.now();

     new MovieItem(req.query)
          .momInfo()
          .then(v => res.send({ success: true, data: v, time: time.now() }))
          .catch(v => res.send({ success: false, message: v.toString(), time: time.now() }))

});

app.use("/api/v1/sources", async function (req, res) {
     const time = Date.now();

     const { q, id } = req.query;

     if (!q) return res.send({ success: false, message: "Query not found" })

     const movie = new MovieItem({ href: scrapper.base + "/film/" + q, id });

     let sources = await movie.mom();

     res.send({ success: true, data: sources, time: time.now() });
});


app.use("/api/v1/source", async function (req, res) {
     const time = Date.now();

     const { id } = req.query;

     if (!id) return res.send({ success: false, message: "Id not found" })

     const source = await new MovieItem({}).momSource({ id });

     res.send({ success: true, data: source, time: time.now() });
});

app.use("/api/v1/search", async function (req, res) {
     const time = Date.now();

     const { q } = req.query;

     if (Object.keys(req.query).length > 1) return res.send({ success: false, message: "Unkown parameter" })

     if (!q) return res.send({ success: false, message: "Query not found" })

     if (typeof q !== "string") return res.send({ success: false, message: "Query.type is invalid" })

     if (q.length > 100) return res.send({ success: false, message: "Query.length is higher than 100" })
     if (q.length <= 1) return res.send({ success: false, message: "Query.length is or lower than one" })

     const data = await scrapper.search(q);

     assign(data);

     res.send({ success: true, data, time: time.now() });
});

app.use("/api/v1/thumbnail/:type/:src", async function (req, res) {
     const { src, type } = req.params;
     const validType = ["poster", "cover"].includes(type);

     if (!validType) return res.send({ success: false, message: "Type.value is invalid" })

     if (src.length > 100) return res.send({ success: false, message: "Query.length is higher than 100" })
     if (src.length <= 1) return res.send({ success: false, message: "Query.length is or lower than one" })

     const path = "https://image." + scrapper.hostname + "/" + src + "-" + type + ".png";

     request
          .get(path)
          .pipe(res)
          .on('error', err => {
               const msg = 'Error on connecting to the webservice.';
               console.error(msg, err);
               res.status(500).send(msg);
          });
})


app.listen(8080, function () {

     console.log("Listening", 8080)

     console.timeEnd("toplevel");
})