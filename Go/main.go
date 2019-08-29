package main

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/tiaguinho/gosoap"
)

type Invoice struct {
	Id             int        `json:"id,omitempty"`
	Lines          []Lines    `json:"lines"`
	Client         *Client    `json:"client"`
	Tax_total      float64    `json:"tax_total"`
	Discount_total float64    `json:"discount_total"`
	Subtotal       float64    `json:"subtotal"`
	Total          float64    `json:"total"`
	Payments       []Payments `json:"payments,omitempty"`
	Balance        float64    `json:"balance"`
}

type Lines struct {
	Product       string  `json:"product,omitempty"`
	Quantity      int     `json:"quantity"`
	Price         float64 `json:"price,omitempty"`
	Price_crc     float64 `json:"price_crc,omitempty"`
	Tax_rate      int     `json:"tax_rate"`
	Discount_rate int     `json:"discount_rate"`
	Currency      string  `json:"currency,omitempty"`
}

type Client struct {
	Name string `json:"name"`
	Id   string `json:"id"`
}

type PayInvoice struct {
	Invoice_id int     `json:"invoice_id,omitempty"`
	Amount     float64 `json:"amount,omitempty"`
}

type Payments struct {
	Id    int     `json:"id,omitempty"`
	Total float64 `json:"total,omitempty"`
}

type ResponseXML struct {
	ResponseXML string `xml:"ObtenerIndicadoresEconomicosXMLResult"`
}

// GetIPLocationResult will
type INDICADORECONOMIC struct {
	Datos_de_INGC011_CAT_INDICADORECONOMIC xml.Name    `xml:"Datos_de_INGC011_CAT_INDICADORECONOMIC"`
	INGC011_CAT_INDICADORECONOMIC          SecondLevel `xml:"INGC011_CAT_INDICADORECONOMIC"`
}

// GetIPLocationResult will
type SecondLevel struct {
	XMLNAME              xml.Name `xml:"INGC011_CAT_INDICADORECONOMIC"`
	COD_INDICADORINTERNO int      `xml:"COD_INDICADORINTERNO"`
	DES_FECHA            string   `xml:"DES_FECHA"`
	NUM_VALOR            float64  `xml:"NUM_VALOR"`
}

type allInvoice []Invoice
type arrayLines []Lines

var invoices = allInvoice{}
var maxId int = 0
var maxIdPay int = 0

func homeLink(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to the technical test. Rest Api with GO!")
}

func getCurrencyValueSale() (value float64) {

	var (
		r ResponseXML
	)

	soap, err := gosoap.SoapClient("https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx?WSDL")
	if err != nil {
		log.Fatalf("SoapClient error: %s", err)
	}
	dt := time.Now()
	params := gosoap.Params{
		"Indicador":         "318",
		"FechaInicio":       dt.Format("02/01/2006"),
		"FechaFinal":        dt.Format("02/01/2006"),
		"Nombre":            "Gerald Barquero",
		"SubNiveles":        "S",
		"CorreoElectronico": "gerald.bv1@gmail.com",
		"Token":             "MURL8ALAGA",
	}

	res, err := soap.Call("ObtenerIndicadoresEconomicosXML", params)
	if err != nil {
		log.Fatalf("Call error: %s", err)
	}

	res.Unmarshal(&r)

	result := INDICADORECONOMIC{}
	err = xml.Unmarshal([]byte(r.ResponseXML), &result)
	if err != nil {
		log.Fatalf("xml.Unmarshal error: %s", err)
	}
	value = result.INGC011_CAT_INDICADORECONOMIC.NUM_VALOR

	return

}

func createInvoice(w http.ResponseWriter, r *http.Request) {
	maxId = maxId + 1
	var newInvoice Invoice
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintf(w, "Kindly enter data of the invoice")
	}

	json.Unmarshal(reqBody, &newInvoice)
	var newLines = arrayLines{}
	for i, line := range newInvoice.Lines {
		var lastPrice float64
		if line.Currency != "CRC" {
			value := getCurrencyValueSale()
			line.Price_crc = line.Price * value
			lastPrice = line.Price_crc
			newInvoice.Lines = append(newInvoice.Lines[:i], line)
		} else {
			lastPrice = line.Price
		}
		newLines = append(newLines, line)
		var priceWithDiscount = lastPrice * (float64(line.Discount_rate) / 100)
		var priceWithTaxt = lastPrice * (float64(line.Tax_rate) / 100)
		newInvoice.Tax_total = newInvoice.Tax_total + priceWithTaxt
		newInvoice.Discount_total = newInvoice.Discount_total + priceWithDiscount
		newInvoice.Subtotal = newInvoice.Subtotal + lastPrice
		newInvoice.Total = newInvoice.Subtotal - priceWithDiscount + priceWithTaxt
	}
	newInvoice.Balance = newInvoice.Balance - newInvoice.Total
	newInvoice.Id = maxId
	newInvoice.Lines = newLines
	invoices = append(invoices, newInvoice)
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(newInvoice)
}

func getOneInvoice(w http.ResponseWriter, r *http.Request) {
	invoiceID, err := strconv.Atoi(mux.Vars(r)["id"])
	if err == nil {
		for _, singleInvoice := range invoices {
			if singleInvoice.Id == invoiceID {
				json.NewEncoder(w).Encode(singleInvoice)
				return
			}
		}
		fmt.Fprintf(w, "Invalid InvoiceID")
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
		var payInvoice PayInvoice

		reqBody, err := ioutil.ReadAll(r.Body)
		if err != nil {
			fmt.Fprintf(w, "Kindly enter data of the invoice to pay")
		}
		json.Unmarshal(reqBody, &payInvoice)

		for i, singleInvoice := range invoices {

			log.Println(singleInvoice.Balance)
			if singleInvoice.Id == invoiceID && singleInvoice.Balance < 0 {
				var newBalance = singleInvoice.Balance + payInvoice.Amount

				if newBalance <= 0 {
					var newPay Payments
					maxIdPay = maxIdPay + 1
					newPay.Id = maxIdPay
					newPay.Total = payInvoice.Amount
					singleInvoice.Payments = append(singleInvoice.Payments, newPay)
					singleInvoice.Balance = singleInvoice.Balance + newPay.Total
				}

				invoices = append(invoices[:i], singleInvoice)
				json.NewEncoder(w).Encode(invoices)
				return
			}
		}
		fmt.Fprintf(w, "Invalid InvoiceID")
	} else {
		fmt.Fprintf(w, "Incorrect format InvoiceID")
	}
}

func deleteInvoice(w http.ResponseWriter, r *http.Request) {
	invoiceID, err := strconv.Atoi(mux.Vars(r)["id"])
	if err == nil {
		for i, singleInvoice := range invoices {
			if singleInvoice.Id == invoiceID {
				invoices = append(invoices[:i], invoices[i+1:]...)
				fmt.Fprintf(w, "The invoice with ID %v has been deleted successfully", invoiceID)
				return
			}
		}
		fmt.Fprintf(w, "Invalid InvoiceID")
	} else {
		fmt.Fprintf(w, "Incorrect format InvoiceID")
	}
}

func main() {
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/", homeLink)
	router.HandleFunc("/invoice", createInvoice).Methods("POST")
	router.HandleFunc("/invoice", getAllInvoices).Methods("GET")
	router.HandleFunc("/invoice/{id}", getOneInvoice).Methods("GET")
	router.HandleFunc("/invoice/{id}", payInvoice).Methods("POST")
	router.HandleFunc("/invoice/{id}", deleteInvoice).Methods("DELETE")
	log.Fatal(http.ListenAndServe(":8080", router))
}
