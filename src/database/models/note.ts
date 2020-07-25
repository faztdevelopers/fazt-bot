// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { Document, Schema, model as mModel } from 'mongoose';

export interface Note extends Document {
  userId: number;
  user: string;
  note: string;
  noteId: number;
  date: string;
}

const Note: Schema = new Schema({
  userId: {
    type: Number,
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
  noteId: {
    type: Number,
    required: true
  },
  date: {
    type: String
  }
});
export const model = mModel<Note>('notes', Note);
