const express = require("express");
const { configureApp } = require("./dashboard_app/app");

const app = express();

module.exports = configureApp(app);
