import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { fileUrl } = req.query; // Expecting the file URL as a query parameter

    if (!fileUrl || Array.isArray(fileUrl)) {
        return res.status(400).json({ error: 'Invalid file URL' });
    }

    try {
        const response = await axios.get(fileUrl, {
            responseType: 'arraybuffer', // Fetch the file as a binary buffer
        });

        // Forward the file data to the client
        res.setHeader('Content-Type', 'application/pdf'); // Ensure correct MIME type
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Failed to fetch the file' });
    }
}
