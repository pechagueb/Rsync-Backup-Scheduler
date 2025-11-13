
import { GoogleGenAI, Type } from "@google/genai";
import { Schedule, ScheduleType } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        jobName: { type: Type.STRING, description: 'A short, descriptive name for the backup job, e.g., "Photos Backup".' },
        source: { type: Type.STRING, description: 'The source directory path for the backup, e.g., "/home/user/photos".' },
        destination: { type: Type.STRING, description: 'The destination directory path, e.g., "/mnt/external_drive/backups/photos".' },
        rsyncFlags: { 
            type: Type.OBJECT,
            properties: {
                archive: { type: Type.BOOLEAN, description: 'Use archive mode (-a).' },
                verbose: { type: Type.BOOLEAN, description: 'Use verbose mode (-v).' },
                compress: { type: Type.BOOLEAN, description: 'Use compress mode (-z).' },
                delete: { type: Type.BOOLEAN, description: 'Delete extraneous files from dest dirs (--delete).' },
            }
        },
        schedule: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, description: `The schedule frequency. One of: "${ScheduleType.HOURLY}", "${ScheduleType.DAILY}", "${ScheduleType.WEEKLY}", "${ScheduleType.MONTHLY}".` },
                minute: { type: Type.INTEGER, description: 'The minute of the hour (0-59).' },
                hour: { type: Type.INTEGER, description: 'The hour of the day (0-23).' },
                dayOfMonth: { type: Type.INTEGER, description: 'The day of the month (1-31). Only for monthly schedule.' },
                dayOfWeek: { type: Type.INTEGER, description: 'The day of the week (0=Sunday, 6=Saturday). Only for weekly schedule.' },
            }
        },
    },
};


export const parseBackupRequest = async (prompt: string): Promise<any> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is not configured.");
    }
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following user request and extract the parameters for an rsync backup job. Return the data in a JSON object format. Today is ${new Date().toDateString()}. User request: "${prompt}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error parsing backup request with Gemini:", error);
    throw new Error("Failed to generate backup configuration. Please try again or fill the form manually.");
  }
};
