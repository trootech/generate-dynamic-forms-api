const supertest = require("supertest");
const app = require("../app");

describe('Authentication api', () => {

    describe('POST /auth/signup', () => {
        // test("It should create new user using POST method ", async () => {
        //   const payload = {
        //     "name": "steven",
        //     "email": "steven@123.com",
        //     "password": "MTIzNA==",
        //     "roles": "user"
        //   };

        //   await supertest(app).post("/auth/signup")
        //     .send(payload)
        //     .expect(200)
        //     .then((response) => {
        //       expect(response).toBeTruthy();
        //       expect(response.statusCode).toBe(200);
        //       expect(response._body).toHaveProperty("message");

        //     });
        // });
        test("It should NOT POST with same name", async () => {
          const payload = {
            "name": "matt",
            "email": "ken@123.com",
            "password": "MTIzNA==",
            "roles": "user"
          };
            await supertest(app).post("/auth/signup")
              .send(payload)
              .expect(400)
              .then((response) => {
                expect(response).toBeTruthy();
                expect(response.statusCode).toBe(400);
              });
          });

          test("It should NOT POST with same email", async () => {
          const payload = {
            "name": "matt123",
            "email": "matt@123.com",
            "password": "MTIzNA==",
            "roles": "user"
          };
            await supertest(app).post("/auth/signup")
              .send(payload)
              .expect(400)
              .then((response) => {
                expect(response).toBeTruthy();
                expect(response.statusCode).toBe(400);
              });
          });
    });


    describe('POST /auth/signin', () => {
      test("It should signin using POST method ", async () => {
        const payload = {
          "email": "steph@1234.com",
          "password": "MTIzNA==",
        };

        await supertest(app).post("/auth/signin")
          .send(payload)
          .expect(200)
          .then((response) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            expect(response._body).toBeInstanceOf(Object);
            expect(response._body).toHaveProperty("success");
            expect(response._body).toHaveProperty("refreshToken");
            expect(response._body).toHaveProperty("accessToken");
            expect(response._body).toHaveProperty("roles");
            expect(response._body).toHaveProperty("email");
            expect(response._body.success).toEqual(true);
          });
      });

      test("It should NOT POST with wrong password in signin", async () => {
        const payload = {
          "email": "steph@1234.com",
          "password": "12345678",
        };
          await supertest(app).post("/auth/signin")
            .send(payload)
            .expect(401)
            .then((response) => {
              expect(response).toBeTruthy();
              expect(response.statusCode).toBe(401);
            });
        });

        test("It should NOT POST with wrong email in signin", async () => {
          const payload = {
            "email": "steph@adm.com",
            "password": "1234",
          };
          await supertest(app).post("/auth/signin")
            .send(payload)
            .expect(404)
            .then((response) => {
              expect(response).toBeTruthy();
              expect(response.statusCode).toBe(404);
            });
        });
    });

    describe('POST /auth/changepassword', () => {
      test("It should change password using POST method ", async () => {
        const payload = {
          "email": "ketty@123.com",
          "password": "MTIzNA==",
        };

        await supertest(app).post("/auth/changepassword")
          .send(payload)
          .expect(200)
          .then((response) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            expect(response._body.success).toEqual(true);
          });
      });

      test("It should NOT POST with wrong email in change password", async () => {
        const payload = {
          "email": "ketty@1244.com",
          "password": "12345678",
        };
          await supertest(app).post("/auth/changepassword")
            .send(payload)
            .expect(404)
            .then((response) => {
              expect(response).toBeTruthy();
              expect(response.statusCode).toBe(404);
            });
        });


    });




});