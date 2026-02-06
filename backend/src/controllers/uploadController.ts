import { Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configure Multer for temporary storage
 * Files will be processed by sharp or moved to permanent storage
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempPath = path.join(__dirname, '../../uploads/temp');
        if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath, { recursive: true });
        }
        cb(null, tempPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|pdf/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpg, png, webp) and PDFs are allowed'));
    }
});

/**
 * Handle file upload and processing
 */
export const handleUpload = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.file;
        const targetDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const isImage = file.mimetype.startsWith('image/') && !file.mimetype.includes('webp');
        const filename = uuidv4();
        let finalPath = '';
        let publicUrl = '';

        if (isImage) {
            // Convert to WebP
            const webpFilename = `${filename}.webp`;
            finalPath = path.join(targetDir, webpFilename);

            await sharp(file.path)
                .webp({ quality: 80 })
                .toFile(finalPath);

            // Clean up temp file
            fs.unlinkSync(file.path);

            publicUrl = `/uploads/${webpFilename}`;
        } else {
            // For PDFs or already WebP, just move from temp
            const ext = path.extname(file.originalname).toLowerCase();
            const newFilename = `${filename}${ext}`;
            finalPath = path.join(targetDir, newFilename);

            fs.renameSync(file.path, finalPath);
            publicUrl = `/uploads/${newFilename}`;
        }

        res.json({
            message: 'Upload successful',
            url: publicUrl,
            filename: path.basename(finalPath),
            originalName: file.originalname,
            mimetype: isImage ? 'image/webp' : file.mimetype
        });
    } catch (error: any) {
        console.error('Upload handling error:', error);
        res.status(500).json({ message: error.message || 'Error processing upload' });
    }
};
