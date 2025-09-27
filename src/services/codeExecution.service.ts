import axios from 'axios';

// Define the structure of the Judge0 API response
interface Judge0Response {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    message: string | null;
    time: string;
    memory: number;
    status: {
        id: number;
        description: string;
    };
}

// Define the structure of our clean output
export interface ExecutionResult {
    output: string | null;
    error: string | null;
    executionTime: number; // in seconds
    memory: number; // in KB
    status: string;
}

// Language IDs for Judge0
const LANGUAGE_MAP: { [key: string]: number } = {
    javascript: 93, // Node.js
    python: 71, // Python 3.8
    java: 62, // Java OpenJDK 13
    cpp: 54, // C++ GCC 9.2
};

/**
 * Executes a given code snippet using the Judge0 API.
 * @param code The source code to execute.
 * @param language The programming language (e.g., 'javascript', 'python').
 * @returns A promise that resolves to an ExecutionResult object.
 */
export async function executeCode(code: string, language: string): Promise<ExecutionResult> {
    const languageId = LANGUAGE_MAP[language.toLowerCase()];
    if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: {
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        data: {
            language_id: languageId,
            source_code: Buffer.from(code).toString('base64'),
            // stdin can be added here if needed, also base64 encoded
        }
    };

    try {
        const submissionResponse = await axios.request(options);
        const token = submissionResponse.data.token;

        // Poll for the result
        while (true) {
            const resultResponse = await axios.request({
                method: 'GET',
                url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
                params: {
                    base64_encoded: 'true',
                    fields: '*'
                },
                headers: {
                    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                }
            });

            const resultData: Judge0Response = resultResponse.data;

            if (resultData.status.id > 2) { // Statuses 1 (In Queue) and 2 (Processing) are pending
                const output = resultData.stdout ? Buffer.from(resultData.stdout, 'base64').toString('utf-8') : null;
                
                let error = null;
                if (resultData.stderr) {
                    error = Buffer.from(resultData.stderr, 'base64').toString('utf-8');
                } else if (resultData.compile_output) {
                    error = Buffer.from(resultData.compile_output, 'base64').toString('utf-8');
                } else if (resultData.status.description !== 'Accepted') {
                    error = resultData.message ? Buffer.from(resultData.message, 'base64').toString('utf-8') : resultData.status.description;
                }
                
                return {
                    output,
                    error,
                    executionTime: parseFloat(resultData.time),
                    memory: resultData.memory,
                    status: resultData.status.description,
                };
            }
            // Wait for a short period before polling again
            await new Promise(resolve => setTimeout(resolve, 250));
        }
    } catch (error: any) {
        console.error("Error executing code via Judge0:", error.response?.data || error.message);
        throw new Error("Failed to execute code.");
    }
}
