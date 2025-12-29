/**
 * API Route: /api/label-configs/files/[filename]
 * Handles individual label configuration file operations
 */

import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { filename } = req.query;
  
  if (!filename || Array.isArray(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  const labelsDir = path.join(process.cwd(), 'public', 'labels');
  const filePath = path.join(labelsDir, filename);
  
  // Security: ensure file is within labels directory
  if (!filePath.startsWith(labelsDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    // GET - Read file
    if (req.method === 'GET') {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content);
      
      return res.status(200).json({
        filename,
        config
      });
    }
    
    // DELETE - Remove file
    if (req.method === 'DELETE') {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      fs.unlinkSync(filePath);
      
      return res.status(200).json({
        success: true,
        message: 'File deleted'
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('File operation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}