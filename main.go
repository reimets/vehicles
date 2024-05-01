package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// Define your data structures
type Manufacturer struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Country      string `json:"country"`
	FoundingYear int    `json:"foundingYear"`
}

type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Specifications struct {
	Engine       string `json:"engine"`
	Horsepower   int    `json:"horsepower"`
	Transmission string `json:"transmission"`
	Drivetrain   string `json:"drivetrain"`
}

type CarModels struct {
	ID               int            `json:"id"`
	Name             string         `json:"name"`
	ManufacturerId   int            `json:"manufacturerId"`
	ManufacturerName string         `json:"-"`
	CategoryId       int            `json:"categoryId"`
	CategoryName     string         `json:"categoryName"`
	Year             int            `json:"year"`
	Specifications   Specifications `json:"specifications"`
	Image            string         `json:"image"`
	Country          string         `json:"country"`
	FoundingYear     int            `json:"foundingYear"`
}

type Data struct {
	Manufacturers []Manufacturer `json:"manufacturers"`
	Categories    []Category     `json:"categories"`
	CarModels     []CarModels    `json:"carModels"`
}

var data Data

func loadCarData() error {
	// Fetch data from an external API instead of a local file
	if err := fetchDataFromAPI("http://localhost:3000/api/manufacturers", &data.Manufacturers); err != nil {
		return err
	}
	if err := fetchDataFromAPI("http://localhost:3000/api/categories", &data.Categories); err != nil {
		return err
	}
	if err := fetchDataFromAPI("http://localhost:3000/api/models", &data.CarModels); err != nil {
		return err
	}
	return nil
}

// fetchDataFromAPI makes an HTTP GET request to fetch data from the specified API endpoint.
func fetchDataFromAPI(url string, target interface{}) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return json.NewDecoder(resp.Body).Decode(target)
}

// Serve index page
func serveIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, "./web/index.html")
}

// enhanceModelsWithCategoryData enriches car models with category names from a mapping.
func enhanceModelsWithCategoryData(models []CarModels, categories []Category) {
	categoryMap := make(map[int]string)
	for _, category := range categories {
		categoryMap[category.ID] = category.Name
	}

	for i := range models {
		if name, ok := categoryMap[models[i].CategoryId]; ok {
			models[i].CategoryName = name
		}
	}
}

// enhanceCarData maps manufacturer details to car models for enriched output.
func enhanceCarData() {
	manufacturerMap := make(map[int]Manufacturer)
	for _, m := range data.Manufacturers {
		manufacturerMap[m.ID] = m
	}

	categoryMap := make(map[int]string)
	for _, c := range data.Categories {
		categoryMap[c.ID] = c.Name
	}

	for i, car := range data.CarModels {
		if man, ok := manufacturerMap[car.ManufacturerId]; ok {
			data.CarModels[i].ManufacturerName = man.Name
			data.CarModels[i].Country = man.Country
			data.CarModels[i].FoundingYear = man.FoundingYear
		}
		if catName, ok := categoryMap[car.CategoryId]; ok {
			data.CarModels[i].CategoryName = catName
		}
	}
}

// errorHandler is a middleware that recovers from panics and logs the error, sends notifications, and returns a user-friendly error message.
func errorHandler(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Internal server error: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			}
		}()
		next(w, r)
	}
}

// notifySystemOfError logs the occurrence of an error for monitoring purposes.
func notifySystemOfError(err interface{}) {
	// Implementation details depend on the error reporting tool you use
	log.Printf("Error reported to monitoring system: %v", err)
}

