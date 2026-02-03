const fs = require('fs').promises;
const path = require('path');
const { generateEmbedding } = require('./openai');

const VECTOR_STORE_PATH = path.join(__dirname, '../../data/vectors/store.json');

/**
 * Simple in-memory vector store
 * For production, use Pinecone, Weaviate, or similar
 */
class VectorStore {
    constructor() {
        this.documents = [];
        this.loadStore();
    }

    /**
     * Load vector store from disk
     */
    async loadStore() {
        try {
            const data = await fs.readFile(VECTOR_STORE_PATH, 'utf-8');
            this.documents = JSON.parse(data);
            console.log(`✅ Loaded ${this.documents.length} documents from vector store`);
        } catch (error) {
            console.log('📝 Initializing new vector store');
            this.documents = [];
            await this.saveStore();
        }
    }

    /**
     * Save vector store to disk
     */
    async saveStore() {
        try {
            const dir = path.dirname(VECTOR_STORE_PATH);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(VECTOR_STORE_PATH, JSON.stringify(this.documents, null, 2));
        } catch (error) {
            console.error('Error saving vector store:', error);
        }
    }

    /**
     * Add document to vector store
     * @param {string} text - Document text
     * @param {object} metadata - Document metadata
     */
    async addDocument(text, metadata = {}) {
        try {
            const embedding = await generateEmbedding(text);

            const document = {
                id: Date.now().toString(),
                text,
                embedding,
                metadata,
                createdAt: new Date().toISOString()
            };

            this.documents.push(document);
            await this.saveStore();

            return document.id;
        } catch (error) {
            console.error('❌ Error adding document:', error.message);
            throw error;
        }
    }

    /**
     * Search for similar documents using cosine similarity
     * @param {string} query - Search query
     * @param {number} topK - Number of results to return
     * @returns {Promise<Array>} Top matching documents
     */
    async search(query, topK = 3) {
        try {
            if (this.documents.length === 0) {
                return [];
            }

            const queryEmbedding = await generateEmbedding(query);

            // Calculate cosine similarity for each document
            const results = this.documents.map(doc => ({
                ...doc,
                similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
            }));

            // Sort by similarity and return top k
            results.sort((a, b) => b.similarity - a.similarity);

            return results.slice(0, topK);
        } catch (error) {
            console.error('Error searching vector store:', error);
            return [];
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * Get all documents
     */
    getAllDocuments() {
        return this.documents.map(doc => ({
            id: doc.id,
            text: doc.text.substring(0, 100) + '...',
            metadata: doc.metadata,
            createdAt: doc.createdAt
        }));
    }

    /**
     * Delete document by ID
     */
    async deleteDocument(id) {
        this.documents = this.documents.filter(doc => doc.id !== id);
        await this.saveStore();
    }

    /**
     * Clear all documents
     */
    async clearAll() {
        this.documents = [];
        await this.saveStore();
    }

    /**
     * Re-index all documents (regenerate embeddings)
     */
    async reindex() {
        console.log('🔄 Re-indexing documents...');

        for (let doc of this.documents) {
            doc.embedding = await generateEmbedding(doc.text);
        }

        await this.saveStore();
        console.log('✅ Re-indexing complete');
    }
}

// Singleton instance
const vectorStore = new VectorStore();

module.exports = vectorStore;
