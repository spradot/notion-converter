require('dotenv').config(); // For local development to load .env file
const express = require('express');
const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');

const app = express();
app.use(express.json()); // To parse JSON request bodies

// Ensure your Notion API token is set as an environment variable
const NOTION_API_KEY = process.env.NOTION_API_KEY;
if (!NOTION_API_KEY) {
    console.error('NOTION_API_KEY environment variable is not set.');
    process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

app.post('/convert-notion-to-markdown', async (req, res) => {
    const { pageId } = req.body; // Expecting pageId in the request body

    if (!pageId) {
        return res.status(400).json({ error: 'Missing Notion pageId in request body.' });
    }

    try {
        const mdBlocks = await n2m.pageToMarkdown(pageId);
        const markdownString = n2m.toMarkdownString(mdBlocks);
        res.json({ markdown: markdownString.parent }); // .parent contains the main page content
    } catch (error) {
        console.error('Error converting Notion page to Markdown:', error);
        res.status(500).json({ error: 'Failed to convert Notion page to Markdown.', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});