// Main function sets up the server, loads car data, and defines HTTP routes.
func main() {
	log.SetOutput(os.Stdout)
	if err := loadCarData(); err != nil {
		log.Fatalf("Failed to load car data: %v", err)
	}
	enhanceCarData()

	http.HandleFunc("/", errorHandler(serveIndex))
	http.HandleFunc("/api/cars", errorHandler(carsHandler))
	http.HandleFunc("/api/sort-cars", errorHandler(sortCarsHandler))
	http.HandleFunc("/api/car-details/", errorHandler(carDetailsHandler))

	fileServer := http.FileServer(http.Dir("web"))
	http.Handle("/web/", http.StripPrefix("/web/", fileServer))

	imgServer := http.FileServer(http.Dir("api/img"))
	http.Handle("/api/img/", http.StripPrefix("/api/img/", imgServer))

	log.Println("Server starting on http://localhost:8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}

// serveIndex serves the main index HTML file or a 404 error if the path is incorrect.

// carsHandler handles API requests for car data based on manufacturer and category filters.
func carsHandler(w http.ResponseWriter, r *http.Request) {
	manufacturerId, _ := strconv.Atoi(r.URL.Query().Get("manufacturerId"))
	categoryId, _ := strconv.Atoi(r.URL.Query().Get("categoryId"))

	filteredCars := filterCars(manufacturerId, categoryId)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(filteredCars)
}

func filterCars(manufacturerId, categoryId int) []CarModels {
	var filtered []CarModels
	for _, car := range data.CarModels {
		if (manufacturerId == 0 || car.ManufacturerId == manufacturerId) &&
			(categoryId == 0 || car.CategoryId == categoryId) {
			filtered = append(filtered, car)
		}
	}
	return filtered
}

// matchesFilter checks if the given item ID matches the filter. If no filter is specified, it returns true.
func matchesFilter(itemID int, filter string) bool {
	if filter == "" {
		return true // No filter specified, always match
	}
	filterInt, err := strconv.Atoi(filter)
	if err != nil {
		return false // If conversion fails, no match
	}
	return itemID == filterInt
}

// contains checks if a slice of integers contains a specific item.
func contains(slice []int, item int) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// sortCarsHandler handles the sorting of cars based on various fields specified via query parameters.
func sortCarsHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("sortCarsHandler called")
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	carIdsParam := r.URL.Query().Get("carIds")
	var carIds []int
	err := json.Unmarshal([]byte(carIdsParam), &carIds)
	if err != nil {
		http.Error(w, "Invalid car IDs", http.StatusBadRequest)
		return
	}

	var carsToSort []CarModels
	for _, car := range data.CarModels {
		if contains(carIds, car.ID) {
			carsToSort = append(carsToSort, car)
		}
	}

	sortField := r.URL.Query().Get("field")
	sortOrder := r.URL.Query().Get("order")
	sort.Slice(carsToSort, func(i, j int) bool {
		return sortCarsByField(carsToSort[i], carsToSort[j], sortField, sortOrder)
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(carsToSort)
}

// sortCarsByField determines the order of two car models based on the specified field and order.
func sortCarsByField(a, b CarModels, field, order string) bool {
	switch field {
	case "make":
		return compareStrings(a.Name, b.Name, order)
	case "year":
		return compareInts(a.Year, b.Year, order)
	case "category":
		return compareStrings(a.CategoryName, b.CategoryName, order)
	case "engine":
		return compareStrings(a.Specifications.Engine, b.Specifications.Engine, order)
	case "horsepower":
		return compareInts(a.Specifications.Horsepower, b.Specifications.Horsepower, order)
	case "transmission":
		return compareTransmissions(a.Specifications.Transmission, b.Specifications.Transmission, order)
	case "drivetrain":
		return compareStrings(a.Specifications.Drivetrain, b.Specifications.Drivetrain, order)
	default:
		log.Printf("Unsupported sort field: %s", field)
		return false
	}
}

// Compares two strings based on the specified order.
func compareStrings(a, b, order string) bool {
	if order == "asc" {
		return strings.ToLower(a) < strings.ToLower(b)
	}
	return strings.ToLower(a) > strings.ToLower(b)
}

// Compares two integers based on the specified order.
func compareInts(a, b int, order string) bool {
	if order == "asc" {
		return a < b
	}
	return a > b
}

// Compares transmissions, extracting numbers and comparing them first.
func compareTransmissions(a, b, order string) bool {
	numA, restA := extractNumberFromString(a)
	numB, restB := extractNumberFromString(b)

	if numA != numB {
		if order == "asc" {
			return numA < numB
		}
		return numA > numB
	}
	// If numbers are the same, compare the rest of the string
	return compareStrings(restA, restB, order)
}

// Extracts the first number from a string and returns it along with the rest of the string.
func extractNumberFromString(s string) (int, string) {
	re := regexp.MustCompile(`^(\d+)`)
	match := re.FindStringSubmatch(s)
	if len(match) > 1 {
		num, err := strconv.Atoi(match[1])
		if err == nil {
			return num, strings.TrimSpace(s[len(match[1]):])
		}
	}
	return 0, s // Default to 0 if no number is found
}

// carDetailsHandler fetches detailed information about a specific car by its ID.
func carDetailsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	path := r.URL.Path
	idStr := path[strings.LastIndex(path, "/")+1:]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid Car ID", http.StatusBadRequest)
		return
	}

	// Create a channel to receive the manufacturer details
	manufacturerChan := make(chan Manufacturer, 1)
	foundChan := make(chan bool, 1)

	// Start a goroutine to fetch manufacturer details
	go func() {
		defer close(manufacturerChan)
		defer close(foundChan)
		for _, car := range data.CarModels {
			if car.ID == id {
				foundChan <- true
				for _, manufacturer := range data.Manufacturers {
					if manufacturer.ID == car.ManufacturerId {
						manufacturerChan <- manufacturer
						return
					}
				}
				// Send zero value if not found to avoid deadlock
				manufacturerChan <- Manufacturer{}
				return
			}
		}
		foundChan <- false
	}()

	// Wait for results from goroutine
	found := <-foundChan
	if !found {
		http.NotFound(w, r)
		return
	}

	manufacturer := <-manufacturerChan
	// Check if manufacturer data was found
	if manufacturer.ID == 0 {
		http.Error(w, "Manufacturer details not found", http.StatusInternalServerError)
		return
	}

	for _, car := range data.CarModels {
		if car.ID == id {
			enhancedCar := struct {
				CarModels
				Manufacturer Manufacturer `json:"manufacturer"`
			}{
				CarModels:    car,
				Manufacturer: manufacturer,
			}
			json.NewEncoder(w).Encode(enhancedCar)
			return
		}
	}
}

// Fetch all manufacturers from the Cars API
func FetchManufacturers() ([]Manufacturer, error) {
	resp, err := http.Get("http://localhost:3000/api/manufacturers")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var manufacturers []Manufacturer
	if err := json.NewDecoder(resp.Body).Decode(&manufacturers); err != nil {
		return nil, err
	}
	return manufacturers, nil
}

// Fetch all categories from the Cars API
func FetchCategories() ([]Category, error) {
	resp, err := http.Get("http://localhost:3000/api/categories")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var categories []Category
	if err := json.NewDecoder(resp.Body).Decode(&categories); err != nil {
		return nil, err
	}
	return categories, nil
}
