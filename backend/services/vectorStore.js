const Knowledge = require('../models/Knowledge');
const { generateEmbedding } = require('./openai');

/**
 * MongoDB-backed vector store for production use.
 */
class VectorStore {
    constructor() {
        this.groupedCache = null;
    }

    /**
     * Add document chunks to MongoDB with parallel embedding generation
     * @param {Array<{text: string, metadata: object}>} docs - Array of documents
     */
    async asyncPool(poolLimit, array, iteratorFn) {
        const ret = [];
        const executing = [];
        for (const item of array) {
            const p = Promise.resolve().then(() => iteratorFn(item, array));
            ret.push(p);

            if (poolLimit <= array.length) {
                const e = p.then(() => executing.splice(executing.indexOf(e), 1));
                executing.push(e);
                if (executing.length >= poolLimit) {
                    await Promise.race(executing);
                }
            }
        }
        return Promise.all(ret);
    }

    async addDocuments(docs) {
        try {
            console.log(`📥 Adding ${docs.length} documents to MongoDB...`);
            const startTime = Date.now();

            // Process embeddings in parallel batches for speed
            const batchSize = 5;
            const chunksToInsert = await this.asyncPool(batchSize, docs, async (doc, idx) => {
                const { text, metadata } = doc;
                try {
                    const embedding = await generateEmbedding(text);
                    return {
                        text,
                        embedding,
                        metadata: {
                            ...metadata,
                            isActive: metadata.isActive !== undefined ? metadata.isActive : false
                        }
                    };
                } catch (embErr) {
                    console.error(`❌ Embedding generation failed for chunk:`, embErr.message);
                    throw embErr;
                }
            });

            if (chunksToInsert.length > 0) {
                await Knowledge.insertMany(chunksToInsert);
            }

            this.groupedCache = null; // Invalidate cache
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Bulk addition to MongoDB complete in ${duration}s`);
        } catch (error) {
            console.error('❌ Error in addDocuments:', error.message);
            throw error;
        }
    }

    /**
     * Search for similar documents using MongoDB (cosine similarity in memory for now, or using $vectorSearch if available)
     * Note: Standard MongoDB Atlas Vector Search requires specific setup. 
     * For now we'll fetch active docs and rank in memory if the dataset is small (<2000 chunks).
     */
    async search(query, topK = 3) {
        try {
            // Filter for active documents only
            const activeDocs = await Knowledge.find({ 'metadata.isActive': true });

            if (activeDocs.length === 0) return [];

            const queryEmbedding = await generateEmbedding(query);

            // OpenAI embeddings are normalized, so dot product = cosine similarity
            const results = activeDocs.map(doc => {
                const docObj = doc.toObject();
                return {
                    ...docObj,
                    similarity: this.cosineSimilarity(queryEmbedding, docObj.embedding)
                };
            });

            results.sort((a, b) => b.similarity - a.similarity);
            return results.slice(0, topK);
        } catch (error) {
            console.error('Error searching MongoDB:', error);
            return [];
        }
    }

    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
        let dotProduct = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
        }
        return dotProduct;
    }

    /**
     * Get grouped sources for admin dashboard
     */
    async getGroupedDocuments() {
        try {
            // Use MongoDB aggregation for efficient grouping
            const grouped = await Knowledge.aggregate([
                {
                    $group: {
                        _id: "$metadata.source",
                        source: { $first: "$metadata.source" },
                        filename: { $first: "$metadata.filename" },
                        mimetype: { $first: "$metadata.mimetype" },
                        summary: { $first: "$metadata.summary" },
                        isActive: { $first: "$metadata.isActive" },
                        chunks: { $sum: 1 },
                        createdAt: { $min: "$createdAt" },
                        lastModified: { $max: "$createdAt" }
                    }
                },
                { $sort: { lastModified: -1 } }
            ]);

            return grouped.map(g => {
                const source = g.source || 'Unknown Source';
                return {
                    ...g,
                    id: g._id || Math.random().toString(36).substr(2, 9),
                    source,
                    type: (source && typeof source === 'string' && source.startsWith('http')) ? 'webpage' : 'file'
                };
            });
        } catch (error) {
            console.error('Aggregation error:', error);
            return [];
        }
    }

    async approveBySource(source) {
        const result = await Knowledge.updateMany(
            { $or: [{ 'metadata.source': source }, { 'metadata.filename': source }] },
            { $set: { 'metadata.isActive': true } }
        );
        this.groupedCache = null;
        return result.modifiedCount;
    }

    async deactivateBySource(source) {
        const result = await Knowledge.updateMany(
            { $or: [{ 'metadata.source': source }, { 'metadata.filename': source }] },
            { $set: { 'metadata.isActive': false } }
        );
        this.groupedCache = null;
        return result.modifiedCount;
    }

    async deleteBySource(source) {
        const result = await Knowledge.deleteMany({ 'metadata.source': source });
        this.groupedCache = null;
        return result.deletedCount;
    }

    async clearAll() {
        await Knowledge.deleteMany({});
        this.groupedCache = null;
    }

    async reindex() {
        console.log('🔄 Re-indexing MongoDB store...');
        const allDocs = await Knowledge.find({});
        for (const doc of allDocs) {
            doc.embedding = await generateEmbedding(doc.text);
            await doc.save();
        }
        console.log('✅ Re-indexing complete');
    }
}

module.exports = new VectorStore();

