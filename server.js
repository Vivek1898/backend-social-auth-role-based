const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const passport = require("passport");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const ResponseService = require("./services/ResponseService");
const ConstantService = require("./services/ConstantService");
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const session = require("express-session");

// load config
dotenv.config()

// passport config
require("./config/passport")(passport);
connectDB();

const app = express();

app.use(morgan("dev"));

// Session Middleware
app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());

// file upload
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
    fileUpload({
        useTempFiles: true,
        limits: { fileSize: 50 * 1024 * 1024 },
    })
);

// https://client-social-auth-role-based.vercel.app/

app.use(
  cors({
    origin: ["http://localhost:3001" ,"http://localhost:4001", "https://social-auth-role-based.onrender.com" ,"https://client-social-auth-role-based.vercel.app"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
// Routes
app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/user"));
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.get('/',(req,res)=>{
  res.send(req.headers)
})

global.ResponseService = ResponseService;
global.ConstantService = ConstantService;
const PORT = process.env.PORT || 8000;

app.listen(
  PORT,
  console.log(` Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
