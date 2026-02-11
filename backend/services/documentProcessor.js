const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Process PDF file and extract text
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
async function processPDF(buffer) {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        console.error('PDF processing error:', error);
        throw new Error('Failed to process PDF');
    }
}

/**
 * Process DOCX file and extract text
 * @param {Buffer} buffer - DOCX file buffer
 * @returns {Promise<string>} Extracted text
 */
async function processDOCX(buffer) {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        console.error('DOCX processing error:', error);
        throw new Error('Failed to process DOCX');
    }
}

/**
 * Scrape text from web page
 * @param {string} url - Web page URL
 * @returns {Promise<string>} Extracted text
 */
async function scrapeWebPage(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // Remove script and style elements
        $('script, style, nav, footer, iframe').remove();

        // Extract text from main content areas
        const text = $('body').text()
            .replace(/\s+/g, ' ')
            .trim();

        return text;
    } catch (error) {
        console.error('Web scraping error:', error);
        throw new Error('Failed to scrape web page');
    }
}

/**
 * Chunk text into smaller pieces for better retrieval
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Maximum chunk size
 * @param {number} overlap - Overlap between chunks
 * @returns {Array<string>} Text chunks
 */
function chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }

    return chunks;
}

/**
 * Process document based on file type
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File MIME type
 * @param {string} filename - Original filename
 * @returns {Promise<object>} Processed document data
 */
async function processDocument(buffer, mimetype, filename) {
    let text = '';

    try {
        if (mimetype === 'application/pdf') {
            text = await processPDF(buffer);
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            text = await processDOCX(buffer);
        } else if (mimetype === 'text/plain') {
            text = buffer.toString('utf-8');
        } else {
            throw new Error(`Unsupported file type: ${mimetype}`);
        }

        // Chunk the text
        const chunks = chunkText(text);

        return {
            filename,
            mimetype,
            text,
            chunks,
            metadata: {
                filename,
                mimetype,
                processedAt: new Date().toISOString(),
                chunkCount: chunks.length,
                totalLength: text.length
            }
        };
    } catch (error) {
        console.error('Document processing error:', error);
        throw error;
    }
}

module.exports = {
    processPDF,
    processDOCX,
    scrapeWebPage,
    chunkText,
    processDocument
};
