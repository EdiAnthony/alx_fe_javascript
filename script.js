const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; 

// Default quotes
const defaultQuotes = [
    { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { id: 2, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { id: 3, text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" },
    { id: 4, text: "The best way to predict the future is to invent it.", category: "Innovation" },
    { id: 5, text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { id: 6, text: "The purpose of our lives is to be happy.", category: "Happiness" },
    { id: 7, text: "You miss 100% of the shots you don't take.", category: "Opportunity" },
    { id: 8, text: "In three words I can sum up everything I've learned about life: it goes on.", category: "Wisdom" },
    { id: 9, text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", category: "Identity" },
    { id: 10, text: "It does not matter how slowly you go as long as you do not stop.", category: "Perseverance" }
];

// Initialize quotes from local storage or use default
const quotes = JSON.parse(localStorage.getItem('quotes')) || defaultQuotes;

function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    document.getElementById('quoteDisplay').innerText = `${quote.text} - ${quote.category}`;
}

function populateCategories() {
    const categorySelect = document.getElementById('categoryFilter');
    const categories = new Set(quotes.map(quote => quote.category));
    categorySelect.innerHTML = '<option value="all">All Categories</option>'; // Reset with default option

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Restore the last selected filter
    const lastSelectedCategory = localStorage.getItem('selectedCategory') || 'all';
    categorySelect.value = lastSelectedCategory;
    filterQuotes();
}

function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory); // Save selected filter

    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex] || { text: "No quotes available for this category.", category: "" };
    document.getElementById('quoteDisplay').innerText = `${quote.text} - ${quote.category}`;
}

async function fetchServerQuotes() {
    try {
        const response = await fetch(serverUrl);
        const serverQuotes = await response.json();
        return serverQuotes;
    } catch (error) {
        console.error('Error fetching server quotes:', error);
        return [];
    }
}

async function postQuoteToServer(quote) {
    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quote),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error posting quote to server:', error);
        return null;
    }
}

function startPeriodicFetching() {
    fetchServerQuotes().then(serverQuotes => {
        syncLocalDataWithServer(serverQuotes);
    });

    setInterval(async () => {
        const serverQuotes = await fetchServerQuotes();
        syncLocalDataWithServer(serverQuotes);
    }, 60000); // Fetch every 60 seconds
}

function syncLocalDataWithServer(serverQuotes) {
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    const serverQuoteMap = new Map(serverQuotes.map(quote => [quote.id, quote]));

    // Post new local quotes to server
    localQuotes.forEach(localQuote => {
        if (!serverQuoteMap.has(localQuote.id)) {
            postQuoteToServer(localQuote).then(response => {
                if (response) {
                    console.log('Posted new quote to server:', response);
                }
            });
        }
    });

    // Update local quotes with server data
    const updatedQuotes = serverQuotes.map(serverQuote => ({
        id: serverQuote.id,
        text: serverQuote.text,
        category: serverQuote.category
    }));

    localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
    populateCategories();
    console.log('Local data synced with server.');
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                const currentQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
                const updatedQuotes = [...currentQuotes, ...importedQuotes];
                localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
                populateCategories();
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid file format.');
            }
        };
        fileReader.readAsText(file);
    }
}

function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
    if (newQuoteText && newQuoteCategory) {
        const newQuote = { id: Date.now(), text: newQuoteText, category: newQuoteCategory };
        const currentQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
        currentQuotes.push(newQuote);
        localStorage.setItem('quotes', JSON.stringify(currentQuotes));
        populateCategories();
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('Quote added successfully!');
    } else {
        alert('Please enter both quote text and category.');
    }
}

function syncQuotesWithServer() {
    fetchServerQuotes().then(serverQuotes => {
        syncLocalDataWithServer(serverQuotes);
    });
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuote').addEventListener('click', addQuote);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
document.getElementById('syncQuotes').addEventListener('click', syncQuotesWithServer);

startPeriodicFetching();
