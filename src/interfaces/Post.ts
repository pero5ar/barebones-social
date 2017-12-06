import * as mongoose from "mongoose";
import { TimestampModel } from "./Base";

export interface CommentModel extends mongoose.Document, TimestampModel {
  userId: mongoose.Types.ObjectId;
  text: string;
}

interface Array<CommentModel> {
  id: Function;
  push: Function;
}

export interface PostModel extends mongoose.Document, TimestampModel {
  userId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  title: string;
  tags: string[];
  text: string;
  comments: Array<CommentModel>;
}