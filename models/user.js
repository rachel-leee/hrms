var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
require('mongoose-type-email');
const jwt = require('jsonwebtoken');
var Schema = mongoose.Schema;

var UserSchema = new Schema({

    type: {type: String},
    email: {type: mongoose.SchemaTypes.Email, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    dateOfBirth: {type: Date, required: true},
    contactNumber: {type: String, required: true},
    department: String,
    Skills: [String],
    designation: String,
    dateAdded: {type: Date}

});

UserSchema.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.pre('save', function(next){
    const user = this;

    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function(err, salt){
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash){
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});





UserSchema.methods.comparePassWord = function(password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    let payload = {
        id: this._id,
        email: this.email,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(expirationDate.getTime() / 1000, 10)
    });
};

module.exports = mongoose.model('User', UserSchema);