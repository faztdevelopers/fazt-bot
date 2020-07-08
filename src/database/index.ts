import mongoose from 'mongoose';

export const connect = async () => {
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
