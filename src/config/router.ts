import * as express from "express";

import * as passport from "./passport";
import * as userController from "../controllers/api/user";
import * as postController from "../controllers/api/post";

const router = express.Router();

router.route("/api/login")
  .post(userController.login);

router.route("/api/users")
  .post(userController.create)
  .get(passport.isApiAuthenticated, userController.findByEmail)
  .put(passport.isApiAuthenticated, userController.update)
  .delete(passport.isApiAuthenticated, userController.deleteByEmail);

router.route("/api/posts")
  .post(passport.isApiAuthenticated, postController.createPost)
  .get(passport.isApiAuthenticated, postController.getPosts);

router.route("/api/posts/:postId")
  .get(passport.isApiAuthenticated, postController.getPost)
  .put(passport.isApiAuthenticated, postController.updatePost)
  .delete(passport.isApiAuthenticated, postController.deletePost);

router.route("/api/posts/:postId/comments")
  .post(passport.isApiAuthenticated, postController.createComment)
  .get(passport.isApiAuthenticated, postController.getComments);

router.route("/api/posts/:postId/comments/:commentId")
  .get(passport.isApiAuthenticated, postController.getComment)
  .put(passport.isApiAuthenticated, postController.updateComment)
  .delete(passport.isApiAuthenticated, postController.deleteComment);

export default router;