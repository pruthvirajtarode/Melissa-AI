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
        this.groupedCache = null; // Cache for grouped documents
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
            console.log('📝 Vector store file not found or unreadable');
            this.documents = [];
            // Don't auto-save on load in production/Vercel to prevent read-only filesystem errors
            if (!process.env.VERCEL) {
                await this.saveStore();
            }
        }
    }

    /**
     * Save vector store to disk
     */
    async saveStore() {
        // Vercel has a read-only filesystem. Skip saving there.
        if (process.env.VERCEL) {
            console.log('⚠️ Skipping vector store save (Read-only filesystem on Vercel)');
            return;
        }

        try {
            this.groupedCache = null; // Invalidate cache on save
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
    * @param {boolean} skipSave - Whether to skip saving to disk (for bulk operations)
    */
    async addDocument(text, metadata = {}, skipSave = false) {
        try {
            const embedding = await generateEmbedding(text);

            const document = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
                text,
                embedding,
                metadata: {
                    ...metadata,
                    isActive: metadata.isActive !== undefined ? metadata.isActive : false // Default to false
                },
                createdAt: new Date().toISOString()
            };

            this.documents.push(document);
            if (!skipSave) {
                await this.saveStore();
            }

            return document.id;
        } catch (error) {
            console.error('❌ Error adding document:', error.message);
            throw error;
        }
    }

    /**
     * Add multiple documents to vector store
     * @param {Array<{text: string, metadata: object}>} docs - Array of documents
     */
    async addDocuments(docs) {
        console.log(`📥 Adding ${docs.length} documents to vector store...`);
        for (let i = 0; i < docs.length; i++) {
            const { text, metadata } = docs[i];
            await this.addDocument(text, metadata, true);
            if ((i + 1) % 10 === 0) {
                console.log(`   Processed ${i + 1}/${docs.length} chunks...`);
            }
        }
        await this.saveStore();
        console.log('✅ Bulk addition complete and saved to disk');
    }

    /**
     * Search for similar documents using cosine similarity
     * @param {string} query - Search query
     * @param {number} topK - Number of results to return
     * @returns {Promise<Array>} Top matching documents
     */
    async search(query, topK = 3) {
        try {
            // Filter for active documents only
            const activeDocs = this.documents.filter(doc => doc.metadata?.isActive === true);

            if (activeDocs.length === 0) {
                return [];
            }

            const queryEmbedding = await generateEmbedding(query);

            // Calculate dot product for each active document
            const results = activeDocs.map(doc => ({
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
     * Calculate dot product between two vectors
     * OpenAI embeddings are normalized to length 1, so dot product equals cosine similarity
     */
    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        const len = vecA.length;
        for (let i = 0; i < len; i++) {
            dotProduct += vecA[i] * vecB[i];
        }
        return dotProduct;
    }

    /**
     * Get all unique document sources with caching
     */
    getGroupedDocuments() {
        if (this.groupedCache) {
            return this.groupedCache;
        }

        const groups = {};

        this.documents.forEach(doc => {
            const source = doc.metadata?.source || 'Unnamed Content';
            if (!groups[source]) {
                groups[source] = {
                    source: source,
                    filename: doc.metadata?.filename || source,
                    mimetype: doc.metadata?.mimetype || 'text/plain',
                    type: doc.metadata?.type || 'file',
                    summary: doc.metadata?.summary || '',
                    isActive: doc.metadata?.isActive === true,
                    chunks: 0,
                    createdAt: doc.createdAt,
                    lastModified: doc.createdAt
                };
            }
            groups[source].chunks++;
            if (new Date(doc.createdAt) < new Date(groups[source].createdAt)) {
                groups[source].createdAt = doc.createdAt;
            }
            if (new Date(doc.createdAt) > new Date(groups[source].lastModified)) {
                groups[source].lastModified = doc.createdAt;
            }
        });

        const sorted = Object.values(groups).sort((a, b) =>
            new Date(b.lastModified) - new Date(a.lastModified)
        );

        this.groupedCache = sorted;
        return sorted;
    }

    /**
     * Approve/Activate all chunks for a specific source
     */
    async approveBySource(source) {
        let count = 0;
        this.documents.forEach(doc => {
            if (doc.metadata?.source === source) {
                doc.metadata.isActive = true;
                count++;
            }
        });
        if (count > 0) {
            await this.saveStore();
        }
        return count;
    }

    /**
     * Delete all chunks for a specific source
     */
    async deleteBySource(source) {
        const initialCount = this.documents.length;
        this.documents = this.documents.filter(doc => doc.metadata?.source !== source);
        const deletedCount = initialCount - this.documents.length;
        await this.saveStore();
        return deletedCount;
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
        console.log('🔄 Re-indexing documents and generating missing summaries...');
        const { summarizeDocument } = require('./openai');

        const processedSources = new Set();

        for (let doc of this.documents) {
            // Regenerate embedding
            doc.embedding = await generateEmbedding(doc.text);

            // Generate summary if missing and it's a new source in this loop
            if (!doc.metadata.summary && !processedSources.has(doc.metadata.source)) {
                // Find all chunks for this source to get full text
                const fullText = this.documents
                    .filter(d => d.metadata.source === doc.metadata.source)
                    .map(d => d.text)
                    .join(' ')
                    .substring(0, 8000);

                const summary = await summarizeDocument(fullText);

                // Update all chunks of this source with the summary
                this.documents.forEach(d => {
                    if (d.metadata.source === doc.metadata.source) {
                        d.metadata.summary = summary;
                    }
                });

                processedSources.add(doc.metadata.source);
            }
        }

        await this.saveStore();
        console.log('✅ Re-indexing and summarization complete');
    }
}

// Singleton instance
const vectorStore = new VectorStore();

module.exports = vectorStore;
