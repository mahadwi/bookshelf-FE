const books = [];
const BOOK_EVENT = 'book-event';
const STORAGE_KEY = 'bookshelf-apps';

document.addEventListener('DOMContentLoaded', function(){
    const submitForm = document.getElementById('inputBook');
    const search = document.getElementById('searchBookTitle');

    search.addEventListener('keyup', function(){
        searchBook();
    });

    submitForm.addEventListener('submit', function(e){
        e.preventDefault();
        addBook();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert('Browser kamu tidak mendukng local storage');
        return false;
    }else{
        return true;
    }
}

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null){
        for(const book of data){
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(BOOK_EVENT));
}

function saveData(){
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

function searchBook(){
    const search = document.getElementById('searchBookTitle').value.toLowerCase();
    const bookContainer = document.querySelectorAll('.book_item > h3');
    for(const book of bookContainer){
        if(book.innerText.toLowerCase().includes(search)){
            book.parentElement.style.display = 'block';
        }else {
            book.parentElement.style.display = 'none';
        }
    }
}

function addBook(){
    const judul = document.getElementById('inputBookTitle').value;
    const penulis = document.getElementById('inputBookAuthor').value;
    const tahun = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete');
    const isChecked = isComplete.checked;

    const bookId = +new Date();
    const bookObject = generateBookObject(bookId, judul, penulis, tahun, isChecked);
    books.push(bookObject);

    document.dispatchEvent(new Event(BOOK_EVENT));
    saveData();
    Swal.fire({
        icon: 'success',
        title: 'Berhasil Simpan Buku',
        showConfirmButton: false,
        timer: 1500
    })
}

function generateBookObject(id, title, author, year, isComplete){
    return {id, title, author, year, isComplete};
}

function makeBooks(bookObject){
    const textTitle = document.createElement('h3');
    textTitle.innerHTML = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerHTML = `Penulis : ${bookObject.author}`;

    const textYear = document.createElement('p');
    textYear.innerHTML = `Tahun : ${bookObject.year}`;

    const action = document.createElement('div');
    action.classList.add('action');

    const trashButton = document.createElement('button');
    trashButton.classList.add('red');
    trashButton.innerText = 'Hapus';

    trashButton.addEventListener('click', function(){
        Swal.fire({
            title: 'Yakin Hapus Buku?',
            showCancelButton: true,
            confirmButtonText: 'Ya',
          }).then((result) => {
            if (result.isConfirmed) {
                removeBook(bookObject.id);
                Swal.fire('Berhasil Hapus', '', 'success')
            }
          })
    });

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textTitle, textAuthor, textYear, action);
    container.setAttribute('id', `book-${bookObject.id}`);

    if(bookObject.isComplete){
        const belumSelesaiButton = document.createElement('button');
        belumSelesaiButton.classList.add('green');
        belumSelesaiButton.innerText = 'Belum selesai di Baca';

        action.append(belumSelesaiButton, trashButton);

        belumSelesaiButton.addEventListener('click', function(){
            belumSelesaiBaca(bookObject.id);
        });
    }else {
        const selesaiButton = document.createElement('button');
        selesaiButton.classList.add('green');
        selesaiButton.innerText = 'Selesai Baca';

        action.append(selesaiButton, trashButton);

        selesaiButton.addEventListener('click', function(){
            selesaiBaca(bookObject.id);
        });
    }

    return container;
}

function belumSelesaiBaca(bookId){
    const bookTarget = findBooks(bookId);
    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(BOOK_EVENT));
    saveData();
}

function selesaiBaca(bookId){
    const bookTarget = findBooks(bookId);
    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(BOOK_EVENT));
    saveData();
}

function removeBook(bookId){
    const bookTarget = findBookIndex(bookId);
    if(bookTarget == -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(BOOK_EVENT));
    saveData();
}

function findBooks(bookId){
    for(const bookItem of books){
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
    return null
}

function findBookIndex(bookId){
    for(const index in books){
        if(books[index].id === bookId){
            return index;
        }
    }
    return -1;
}

document.addEventListener(BOOK_EVENT, function(){
    const belumSelesaiBacaList = document.getElementById('incompleteBookshelfList');
    belumSelesaiBacaList.innerHTML = '';

    const selesaiBacaList = document.getElementById('completeBookshelfList');
    selesaiBacaList.innerHTML = '';

    for(const bookItem of books){
        const bookElement = makeBooks(bookItem);
        
        if(!bookItem.isComplete){
            belumSelesaiBacaList.append(bookElement);
        }else {
            selesaiBacaList.append(bookElement);
        }
    }
})