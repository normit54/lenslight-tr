import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator"; //ders  14 validation

const { Schema } = mongoose;

const userSchema = new Schema({
    userName:{
        type:String,
        required: [true, "Username are required"],
        //unique:true,
        lowercase: true,
        validate: [validator.isAlphanumeric, "Only Alphanumeric characters"],
    },
    email:{
        type:String,
        required: [true, "Email area is required"],
        unique:true,
        validate: [validator.isEmail, "Valid email is required"]
    },
    password:{
        type:String,
        required: [true, "Password ares is required"],
        minLength: [4,"At least 4 characters"],
    },
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    followings: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
},
    {
        timestamps:true,
    }
);

userSchema.pre("save", function(next) {
   const user = this;
   //console.log("user pass1 ",user.password );
   bcrypt.hash(user.password, 10, (err, hash) => {
            user.password = hash;
            //console.log("user pass2 ",user.password );
            next();
   }); 
});
const User = mongoose.model("User",userSchema)

export default User;