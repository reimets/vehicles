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
	file, err := os.ReadFile("./api/data.json") // Make sure the path is correct
	if err != nil {
		return err
	}

	err = json.Unmarshal(file, &data)
	if err != nil {
		return err
	}

	return nil
}

// added by reigo
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

func errorHandler(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				// Log the error
				log.Printf("Internal server error: %v", err)
				// Notify the monitoring team or system (if any)
				notifySystemOfError(err)
				// Respond with a generic error message
				http.Error(w, "Oops! Something went wrong on our end. Our team has been notified, and we're working hard to fix it. Please try again later.", http.StatusInternalServerError)
			}
		}()
		next(w, r)
	}
}

func notifySystemOfError(err interface{}) {
	// Implementation details depend on the error reporting tool you use
	log.Printf("Error reported to monitoring system: %v", err)
}

func main() {
	log.SetOutput(os.Stdout)
	if err := loadCarData(); err != nil {
		log.Fatalf("Failed to load car data: %v", err)
	}
	// added by reigo
	enhanceModelsWithCategoryData(data.CarModels, data.Categories)

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

// ****************** I added 404 thing to this function ******************
func serveIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		w.WriteHeader(http.StatusNotFound) // Lisa see rida
		http.ServeFile(w, r, "./web/404.html")
		return
	}
	http.ServeFile(w, r, "./web/index.html")
}

func carsHandler(w http.ResponseWriter, r *http.Request) {
	manufacturerId, _ := strconv.Atoi(r.URL.Query().Get("manufacturerId"))
	categoryId, _ := strconv.Atoi(r.URL.Query().Get("categoryId"))

	// Log the received values for debugging
	log.Printf("Received manufacturerId: %d, categoryId: %d", manufacturerId, categoryId)

	var filteredCars []CarModels
	for _, car := range data.CarModels {
		if (manufacturerId == 0 || car.ManufacturerId == manufacturerId) &&
			(categoryId == 0 || car.CategoryId == categoryId) {
			filteredCars = append(filteredCars, car)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(filteredCars)
}

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

func contains(slice []int, item int) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

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
