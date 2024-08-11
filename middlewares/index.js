const express = require("express");
const cors = require("cors");
const compression =require('compression')
const morgan = require("morgan");

module.exports = (app) => {
  app.use(express.json());
  app.use(compression())
  app.use(cors());

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }
};
