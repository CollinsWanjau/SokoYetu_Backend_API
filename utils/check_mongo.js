const mongoose = require('mongoose');


const id = '656ed68d5371265ff00ae775';
const isValid = mongoose.Types.ObjectId.isValid(id);

if (isValid) {
  console.log(`The ObjectID ${id} is valid.`);
} else {
  console.log(`The ObjectID ${id} is not valid.`);
}
