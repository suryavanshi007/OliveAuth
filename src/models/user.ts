// src/models/user.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email:string;
  password: string;
  resetToken:string;
  resetTokenExpiration:Number;

}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: {type:String, required: true, unique:true},
  password: { type: String, required: true },
  resetToken:{type:String},
  resetTokenExpiration:{type:Number}
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
