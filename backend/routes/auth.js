const express = require("express")
const {limiter} = require("../middleware/security")
const config = require("../config/config")
const logger = require("../utils/logger")
const {User} = require("../models/index")
const jwt = require("jsonwebtoken")


router = express.router()


router.use(limiter)