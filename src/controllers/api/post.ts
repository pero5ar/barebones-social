import { Request, Response, NextFunction } from "express";
import { WriteError } from "mongodb";
import * as mongoose from "mongoose";

import { CommentModel, PostModel } from "../../interfaces/Post";
import Post, { Comment } from "../../models/Post";

import { isValidObjectId } from "../../utils/validator.utils";

/**
 * POST /api/posts
 */
export const createPost = (req: Request, res: Response, next: NextFunction) => {
  const { userId, groupId, title, tags, text } = req.body;

  if (!(userId && title && text)) {
    return res.status(400).type("text/plain").send("One ore more of the following required fields are empty: userId, title and text");
  }

  if (!isValidObjectId(userId)) {
    return res.status(400).type("text/plain").send("Invalid ObjectId value.");
  }

  const post = new Post({
    userId: mongoose.Types.ObjectId(userId),
    groupId: groupId && mongoose.Types.ObjectId(groupId),
    title,
    tags,
    text,
    comments: []
  });

  Post.findOne({ userId: (post as PostModel).userId, title, text }, (err, existingPost) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (existingPost) {
      return res.status(400).type("text/plain").send("Post already exists.");
    }
    post.save((err: WriteError) => {
      if (err) {
        return res.status(500).type("text/plain").send(err.errmsg);
      }
      res.sendStatus(201);
    });
  });
};

/**
 * GET /api/posts?userId=...&title=...&tag=...
 */
export const getPosts = (req: Request, res: Response, next: NextFunction) => {
  const { userId, title, tag } = req.query;

  if (userId && !isValidObjectId(userId)) {
    return res.status(400).type("text/plain").send("Invalid ObjectId value.");
  }

  let query = userId ? { userId: mongoose.Types.ObjectId(userId) } : {};
  query = title ? { ...query, title: new RegExp(title, "i") } : query;
  query = tag ? { ...query, tags: tag } : query;

  Post.find(query, (err, posts) => err ? res.sendStatus(500) : res.json(posts));
};

/**
 * GET /api/posts/:postId
 */
export const getPost = (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    return res.status(400).type("text/plain").send("Invalid ObjectId value.");
  }

  Post.findById(postId, (err, post) => err ? res.sendStatus(500) : !post ? res.sendStatus(404) : res.json(post));
};

/**
 * PUT /api/posts/:postId
 */
export const updatePost = (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const { userId, groupId, title, tags, text } = req.body;

  if (!isValidObjectId(postId) || (userId && !isValidObjectId(userId))) {
    return res.status(400).type("text/plain").send("Invalid ObjectId value.");
  }

  let update = userId ? { userId: mongoose.Types.ObjectId(userId) } : {};
  update = title ? { ...update, title } : update;
  update = tags ? { ...update, tags } : update;
  update = text ? { ...update, text } : update;

  Post.findByIdAndUpdate(postId, update, (err, post) => err ? res.sendStatus(500) : !post ? res.sendStatus(404) : res.sendStatus(200));
};

/**
 * DELETE /api/posts/:postId
 */
export const deletePost = (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    return res.status(400).type("text/plain").send("Invalid ObjectId value.");
  }

  Post.findByIdAndRemove(postId, (err, post) => err ? res.sendStatus(500) : !post ? res.sendStatus(404) : res.sendStatus(200));
};

/**
 * POST /api/posts/:postId/comments
 */
export const createComment = (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const { userId, text } = req.body;

  if (!(userId && text)) {
    return res.status(400).type("text/plain").send("One ore more of the following required fields are empty: userId and text.");
  }

  if (!isValidObjectId(postId) || !isValidObjectId(userId)) {
    return res.status(400).type("text/plain").send("Invalid ObjectId value.");
  }

  const comment = new Comment({
    userId: mongoose.Types.ObjectId(userId),
    text
  });

  Post.findById(postId, (err, post: PostModel) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!post) {
      return res.status(404).type("text/plain").send("Post does not exist.");
    }
    post.comments.push(comment as CommentModel);
    post.save((err: WriteError) => {
      if (err) {
        return res.status(500).type("text/plain").send(err.errmsg);
      }
      res.sendStatus(201);
    });
  });
};

/**
 * GET /api/posts/:postId/comments
 */
export const getComments = (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    return res.status(400).type("text/plain").send("Invalid ObjectId value.");
  }

  Post.findById(postId, (err, post: PostModel) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!post) {
      return res.status(404).type("text/plain").send("Post does not exist.");
    }
    res.json(post.comments);
  });
};

/**
 * GET /api/posts/:postId/comments/:commentId
 */
export const getComment = (req: Request, res: Response, next: NextFunction) => {
  const { postId, commentId } = req.params;

  if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
    return res.status(400).type("text/plain").send("Invalid ObjectId value.");
  }

  Post.findById(postId, (err, post: PostModel) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!post) {
      return res.status(404).type("text/plain").send("Post does not exist.");
    }
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).type("text/plain").send("Comment does not exist.");
    }
    res.json(comment);
  });
};

/**
 * PUT /api/posts/:postId/comments/:commentId
 */
export const updateComment = (req: Request, res: Response, next: NextFunction) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;

  if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
    return res.status(400).type("text/plain").send("Invalid ObjectId value.");
  }

  Post.findOneAndUpdate({ "_id": postId, "comments._id": commentId }, { "comments.$.text": text }, (err, post: PostModel) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!post) {
      return res.sendStatus(404);
    }
    res.sendStatus(200);
  });
};

/**
 * DELETE /api/posts/:postId/comments/:commentId
 */
export const deleteComment = (req: Request, res: Response, next: NextFunction) => {
  const { postId, commentId } = req.params;

  if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
    return res.status(400).type("text/plain").send("Invalid ObjectId value.");
  }

  Post.findById(postId, (err, post: PostModel) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!post) {
      return res.status(404).type("text/plain").send("Post does not exist.");
    }
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).type("text/plain").send("Comment does not exist.");
    }
    comment.remove();
    post.save();
    res.sendStatus(200);
  });
};