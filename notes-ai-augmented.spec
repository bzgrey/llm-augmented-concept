<concept_spec>

concept Notes[User, Label, Flashcards]

purpose
    store notes on different topics or classes with labels

principle
    a user can store notes and give a label to them; 
    the user can also remove notes of labels;
    the user can also use an llm to turn notes into flashcards

state
    a set of Notes with
        a User
        a name String
        a notes String
        a set of Labels

    a set of Users with
        a set of Notes

actions
    addNotes(user: User, name: String, notes: String, labels: Labels): Notes
        requires
            Notes don't already exist with the same user and name
        effects
            adds new notes to set of Notes associated with the given user, name and labels. Also adds new Notes to set of Users

    removeNotes(user: User, name: String): Notes
        requires
            Notes exist with the same user and name
        effects
            removes notes with given name and user from both Notes set and given user's set

    addLabel(user: User, name: String, label: Label): Label
        requires
            Notes already exist with the same user and name
        effects
            adds new label to Notes of given name and user

    removeLabel(user: User, name: String, label: Label): Label
        requires
            Notes already exist with the same user and name and the given label exists in those Notes
        effects
            removes label from Notes of given name and user

    notesToFlashCards(user: User, notes: Notes): Flashcards
        requires
            Notes already exist with the same user 
        effects
            returns set of question/answer pairs of flashcards based on the notes

</concept_spec>