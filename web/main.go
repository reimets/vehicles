package main

import (
	"encoding/json"
	"fmt"
	"os"
)

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
	ID             int            `json:"id"`
	Name           string         `json:"name"`
	ManufacturerId int            `json:"manufacturerId"`
	CategoryId     int            `json:"categoryId"`
	Year           int            `json:"year"`
	Specifications Specifications `json:"Specifications"`
	Image          string         `json:"image"`
}

// Peastruktuur, mis sisaldab kõiki andmekogumeid
type Data struct {
	Manufacturers []Manufacturer `json:"manufacturers"`
	Categories    []Category     `json:"categories"`
	CarModels     []CarModels    `json:"carModels"`
}

func main() {
	// Eeldus, et `data.json` on sama kataloogi all
	file, err := os.ReadFile("../api/data.json")
	if err != nil {
		fmt.Println("Error reading file:", err)
		return
	}

	var data Data
	err = json.Unmarshal(file, &data)
	if err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		return
	}

	// Nüüd on `data` muutuja täidetud JSON-failist loetud andmetega
	// Sa võid seda kasutada nagu iga teist Go struktuuri
	fmt.Println(data.Manufacturers) // Näite väljastus
	fmt.Println()
	fmt.Println(data.Categories) // Näite väljastus
	fmt.Println()
	fmt.Println(data.CarModels) // Näite väljastus

}
