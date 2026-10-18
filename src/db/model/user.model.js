
import mongoose, { Schema } from "mongoose";
import { gender_enum } from "../../common/enum/index.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minlength: 2,
      maxlength: 25,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      minlength: 2,
      maxlength: 25,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    DOB: {
      type: Date,
    },

    confirmEmail: {
      type: Date,
    },

    image: {
      type: String,
    },

    coverImage: {
      type: [String],
      default: [],
    },

    gender: {
      type: Number,
      enum: Object.values(gender_enum),
      default: gender_enum.MALE,
    },
  },

  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true,
    autoIndex:true
  }
);
userSchema.virtual("username").set(function(value) {
    const [firstName, lastName] = value?.trim().split(/\s+/) || [];
    this.set({ firstName, lastName });
}).get(function() {
    return `${this.firstName} ${this.lastName}`;
});

export const usermodel = mongoose.model("user",userSchema)
