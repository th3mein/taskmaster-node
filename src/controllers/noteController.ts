import { Request, Response } from "express";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import Note from "../models/Note";

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  // Get all notes from MongoDB
  const notes = await Note.find().lean();

  // If no notes
  if (!notes?.length) {
    res.status(400).json({ message: "No notes found" });
    return;
  }

  // Add username to each note before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, id: note._id, username: user?.username };
    })
  );

  res.json(notesWithUser);
};

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = async (req: Request, res: Response): Promise<void> => {
  const { user, title, text } = req.body;

  // Confirm data
  if (!user || !title || !text) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }
  if (!mongoose.isValidObjectId(user)) {
    res.status(400).json({ message: "Invalid user ID format" });
    return;
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    res.status(409).json({ message: "Duplicate note title" });
    return;
  }

  // Create and store the new user
  const note = await Note.create({ user, title, text });

  if (note) {
    // Created
    res.status(201).json({ message: "New note created" });
    return;
  } else {
    res.status(400).json({ message: "Invalid note data received" });
    return;
  }
};

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = async (req: Request, res: Response): Promise<void> => {
  const { id, user, title, text, completed } = req.body;

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  // Confirm note exists to update
  const note = await Note.findById(id).exec();

  if (!note) {
    res.status(400).json({ message: "Note not found" });
    return;
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    res.status(409).json({ message: "Duplicate note title" });
    return;
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json(`'${updatedNote.title}' updated`);
};

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    res.status(400).json({ message: "Note ID required" });
    return;
  }

  // Confirm note exists to delete
  const result = await Note.findByIdAndDelete(id).exec();

  if (!result) {
    res.status(400).json({ message: "Note not found" });
    return;
  } else {
    res.json(`Note '${result.title}' with ID ${result._id} deleted`);
  }
};

export { getAllNotes, createNewNote, updateNote, deleteNote };
