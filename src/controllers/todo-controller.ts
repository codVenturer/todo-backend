import { NextFunction, Request, Response, Router } from 'express';
import { BaseController } from './base-controller';
import { createTodoValidator } from '@validators';
import { Validation } from '@helpers';
import { AppContext, Errors, ExtendedRequest, ValidationFailure } from '@typings';
import { TodoItem } from '@models';

export class TodoController extends BaseController {
  public basePath: string = '/todos';
  public router: Router = Router();

  constructor(ctx: AppContext) {
    super(ctx);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.basePath}`, createTodoValidator(this.appContext), this.createTodo);
  }

  private createTodo = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const failures: ValidationFailure[] = Validation.extractValidationErrors(req);

    if (failures.length > 0) {
      const valError = new Errors.ValidationError(res.__('DEFAULT_ERRORS.VALIDATION_FAILED'), failures);

      return next(valError);
    }

    const { title } = req.body;
    const todo = await this.appContext.todoRepository.save(
      new TodoItem({
        title,
      }),
    );
    res.status(201).json(todo.serialize());
  }
}