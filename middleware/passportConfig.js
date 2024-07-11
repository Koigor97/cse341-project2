const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/userModel'); // Adjust the path if necessary

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create a user based on their GitHub profile
        let user = await User.findOne({ githubId: profile.id });
        // console.log(profile);

        if (!user) {
          user = await User.create({
            githubId: profile.id,
            name: profile.displayName || profile.login,
            email:
              profile.emails && profile.emails.length
                ? profile.emails[0].value
                : undefined,
            image:
              profile.photos && profile.photos.length
                ? profile.photos[0].value
                : undefined
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

module.exports = passport;
