// document.addEventListener("DOMContentLoaded", function () {...}); see kuulaja ootab, kuni kogu HTML on täielikult laetud ja parseeritud, enne kui käivitab 
// funktsiooni sisu. See ei oota CSS-i, pilte või muid ressursse, vaid ainult dokumendi DOMi valmimist.
// leht laetakse sujuvalt sisse
// document.addEventListener("DOMContentLoaded", function () {...}); this listener waits until all HTML is fully loaded and parsed before executing
// function content. It doesn't wait for CSS, images, or other resources, just the document DOM to complete.
// the page will load smoothly
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute("data-theme", savedTheme);
}); 
  
  // see koodi lõik hoolitseb lehekülje dark/light tekkimise ja püsimise eest
  // this piece of code takes care of the creation and persistence of the dark/light page
document.getElementById("themeToggle").addEventListener("click", function() {
  let currentTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", currentTheme);
  localStorage.setItem('theme', currentTheme); // save used theme
});


// /////////////////////////////
// Function to change button selection and color
function toggleSelection(event) {
  console.log('Button clicked!'); // logs message to console - that was for testing. Result I saw f12=>console
  const button = event.target;
  button.classList.toggle('selected');

  updateOutput(globalCarData);
}

function selectAllManufacturers() {
  // Vali kõik tootja nupud ja lisa neile .selected klass
  document.querySelectorAll('.manufacturer-button').forEach(btn => {
    btn.classList.add('selected');
  });
  // Uuenda väljundi sisu
  updateOutput(globalCarData);
}

function selectAllCategories() {
  // Vali kõik kategooria nupud ja lisa neile .selected klass
  document.querySelectorAll('.category-button').forEach(btn => {
    btn.classList.add('selected');
  });
  // Uuenda väljundi sisu
  updateOutput(globalCarData);
}

// function to clear selection
function toggleClearSelection() {
  document.querySelectorAll('.manufacturer-button, .category-button').forEach(btn => {
    btn.classList.remove('selected');
  });
  updateOutput(innerHTML = '');
}

// function to SORT BY buttons (only one button at a time)
function handleSortButtonClick(event) {
  const button = event.target;
  const sortValue = event.target.value;
    const alreadySelected = button.classList.contains('selected');
    document.querySelectorAll('.sort-button').forEach (button => {
      button.classList.remove('selected');
    });
    
  if(!alreadySelected) {
    button.classList.add('selected')
  }  
  console.log('Sort by:', sortValue); // logs message to console - that was for testing. Result I saw f12=>console

  updateOutput(globalCarData);
}


// // Function to output information
// function updateOutput() {
//   const selectedManufacturers = document.querySelectorAll('.manufacturer-button.selected');
//   const selectedCategories = document.querySelectorAll('.category-button.selected');

//   // We create arrays of the names of the selected manufacturers and categories
//   const selectedManufacturersNames = Array.from(selectedManufacturers).map(btn => btn.value);
//   const selectedCategoriesNames = Array.from(selectedCategories).map(btn => btn.value);

// // Use the arrays created here to display the selected information to the user
// // For example, you can display names separated by commas
//   const outputElement = document.getElementById('cars-output');
//   outputElement.innerHTML = `Selected manufacturers:<br>${selectedManufacturersNames.join('<br>')}<br><br>Selected categories:<br>${selectedCategoriesNames.join('<br>')}`;

// // Create logic to update the information displayed in the information output field
// }

// //////////////////////////////////
// fetch('temporary/data.json')
//   .then(response => response.json())
//   .then(data => {
//     // Kasutage data objekti, et kuvada andmed veebilehel
//     updateOutput(data);
//   })
//   .catch(error => console.error('Error loading the data:', error));


// // //////////////////////////////////////
// function displayCarInfo(data) {
//   const selectedManufacturers = document.querySelectorAll('.manufacturer-button.selected');
//   const selectedCategories = document.querySelectorAll('.category-button.selected');

