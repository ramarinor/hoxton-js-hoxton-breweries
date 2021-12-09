const state = {
	breweries: [],
	selectedState: null,
	selectedBreweryType: "",
	selectedCities: []
};

const selectStateForm = document.querySelector("#select-state-form");
const filterSectionEl = document.querySelector(".filters-section");
const filterByCityForm = document.querySelector("#filter-by-city-form");
const listSection = document.querySelector(".list-section");
const breweriesList = document.querySelector(".breweries-list");
const filterByTypeSelect = document.querySelector("#filter-by-type");

let pageIterator = 1;
// server functions
function fetchAllBreweriesByState() {
	return fetch(`https://api.openbrewerydb.org/breweries?per_page=50&page=${pageIterator}&by_state=${state.selectedState}`)
		.then((resp) => resp.json())
		.then((breweriesFromServer) => {
			if (breweriesFromServer.length > 0) {
				state.breweries.push(...cleanData(breweriesFromServer));
				pageIterator++;
				fetchAllBreweriesByState();
			} else {
				pageIterator = 1;
				render();
			}
		});
}

//derived state
function extractCitiesData() {
	let cities = [];

	for (const brewery of state.breweries) {
		if (!cities.includes(brewery.city)) {
			cities.push(brewery.city);
		}
	}
	return cities;
}

function cleanData(breweriesFromServer) {
	const breweryTypes = ["micro", "regional", "brewpub"];
	return breweriesFromServer.filter((brewery) => breweryTypes.includes(brewery.brewery_type));
}
function getFilteredBreweries() {
	let filteredBreweries = state.breweries;

	if (state.selectedBreweryType !== "") {
		filteredBreweries = filteredBreweries.filter((brewery) => brewery.brewery_type === state.selectedBreweryType);
	}

	return filteredBreweries;
}

function getBreweriesToDisplay() {
	let breweriesToDisplay = getFilteredBreweries();
	breweriesToDisplay = breweriesToDisplay.slice(0, 10);
	return breweriesToDisplay;
}

//render functions
function render() {
	renderFiltersSection();
	renderBreweryList();
}
function renderFiltersSection() {
	if (state.breweries.length !== 0) {
		filterSectionEl.style.display = "block";
		filterByCityForm.innerHTML = "";
		const cities = extractCitiesData();

		for (const city of cities) {
			const inputEl = document.createElement("input");
			inputEl.setAttribute("type", "checkbox");
			inputEl.setAttribute("class", "city-checkbox");
			inputEl.setAttribute("name", city);
			inputEl.setAttribute("value", city.toLowerCase());
			inputEl.setAttribute("id", city);

			const labelEl = document.createElement("label");
			labelEl.setAttribute("for", city);
			labelEl.textContent = city;

			filterByCityForm.append(inputEl, labelEl);
		}
	} else {
		filterSectionEl.style.display = "none";
	}
}
function renderBreweryList() {
	if (state.breweries.length !== 0) {
		listSection.style.display = "block";
		breweriesList.innerHTML = "";
		const brewereisToDisplay = getBreweriesToDisplay();
		for (const brewery of brewereisToDisplay) {
			const liEl = document.createElement("li");

			const h2El = document.createElement("h2");
			h2El.textContent = brewery.name;

			const typeDiv = document.createElement("div");
			typeDiv.setAttribute("class", "type");
			typeDiv.textContent = brewery.brewery_type;

			const addressSection = document.createElement("section");
			addressSection.setAttribute("class", "address");
			const addressTitle = document.createElement("h3");
			addressTitle.textContent = "Adress:";
			const pStreet = document.createElement("p");
			pStreet.textContent = brewery.street;
			const pCity = document.createElement("p");
			const strongEl = document.createElement("strong");
			strongEl.textContent = `${brewery.city}, ${brewery.postal_code}`;
			pCity.append(strongEl);
			addressSection.append(addressTitle, pStreet, pCity);

			const phoneSection = document.createElement("section");
			phoneSection.setAttribute("class", "phone");
			const phoneTitle = document.createElement("h3");
			phoneTitle.textContent = "Phone: ";
			const pPhone = document.createElement("p");
			pPhone.textContent = "+" + brewery.phone;
			phoneSection.append(phoneTitle, pPhone);

			const linkSection = document.createElement("section");
			linkSection.setAttribute("class", "link");
			const aEl = document.createElement("a");
			aEl.setAttribute("href", brewery.website_url);
			aEl.setAttribute("target", "_blank");
			aEl.textContent = "Visit Website";
			linkSection.append(aEl);

			liEl.append(h2El, typeDiv, addressSection, phoneSection, linkSection);
			breweriesList.append(liEl);
		}
	} else {
		listSection.style.display = "none";
	}
}

// listen function
function listenToSelectStateForm() {
	selectStateForm.addEventListener("submit", (event) => {
		event.preventDefault();
		state.selectedState = selectStateForm["select-state"].value;
		state.breweries = [];
		fetchAllBreweriesByState().then(() => {
			render();
		});
	});
}
function listenToFilterByTypeSelect() {
	filterByTypeSelect.addEventListener("change", () => {
		state.selectedBreweryType = filterByTypeSelect.value;
		render();
	});
}

function init() {
	fetchAllBreweriesByState().then(() => {
		listenToSelectStateForm();
		listenToFilterByTypeSelect();
	});
}

init();
