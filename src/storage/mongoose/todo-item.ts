import { model, Schema } from 'mongoose';

const todoSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
  },
  {
    collection: 'todoItems',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);
const todoItem = model('TodoItem', todoSchema);
export default todoItem;