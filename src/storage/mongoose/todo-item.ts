import { model, Schema } from 'mongoose';

const todoSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
  },
  {
    collection: 'todos',
  },
);
const todoItem = model('TodoItem', todoSchema);
export default todoItem;