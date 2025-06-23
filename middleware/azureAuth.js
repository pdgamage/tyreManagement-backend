const passport = require("passport");
const BearerStrategy = require("passport-azure-ad").BearerStrategy;
const pool = require("../config/db");

const options = {
  identityMetadata: `https://login.microsoftonline.com/a92cbcff-6e56-42ae-9e7f-742431739e80/v2.0/.well-known/openid-configuration`,
  clientID: "bca262cc-e31e-460e-b9b2-342fac6536ff",
  validateIssuer: true,
  loggingLevel: "info",
  passReqToCallback: false,
};

passport.use(
  new BearerStrategy(options, async (token, done) => {
    try {
      // Check if user exists in MySQL
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE azure_id = ?",
        [token.oid]
      );
      if (rows.length === 0) {
        return done(null, false, { message: "User not allowed" });
      }
      // Attach user info from DB
      return done(null, rows[0]);
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;
