import chai from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';
import { TodoItem } from '../../../src/models';
import { todoItem } from '../../../src/storage/mongoose';
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

describe("PUT /todos/:id", () => {
  it("should update a todo item if it exists, if id is valid mongo id and if title is valid non-empty string", async () => {
    const todo= await testAppContext.todoRepository.save(
      new TodoItem({ title: "Update TODO" })
    );

    const updatedItem = "Item Updated";

    const res = await chai
      .request(expressApp)
      .put(`/todos/${todo._id}`)
      .send({
        title: updatedItem,
      });

    todoItem.find({ title: updatedItem }, function (err, data) {
      expect(new TodoItem(data[0]).serialize().title).to.deep.equal(
        updatedItem
      );
    });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("title");
    expect(res.body.id).to.deep.equal(todo._id.toString());
    expect(res.body.title).to.deep.equal(updatedItem);
  });

  it("should return a validation error if empty title is specified", async () => {
    const todo = await testAppContext.todoRepository.save(
      new TodoItem({ title: "TODO_TO_BE_UPDATED" })
    );

    const res = await chai
      .request(expressApp)
      .put(`/todos/${todo._id}`)
      .send({
        title: "",
      });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property("failures[0].message")
      .to.equal("The title is empty or the title is not a string.");
  });

  it("should return a validation error if id is invalid mongo id", async () => {
    const res = await chai.request(expressApp).put("/todos/hhd8882nn").send({
      title: "Update TODO",
    });

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
      .put("/todos/605bb3efc93d78b7f4335c2c")
      .send({
        title: "TODO_UPDATED",
      });

    expect(res).to.have.status(404);
  });
});

describe("DELETE /todos/:id", () => {
  it("should delete a todo item if it exists and if ID it is valid.", async () => {
    const todoItem = await testAppContext.todoRepository.save(
      new TodoItem({ title: "Title to be deleted" })
    );
    const res = await chai.request(expressApp).delete(`/todos/${todoItem._id}`);

    expect(res).to.have.status(204);
  });

  it("should return a validation error if id is not a valid ID.", async () => {
    const res = await chai.request(expressApp).delete("/todos/2114071");

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property("failures[0].message")
      .to.equal(
        "The specified todo ID is not a valid one. Please provide a valid one."
      );
  });
});

describe("GET /todos", () => {
  it("should have got all the todo items", async () => {
    const res = await chai.request(expressApp).get("/todos");

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
  });

  it("should check if the array returned is empty when there are no todo items", async () => {
    await testAppContext.todoRepository.getAll();

    await testAppContext.todoRepository.deleteMany({});

    const res = await chai.request(expressApp).get("/todos");

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body).to.deep.equal([]);
  });
});
