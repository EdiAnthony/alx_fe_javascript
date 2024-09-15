// Initialize quotes from local storage or use default
const quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" },
    { text: "The best way to predict the future is to invent it.", category: "Innovation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The purpose of our lives is to be happy.", category: "Happiness" },
    { text: "You miss 100% of the shots you don't take.", category: "Opportunity" },
    { text: "In three words I can sum up everything I've learned about life: it goes on.", category: "Wisdom" },
    { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", category: "Identity" },
    { text: "It does not matter how slowly you go as long as you do not stop.", category: "Perseverance" }
];

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

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                localStorage.setItem('quotes', JSON.stringify(quotes));
                populateCategories(); // Update categories dropdown
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
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        localStorage.setItem('quotes', JSON.stringify(quotes));
        populateCategories(); // Update categories dropdown
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('Quote added successfully!');
    } else {
        alert('Please enter both quote text and category.');
    }
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuote').addEventListener('click', addQuote);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Initialize categories and display a random quote on page load
populateCategories();
