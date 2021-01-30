let db;

// create a new database request for a "budget" database
const request = indexedDB.open('budget', 1);

// create an object store called 'pending', autoIncrement
request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createObjectStore('pending', { autoIncrement: true });
};

// check to see if the app is online, then read from db
request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log('ERROR! ' + event.target.errorCode); 
};

// create a transaction on the pending database with readwrite access, 
// access the pending object store, 
// then add the record to your store using the add method.
function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');

    store.add(record);
}

// open a transaction on your pending database
// then access the pending object store
// get all of the records from store and set to a variable
function checkDatabase() {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })

            .then((response) => response.json())
            .then(() => {
                const transaction = db.transaction(['pending'], 'readwrite');
                const store = transaction.objectStore('pending');

                store.clear();
            });
        }
    };
}

// listen for the app coming back online
window.addEventListener('online', checkDatabase); 