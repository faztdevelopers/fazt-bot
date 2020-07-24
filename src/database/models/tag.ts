// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { Document, Schema, model as mModel } from 'mongoose';

export interface Tag extends Document {
  title: string;
  content: string;
}

const Tag: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

export const model = mModel<Tag>('tag', Tag);
