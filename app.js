import express from "express";
import bodyParser from "body-parser";
import connectDB from "./db.js";
import User from "./models/user.js";

//---------------------------------------------------

const app = express();
const port = 8080;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
connectDB();

//---------------------------------------------------

app.get("/", async (req, res) => {
    res.render("home.ejs", {});
});

app.get("/secrets", async (req, res) => {
    res.render("secrets.ejs", {});
});

app.get("/register", async (req, res) => {
    res.render("register.ejs", {});
});

app.get("/login", async (req, res) => {
    res.render("login.ejs", {});
});

app.post("/register", async (req, res) => {
    try {
        const newUser = await new User ({
            email: req.body.username,
            password: req.body.password
        });
        await newUser.save(newUser);
        res.redirect("secrets");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating new user");
    }
});

app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.username,
            password: req.body.password
        });
        if (user) {
            if (user.password === req.body.password) {
                res.redirect("secrets");
            }
        } else {
            return res.status(404).send("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating new user");
    }
});

//---------------------------------------------------

app.listen(port, function() {
    console.log(`App is running on port ${port}`);
});