const mongoose = require('mongoose');
const Car = require('./models/Car');
mongoose.connect('mongodb://127.0.0.1:27017/car-inventory').then(async () => {
  try {
    const car = await Car.findOne();
    if (car) {
      const updateData = car.toObject();
      updateData.price = 9999;
      // updateData includes _id
      await Car.findByIdAndUpdate(car._id, updateData, { new: true, runValidators: true });
      console.log('Update success with _id');
    }
    console.log('Done');
  } catch (err) {
    console.error('Update failed:', err.message);
  } finally {
    process.exit(0);
  }
});
