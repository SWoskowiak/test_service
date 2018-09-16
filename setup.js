const db = require('@arangodb').db
const collections = [
  'users',
  'state_ids',
  'medical_ids'
]

// Initialize collections if they do not exist
collections.forEach((collection) => {
  if (!db._collection(collection)) {
    db._createDocumentCollection(collection)
  }
})
