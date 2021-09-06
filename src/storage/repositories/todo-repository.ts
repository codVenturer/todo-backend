import { BaseRepository } from './base-repository';
import { TodoItem, ModelFactory } from '@models';
import { RepositoryContext } from './repository-context';

export class TodoRepository extends BaseRepository<TodoItem> {
  constructor(context: RepositoryContext) {
    super(context);
  }

  protected modelFactory(): ModelFactory<TodoItem> {
    return {
      getType() {
        return typeof TodoItem;
      },
      create(json: any) {
        return new TodoItem(json);
      },
    };
  }
}
