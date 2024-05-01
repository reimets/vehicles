let currentlyDisplayedCarIds = []; // Ensure this is declared at the top-level scope of your script

// Listener that fires when the DOM content is fully loaded, setting up the application.
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');  // Marks the body as loaded for any loading animations.

    const savedTheme = localStorage.getItem('theme') || 'light';  // Retrieves the saved theme or defaults to 'light'.
    document.body.setAttribute("data-theme", savedTheme);  // Sets the initial theme based on saved settings.

    setupEventListeners();  // Sets up the main event listeners for the application.
    setupThemeToggle();  // Sets up the theme toggle functionality.
});

// Initializes all event listeners for user interactions within the application.
function setupEventListeners() {
    const outputArea = document.getElementById('cars-output');  // Gets the main area where cars are displayed.
    outputArea.addEventListener('click', function(event) {
      if (event.target.classList.contains('about-button')) {  // Listener for clicking on car details buttons.
        const carId = event.target.getAttribute('data-car-id');
        console.log("Button clicked. Fetching details for car ID:", carId);
        fetchCarDetails(carId);  // Fetches details for a specific car.
      }
    });
  
    const manufacturerButtons = document.querySelectorAll('.manufacturer-button');
    const categoryButtons = document.querySelectorAll('.category-button');
    const allManufacturersButton = document.getElementById('all-manufacturers-button');
    const allCategoriesButton = document.getElementById('all-categories-button');
    let activeFilterGroup = null; // Track the active filter group
  
    // Toggles the enabled/disabled state of filter buttons when one group is active.
    const toggleFilterGroup = (group, enable) => {
        const otherGroup = group === manufacturerButtons ? categoryButtons : manufacturerButtons;
        const otherAllButton = group === manufacturerButtons ? allCategoriesButton : allManufacturersButton;
        otherGroup.forEach(button => {  // Disables or enables the other group of buttons.
        button.disabled = !enable;
        button.style.opacity = enable ? '1' : '0.5';  // Changes opacity to indicate disabled state.
        });
        otherAllButton.disabled = !enable;  // Disables or enables the corresponding 'All' button.
        otherAllButton.style.opacity = enable ? '1' : '0.5';
    };
  
    manufacturerButtons.forEach(button => {
      button.addEventListener('click', function() {
        if (!activeFilterGroup || activeFilterGroup === manufacturerButtons) {
          toggleButtonActive(this);
          const filterType = 'manufacturerId';
          fetchAndDisplayCars({ [filterType]: this.value }, false);
          activeFilterGroup = manufacturerButtons;
          toggleFilterGroup(manufacturerButtons, false);
        }
      });
    });
  
    categoryButtons.forEach(button => {
      button.addEventListener('click', function() {
        if (!activeFilterGroup || activeFilterGroup === categoryButtons) {
          toggleButtonActive(this);
          const filterType = 'categoryId';
          fetchAndDisplayCars({ [filterType]: this.value }, false);
          activeFilterGroup = categoryButtons;
          toggleFilterGroup(categoryButtons, false);
        }
      });
    });
  
    document.querySelectorAll('.sort-button').forEach(button => {
      button.addEventListener('click', function() {
        const [field, order] = this.value.split('-');
        fetchSortedCars(field, order);
        handleSortButtonClick(button);
      });
    });
  
    allManufacturersButton.addEventListener('click', () => {
      manufacturerButtons.forEach(button => button.classList.add('selected'));
      fetchAndDisplayCars({}, true);
      activeFilterGroup = manufacturerButtons;
      toggleFilterGroup(manufacturerButtons, false);
    });
  
    allCategoriesButton.addEventListener('click', () => {
      categoryButtons.forEach(button => button.classList.add('selected'));
      fetchAndDisplayCars({}, true);
      activeFilterGroup = categoryButtons;
      toggleFilterGroup(categoryButtons, false);
    });
  
    document.getElementById('clearSelection').addEventListener('click', function() {
      resetDisplay();
      activeFilterGroup = null;
      toggleFilterGroup(manufacturerButtons, true); // Enable all buttons again
      toggleFilterGroup(categoryButtons, true); // Enable all buttons again
    });
  
    // Resets the display area to its initial state and clears any selected filters.
    function resetDisplay() {
        const output = document.getElementById('cars-output');
        output.innerHTML = '';  // Clears the output display area.
        currentlyDisplayedCarIds = [];  // Clears the array of displayed car IDs.
        document.querySelectorAll('.manufacturer-button, .category-button, .sort-button').forEach(button => {
            button.classList.remove('selected');  // Removes 'selected' class from all filter buttons.
            button.disabled = false;  // Re-enables all filter buttons.
            button.style.opacity = '1';  // Resets opacity to fully opaque.
        });
        // Resets the disabled state and opacity of the 'All' buttons as well.
        allManufacturersButton.disabled = false;
        allManufacturersButton.style.opacity = '1';
        allCategoriesButton.disabled = false;
        allCategoriesButton.style.opacity = '1';
    }
}

    // Handles the logic for sort button clicks, toggling the 'selected' state of buttons.
    function handleSortButtonClick(button) {
        const alreadySelected = button.classList.contains('selected'); // Check if the button is already selected.
        document.querySelectorAll('.sort-button').forEach(button => {
            button.classList.remove('selected'); // Remove 'selected' class from all sort buttons to ensure only one can be active at a time.
        });
        
        if (!alreadySelected) {
            button.classList.add('selected'); // Set the 'selected' class on the clicked button if it was not already selected.
        }  
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

    // Sets up the functionality to toggle the theme between light and dark modes.
    function setupThemeToggle() {
        document.getElementById('themeToggle').addEventListener('click', function() {
            let currentTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";  // Toggles the theme.
            document.body.setAttribute("data-theme", currentTheme);  // Sets the new theme.
            localStorage.setItem('theme', currentTheme);  // Saves the new theme setting.
        });
    }

    // Fetches and displays cars based on specified filters, with an option to replace current displays.
    function fetchAndDisplayCars(filters, replace) {
        const queryParams = new URLSearchParams();
        for (const key in filters) {  // Converts filters object into URL search parameters.
            if (filters[key]) {  // Ensures only non-null values are included.
                queryParams.append(key, filters[key]);
                console.log(`Adding filter: ${key}=${filters[key]}`); // Debug output for added filters.
            }
        }

        const url = `/api/cars?${queryParams.toString()}`;  // Constructs the full URL for the API call.
        console.log(`Fetching cars with URL: ${url}`); // Debug output for the fetch operation.

        // Fetch call with then-catch chaining for handling responses and errors.
        fetch(url)
            .then(response => response.json())
            .catch(error => {
                console.error('Failed to fetch cars:', error);
                return []; // Returns an empty array in case of fetch failure.
            })
            .then(data => {
                console.log('Cars data received:', data); // Debug output for received data.
                updateCarOutput(data, replace);  // Updates the display with the received data.
            })
            .catch(error => console.error('Error in processing cars data:', error));
    }
    
    // Fetches car data sorted according to specified field and order, only if cars are already selected.
    function fetchSortedCars(field, order) {
        if (currentlyDisplayedCarIds.length === 0) {
            displayWarningPopup("Please select cars first before sorting."); // Displays a warning if no cars are selected.
            resetDisplay(); // Resets the display to the initial state.
            return; // Exits the function early if no cars are selected.
        }
        
        const url = new URL('/api/sort-cars', window.location.origin); // Constructs the URL for the API call.
        url.searchParams.append('field', field); // Appends the field by which to sort.
        url.searchParams.append('order', order); // Appends the order of sorting.
        url.searchParams.append('carIds', JSON.stringify(currentlyDisplayedCarIds)); // Appends the currently displayed car IDs.

        fetch(url) // Makes the API call.
            .then(response => response.json()) // Parses the JSON response.
            .then(data => {
                updateCarOutput(data, true); // Updates the display with the sorted data.
            })
            .catch(error => {
                console.error('Failed to fetch sorted cars:', error); // Logs an error if the fetch fails.
                alert('Failed to fetch sorted cars. Please try again.'); // Alerts the user on failure.
            });
    }

    // Displays a generic warning popup with a custom message.
    function displayWarningPopup(message) {
        let popup = document.querySelector('.warning-popup'); // Selects the existing warning popup, if any.
        if (!popup) {
            popup = document.createElement('div'); // Creates a new popup div if none exist.
            popup.className = 'warning-popup'; // Sets the class for styling.
            popup.innerHTML = `<p>${message}</p>`; // Inserts the passed message into the popup.
            const closeButton = document.createElement('button'); // Creates a close button for the popup.
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => {
                popup.style.display = 'none'; // Adds click event to hide the popup.
            });
            popup.appendChild(closeButton); // Appends the close button to the popup.
            document.body.appendChild(popup); // Appends the popup to the document body.
        }
        popup.style.display = 'block'; // Makes the popup visible.
    }
    
