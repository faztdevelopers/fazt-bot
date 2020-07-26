// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { Document, Schema, model as mModel } from 'mongoose';

export interface Note extends Document {
  userId: string;
  user: string;
  note: string;
  date: string;
}

const Note: Schema = new Schema({
  userId: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  date: {
    type: String
  }
});
export const model = mModel<Note>('notes', Note);
