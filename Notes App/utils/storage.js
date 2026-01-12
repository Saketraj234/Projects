// In-memory storage configuration and data
const storage = {
  // State
  isUsingInMemory: false,
  
  // Data stores
  notes: [],
  users: [],
  
  // Methods to modify state
  setInMemoryMode(value) {
    this.isUsingInMemory = value;
    console.log(`Storage mode set to: ${value ? 'In-Memory' : 'MongoDB'}`);
  },
  
  // Helper to generate IDs
  generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
};

module.exports = storage;
