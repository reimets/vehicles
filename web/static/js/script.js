let currentlyDisplayedCarIds = []; // Ensure this is declared at the top-level scope of your script

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
  
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute("data-theme", savedTheme);

    setupEventListeners();
    setupThemeToggle();
});

function setupEventListeners() {
    const outputArea = document.getElementById('cars-output');
    outputArea.addEventListener('click', function(event) {
        if (event.target.classList.contains('about-button')) {
            const carId = event.target.getAttribute('data-car-id');
            console.log("Button clicked. Fetching details for car ID:", carId);
            fetchCarDetails(carId);
        }
    });

    const manufacturerButtons = document.querySelectorAll('.manufacturer-button');
    manufacturerButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleButtonActive(this);
            const filterType = 'manufacturerId';
            fetchAndDisplayCars({ [filterType]: this.value }, false);
        });
    });

    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleButtonActive(this);
            const filterType = 'categoryId';
            fetchAndDisplayCars({ [filterType]: this.value }, false);
        });
    });

    document.querySelectorAll('.sort-button').forEach(button => {
        button.addEventListener('click', function() {
            const [field, order] = this.value.split('-');
            fetchSortedCars(field, order);
            handleSortButtonClick(button);

        });
    });

    function handleSortButtonClick(button) {
          const alreadySelected = button.classList.contains('selected');
          document.querySelectorAll('.sort-button').forEach (button => {
            button.classList.remove('selected');
          });
          
        if(!alreadySelected) {
          button.classList.add('selected')
        }  
      }

    document.getElementById('all-manufacturers-button').addEventListener('click', () => {
        manufacturerButtons.forEach(button => button.classList.add('selected'));
        fetchAndDisplayCars({}, true);
    });

    document.getElementById('all-categories-button').addEventListener('click', () => {
        categoryButtons.forEach(button => button.classList.add('selected'));
        fetchAndDisplayCars({}, true);
    });

    document.getElementById('clearSelection').addEventListener('click', resetDisplay);
}

    document.addEventListener('DOMContentLoaded', function() {
        const outputArea = document.getElementById('cars-output'); // Static parent element
        outputArea.addEventListener('click', function(event) {
            if (event.target.classList.contains('about-button')) {
                const carId = event.target.getAttribute('data-car-id');
                console.log("Button clicked. Fetching details for car ID:", carId); // Debug output
                fetchCarDetails(carId);
            }
        });
    });

    function setupThemeToggle() {
        document.getElementById('themeToggle').addEventListener('click', function() {
            let currentTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
            document.body.setAttribute("data-theme", currentTheme);
            localStorage.setItem('theme', currentTheme);
        });
    }

    function fetchAndDisplayCars(filters, replace) {
        const queryParams = new URLSearchParams();
        for (const key in filters) {
            if (filters[key]) { // Check if value is truthy to avoid undefined or null values
                queryParams.append(key, filters[key]);
                console.log(`Adding filter: ${key}=${filters[key]}`); // Debugging line
            }
        }

        const url = `/api/cars?${queryParams.toString()}`;
        console.log(`Fetching cars with URL: ${url}`); // Debugging line
    
        fetch(url)
            .then(response => response.json())
            .catch(error => {
                console.error('Failed to fetch cars:', error);
                return []; // Return an empty array on failure
            })
            .then(data => {
                console.log('Cars data received:', data); // More debugging
                updateCarOutput(data, replace);
            })
            .catch(error => console.error('Error in processing cars data:', error));
    }
    
    

function fetchSortedCars(field, order) {
        if (currentlyDisplayedCarIds.length === 0) {
            displayWarningPopup("Please select cars first before sorting.");
            return; // Stop the function if no cars are selected
        }
    
    const url = new URL('/api/sort-cars', window.location.origin);
    url.searchParams.append('field', field);
    url.searchParams.append('order', order);
    url.searchParams.append('carIds', JSON.stringify(currentlyDisplayedCarIds));

    fetch(url)
        .then(response => response.json())
            .then(data => {
                updateCarOutput(data, true);
            })
            .catch(error => {
                console.error('Failed to fetch sorted cars:', error);
                alert('Failed to fetch sorted cars. Please try again.');
            });
    }

    function displayWarningPopup(message) {
        let popup = document.querySelector('.warning-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.className = 'warning-popup';
            popup.innerHTML = `<p>${message}</p>`;
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => {
                popup.style.display = 'none';
            });
            popup.appendChild(closeButton);
            document.body.appendChild(popup);
        }
        popup.style.display = 'block';
    }
    
    