// Fetches detailed information for a specific car by ID.
function fetchCarDetails(carId) {
    console.log(`Attempting to fetch details for car ID: ${carId}`); // Logs an attempt message with the car ID for debugging.
    fetch(`/api/car-details/${carId}`) // Makes a fetch request to get details for the specified car ID.
        .then(response => {
            if (!response.ok) { // Checks if the server's response is not OK.
                throw new Error('Network response was not ok'); // Throws an error if the response is not satisfactory.
            }
            return response.json(); // Returns the parsed JSON data from the response.
        })
        .then(data => {
            console.log("Data received:", data); // Logs the received data for debugging.
            displayCarDetailsPopup(data); // Displays the car details in a popup.
        })
        .catch(error => console.error('Failed to fetch car details:', error)); // Logs any errors encountered during fetching.
}

// Displays a popup with detailed information about a car.
function displayCarDetailsPopup(car) {
    const existingPopup = document.querySelector('.car-details-popup'); // Checks for an existing popup.
    if (existingPopup) {
        existingPopup.remove(); // Removes the existing popup if present.
    }

    const popup = document.createElement('div'); // Creates a new div element for the popup.
    popup.className = 'car-details-popup'; // Sets the class name for styling purposes.

    // Sets the inner HTML of the popup with detailed car information and structured layout.
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

    document.body.appendChild(popup); // Appends the popup to the body of the document.
}

