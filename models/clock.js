var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClockSchema = new Schema({

    employeeID: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    entry: {type: String, required: true},
    clockStatus: {type: String, required: true},

});


module.exports = mongoose.model('Clock', ClockSchema);