//     // 'data' on objekt või massiiv, mis sisaldab auto andmeid
//   const output = document.getElementById('cars-output');

//     // Eemalda vana sisu
//   output.innerHTML = '';

//     // Genereerib uue sisu iga auto kohta
//   data.carModels.forEach(carModels => {
//     const category = data.categories.find(category => category.id === carModels.categoryId);
//     const categoryName = category ? category.name : 'Unknown';

//     const carDiv = document.createElement('div');
//     carDiv.classList.add('car-info-container');
//     carDiv.innerHTML = `
//     <img class="car-image" src="temporary/img/${carModels.image}" alt="${carModels.name}">
//     <div class="car-details">
//         <h2>${carModels.name}</h2>
//         <ul>
//             <li>Category: ${categoryName }</li>
//             <li>Year: ${carModels.year}</li>
//             <li>Engine: ${carModels.specifications.engine}</li>
//             <li>Horsepower: ${carModels.specifications.horsepower}</li>
//             <li>Transmission: ${carModels.specifications.transmission}</li>
//             <li>Drivetrain: ${carModels.specifications.drivetrain}</li>
//         </ul>
//     </div>
//     `;
//     output.appendChild(carDiv);
//   });
// }

///////////////////////////
///////////////////////////
//////////////////////////
// Funktsioon, mis filtreerib ja kuvab autode andmeid vastavalt valikutele
function updateOutput(data) {
  console.log("updateOutput called with data", data); // for testing

  const output = document.getElementById('cars-output');
  const selectedManufacturers = Array.from(document.querySelectorAll('.manufacturer-button.selected')).map(btn => parseInt(btn.value));
  const selectedCategories = Array.from(document.querySelectorAll('.category-button.selected')).map(btn => parseInt(btn.value));

  // Eemalda eelmine sisu
  output.innerHTML = '';
  
  if (!data || !data.carModels) {
    console.error('Data is not loaded yet!');
    return; // Katkesta funktsiooni täitmine, kui andmed pole veel laetud
}

  // Filtreeri autosid vastavalt valitud tootjatele ja kategooriatele
  const filteredCars = data.carModels.filter(car => {
    const matchesManufacturer = selectedManufacturers.length === 0 || selectedManufacturers.includes(car.manufacturerId);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(car.categoryId);
    return matchesManufacturer && matchesCategory;
  });

  // Kuvab iga filtreeritud auto
  filteredCars.forEach(carModel => {
    const category = data.categories.find(category => category.id === carModel.categoryId);
    const categoryName = category ? category.name : 'Unknown';

    const carDiv = document.createElement('div');
    carDiv.classList.add('car-info-container');
    carDiv.innerHTML = `
      <img class="car-image" src="temporary/img/${carModel.image}" alt="${carModel.name}">
      <div class="car-details">
          <h2>${carModel.name}</h2>
          <ul>
              <li>Category: ${categoryName}</li>
              <li>Year: ${carModel.year}</li>
              <li>Engine: ${carModel.specifications.engine}</li>
              <li>Horsepower: ${carModel.specifications.horsepower}</li>
              <li>Transmission: ${carModel.specifications.transmission}</li>
              <li>Drivetrain: ${carModel.specifications.drivetrain}</li>
          </ul>
      </div>
    `;
    output.appendChild(carDiv);
  });
}



  // -----------
let globalCarData; // Globaalne muutuja andmete hoidmiseks
// Andmete laadimine
fetch('temporary/data.json')
  .then(response => response.json())
  .then(data => {
    globalCarData = data; // Salvestage laetud andmed globaalsesse muutujasse
    // updateOutput(globalCarData); // Kutsuge esimene kuvamine välja kohe pärast andmete laadimist
  })
  .catch(error => console.error('Error loading the data:', error));



