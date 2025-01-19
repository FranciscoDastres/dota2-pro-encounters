import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import { promisify } from "util";
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const execAsync = promisify(exec);
const app = express();
const PORT = 4000;

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
 
        const scriptPath = path.resolve(process.cwd(), 'src', 'run.sh');
        
        // Check if script exists
        try {
            await fs.access(scriptPath);
        } catch (error) {
            return res.status(404).json({
                error: "Script Not Found",
                details: "The required script file was not found",
                path: scriptPath
            });
        }

        // Try different shell commands based on what's available
        let command;
        try {
            // Try Git Bash first (most common on Windows)
            command = `"C:\\Program Files\\Git\\bin\\bash.exe" "${scriptPath}" "${accountId}"`;
            console.log(`Attempting Git Bash execution: ${command}`);
            const result = await execAsync(command);
            return handleScriptResult(result, res);
        } catch (error) {
            console.log('Git Bash not available, trying WSL...');
            try {
                // Try WSL if available
                command = `wsl bash "${scriptPath}" "${accountId}"`;
                console.log(`Attempting WSL execution: ${command}`);
                const result = await execAsync(command);
                return handleScriptResult(result, res);
            } catch (error) {
                // If neither is available, try to execute the script directly
                // Note: This requires the script to be executable and have proper line endings
                command = `"${scriptPath}" "${accountId}"`;
                console.log(`Attempting direct execution: ${command}`);
                const result = await execAsync(command);
                return handleScriptResult(result, res);
            }
        }
    } catch (error) {
        console.error('Server error:', error);
        
        const errorResponse = {
            error: "Server Error",
            details: error.message,
            timestamp: new Date().toISOString()
        };

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

function handleScriptResult(result, res) {
    const { stdout, stderr } = result;
    
    if (stderr) {
        console.error('Script stderr:', stderr);
    }

    // Try to parse stdout as JSON if possible
    let outputData;
    try {
        outputData = JSON.parse(stdout);
    } catch (e) {
        outputData = stdout;
    }

    console.log('Script output:', outputData);
    
    return res.json({
        success: true,
        data: outputData,
        timestamp: new Date().toISOString()
    });
}

// Rest of your server code remains the same...
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});