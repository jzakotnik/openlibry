import { promises as fs } from 'fs';
import path from 'path';

export async function copyCover(sourceBookId: number, targetBookId: number) {
  try {
    // Bilder liegen in /app/images mit .jpg Endung
    const coverDir = path.join(process.cwd(), 'images');
    const sourcePath = path.join(coverDir, `${sourceBookId}.jpg`);
    const targetPath = path.join(coverDir, `${targetBookId}.jpg`);
    
    console.log("Source cover path:", sourcePath);
    console.log("Target cover path:", targetPath);
    
    // Prüfen ob das Original-Cover existiert
    try {
      await fs.access(sourcePath);
    } catch {
      console.log("No cover found for book", sourceBookId);
      return false;
    }

    // Cover kopieren
    const coverData = await fs.readFile(sourcePath);
    await fs.writeFile(targetPath, coverData);
    
    console.log("Cover copied successfully from", sourceBookId, "to", targetBookId);
    return true;
  } catch (err) {
    console.error("Failed to copy cover:", err);
    return false;
  }
}