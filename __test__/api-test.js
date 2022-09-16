let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');

chai.should();
chai.use(chaiHttp);

describe('Dynamic form API', () => {

    // Test the Get route.
    describe("GET /forms/all", () => {
        it("It should Get all the forms", (done) => {
            chai.request('http://localhost:5000')
                .get('/forms/all')
                .end((err, response) => {
                    response.should.have.status(200);
                    (response.body).should.be.a('object');
                    (response.body).message.should.equal("Record\'s Found");
                    (response.body).data.length.should.be.greaterThan(0);
                    done();
                });
        });

        it("It should NOT Get all the forms", (done) => {
            chai.request('http://localhost:5000')
                .get('/forms/alls')
                .end((err, response) => {
                    response.should.have.status(404);
                    done();
                });
        });
    });

    describe("GET /forms/by/", () => {
        it("It should Get all the forms by ID", (done) => {
            const formId = '63031746afeb8e0415303ad7';
            chai.request('http://localhost:5000')
                .get('/forms/by/?id='+ formId)
                .end((err, response) => {
                    response.should.have.status(200);
                    (response.body).should.be.a('object');
                    (response.body).data.should.have.property('_id');
                    (response.body).data.should.have.property('form_name');
                    (response.body).data.should.have.property('form_key');
                    (response.body).data.should.have.property('fields_id');
                    (response.body).data.should.have.property('_id').equal(formId);
                    done();
                });
        });

        it("It should NOT Get all the forms by ID", (done) => {
            const formId = '63031746afeb8e041530dfg4df';
            chai.request('http://localhost:5000')
                .get('/forms/by/?id='+ formId)
                .end((err, response) => {
                    response.should.have.status(500);
                    (response.body).should.have.property("message");
                    done();
                });
        });
    });


    describe("POST /forms/create", () => {
        // it("It should POST new form", (done) => {
        //     const payload = {"form_name":"signUp","form_key":"sdCdFXNUE2MPBZga1333","submitButtonName":"Submit","fields":[{"fieldId":1,"field_name":"email","field_label":"Email","field_type":"email","validation":{"required":true}}]};
        //     chai.request('http://localhost:5000')
        //         .post('/forms/create')
        //         .send(payload)
        //         .end((err, response) => {
        //             response.should.have.status(200);
        //             (response.body).should.be.a('object');
        //             (response.body).should.have.property("message");
        //             (response.body).message.should.equal("Record added successfully");
        //             done();
        //         });
        // });

        it("It should NOT POST new form with same form key", (done) => {
            const payload = {"form_name":"signUp","form_key":"sdCdFdsadsaXNUE2MPBZga","submitButtonName":"Submit","fields":[{"fieldId":1,"field_name":"email","field_label":"Email","field_type":"email","validation":{"required":true}}]};
            chai.request('http://localhost:5000')
                .post('/forms/create')
                .send(payload)
                .end((err, response) => {
                    response.should.have.status(422);
                    (response.body).should.have.property("error");
                    (response.body).error.should.equal("This Form key is already exists...");
                    done();
                });
        });
    });

    describe("PUT /forms/update", () => {
        it("It should PUT update the form", (done) => {
            const payload = {"_id":"6304bb5ce4e22dc2bad8f768","form_name":"SignUp","form_key":"sdCdFXNUE2MPBZga","submitButtonName":"Submit","fields":[{"_id":"6304bb5ce4e22dc2bad8f766","field_label":"Email","field_name":"email","field_type":"email","required":false,"order":1,"iseditable":false,"isvisibletolist":false,"field_values":[],"validation":{"required":true}}]};
            chai.request('http://localhost:5000')
                .post('/forms/update')
                .send(payload)
                .end((err, response) => {
                    response.should.have.status(200);
                    (response.body).should.be.a('object');
                    (response.body).should.have.property("message");
                    (response.body).message.should.equal("Record updated successfully");
                    done();
                });
        });

        it("It should NOT PUT update the form without Id", (done) => {
            const payload = {"form_name":"SignUp","form_key":"sdCdFXNUE2MPBZga","submitButtonName":"Submit","fields":[{"_id":"6304bb5ce4e22dc2bad8f766","field_label":"Email","field_name":"email","field_type":"email","required":false,"order":1,"iseditable":false,"isvisibletolist":false,"field_values":[],"validation":{"required":true}}]};
            chai.request('http://localhost:5000')
                .post('/forms/update')
                .send(payload)
                .end((err, response) => {
                    response.should.have.status(422);
                    (response.body).should.have.property("error");
                    (response.body).error.should.equal("Form id is required...");

                    done();
                });
        });
    });

});
