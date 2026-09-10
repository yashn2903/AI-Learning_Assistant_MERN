import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import { put, del } from '@vercel/blob';
import mongoose from 'mongoose';

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400
            });
        }

        // Store the PDF in Vercel Blob - the serverless filesystem is ephemeral.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const blob = await put(
            `documents/${uniqueSuffix}-${req.file.originalname}`,
            req.file.buffer,
            { access: 'public', contentType: 'application/pdf' }
        );

        // Create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: blob.url,
            fileSize: req.file.size,
            status: 'processing'
        });

        // Extract and chunk the text before responding. A serverless function is
        // frozen once it responds, so this cannot run as background work.
        await processPDF(document._id, req.file.buffer);

        const processed = await Document.findById(document._id).select('-extractedText -chunks');

        res.status(201).json({
            success: true,
            data: processed,
            message: 'Document uploaded and processed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to process PDF
const processPDF = async (documentId, dataBuffer) => {
  try {
    const { extractedText } = await extractTextFromPDF(dataBuffer);

    // Create chunks
    const chunks = chunkText(extractedText, 500, 50);

    // Update document
    await Document.findByIdAndUpdate(
      documentId,
      {
        extractedText,
        chunks,
        status: "ready",
      },
      {
        new: true,
        runValidators: true,
      }
    );
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user._id) }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { uploadDate: -1 }
            }
        ]);
        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Get single document with chunks
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Get counts of associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id });

        // Update last accessed
        document.lastAccessed = Date.now();
        await document.save();

        // Combine document data with counts
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        statusCode: 404
      });
    }

    // Remove the stored PDF. Legacy records point at a local /uploads path
    // rather than a Blob URL, so a failure here must not block the delete.
    if (document.filePath?.includes('.public.blob.vercel-storage.com')) {
      await del(document.filePath).catch((err) =>
        console.error(`Blob delete failed for ${document._id}:`, err.message)
      );
    }

    // Delete document
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
