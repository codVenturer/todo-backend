import chai from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';
import {TodoItem} from '../../../src/models';
import {App} from '../../../src/server';
import {respositoryContext, testAppContext} from '../../mocks/app-context';

chai.use(chaiHttp);
const expect  = chai.expect;
let expressApp: Application;

before(async () => {
  await respositoryContext.store.connect();
  const app = new App(testAppContext);

  app.initializeMiddlewares();
  app.initializeControllers();
  app.initializeErrorHandling();

  expressApp = app.expressApp;
});

describe("POST /todo", () => {
  it("should create a new todo item", async () => {
    const res = await chai
      .request(expressApp)
      .post("/todos")
      .send({
        title: "Todo Item"
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("title");
  });

  it("should not allow blank title", async() => {
    const res = await chai
      .request(expressApp)
      .post("/todos")
      .send({
        title: ""
      });
    
    expect(res).to.have.status(400);
    expect(res.body).to.have.property("message");
    expect(res.body).to.have.nested.property("failures[0].message").to.equal("Please enter a valid todo item");
  });

  it("should not allow duplicate title", async () => {
    await testAppContext.todoRepository.save(new TodoItem({
      title: "Duplicate Check Todo Item"
    }));

    const res = await chai
      .request(expressApp)
      .post("/todos")
      .send({
        title: "Duplicate Check Todo Item"
      });
    
    expect(res).to.have.status(400);
    expect(res.body).to.have.property("message");
    expect(res.body).to.have.nested.property("failures[0].message").to.equal("This todo item already exists. Please try a new one.");
  });
});