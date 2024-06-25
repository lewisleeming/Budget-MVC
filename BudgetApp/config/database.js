const mongoose = require('mongoose');

//connect to databse
const password = process.env.MONGO_ATLAS_PW;
mongoose.connect('mongodb+srv://lewisllcomp:NzaJhTZ1wqiC24yJ@budgetcluster.4z12kum.mongodb.net/?retryWrites=true&w=majority&appName=BudgetCluster');
mongoose.Promise = global.Promise;

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error(`Database connection error: ${err}`);
});