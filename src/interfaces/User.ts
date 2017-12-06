import * as mongoose from "mongoose";
import { TimestampModel } from "./Base";

export type AuthToken = {
  accessToken: string,
  kind: string
};

export interface UserModel extends mongoose.Document, TimestampModel {
  email: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: Date;

  tokens: AuthToken[];

  profile: {
    name: string,
    gender: string,
    location: string
  };

  groups: string[];

  comparePassword: (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;
}