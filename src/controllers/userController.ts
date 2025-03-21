import { Request, Response } from "express";

import User from "../models/User";
import Note from "../models/Note";

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  // Get all users from MongoDB
  const users = await User.find().select("-password");

  // If no users
  if (!users?.length) {
    res.status(400).json({ message: "No users found" });
    return;
  }

  res.json(users);
};

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password, roles } = req.body;

  // Confirm data
  if (!username || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    res.status(409).json({ message: "Duplicate username" });
    return;
  }

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password }
      : { username, password, roles };
  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    //created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
};

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id, username, roles, active, password } = req.body;
  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    res
      .status(400)
      .json({ message: "All fields except password are required" });
    return;
  }
  // Does the user exist to update?
  const user = await User.findById(id).exec();
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }
  // Check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    res.status(409).json({ message: "Duplicate username" });
    return;
  }
  user.username = username;
  user.roles = roles;
  user.active = active;
  if (password) {
    // Hash password
    // user.password = await bcrypt.hash(password, 10); // salt rounds
    user.password = password; // salt rounds
  }
  const updatedUser = await user.save();
  res.json({ message: `${updatedUser.username} updated` });
};

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body;
  // Confirm data
  if (!id) {
    res.status(400).json({ message: "User ID Required" });
    return;
  }
  // Does the user still have assigned notes?
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    res.status(400).json({ message: "User has assigned tickets" });
    return;
  }
  // Does the user exist to delete?
  const user = await User.findById(id).exec();
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }
  const result = await User.findOneAndDelete({ _id: id });
  let reply = "User not found";
  if (result) {
    reply = `Username ${result.username} with ID ${result._id} deleted`;
  }
  res.json(reply);
};

export { getAllUsers, createNewUser, updateUser, deleteUser };
