import express from "express";
import bodyParser from "body-parser";
import connectDB from "./db.js";
import User from "./models/user.js";
import bcrypt from "bcrypt";

//---------------------------------------------------

const app = express();
const port = 8080;
const saltRounds = 10;
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
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = await new User ({
            email: req.body.username,
            password: hashedPassword
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
        const user = await User.findOne({ email: req.body.username });

        if (!user) {
            return res.status(404).send("User not found");
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (isMatch) {
            res.redirect("/secrets");
        } else {
            res.status(401).send("Invalid email or password");
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