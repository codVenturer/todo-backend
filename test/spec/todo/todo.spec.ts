import chai from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';
import { TodoItem } from '../../../src/models';
import {App} from '../../../src/server';
import { respositoryContext, testAppContext } from '../../mocks/app-context';

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

describe("GET /todos/:id", () => {
  it("should fetch a todo item if it exists and if id is valid mongo id", async () => {
    const todo = await testAppContext.todoRepository.save(
      new TodoItem({ title: "Fetching an item" })
    );

    const res = await chai.request(expressApp).get(`/todos/${todo._id}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("title");
  });

  it("Should return a validation error if id is invalid mongo id", async () => {
    const res = await chai.request(expressApp).get("/todos/jlkm129e2nk");

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property("failures[0].message")
      .to.equal(
        "The specified todo ID is not a valid one. Please provide a valid one."
      );
  });

  it("should return a 404 if todo item does not exists", async () => {
    const res = await chai
      .request(expressApp)
      .get("/todos/605bb3efc93d78b7f4388c2c");

    expect(res).to.have.status(404);
  });
});
