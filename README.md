# Assignment 3: An AI-Augmented Concept

[Original Concept](/notes-original.spec)  
[AI Augmented Concept](/notes-ai-augmented.spec)  

UI Interaction sketches:
![UI Interaction sketches](/ui-sketches-AI.jpeg)

User Journey: A user who has inputed his notes on a book in Torah or a lecture or class would like to create flashcards out of the notes. He clicks on the "To TorahCards" button and an llm proccesses the notes into multiple flash cards with questions and answers. He is then taken to the create flashcards page, where all of the flashcards produced by the llm are there for him to modify or delete or add more flashcards. He can then click save on the flashcards and he has flashcards based on his notes.

Prompt Experiments:
1.  For the first experiment, I wanted to make sure that the llm could handle large input. I wanted it to have a limit of 25 cards produced to make sure that llm didn't go over a token output limit. By including the limit in the prompt, I was able to make sure that the llm didn't return more cards given the larger notes size. Otherwise, if it went over the token limit, it could have returned an invalid json, not finishing it.
2. For the second experiment, I wanted to see what would happen if I gave it an empty input. Even though I told it not to make up information not present in the notes, it would just make up flashcards based off of topics in Torah that were not present, which was not the intended outcome. It should have returned 0 cards. As a solution, I realized that in addition to reemphasizing that I don't want outside info, I put quotes around the input text so the llm could recognize that it was an empty input text, which worked.
3. Finally, I wanted to test what would happen if I gave it nonsensical information that had nothing to do with Torah. Originally, it just created flashcards based off of that information, so I added a requirement to only create cards on Torah, and otherwise not create any other cards. This worked, as now it returns an empty list of cards. There still may be a problem if I have a mix of Torah and non-Torah topics, but I'm not sure.

Validation: 
I implemented three validators of the llm output. The first checks that each card id, question, and answer have the correct types. The second checks that no more than 25 cards were created. The last validator checks that the question and answer fields are non-empty for each card and that they don't exceed of 2000 characters, to make sure that they aren't too big.