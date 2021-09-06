import { BaseController } from './base-controller';
import { NextFunction, Response, Router } from 'express';
import { Validation } from '@helpers';
import { createTodoValidator, updateTodoValidator } from '@validators';
import { TodoItem } from '@models';
import {
  AppContext,
  Errors,
  ExtendedRequest,
  ValidationFailure,
} from '@typings';


export class TodoController extends BaseController {
  public basePath: string = '/todos';
  public router: Router = Router();

  constructor(ctx: AppContext) {
    super(ctx);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.basePath}`, createTodoValidator(this.appContext), this.createTodo);

    this.router.put(`${this.basePath}/:id`, updateTodoValidator(this.appContext), this.updateTodo);
  }

  private createTodo = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const failures: ValidationFailure[] = Validation.extractValidationErrors(req);
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures,
      );
      return next(valError);
    }

    const { title } = req.body;
    const todo = await this.appContext.todoRepository.save(
      new TodoItem({ title })
    )
    res.status(201).send(todo.serialize());
  }

  private updateTodo = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const failures: ValidationFailure[] = Validation.extractValidationErrors(req);
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures,
      );
      return next(valError);
    }

    const { id } = req.params;
    const { title } = req.body;
    const todo = await this.appContext.todoRepository.update(
      { _id: id},
      { $set: { title } }
    );

    if (todo._id) {
      res.status(200).send(todo.serialize());
    } else {
      const valError = new Errors.NotFoundError(
        res.__("DEFAULT_ERRORS.VALIDATION_FAILED")
      );
      next(valError);
    }
  }
}
