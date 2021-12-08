const state = { breweries: [] };

const selectStateFrom = document.getElementById("select-state-form");
const cityForm = document.getElementById("filter-by-city-form");

function getBreweries(usState) {
	return fetch(`https://api.openbrewerydb.org/breweries?per_page=10&page=2&by_state=${usState}`) // force break
		.then((resp) => resp.json());
}

function extractCitiesData() {
	return [...new Set(state.breweries.map((breweries) => breweries.city))];
}

function renderCities() {
	cityForm.textContetn = "";
	const cities = extractCitiesData();
	console.log(cities);
	for (const city of cities) {
		const inputEl = document.createElement("input");
		inputEl.setAttribute("type", "checkbox");
		inputEl.setAttribute("name", city);
		inputEl.setAttribute("value", city);
		inputEl.setAttribute("id", city);
		const labelEl = document.createElement("label");
		labelEl.setAttribute("for", city);
		labelEl.textContent = city;
		cityForm.append(inputEl, labelEl);
	}
}

function render() {
	renderCities();
}

selectStateFrom.addEventListener("submit", (event) => {
	event.preventDefault();
	getBreweries(selectStateFrom["select-state"].value).then((breweries) => {
		state.breweries = breweries;
		selectStateFrom.reset();
		render();
	});
});
