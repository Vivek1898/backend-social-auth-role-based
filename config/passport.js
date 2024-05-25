const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const GithubStrategy = require("passport-github2").Strategy;
// const FacebookStrategy = require("passport-facebook").Strategy;
const {Octokit} = require("octokit");


module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/auth/google/callback",
                proxy: true
            },
            async (accessToken, refreshToken, profile, done) => {
                const email = profile.emails[0].value;
                const newUser = {
                    googleId: profile.id,
                    githubId: "",
                    displayName: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    emailId: email,
                };

                try {
                    let user = await User.findOne({emailId: profile.emails[0].value});

                    if (user && user.googleId) {
                        done(null, user);
                    } else if (!user) {
                        user = await User.create(newUser);
                        done(null, user);
                    } else {
                        user = await User.findOneAndUpdate(
                            {emailId: email},
                            {
                                $set: {
                                    googleId: profile.id,
                                    firstName: profile.name.givenName,
                                    lastName: profile.name.familyName,
                                },
                            },
                            {new: true}
                        );
                        done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        )
    );
    passport.use(
        new GithubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: "/auth/github/callback",
                proxy: true
            },
            async function (accessToken, refreshToken, profile, done) {
                const octokit = new Octokit({auth: accessToken});
                const emails = await octokit.request("GET /user/emails", {});
                const email = emails.data[0].email;

                const newUser = {
                    googleId: "",
                    githubId: profile.id,
                    displayName: profile.displayName,
                    //cut name into first and last name
                    firstName: profile.displayName.split(" ")[0] || "",

                    lastName: "",
                    emailId: email,
                };

                try {
                    let user = await User.findOne({emailId: email});
                    if (user && user.githubId) {
                        done(null, user);
                    } else if (!user) {
                        user = await User.create(newUser);
                        await user.save();
                        done(null, user);
                    } else {
                        user = await User.findOneAndUpdate(
                            {emailId: email},
                            {$set: {githubId: profile.id}},
                            {new: true}
                        );

                        done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        )
    );
    // passport.use(
    //   new FacebookStrategy(
    //     {
    //       clientID: process.env.FACEBOOK_CLIENT_ID,
    //       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    //       callbackURL: "/auth/facebook/callback",
    //     },
    //     async function (accessToken, refreshToken, profile, done) {}
    //   )
    // );
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};
