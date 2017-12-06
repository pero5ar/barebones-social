import * as async from "async";
import * as crypto from "crypto";
import * as passport from "passport";
import { Request, Response, NextFunction } from "express";
import { LocalStrategyInfo } from "passport-local";
import { WriteError } from "mongodb";
import { error } from "util";

import { UserModel } from "../../interfaces/User";
import User from "../../models/User";

/**
 * POST /api/login
 * Get user details using email and password.
 */
export const login = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password cannot be blank").notEmpty();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.sendStatus(400);
  }

  passport.authenticate("local", (err: Error, user: UserModel, info: LocalStrategyInfo) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!user) {
      return res.status(404).send(info.message);
    }
    res.status(200).json(user);
  })(req, res, next);
};

/**
 * POST /api/users
 */
export const create = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
  req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.sendStatus(400);
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    profile: req.body.profile && {
      name: req.body.profile.name,
      gender: req.body.profile.gender,
      location: req.body.profile.gender
    }
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (existingUser) {
      return res.status(400).type("text/plain").send("Account with that email address already exists.");
    }
    user.save((err: WriteError) => {
      if (err) {
        return res.status(500).type("text/plain").send(err.errmsg);
      }
      res.sendStatus(201);
    });
  });
};

/**
 * PUT /api/users
 * If new resource, same as POST
 */
export const update = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
  req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.sendStatus(400);
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    profile: req.body.profile && {
      name: req.body.profile.name,
      gender: req.body.profile.gender,
      location: req.body.profile.gender
    }
  });

  User.findOne({ email: req.body.email }, (err, existingUser: UserModel) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (existingUser) {
      const newUser = user as UserModel;
      existingUser.password = newUser.password || existingUser.password;
      existingUser.profile = { ...existingUser.profile, ...newUser.profile };

      existingUser.save((err: WriteError) => {
        if (err) {
          return res.status(500).type("text/plain").send(err.errmsg);
        }
        res.sendStatus(200);
      });
      return;
    }
    user.save((err: WriteError) => {
      if (err) {
        return res.status(500).type("text/plain").send(err.errmsg);
      }
      res.sendStatus(201);
    });
  });
};

/**
 * GET /api/users?email=...
 */
export const findByEmail = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.query;

  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) {
      return res.sendStatus(500);
    }
    return user;
  }).then((user) => {
    if (!user) {
      res.sendStatus(404);
    }
    res.status(200).json(user);
  });
};

/**
 * DELETE /api/users?email=...
 */
export const deleteByEmail = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.query;

  User.findOneAndRemove({ email: email.toLowerCase() }, (err, user) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!user) {
      return res.sendStatus(404);
    }
    res.sendStatus(200);
  });
};
