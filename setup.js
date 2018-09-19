const db = require('@arangodb').db
const collections = [
  'users',
  'state_ids',
  'medical_ids'
]

const edgeCollections = [
  'medical_id_for',
  'state_id_for'
]

// Initialize collections if they do not exist
collections.forEach((collection) => {
  if (!db._collection(collection)) {
    db._createDocumentCollection(collection)
  }
})

// Initialize edgeCollections if they do not exist
edgeCollections.forEach((collection) => {
  if (!db._collection(collection)) {
    db._createEdgeCollection(collection)
  }
})
