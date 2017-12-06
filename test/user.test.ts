// During the test the env variable is set to test
process.env.NODE_ENV = "test";

import * as mocha from "mocha";
import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as server from "../src/server";

chai.use(chaiHttp);
const expect = chai.expect;

const _user = {
  email: "tmp123@test.com",
  password: "tmp123"
};
const _user2 = {
  email: "tmp321@test.com",
  password: "tmp321"
};

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
        console.log("error 1");
        throw err;
      });
  });
});

describe("POST /api/login", () => {
  it("should return User object", () => {
    chai.request(server)
      .post("/api/login")
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.all.keys("email", "_id");
      })
      .catch(err => {
        console.log("error 3");
      });
  });
});

describe("GET /api/users", () => {
  it("should return User object", () => {
    return chai.request(server)
      .get("/api/users")
      .query({email: _user.email})
      .auth(_user.email, _user.password)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.all.keys("email", "_id");
      })
      .catch(err => {
        console.log("error 4");
      });
  });
  it("should return User object with correct data", () => {
    return chai.request(server)
      .get("/api/user")
      .query({email: _user.email})
      .auth(_user.email, _user.password)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.all.keys("email", "_id");
        expect(res.body.email).to.equal(_user.email);
      })
      .catch(err => {
        console.log("error 5");
      });
  });
});

describe("PUT /api/users", () => {
  it("should return status 200", () => {
    const newUser = { ..._user, confirmPassword: _user.password, profile: { name: "tmp" } };
    chai.request(server)
      .put("/api/users")
      .send(newUser)
      .auth(_user.email, _user.password)
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        console.log("error 6");
      });
  });
  it("should return status 201", () => {
    const newUser = { ..._user2, confirmPassword: _user2.password };
    chai.request(server)
      .put("/api/user")
      .send(newUser)
      .auth(_user.email, _user.password)
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        console.log("error 7");
      });
  });
});

describe("DELETE /api/users", () => {
  it("should return status 200", () => {
    chai.request(server)
      .del("/api/users")
      .query({email: _user.email})
      .auth(_user.email, _user.password)
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        console.log("error 8");
      });
  });
  it("should return status 200", () => {
    chai.request(server)
      .del("/api/users")
      .query({email: _user2.email})
      .auth(_user.email, _user.password)
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        console.log("error 9");
      });
  });
  it("should return status 404", () => {
    chai.request(server)
      .del("/api/user")
      .query({email: _user.email})
      .auth(_user.email, _user.password)
      .then(res => {
        expect(res).to.have.status(404);
      })
      .catch(err => {
        console.log("error 10");
      });
  });
});