function fetchCarDetails(carId) {
    console.log(`Attempting to fetch details for car ID: ${carId}`);
    fetch(`/api/car-details/${carId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Data received:", data);
            displayCarDetailsPopup(data);
        })
        .catch(error => console.error('Failed to fetch car details:', error));
}

function displayCarDetailsPopup(car) {
    // Remove existing popup if present
    const existingPopup = document.querySelector('.car-details-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'car-details-popup';

    // Set up the inner HTML with flexbox for layout
    popup.innerHTML = `
        <div class="car-info">
            <h2>${car.name} (${car.year})</h2>
            <p><strong>Manufacturer:</strong> ${car.manufacturer.name}</p>
            <p><strong>Country:</strong> ${car.manufacturer.country}</p>
            <p><strong>Founding Year of Manufacturer:</strong> ${car.manufacturer.foundingYear}</p>
            <p><strong>Category:</strong> ${car.categoryName}</p>
            <p><strong>Engine:</strong> ${car.specifications.engine}</p>
            <p><strong>Horsepower:</strong> ${car.specifications.horsepower}</p>
            <p><strong>Transmission:</strong> ${car.specifications.transmission}</p>
            <p><strong>Drivetrain:</strong> ${car.specifications.drivetrain}</p>
            <button onclick="closePopup()" class="close-btn">Close</button>
        </div>
        <div class="car-image-olha">
            <img src="./api/img/${car.image}" alt="Image of ${car.name}">
        </div>
    `;

    // Append to body
    document.body.appendChild(popup);
}

function closePopup() {
    const popup = document.querySelector('.car-details-popup');
    if (popup) {
        popup.remove();
    }
}




function updateCarOutput(cars, replace) {
    const output = document.getElementById('cars-output');
    if (replace) {
        output.innerHTML = ''; // Clear the current content
        currentlyDisplayedCarIds = []; // Reset the displayed car IDs
    }
    cars = cars || [];

    console.log('Updating car output with', cars.length, 'cars');

    if (cars.length === 0) {
        console.log('No cars found, displaying popup');
        displayNoCarsPopup(); // Display the popup if no cars are found
    } else {
    cars.forEach(car => {
        if (!currentlyDisplayedCarIds.includes(car.id)) {
            currentlyDisplayedCarIds.push(car.id);
            const carDiv = document.createElement('div');
            carDiv.className = 'car-info-container';
            carDiv.innerHTML = `
                <img class="car-image" src="./api/img/${car.image}" alt="${car.name}">
                <div class="car-details">
                    <h2>${car.name}</h2>
                    <p>Category: ${car.categoryName}</p>
                    <p>Year: ${car.year}</p>
                    <p>Engine: ${car.specifications.engine}</p>
                    <p>Horsepower: ${car.specifications.horsepower}</p>
                    <p>Transmission: ${car.specifications.transmission}</p>
                    <p>Drivetrain: ${car.specifications.drivetrain}</p>
                    <p><button class="about-button" data-car-id="${car.id}">More information</button></p>
                </div>
            `;
            output.appendChild(carDiv);
        }
    });
}
}

function displayNoCarsPopup() {
    let popup = document.querySelector('.no-cars-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.className = 'no-cars-popup';
        popup.innerHTML = `<p>There are currently no cars in this category in stock.</p>`;
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', closeNoCarsPopup);
        popup.appendChild(closeButton);
        document.body.appendChild(popup);
    }
    popup.style.display = 'block';
}

function closeNoCarsPopup() {
    const popup = document.querySelector('.no-cars-popup');
    if (popup) {
        popup.style.display = 'none'; // Hide the popup
    }
}


function resetDisplay() {
    const output = document.getElementById('cars-output');
    output.innerHTML = '';
    currentlyDisplayedCarIds = []; // Clear the tracked IDs

    document.querySelectorAll('.manufacturer-button, .category-button, .sort-button').forEach(button => {
        button.classList.remove('selected');
    });
}

function toggleButtonActive(button) {
    button.classList.toggle('selected');
}