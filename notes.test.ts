/**
 * Notes Test Cases
 * 
 * Demonstrates the notes concept with AI-augmented flashcard generation functionality.
 */
import { NotesManager, User, Notes, Flashcards } from './notes';
import { GeminiLLM, Config } from './gemini-llm';
import fs from 'fs/promises';

/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
    try {
        const config = require('../config.json');
const path = require('path');
const fs = require('fs').promises;
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}

const notesExample1 = `Brachos Summaries:
ב.
Mishna:
•	Begin reading ק״ש של ערבית when the Kohanim begin eating trumah
o	Gm’ explains this is צאת
•	Rashi explains why we daven maariv before tzais, b/c the main shma is said al hamitah, enough with first paragraph. Tosfos disagrees
•	3 opinions of until when:
o	ר אליאזר: עד סוף האשמורה הראשונה
o	חכמים: חצות
o	רבן גמליאל: עמוד השחר
•	The Chachamim really hold amud hashachar. They said chatzos כדי להרחיק אדם מן העבירה
•	We pasken like the chachamim, but still say it after chatzos if forgot
Gemara:
•	There are 2 sources for why the mishna starts with Arvis before shacharis
o	 ״בשכבך ובקומך״ (דברים ו ז)
o	״ויהי ערב ויהי בקר יום אחד״ (בראשית א ה) Learn from the creation of the world
ב:
•	A kohen who was a tvul yom can begin eating trumah after tzeis and doesn’t have to wait until the next day when he brings his korban
•	6 different opinions are given for the start time of zman krias shma shel arvis
•	Some new opinions for start time:
o	When the עני enters to eat his bread with salt (b/c too dark)
o	When ppl enter their houses to eat bread on erev Shabbos
o	When Shabbos begins – bein hashmashos
•	Conclusion is that עני and כהן are different times, and the time of עני is later
Daf ב siman (House - בית):
A man rushes into his house exactly at tzais to recite krias shma so that he can join the Kohen and afterwards the poor person in the dining room to eat their terumah and dinner, respectively
`;

/**
 * Test Case 1: Adding Notes
 * Demonstrates adding notes for a user.
 */
export function testAddingNotes() {
    console.log('\n🧪 TEST CASE 1: Adding Notes');
    console.log('==================================');
    const notesManager = new NotesManager();
    const user: User = { id: 1, username: 'Benny' };
    
    console.log('Adding notes for user Benny:');
    notesManager.addNotes(user, 'Brachos Summary', notesExample1);
    console.log('Notes added successfully: ');
    console.log(notesManager.getNotes(user, 'Brachos Summary'));
}

/**
 * Test Case 2: Generating Flashcards from Notes
 * Demonstrates generating flashcards from notes using Gemini LLM.
 */
export async function testGeneratingFlashcards() {
    console.log('\n🧪 TEST CASE 2: Generating Flashcards from Notes');
    console.log('==================================');
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const notesManager = new NotesManager();
    const user: User = { id: 1, username: 'Benny' };
    notesManager.addNotes(user, 'Brachos Summary', notesExample1);
    const notes = notesManager.getNotes(user, 'Brachos Summary');
    console.log('Notes to be used in flashcard generation:');
    console.log(notes);
    
    console.log('Generating flashcards from notes for user Benny:');
    const flashcards: Flashcards = await notesManager.notesToFlashCards(user, notes, llm);
    console.log('Flashcards generated successfully:');
    console.log(flashcards);
    console.log(`Total flashcards generated: ${flashcards.cards.length}`);
    let currentId = 1;
    for (let card of flashcards.cards) {
        console.log(`Card ${currentId}:
    Q: ${card.question}
    A: ${card.answer}`);
        currentId++;
    }
}

/**
 * Test case 3: Long input notes
 * Demonstrates handling of long notes input, doesn't create more than 25 cards
 * which would otherwise result in exceeding the token limit and not returning a valid json.
 */
