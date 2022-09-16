const Form = require("../models/forms.model");
const FormEntriesModel = require("../models/formsDataEntriesnew.model");
const mongoose = require("mongoose");
const supertest = require("supertest");
const index = require("../app");
var Buffer = require('buffer/').Buffer;

describe('Dynamic form API', () => {

  let token = null;
  let formId = null;
  let formKey = null;
  beforeAll(async () => {
    const response = await supertest(index)
      .post('/auth/signin')
      .send({
        email: 'admin@admin.com',
        password: Buffer.from('12345678').toString('base64')
      });
    token = response._body.accessToken;

  });

  function randomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
      return result;
  }

  describe('POST /forms/create', () => {
    test("It should POST new form", async () => {
      formKey = randomString(16);
      const payload = {"form_name":"signUp","form_key":formKey,"submitButtonName":"Submit","fields":[{"fieldId":1,"field_name":"email","field_label":"Email","field_type":"email","validation":{"required":true}}]};

      await supertest(index).post("/forms/create")
        .send(payload)
        .set('x-access-token', token)
        .expect(200)
        .then(async (response) => {
          expect(response).toBeTruthy();
          expect(response.statusCode).toBe(200);
          expect(response.body).toBeInstanceOf(Object);
          expect(response.body).toHaveProperty("message");
          expect(response.body.message).toEqual("Record added successfully");
        });
    });
    test("It should NOT POST new form with same form key", async () => {
        let payload = {"form_name":"signUp","form_key":formKey, "submitButtonName":"Submit","fields":[{"fieldId":1,"field_name":"email","field_label":"Email","field_type":"email","validation":{"required":true}}]};

        await supertest(index).post("/forms/create")
          .send(payload)
          .set('x-access-token', token)
          .expect(422)
          .then(async (response) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(422);
            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toEqual("This Form key is already exists...");
          });
      });
  });


  describe('Get /forms/all', () => {
    test("It should Get all the forms", async () => {
        await supertest(index).get("/forms/all")
            .set('x-access-token', token)
            .expect(200)
            .then((response) => {
                expect(response).toBeTruthy();
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeInstanceOf(Object);
                expect(response.body.message).toEqual("Record\'s Found");
                expect(response.body.data.length).toBeGreaterThan(0);
                formId = (response.body.data[response.body.data.length-1]._id);
            });
    });

    test("It should NOT Get all the forms", async () => {
      await supertest(index).get("/forms/alls")
          .set('x-access-token', token)
          .expect(404)
          .then((response) => {
              expect(response).toBeTruthy();
              expect(response.statusCode).toBe(404);
          });
    });
});

  describe('GET /forms/by/', () => {
    test("It should Get the forms by ID", async () => {
        // const formId = '6318795855ae0916a6891771';
        await supertest(index).get('/forms/by/?id='+ formId)
          .expect(200)
          .then(async (response) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.data).toHaveProperty("_id");
            expect(response.body.data).toHaveProperty("form_name");
            expect(response.body.data).toHaveProperty("form_key");
            expect(response.body.data).toHaveProperty("fields_id");
            expect(response.body.data).toMatchObject({_id: formId});
          });
      });

      test("It should NOT Get the forms by ID", async () => {
        // const formId = '63031746afeb8e0415303ad700';
        await supertest(index).get("/forms/by/?id="+(formId+'000'))
            .expect(500)
            .then((response) => {
                expect(response).toBeTruthy();
                expect(response.statusCode).toBe(500);
                expect(response.body).toHaveProperty("message");
            });
      });
  });



  describe("PUT /forms/update", () => {

    test("It should PUT update the form", async () => {

      const payload = {"_id": formId.toString(),"form_name":"signUp","form_key":formKey.toString(), "submitButtonName":"Submit","fields":[]}
      await supertest(index).post("/forms/update")
        .send(payload)
        .set('x-access-token', token)
        .expect(200)
        .then(async (response) => {
          // expect(response).toBeTruthy();
          expect(response.statusCode).toBe(200);
          // expect(response.body).toHaveProperty("message");
          // expect(response.body.message).toEqual("Record updated successfully");
        })
    })

    test("It should NOT PUT update the form", async () => {
        let payload = {"form_name":"signUp1","form_key":formKey, "submitButtonName":"Submit","fields":[]}
        await supertest(index).post("/forms/update")
          .send(payload)
          .set('x-access-token', token)
          .expect(422)
          .then(async (response) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(422);
            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toEqual("Form id is required...");
          });
      });
  });