// Closes the car details popup by removing it from the document.
function closePopup() {
    const popup = document.querySelector('.car-details-popup'); // Selects the car details popup.
    if (popup) {
        popup.remove(); // Removes the popup if it exists.
    }
}

// Updates the car display area with new or additional car data.
function updateCarOutput(cars, replace) {
    const output = document.getElementById('cars-output'); // Selects the output area for cars.
    if (replace) {
        output.innerHTML = ''; // Clears the output area if replace is true.
        currentlyDisplayedCarIds = []; // Resets the list of displayed car IDs.
    }
    cars = cars || []; // Ensures cars is an array to prevent errors.

    console.log('Updating car output with', cars.length, 'cars'); // Logs the number of cars being displayed.

    if (cars.length === 0) {
        console.log('No cars found, displaying popup'); // Logs if no cars are found.
        displayNoCarsPopup(); // Displays a no-cars-available popup.
    } else {
        cars.forEach(car => {
            if (!currentlyDisplayedCarIds.includes(car.id)) {
                currentlyDisplayedCarIds.push(car.id); // Adds car ID to the list if not already included.
                const carDiv = document.createElement('div'); // Creates a new div for each car.
                carDiv.className = 'car-info-container'; // Sets the class for styling.
            // Sets the inner HTML for car details.
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
            output.appendChild(carDiv); // Appends the car div to the output area.
            }
        });
    }
}

// Displays a popup when no cars are available in the selected category.
function displayNoCarsPopup() {
    let popup = document.querySelector('.no-cars-popup'); // Selects the existing no-cars popup, if any.
    if (!popup) {
        popup = document.createElement('div'); // Creates a new popup if none exist.
        popup.className = 'no-cars-popup'; // Sets the class for styling.
        popup.innerHTML = `<p>There are currently no cars in this category in stock.</p>`; // Sets the popup message.
        const closeButton = document.createElement('button'); // Creates a close button.
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', closeNoCarsPopup); // Adds an event to close the popup.
        popup.appendChild(closeButton); // Appends the close button to the popup.
        document.body.appendChild(popup); // Appends the popup to the document body.
    }
    popup.style.display = 'block'; // Makes the popup visible.
}

// Closes the no-cars-available popup.
function closeNoCarsPopup() {
    const popup = document.querySelector('.no-cars-popup'); // Selects the no-cars popup.
    if (popup) {
        popup.style.display = 'none'; // Hides the popup.
    }
}

// Toggles the 'selected' class on a button if it is not already selected.
function toggleButtonActive(button) {
    if (!button.classList.contains('selected')) {
        button.classList.add('selected'); // Adds 'selected' class if it's not present.
    }
}

