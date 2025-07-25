const Note = require('../models/Note');
const { inMemoryNotes, isUsingInMemory, generateId } = require('../server');

exports.getNotes = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }
    
    if (isUsingInMemory) {
      // Filter notes by user and sort by isPinned and updatedAt
      const userNotes = inMemoryNotes.filter(note => note.user === userId);
      const sortedNotes = [...userNotes].sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        return b.isPinned ? 1 : -1;
      });
      
      return res.status(200).json({
        success: true,
        count: sortedNotes.length,
        data: sortedNotes
      });
    }
    
    // Use MongoDB if available
    const notes = await Note.find({ user: userId }).sort({ isPinned: -1, updatedAt: -1 });
    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};


exports.getNote = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }
    
    if (isUsingInMemory) {
      const note = inMemoryNotes.find(note => note._id === req.params.id);
      
      if (!note) {
        return res.status(404).json({
          success: false,
          error: 'Note not found'
        });
      }
      
      // Check if the note belongs to the user
      // Convert both to strings and compare
      if (note.user.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this note'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: note
      });
    }
    
    // Use MongoDB if available
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    // Check if the note belongs to the user
    // Convert both to strings and compare
    if (note.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this note'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};


exports.createNote = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }
    
    // Validate required fields
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: ['Please provide title and content for the note']
      });
    }
    
    if (isUsingInMemory) {
      // Create new note for in-memory storage
      const newNote = {
        _id: generateId(),
        title: req.body.title,
        content: req.body.content,
        color: req.body.color || '#ffffff',
        isPinned: req.body.isPinned || false,
        user: userId, // Add user ID to the note
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to in-memory notes array
      inMemoryNotes.push(newNote);
      
      return res.status(201).json({
        success: true,
        data: newNote
      });
    }
    
    // Use MongoDB if available
    // Add user ID to the note data
    const noteData = {
      ...req.body,
      user: userId
    };
    
    const note = await Note.create(noteData);

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);

      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};


exports.updateNote = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }
    
    // Validate required fields
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: ['Please provide title and content for the note']
      });
    }
    
    if (isUsingInMemory) {
      // Find note in in-memory storage
      const noteIndex = inMemoryNotes.findIndex(note => note._id === req.params.id);
      
      if (noteIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Note not found'
        });
      }
      
      // Check if the note belongs to the user
      // Convert both to strings and compare
      if (inMemoryNotes[noteIndex].user.toString() !== userId.toString()) {
        console.log('Update authorization failed:', { noteUser: inMemoryNotes[noteIndex].user, requestUser: userId });
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this note'
        });
      }
      
      // Update the note
      const updatedNote = {
        ...inMemoryNotes[noteIndex],
        title: req.body.title,
        content: req.body.content,
        color: req.body.color || inMemoryNotes[noteIndex].color,
        isPinned: req.body.isPinned !== undefined ? req.body.isPinned : inMemoryNotes[noteIndex].isPinned,
        updatedAt: new Date()
      };
      
      // Replace the old note with updated one
      inMemoryNotes[noteIndex] = updatedNote;
      
      return res.status(200).json({
        success: true,
        data: updatedNote
      });
    }
    
    // Use MongoDB if available
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    // Check if the note belongs to the user
    console.log('MongoDB Update authorization check:', { noteUser: note.user.toString(), requestUser: userId });
    // Convert both to strings and compare
    if (note.user.toString() !== userId.toString()) {
      console.log('MongoDB Update authorization failed:', { noteUser: note.user.toString(), requestUser: userId });
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this note'
      });
    }

    // Update the updatedAt timestamp
    req.body.updatedAt = Date.now();

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);

      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};


exports.togglePinStatus = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }
    
    if (isUsingInMemory) {
      // Find note in in-memory storage
      const noteIndex = inMemoryNotes.findIndex(note => note._id === req.params.id);
      
      if (noteIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Note not found'
        });
      }
      
      // Check if the note belongs to the user
      // Convert both to strings and compare
      if (inMemoryNotes[noteIndex].user.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this note'
        });
      }
      
      // Toggle pin status
      const updatedNote = {
        ...inMemoryNotes[noteIndex],
        isPinned: !inMemoryNotes[noteIndex].isPinned,
        updatedAt: new Date()
      };
      
      // Replace the old note with updated one
      inMemoryNotes[noteIndex] = updatedNote;
      
      return res.status(200).json({
        success: true,
        data: updatedNote
      });
    }
    
    // Use MongoDB if available
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    // Check if the note belongs to the user
    // Convert both to strings and compare
    if (note.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this note'
      });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id, 
      { isPinned: !note.isPinned, updatedAt: Date.now() }, 
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};


exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }
    
    if (isUsingInMemory) {
      // Find note in in-memory storage
      const noteIndex = inMemoryNotes.findIndex(note => note._id === req.params.id);
      
      if (noteIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Note not found'
        });
      }
      
      // Check if the note belongs to the user
      console.log('In-memory Delete authorization check:', { noteUser: inMemoryNotes[noteIndex].user, requestUser: userId });
      // Convert both to strings and compare
      if (inMemoryNotes[noteIndex].user.toString() !== userId.toString()) {
        console.log('In-memory Delete authorization failed:', { noteUser: inMemoryNotes[noteIndex].user, requestUser: userId });
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this note'
        });
      }
      
      // Remove note from array
      inMemoryNotes.splice(noteIndex, 1);
      
      return res.status(200).json({
        success: true,
        data: {}
      });
    }
    
    // Use MongoDB if available
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    // Check if the note belongs to the user
    console.log('MongoDB Delete authorization check:', { noteUser: note.user.toString(), requestUser: userId });
    // Convert both to strings and compare
    if (note.user.toString() !== userId.toString()) {
      console.log('MongoDB Delete authorization failed:', { noteUser: note.user.toString(), requestUser: userId });
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this note'
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};