import { Document, Schema, model as mModel } from 'mongoose';

export interface Setting extends Document {
  name: string;
  value: string;
  getValueAsNumber: () => number;
}

const Setting: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

Setting.methods.getValueAsNumber = function () {
  const num: number = Number(this.value);
  return isNaN(num) ? 0 : num;
}

export const model = mModel<Setting>('setting', Setting);
