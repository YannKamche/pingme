//Tree shaking is an optimization technique that eliminates unused code (dead code) from your final application bundle
import mongoose, { Schema, type Document} from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    avatar: {
        type: String,
        default: "",
    }}, { timestamps: true /**MongoDB will include the update and create fields automatically**/ });

export const User = mongoose.model("User", UserSchema) //Create a model called "user" in the database