// Add event handlers to all buttons in FILTER BY area
// document.querySelectorAll('.manufacturer-button').forEach(btn => {
//   btn.addEventListener('click', toggleSelection);
// });
// Lisame sündmusekäsitlejad kõigile nuppudele
document.querySelectorAll('.manufacturer-button, .category-button').forEach(btn => {
  btn.addEventListener('click', toggleSelection);
});
// document.querySelectorAll('.category-button').forEach(btn => {
//   btn.addEventListener('click', toggleSelection);
// });
// Add event handlers to all buttons in SORT BY area
document.querySelectorAll('.sort-button').forEach(button => {
  button.addEventListener('click', handleSortButtonClick);
});
// event to Clear Selection button
document.getElementById('clearSelection').addEventListener('click', toggleClearSelection);
// 2 events to select all buttons in FILTER BY area
document.getElementById('all-manufacturers-button').addEventListener('click', selectAllManufacturers);
document.getElementById('all-categories-button').addEventListener('click', selectAllCategories);
// document.getElementById('make-asc').addEventListener('click', () => sortData('make-asc'));
// to sort by buttons
document.querySelector('.sort-button[value="make-asc"]').addEventListener('click', () => sortData('make-asc'));
document.querySelector('.sort-button[value="make-desc"]').addEventListener('click', () => sortData('make-desc'));



////////////////////////////////////////////////
// SORT BY operaton - for future
////// Note to myself: uurida lähemat infot selle kohta!! 
// function sortData(criteria) {
//   const outputElement = document.getElementById('info-output');

//   if (criteria === 'make-asc') {
//     selectedManufacturersNames.sort(); // Sorteerib tähestiku järjekorras
//   } else if (criteria === 'make-desc') {
//     selectedManufacturersNames.sort().reverse(); // Sorteerib vastupidises tähestiku järjekorras
//   }

//   // Uuendame väljundit sorteeritud nimedega
//   updateOutput(selectedManufacturersNames);
// }



/////////////////////////////////////////////////////////////////////////////////////
// järgmised read on popuppide jaoks ning pärastiseks koht API-st info hankimiseks
// the following lines are for popups and later a place to get information from the API
document.querySelectorAll('.logo').forEach(logo => {
  logo.addEventListener('mouseenter', (event) => {
    // Võib hankida andmeid API-st ja uuendada hüpikakna sisu
    // Can get data from API and update popup content
    const popupId = event.target.id + "-popup";
    const popup = document.getElementById(popupId);
    // Siin oleks kood andmete hankimiseks ja kuvamiseks hüpikaknas
    // Here would be the code to get the data and display it in the popup
  });
});


//////////////////////////
// tulevikuks // FOR FUTURE
// // Eeldame, et teil on andmed sellises vormis
// let carsData = [
//   { manufacturer: 'Toyota', model: 'Corolla', year: 2020 },
//   { manufacturer: 'Honda', model: 'Civic', year: 2018 },
//   // ... rohkem objekte
// ];

// // Sorteerimisfunktsioon
// function sortData(criteria) {
//   // Näide: sorteerime aasta järgi kasvavas järjekorras
//   if (criteria === 'year-asc') {
//     carsData.sort((a, b) => a.year - b.year);
//   }
//   // Lisage siia muud sorteerimiskriteeriumid vastavalt vajadusele
  
//   // Pärast sorteerimist uuendage väljundit
//   updateOutput(carsData);
// }

// // Funktsioon andmete uuendamiseks väljundis
// function updateOutput(sortedData) {
//   const outputElement = document.getElementById('info-output');
//   outputElement.innerHTML = ''; // Puhasta olemasolev sisu
//   sortedData.forEach(car => {
//     // Looge iga auto jaoks uus element ja lisage see väljundisse
//     const carInfo = document.createElement('div');
//     carInfo.textContent = `${car.manufacturer} ${car.model} - ${car.year}`;
//     outputElement.appendChild(carInfo);
//   });
// }

// // Eeldame, et teil on nupp, mis käivitab sorteerimise
// document.getElementById('sort-year-asc').addEventListener('click', () => sortData('year-asc'));
