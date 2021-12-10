const state = {
	breweries: [],
	selectedState: null,
	selectedBreweryType: "",
	selectedCities: [],
	page: 1
};

const selectStateForm = document.querySelector("#select-state-form");
const filterSectionEl = document.querySelector(".filters-section");
const filterByCityForm = document.querySelector("#filter-by-city-form");
const listSection = document.querySelector(".list-section");
const breweriesList = document.querySelector(".breweries-list");
const filterByTypeSelect = document.querySelector("#filter-by-type");
const clearAllBtn = document.querySelector(".clear-all-btn");
const pagesSection = document.querySelector(".pages");

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
	if (state.selectedCities.length > 0) {
		filteredBreweries = filteredBreweries.filter((brewery) => state.selectedCities.includes(brewery.city));
	}

	return filteredBreweries;
}

function getBreweriesToDisplay() {
	let breweriesToDisplay = getFilteredBreweries();
	breweriesToDisplay = breweriesToDisplay.slice(10 * (state.page - 1), 10 * state.page);
	return breweriesToDisplay;
}

//render functions
function render() {
	renderFiltersSection();
	renderBreweryList();
	renderPagesSection();
}
function renderFiltersSection() {
	if (state.breweries.length !== 0) {
		filterSectionEl.style.display = "block";
		filterByCityForm.innerHTML = "";
		const cities = extractCitiesData();
		filterByTypeSelect.value = state.selectedBreweryType;
		for (const city of cities) {
			const inputEl = document.createElement("input");
			inputEl.setAttribute("type", "checkbox");
			inputEl.setAttribute("class", "city-checkbox");
			inputEl.setAttribute("name", city);
			inputEl.setAttribute("value", city.toLowerCase());
			inputEl.setAttribute("id", city);
			if (state.selectedCities.includes(city)) {
				inputEl.checked = true;
			}
			inputEl.addEventListener("click", () => {
				state.page = 1;
				if (inputEl.checked) {
					state.selectedCities.push(city);
				} else {
					state.selectedCities = state.selectedCities.filter((targetCity) => targetCity !== city);
				}
				render();
			});

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

function renderPagesSection() {
	pagesSection.innerHTML = "";
	for (let i = 0; i < getFilteredBreweries().length / 10; i++) {
		const buttonEL = document.createElement("button");
		if (i === state.page - 1) {
			buttonEL.disabled = true;
		}
		buttonEL.textContent = i + 1;
		buttonEL.addEventListener("click", () => {
			state.page = i + 1;
			render();
		});
		pagesSection.append(buttonEL);
	}
}

// listen function
function listenToSelectStateForm() {
	selectStateForm.addEventListener("submit", (event) => {
		event.preventDefault();
		state.page = 1;
		state.selectedCities = [];
		state.selectedBreweryType = "";
		state.selectedState = selectStateForm["select-state"].value;
		state.breweries = [];
		fetchAllBreweriesByState();
	});
}
function listenToFilterByTypeSelect() {
	filterByTypeSelect.addEventListener("change", () => {
		state.page = 1;
		state.selectedBreweryType = filterByTypeSelect.value;
		render();
	});
}

function listenToClearAllBtn() {
	clearAllBtn.addEventListener("click", () => {
		state.page = 1;
		state.selectedCities = [];
		render();
	});
}

function init() {
	fetchAllBreweriesByState().then(() => {
		listenToSelectStateForm();
		listenToFilterByTypeSelect();
		listenToClearAllBtn();
	});
}

init();
