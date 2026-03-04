import mongoose, { mongo, Schema, type Document} from "mongoose";

export interface IChat extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage?: mongoose.Types.ObjectId;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
    // participants is an array of ID
    participants: [
        {
            type:Schema.Types.ObjectId, //MongoDB Id
            ref:"User", //Every single participant is a user
            required: true,
        },
    ],
    // lastMessage is just one id
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: null
    },

    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
}, {timestamps: true})

export const Chat = mongoose.model("Chat", ChatSchema) //Create a model called "chat" in the database