export async function testLongInputNotes() {
    console.log('\n🧪 TEST CASE 3: Handling Long Input Notes');
    console.log('==================================');
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const notesManager = new NotesManager();
    const user: User = { id: 2, username: 'Alice' };
    
    // load long notes from file
    let longNotes: string;
    try {
        longNotes = await fs.readFile('./test-inputs/long-notes.txt', 'utf-8');
    } catch (err) {
        console.error('❌ Error reading test-inputs/long-notes.txt:', (err as Error).message);
        return;
    }

    notesManager.addNotes(user, 'Long Notes', longNotes);
    const notes = notesManager.getNotes(user, 'Long Notes');

    console.log('Generating flashcards from long notes for user Alice:');
    const flashcards: Flashcards = await notesManager.notesToFlashCards(user, notes, llm);
    console.log('Flashcards generated successfully without generating too many that would exceed token limit:');
    console.log(`Total flashcards generated: ${flashcards.cards.length}`);
    let currentId = 1;
    for (const card of flashcards.cards) {
        console.log(`Card ${currentId}:
    Q: ${card.question}
    A: ${card.answer}`);
        currentId++;
    }
}

/**
 * Test case 4: Empty notes input
 * Demonstrates handling of empty notes input. Should return zero cards, empty json card list.
 */
export async function testEmptyNotes() {
    console.log('\n🧪 TEST CASE 4: Handling Empty Notes Input');
    console.log('==================================');
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const notesManager = new NotesManager();
    const user: User = { id: 3, username: 'Charlie' };
    
    const emptyNotes = '';
    notesManager.addNotes(user, 'Empty Notes', emptyNotes);
    const notes = notesManager.getNotes(user, 'Empty Notes');

    console.log('Generating flashcards from empty notes for user Charlie:');
    try {
        const flashcards: Flashcards = await notesManager.notesToFlashCards(user, notes, llm);

        console.log('Flashcards generated successfully:');
        if (flashcards.cards.length === 0) {
            console.log('No flashcards generated as expected for empty notes input.');
        } else {
            console.error('❌ Unexpected zero flashcards generated for empty notes input:', flashcards);
        }
    } catch (error) {
        console.error('❌ Expected zero cards returned for empty notes input:', (error as Error).message);
    }
}

/**
 * Test case 5: Ghibberish notes input
 * Demonstrates handling of gibberish notes input that has nothing to do with Torah. 
 * Should return zero cards, empty json card list.
 */
export async function testGibberishNotes() {
    console.log('\n🧪 TEST CASE 5: Handling Gibberish Notes Input');
    console.log('==================================');
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const notesManager = new NotesManager();
    const user: User = { id: 4, username: 'David' };
    
    // load long notes from file
    let gibberishNotes: string;
    try {
        gibberishNotes = await fs.readFile('./test-inputs/ghibberish.txt', 'utf-8');
    } catch (err) {
        console.error('❌ Error reading test-inputs/ghibberish.txt:', (err as Error).message);
        return;
    }
    notesManager.addNotes(user, 'Gibberish Notes', gibberishNotes);
    const notes = notesManager.getNotes(user, 'Gibberish Notes');
    console.log('Generating flashcards from gibberish notes for user David:');
    try {
        const flashcards: Flashcards = await notesManager.notesToFlashCards(user, notes, llm);

        console.log('Flashcards generated successfully:');
        if (flashcards.cards.length === 0) {
            console.log('No flashcards generated as expected for nonsensical notes input.');
        } else {
            console.error('❌ Unexpected zero flashcards generated for nonsensical notes input:', flashcards);
        }
    } catch (error) {
        console.error('❌ Expected zero cards returned for nonsensical notes input:', (error as Error).message);
    }
}

/**
 * Main function to run all test cases
 */
async function main(): Promise<void> {
    console.log('🎓 Notes Test Suite');
    console.log('========================\n');
    
    try {
        // Run adding notes test
        await testAddingNotes();

        // Run generating flashcards test
        await testGeneratingFlashcards();

        // Run long input notes test
        await testLongInputNotes();

        // Run empty notes test
        await testEmptyNotes();

        // Run gibberish notes test
        await testGibberishNotes();
 
        console.log('\n🎉 All test cases completed successfully!');
        
    } catch (error) {
        console.error('❌ Test error:', (error as Error).message);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    main();
}
