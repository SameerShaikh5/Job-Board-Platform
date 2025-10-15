import mongoose from "mongoose";
import bcrypt from "bcrypt"; // use same package everywhere

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "employer"], default: "user" },
  contact: { type: String },
  skills: [{ type: String }],
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }]
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



const User = mongoose.model("User", userSchema);
export default User;
