// During the test the env variable is set to test
process.env.NODE_ENV = "test";

import * as mocha from "mocha";
import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as server from "../src/server";

// FIX-ME

chai.use(chaiHttp);
const expect = chai.expect;

const _user = {
  email: "tmp123@test.com",
  password: "tmp123"
};
const _post = {
  userId: "5a266bd64765b940ec7e8765",
  title: "My first post",
  tags: ["general", "first"],
  text: "This is my first Post"
};
let _postId: any;

describe("POST /api/users", () => {
  it("should return status 201", () => {
    const newUser = { ..._user, confirmPassword: _user.password };
    return chai.request(server)
      .post("/api/users")
      .send(_user)
      .then(res => {
        expect(res).to.have.status(201);
      })
      .catch(err => {
        console.log("error 1.1");
      });
  });
});

describe("POST /api/posts", () => {
  it("should return status 201", () => {
    const newUser = { ..._user, confirmPassword: _user.password };
    return chai.request(server)
      .post("/api/posts")
      .send(_post)
      .auth(_user.email, _user.password)
      .then(res => {
        expect(res).to.have.status(201);
      })
      .catch(err => {
        console.log("error 1.2");
      });
  });
});

describe("GET /api/posts", () => {
  it("should return Post objects", () => {
    chai.request(server)
      .get("/api/post")
      .query({userId: _post.userId})
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("array");
        console.log(res);
      })
      .catch(err => {
        console.log("error 1.3");
      });
  });
});
