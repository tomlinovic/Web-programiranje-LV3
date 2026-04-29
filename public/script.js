// ---------------- GLOBALNE VARIJABLE ----------------

let filmovi = []; 
let kosarica = [];


// ---------------- UČITAVANJE CSV-a ----------------

fetch('data/movies.csv')
  .then(res => res.text())
  .then(csv => {
    const rezultat = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true
    });

    filmovi = rezultat.data.map(film => ({
      title: film.Naslov,
      year: Number(film.Godina),
      genre: film.Zanr.split(',').map(c => c.trim()) || [],
      duration: Number(film.Trajanje_min),
      country: film.Zemlja_porijekla?.split('/').map(c => c.trim()) || [],
      rating: Number(film.Ocjena)
    }));

    prikaziTablicu(filmovi.slice(0, 150), false);
  });


// ---------------- FILTRIRANJE ----------------

function primijeniFiltere() {
  const minGodina = Number(document.getElementById('filter-year-text').value) || 0;
  const minOcjena = Number(document.getElementById('filter-rating').value);
  const odabraniZanr = document.getElementById('filter-genre').value;

  const filtrirani = filmovi.filter(f => {
    const matchYear = f.year >= minGodina;
    const matchRating = f.rating >= minOcjena;
    const matchGenre = odabraniZanr === "Svi" || f.genre.includes(odabraniZanr);

    return matchYear && matchRating && matchGenre;
  });

  prikaziTablicu(filtrirani, true);
}


// ---------------- PRIKAZ TABLICE ----------------

function prikaziTablicu(filmovi, showAddButton = false) {
  const tbody = document.querySelector('#filmovi-tablica tbody');
  tbody.innerHTML = '';

  if (filmovi.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="7" style="text-align:center; padding:15px; font-weight:bold;">
        Nema rezultata za zadane kriterije.
      </td>
    `;
    tbody.appendChild(row);
    return;
  }

  for (const film of filmovi) {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${film.title}</td>
      <td>${film.year}</td>
      <td>${film.genre.join(', ')}</td>
      <td>${film.duration}</td>
      <td>${film.country.join(', ')}</td>
      <td>${film.rating}</td>
      <td>
        ${
          showAddButton
            ? `<button class="add-cart-btn" data-title="${film.title}">Dodaj</button>`
            : ""
        }
      </td>
    `;

    tbody.appendChild(row);

    // Ako je filtrirano, dodaj event listener
    if (showAddButton) {
      row.querySelector('.add-cart-btn').addEventListener('click', (e) => {
        dodajUKosaricu(film, e.target);
      });
    }
  }
}



// ---------------- EVENT LISTENERI ----------------

document.getElementById('filter-rating').addEventListener('input', () => {
  document.getElementById('rating-value').textContent =
    document.getElementById('filter-rating').value;
});

document.getElementById('filter-btn').addEventListener('click', primijeniFiltere);


// ---------------- KOŠARICA ----------------

function dodajUKosaricu(film, buttonEl) {
  const postoji = kosarica.some(f => f.title === film.title);
  if (postoji) return;

  kosarica.push(film);
  document.getElementById('cart-count').textContent = kosarica.length;

  // ili makni gumb:
  // buttonEl.remove();

  // ili ga onemogući i promijeni tekst:
  buttonEl.disabled = true;
  buttonEl.textContent = 'U košarici';
  buttonEl.style.opacity = '0.6';
  buttonEl.style.cursor = 'not-allowed';
}




// Prikaz košarice u modalnom prozoru
function prikaziKosaricu() {
  const tbody = document.querySelector('#cart-table tbody');
  tbody.innerHTML = '';

  if (kosarica.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">Košarica je prazna.</td>
      </tr>
    `;
    return;
  }

  kosarica.forEach((film, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${film.title}</td>
      <td>${film.year}</td>
      <td>${film.genre.join(', ')}</td>
      <td><button class="remove-btn" data-index="${index}">X</button></td>
    `;
    tbody.appendChild(row);
  });

  // Uklanjanje iz košarice
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = e.target.dataset.index;

      // spremi film prije brisanja
      const removedFilm = kosarica[index];

      kosarica.splice(index, 1);
      document.getElementById('cart-count').textContent = kosarica.length;
      prikaziKosaricu();

      // ponovno omogući gumb za taj film
      const button = document.querySelector(`button[data-title="${removedFilm.title}"]`);
      if (button) {
          button.disabled = false;
          button.textContent = "Dodaj";
          button.style.opacity = "1";
          button.style.cursor = "pointer";
      }
    });
  });
}


// ---------------- MODALNI PROZOR ----------------

const modal = document.getElementById('cart-modal');
const openBtn = document.getElementById('open-cart-btn');
const closeBtn = document.getElementById('close-cart');

openBtn.addEventListener('click', () => {
  prikaziKosaricu();
  modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});



// ---------------- POTVRDA POSUDBE ----------------

document.getElementById('confirm-cart-btn').addEventListener('click', () => {
  const count = kosarica.length;

  if (count === 0) {
    alert("Košarica je prazna.");
    return;
  }

  document.getElementById('cart-message').textContent =
    `Uspješno ste dodali ${count} filmova u svoju košaricu za vikend maraton!`;

  kosarica = [];
  document.getElementById('cart-count').textContent = 0;
  prikaziKosaricu();

  // 🔥 ponovno aktiviraj sve gumbe
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.disabled = false;
      btn.textContent = "Dodaj";
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
  });
});

