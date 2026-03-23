import mongoose from 'mongoose';
import seedProductsByCategory from './seedProducts';

const run = async () => {
    await mongoose.connect('mongodb+srv://admin:shaun1234@cluster0.qfdas.mongodb.net/ecommerce-project?retryWrites=true&w=majority&appName=Cluster0');
    await seedProductsByCategory();
    await mongoose.disconnect();
};

run();