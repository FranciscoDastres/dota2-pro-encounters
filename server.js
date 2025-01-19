import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import { promisify } from "util";
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const execPs = exec;
const app = express();
const PORT = 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.post("/api/run-script", async (req, res) => {
    try {
        const { accountId } = req.body;
 
        if (!accountId) {
            return res.status(400).json({ 
                error: "Account ID is required",
                details: "Please provide a valid Dota 2 account ID"
            });
        } 

        if (!/^\d+$/.test(accountId)) {
            return res.status(400).json({
                error: "Invalid Account ID format",
                details: "Account ID should contain only numbers"
            });
        }

        console.log(`Processing request for Account ID: ${accountId}`);
 
        const scriptPath = path.join(process.cwd(), 'src', 'run.sh'); 
        const command = `sh ${scriptPath} ${accountId}`;
        console.log(`Executing command: ${command}`);
        
        const { stdout, stderr } = await execPs(command);
        if (stderr) {
            console.error(`Script stderr output: ${stderr}`);
        }

        console.log(`Script stdout output: ${stdout}`);
 
        
        
        // Send response
        res.json({
            success: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Server error:', error);
        
        // Determine appropriate error response
        const errorResponse = {
            error: "Server Error",
            details: error.message,
            timestamp: new Date().toISOString()
        };

        // Handle specific error types
        if (error.code === 'ENOENT') {
            errorResponse.error = "File Not Found";
            errorResponse.details = "Required file or directory not found";
            return res.status(404).json(errorResponse);
        }

        if (error.code === 'EACCES') {
            errorResponse.error = "Permission Denied";
            errorResponse.details = "Unable to access required files";
            return res.status(403).json(errorResponse);
        }

        res.status(500).json(errorResponse);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});