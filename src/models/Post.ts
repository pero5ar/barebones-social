import * as mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  groupId: Number,
  title: String,
  tags: [String],
  text: String,
  comments: [commentSchema]
}, { timestamps: true });

export const Comment = mongoose.model("Comment", commentSchema);
const Post = mongoose.model("Post", postSchema);
export default Post;