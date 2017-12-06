import * as passport from "passport";
import * as request from "request";
import * as passportLocal from "passport-local";
import * as passportHttp from "passport-http";
import { Request, Response, NextFunction } from "express";

import { default as User } from "../models/User";

const LocalStrategy = passportLocal.Strategy;
const BasicStrategy = passportHttp.BasicStrategy;

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});


/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: `Email ${email} not found.` });
    }
    user.comparePassword(password, (err: Error, isMatch: boolean) => {
      if (err) {
        return done(err);
      }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { message: "Invalid email or password." });
    });
  });
}));

/**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

/**
 * Basic Auth
 */
passport.use(new BasicStrategy((email, password, callback) => {
  User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback({ status: 401, message: `Email ${email} not found.` });
    }
    user.comparePassword(password, (err: Error, isMatch: boolean) => {
      if (err) {
        return callback(err);
      }
      if (isMatch) {
        return callback(null, user);
      }
      return callback({ status: 401, message: "Invalid email or password." });
    });
  });
}));

/**
 * API Auth middleware.
 */
export const isApiAuthenticated = passport.authenticate("basic", {session: false});