describe("Delete /forms/deleteForm/", () => {
     test("It should Delete the form", async () => {

          await supertest(index).delete("/forms/deleteForm/?id="+ formId)
            .set('x-access-token', token)
            .expect(200)
            .then(async (response) => {
              expect(response).toBeTruthy();
              expect(response.statusCode).toBe(200);
              expect(response.body).toHaveProperty("message");
              expect(response.body.message).toEqual("Form deleted successfully!");
            });
        });

      test("It should NOT Delete the form", async () => {

        await supertest(index).delete("/forms/deleteForm/?id="+ (formId + '000'))
          .set('x-access-token', token)
          .expect(500)
          .then(async (response) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(500);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toEqual(`Could not delete form with id=${(formId + '000')}`);
          });
      });
  });

  describe('Get /forms/GetAllFormEntriesNew', () => {
    test("It should Get All FormEntriesNew", async () => {
        await supertest(index).get("/forms/GetAllFormEntriesNew")
            .set('x-access-token', token)
            .expect(200)
            .then((response) => {
                expect(response).toBeTruthy();
                expect(response.statusCode).toBe(200);
            });
    });
  });

  describe('GET /forms/GetEntriesById', () => {
    test("It should Get the formsentries by ID", async () => {
        // const formId = '6318795855ae0916a6891771';
        await supertest(index).get('/forms/by/?id='+ formId)
          .set('x-access-token', token)
          .expect(200)
          .then(async (response) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);

          });
      });
  });

  describe('POST /forms/savedetailsnew', () => {
      // test("It should Post new form entries", async () => {
      //   let newdata =  {}
      //   newdata.form_id = "63031746afeb8e0415303ad7";
      //   newdata.value = {"employeename":"darshit","lastname":"12345678","employee-designation":"tl","gender":"male","employee_Profile":"C:\\fakepath\\170249.jpg","language":{"gujarati":true,"hindi":"","english":""},"technology":[{"value_name":"angular","value_text":"Angular"},{"value_name":"laravel","value_text":"Laravel"}]};
      //   newdata.imagename = 'employee_Profigdfgdfgle';
      //   newdata.image = '';
      //     await supertest(index).post("/forms/savedetailsnew")
      //       .send(newdata)
      //       .expect(200)
      //       .then(async (response) => {
      //         expect(response).toBeTruthy();
      //         expect(response.statusCode).toBe(200);

      //       });
      //   });
  });
  describe('POST /forms/UpdateEntries', () => {
      // test("It should Update exisiting form entry", async () => {
      //   let newdata =  {}
      //   newdata._id = "6304a01ce4e22dc2bad8f6ed";
      //   newdata.form_id = "63049fc4e4e22dc2bad8f6e4";
      //   newdata.entry_id = "6304a01ce4e22dc2bad8f6eb";
      //   newdata.value = {"employeename":"darshitsirtrootech","lastname":"12345678","employee-designation":"tl","gender":"male","employee_Profile":"C:\\fakepath\\sell_landscape_photography_online.jpeg","language":{"gujarati":true,"hindi":"","english":""},"technology":[{"value_name":"angular","value_text":"Angular"},{"value_name":"laravel","value_text":"Laravel"}]}
      //   newdata.imagename = 'employee_Profigdfgdfgle';
      //   newdata.image = '';
      //     await supertest(index).put("/forms/UpdateEntries")
      //       .send(newdata)
      //       .expect(200)
      //       .then(async (response) => {
      //         expect(response).toBeTruthy();
      //         expect(response.statusCode).toBe(200);

      //       });
      //   });
  });

  describe("Delete /forms/DeleteEntries", () => {
      // test("It should Delete the form", async () => {
      //     const entry_id = "6304a01ce4e22dc2bad8f6ed"
      //     await supertest(index).delete("/forms/DeleteEntries/?entry_id="+ entry_id)
      //       .send(entry_id)
      //       .expect(200)
      //       .then(async (response) => {
      //         expect(response).toBeTruthy();
      //         expect(response.statusCode).toBe(200);

      //       });
      //   });
  });




});
