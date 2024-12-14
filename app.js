import express from "express";
import bodyParser from "body-parser";
import connectDB from "./db.js";
import User from "./models/user.js";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import findOrCreate from "mongoose-findorcreate";

//---------------------------------------------------

const app = express();
const port = 8080;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/secrets",
    scope: ['profile', 'email'], // Make sure email is included in the scope
},
async function(accessToken, refreshToken, profile, cb) {
    try {
        // Get the email from the profile, if available, otherwise use a fallback email
        const email = profile.emails?.[0]?.value || `noemail-${profile.id}@google.com`;
        console.log(profile)
        const user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            // If the user already exists, pass it to the callback
            return cb(null, user);
        } else {
            // If the user doesn't exist, create a new one
            const newUser = new User({
                googleId: profile.id,
                email: email, // Assign the email
            });

            await newUser.save();
            return cb(null, newUser);  // Pass new user to callback
        }
    } catch (err) {
        return cb(err); // Handle any errors
    }
}));


connectDB();

//---------------------------------------------------

app.get("/", async (req, res) => {
    res.render("home.ejs", {});
});

app.get("/auth/google",  passport.authenticate("google", { scope: ['profile', 'email'] }));

app.get("/auth/google/secrets", 
    passport.authenticate("google", { 
        failureRedirect: "/login" 
    }),
    (req, res) => {
        // If successful, redirect to the secrets page
        res.redirect("/secrets");
    }
);


app.get("/submit", async (req, res) => {
    if (req.isAuthenticated()) {
        res.render("submit.ejs");
    } else {
        res.redirect("/login");
    }
});

app.post("/submit", async (req, res) => {
    try {
        const secret = req.body.secret;
        const foundUser = await User.findById(req.user.id);
        if (!foundUser) {
            console.error("Error user not found");
            return res.redirect("/login"); 
        } else {
            foundUser.secret = secret;
            await foundUser.save();
            res.redirect("secrets");
        }
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Error registering user.");
    }
});

app.get("/secrets", async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const usersWithSecrets = await User.find({ secret: { $exists: true, $ne: null } });
            res.render("secrets.ejs", { usersWithSecrets: usersWithSecrets });
        } else {
            res.redirect("/login");
        }

    } catch (error) {
        console.error("Error fetching secrets:", error);
        res.status(500).send("Error fetching secrets.");
    }

});

app.get("/register", async (req, res) => {
    res.render("register.ejs", {});
});

app.get("/login", async (req, res) => {
    res.render("login.ejs", {});
});

app.get("/logout", async (req, res, next) => {
    await req.logout((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return next(err);
        }
        res.redirect("/");
    });
});

app.post("/register", async (req, res) => {
    try {
        const user = await User.register(
            { email: req.body.email },
            req.body.password
        );

        req.login(user, (err) => {
            if (err) {
                console.error("Error logging in user after registration:", err);
                return res.redirect("/register"); 
            }
            return res.redirect("/secrets");
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Error registering user.");
    }
});

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("Error during login:", err);
            return res.status(500).send("Error during login.");
        }
        if (!user) {
            console.warn("Login failed:", info.message);
            return res.redirect("/login"); // Redirect back to login if authentication fails
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error("Error logging in user:", err);
                return res.status(500).send("Error logging in user.");
            }
            return res.redirect("/secrets"); // Redirect to the secrets page on successful login
        });
    })(req, res, next);
});
//---------------------------------------------------

app.listen(port, function() {
    console.log(`App is running on port ${port}`);
});