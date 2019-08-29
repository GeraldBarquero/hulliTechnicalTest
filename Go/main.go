package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/tiaguinho/gosoap"
)

type Invoice struct {
	id             int       `json:"id,omitempty"`
	lines          *Lines    `json:"lines,omitempty"`
	client         *Client   `json:"client,omitempty"`
	tax_total      int       `json:"tax_total,omitempty"`
	discount_total int       `json:"discount_total,omitempty"`
	subtotal       float64   `json:"subtotal,omitempty"`
	total          float64   `json:"total,omitempty"`
	payments       *Payments `json:"payments,omitempty"`
	balance        int       `json:"balance,omitempty"`
}

type Lines struct {
	product       string  `json:"product,omitempty"`
	quantity      int     `json:"quantity,omitempty"`
	price         float64 `json:"price,omitempty"`
	price_crc     float64 `json:"price_crc,omitempty"`
	tax_rate      int     `json:"tax_rate,omitempty"`
	discount_rate int     `json:"discount_rate,omitempty"`
	currency      string  `json:"currency,omitempty"`
}

type Client struct {
	name string `json:"name,omitempty"`
	id   string `json:"id,omitempty"`
}

type PayInvoice struct {
	invoice_id int     `json:"invoice_id,omitempty"`
	amount     float64 `json:"amount,omitempty"`
}

type Payments struct {
	id    int     `json:"id,omitempty"`
	total float64 `json:"total,omitempty"`
}

type allInvoice []Invoice

// GetIPLocationResponse will hold the Soap response
type GetIPLocationResponse struct {
	getValueSale string `xml:"getValueSale"`
}

// GetIPLocationResult will
type GetIPLocationResult struct {
	XMLName xml.Name `xml:"GeoIP"`
	Country string   `xml:"Country"`
	State   string   `xml:"State"`
}

var (
	r GetIPLocationResponse
)

var invoices = allInvoice{}

func homeLink(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to the technical test. Rest Api with GO!")
}
func getCurrencyValueSale() {
	soap, err := gosoap.SoapClient("https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx?WSDL")
	if err != nil {
		log.Fatalf("SoapClient error: %s", err)
	}

	params := gosoap.Params{
		"Indicador": "318",
		"FechaInicio": "28/08/2019",
		"IndFechaFinalicador": "28/08/2019",
		"Nombre": "Gerald Barquero",
		"SubNiveles": "S",
		"CorreoElectronico": "gerald.bv1@gmail.com",
		"Token": "MURL8ALAGA",
	}

	res, err = soap.Call("GetIpLocation", params)
	if err != nil {
		log.Fatalf("Call error: %s", err)
	}

	res.Unmarshal(&r)

	// GetIpLocationResult will be a string. We need to parse it to XML
	result := GetIPLocationResult{}
	err = xml.Unmarshal([]byte(r.GetIPLocationResult), &result)
	if err != nil {
		log.Fatalf("xml.Unmarshal error: %s", err)
	}

	if result.Country != "US" {
		log.Fatalf("error: %+v", r)
	}

	log.Println("Country: ", result.Country)
	log.Println("State: ", result.State)

}

func createInvoice(w http.ResponseWriter, r *http.Request) {
	var newInvoice Invoice
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintf(w, "Kindly enter data of the invoice")
	}

	json.Unmarshal(reqBody, &newInvoice)
	invoices = append(invoices, newInvoice)
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(newInvoice)
}

func getOneInvoice(w http.ResponseWriter, r *http.Request) {
	invoiceID, err := strconv.Atoi(mux.Vars(r)["id"])
	if err == nil {
		for _, singleInvoice := range invoices {
			if singleInvoice.id == invoiceID {
				json.NewEncoder(w).Encode(singleInvoice)
			}
		}
	} else {
		fmt.Fprintf(w, "Incorrect format InvoiceID")
	}
}

func getAllInvoices(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(invoices)
}

func payInvoice(w http.ResponseWriter, r *http.Request) {
	invoiceID, err := strconv.Atoi(mux.Vars(r)["id"])
	if err == nil {
		var payInvoice Invoice

		reqBody, err := ioutil.ReadAll(r.Body)
		if err != nil {
			fmt.Fprintf(w, "Kindly enter data of the invoice to pay")
		}
		json.Unmarshal(reqBody, &payInvoice)

		for i, singleInvoice := range invoices {
			if singleInvoice.id == invoiceID {
				invoices = append(invoices[:i], singleInvoice)
				json.NewEncoder(w).Encode(singleInvoice)
			}
		}
	} else {
		fmt.Fprintf(w, "Incorrect format InvoiceID")
	}
}

func deleteInvoice(w http.ResponseWriter, r *http.Request) {
	invoiceID, err := strconv.Atoi(mux.Vars(r)["id"])
	if err == nil {

		for i, singleInvoice := range invoices {
			if singleInvoice.id == invoiceID {
				invoices = append(invoices[:i], invoices[i+1:]...)
				fmt.Fprintf(w, "The invoice with ID %v has been deleted successfully", invoiceID)
			}
		}
	} else {
		fmt.Fprintf(w, "Incorrect format InvoiceID")
	}
}

func main() {
	getCurrencyValueSale()
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/", homeLink)
	router.HandleFunc("/invoice", createInvoice).Methods("POST")
	router.HandleFunc("/invoice", getAllInvoices).Methods("GET")
	router.HandleFunc("/invoice/{id}", getOneInvoice).Methods("GET")
	router.HandleFunc("/invoice/{id}", payInvoice).Methods("POST")
	router.HandleFunc("/invoice/{id}", deleteInvoice).Methods("DELETE")
	log.Fatal(http.ListenAndServe(":8080", router))
}
