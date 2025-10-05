/**
 * notes concept - AI augmented version
 */

import { GeminiLLM } from './gemini-llm';

export interface User {
    username: string;
    id: number;
}

export interface Notes {
    user: User;
    name: string;
    content: string;
}

export interface Flashcard {
    question: string;
    answer: string;
}

export interface Flashcards {
    user: User;
    cards: Flashcard[];
}

// Stores notes for users and allows conversion to flashcards using LLM
export class NotesManager {
    private notesSet: Map<number, Set<Notes>>; // Maps user ID to their notes
    
    constructor() {
        this.notesSet = new Map();
    } 

    addNotes(user: User, name: string, content: string): void {
        const userNotes = this.notesSet.get(user.id) || new Set<Notes>();
        for (let note of userNotes) {
            if (note.name === name) {
                throw new Error('Notes with this name already exist for the user.');
            }
        }
        userNotes.add({ user, name, content });
        this.notesSet.set(user.id, userNotes);
    }

    removeNotes(user: User, name: string): void {
        const userNotes = this.notesSet.get(user.id);
        if (!userNotes) {
            throw new Error('No notes of found for the user.');
        }
        let found = false;
        for (let note of userNotes) {
            if (note.name === name) {
                userNotes.delete(note);
                found = true;
                break;
            }
        }
        if (!found) {
            throw new Error('No notes of given name found for the user.');
        }
    }

    getNotes(user: User, name: string): Notes { 
        const userNotes = this.notesSet.get(user.id);
        if (!userNotes) {
            throw new Error('No notes found for the user.');
        }
        for (let note of userNotes) {
            if (note.name === name) {
                return note;
            }
        }
        throw new Error('No notes of given name found for the user.');
    }

    async notesToFlashCards(user: User, notes: Notes, llm: GeminiLLM): Promise<Flashcards> {
        const userNotes = this.notesSet.get(user.id);
        if (!userNotes) {
            throw new Error('No notes found for the user.');
        }
        let found = false;
        for (let possibleNote of userNotes) {
            if (possibleNote.name === notes.name) {
                found = true;
                break;
            }
        }
        if (!found) {
            throw new Error('No notes of given name found for the user.');
        }
        const prompt = this.createLLMPrompt(notes);
        const responseText = await llm.executeLLM(prompt);
        console.log('LLM Response Text:\n', responseText);
        return this.parseLLMToFlashcards(responseText, user);
    }

    private createLLMPrompt(notes: Notes): string {


        return `
        You are a focused flashcard generator for Torah study.
        Input: a block of notes about any Torah topic.
        Output: valid JSON only — no commentary, no markdown, no extra text.

        CRITICAL REQUIREMENTS:
        1. Parse the notes and generate concise question/answer flashcards covering key rulings, definitions, reasons, stories, contrasts, disagreements(machlokes), ideas.
        2. Produce up to 25 cards depending on input length; if the notes are short, don't make up information not present in the notes to create more cards.
        3. IMPORTANT: If nothing is provided in the notes, do not create any cards.
        4. IMPORTANT: If insuffiecient information is provided, do not use any outside knowledge to create cards.
        5. Each card must have: id (integer starting at 1), question (string), answer (string).
        6. The top-level JSON must include only one key: "cards" (array).
        7. Do not include tags, timestamps, language markers, titles, or any other metadata.
        8. If an item in the notes is ambiguous or missing a clear answer, set the answer to "Ambiguous / not stated".
        9. Do not invent sources or facts not present in the notes.
        10. If the notes do not relate to Torah, return zero cards.
        11. Return parsable JSON only. Do not include any other text.

        Output format example (valid JSON only):
        { 
            "cards": [ 
                {
                    "id": <number starting at 1>, 
                    "question": <string Question text>, 
                    "answer": <string Answer text>
                }
                ... up to 25 cards ...
            ] 
        }

        Now process the input notes below and return ONLY the JSON object, no additional text.
        
        "
        ${notes.content}
        "
        `.trim();
    }
    

    private parseLLMToFlashcards(responseText: string, user: User): Flashcards {
        try {
            // Extract JSON from response (in case there's extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const response = JSON.parse(jsonMatch[0]);
            if (!response.cards || !Array.isArray(response.cards)) {
                throw new Error('Invalid JSON structure: missing cards array');
            }

            // Validator 1: Ensure each card has required fields
            for (let card of response.cards) {
                if (typeof card.id !== 'number' || typeof card.question !== 'string' || typeof card.answer !== 'string') {
                    throw new Error('Invalid card format: question and answer must be strings, id must be a number');
                }
            }

            // Validator 2: Enforce max 25 cards limit in order to ensure max token limit is not exceeded
            if (response.cards.length > 25) {
                throw new Error('Too many cards generated, exceeds limit of 25');
            }

            // Validator 3: Ensure each that question/answer is non-empty (after trimming) and reasonably sized.
            for (let card of response.cards) {
                const q = card.question?.trim();
                const a = card.answer?.trim();
                if (!q || !a) {
                    throw new Error('Invalid card: question and answer must be non-empty');
                }
                const MAX_LEN = 2000;
                if (q.length > MAX_LEN || a.length > MAX_LEN) {
                    throw new Error(`Invalid card: question/answer exceed maximum length of ${MAX_LEN}`);
                }
            }

            // Map to Flashcard interface
            const cards: Flashcard[] = response.cards.map((card: any) => ({
                question: card.question,
                answer: card.answer
            }));

            return { user: user, cards: cards};
        } catch (error) {
            throw new Error('Failed to parse LLM response: ' + (error as Error).message);
        }
    }


}