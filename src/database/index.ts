// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import mongoose from 'mongoose';

export const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Database connected!');
  } catch (error) {
    console.error('Database Error', error);
  }
};
