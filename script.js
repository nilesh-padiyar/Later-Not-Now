
document.addEventListener('DOMContentLoaded', () => {

    const btnThought = document.getElementById('button1');
    const btnIdea = document.getElementById('button2');
    const btnTask = document.getElementById('button3');

    const inputContainer = document.getElementById('inputContainer');
    const noteInput = document.getElementById('noteInput');
    const saveBtn = document.getElementById('saveNoteBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const notesList = document.getElementById('notesList');

    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const fileInput = document.getElementById('fileInput');


    const searchInput = document.getElementById('searchInput');
    const sortOrder = document.getElementById('sortOrder');


    let activeCategory = '';
    let notes = JSON.parse(localStorage.getItem('laterNotNowData')) || [];


    function renderNotes() {
        notesList.innerHTML = '';

        const term = searchInput.value.toLowerCase();
        const order = sortOrder.value;


        let filteredNotes = notes.filter(note =>
        note.text.toLowerCase().includes(term) ||
        note.tag.toLowerCase().includes(term)
        );


        filteredNotes.sort((a, b) => {
            return order === 'newest' ? b.id - a.id : a.id - b.id;
        });

        if (filteredNotes.length === 0) {
            notesList.innerHTML = '<p style="color: grey;">No notes found.</p>';
            return;
        }

        filteredNotes.forEach(note => {
            const div = document.createElement('div');

            let tagColor = '#f0f0f0';
            if(note.tag === 'Thought') tagColor = 'honeydew';
            if(note.tag === 'Idea') tagColor = 'lavender';
            if(note.tag === 'Task/Goal') tagColor = 'lavenderblush';

            div.style.cssText = `
            border: 1px solid grey;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: white;
            position: relative;
            `;

            div.innerHTML = `
            <span style="background-color: ${tagColor}; padding: 4px 8px; border-radius: 5px; border: 1px solid #ccc; font-size: 0.8rem; font-weight: bold;">
            ${note.tag}
            </span>
            <span style="font-size: 0.8rem; color: #666; float: right;">${new Date(note.id).toLocaleDateString()}</span>
            <p style="margin-top: 10px; font-family: sans-serif;">${note.text}</p>
            <button onclick="deleteNote(${note.id})" style="margin-top: 5px; font-size: 0.8rem; color: red; background: none; border: none; cursor: pointer;">Delete</button>
            `;
            notesList.appendChild(div);
        });
    }

    function showInput(category) {
        activeCategory = category;
        inputContainer.style.display = 'block';
        noteInput.value = '';
        noteInput.placeholder = `Type your ${category}...`;
        noteInput.focus();
        document.getElementById('controls').style.display = 'none';
        document.getElementById('searchContainer').style.display = 'none'; // Hide search while typing
    }

    function hideInput() {
        inputContainer.style.display = 'none';
        document.getElementById('controls').style.display = 'block';
        document.getElementById('searchContainer').style.display = 'flex'; // Show search again
        activeCategory = '';
    }

    function saveNote() {
        const text = noteInput.value.trim();
        if (!text) {
            alert("Please type something!");
            return;
        }

        const newNote = {
            id: Date.now(),
                          text: text,
                          tag: activeCategory
        };

        notes.push(newNote);
        localStorage.setItem('laterNotNowData', JSON.stringify(notes));

        hideInput();
        renderNotes();
    }

    function exportData() {
        const dataStr = JSON.stringify(notes, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `later_not_now_backup_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedNotes = JSON.parse(e.target.result);
                if (Array.isArray(importedNotes)) {
                    const existingIds = new Set(notes.map(n => n.id));
                    importedNotes.forEach(note => {
                        if (!existingIds.has(note.id)) {
                            notes.push(note);
                        }
                    });
                    localStorage.setItem('laterNotNowData', JSON.stringify(notes));
                    renderNotes();
                    alert("Notes imported successfully!");
                }
            } catch (err) { alert("Error reading file."); }
        };
        reader.readAsText(file);
    }

    btnThought.addEventListener('click', () => showInput('Thought'));
    btnIdea.addEventListener('click', () => showInput('Idea'));
    btnTask.addEventListener('click', () => showInput('Task/Goal'));

    saveBtn.addEventListener('click', saveNote);
    cancelBtn.addEventListener('click', hideInput);

    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importData);

    searchInput.addEventListener('input', renderNotes);
    sortOrder.addEventListener('change', renderNotes);

    window.deleteNote = function(id) {
        if(confirm("Delete this note?")) {
            notes = notes.filter(note => note.id !== id);
            localStorage.setItem('laterNotNowData', JSON.stringify(notes));
            renderNotes();
        }
    };

    renderNotes();
});
