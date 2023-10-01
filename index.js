const userTab = document.querySelector("[user-weather]");
const searchTab = document.querySelector("[search-weather]");
const container = document.querySelector(".container");

const grantLocation = document.querySelector(".grant-location");
const grantAccessButton = document.querySelector("[data-grant-access]");
const formContainer = document.querySelector(".form-container");
const searchInput = document.querySelector("[input-name]")
const searchButton = document.querySelector("[search-button]");
const loading = document.querySelector(".loading");
const weatherInfo = document.querySelector(".weather-info");

const cityName = document.querySelector("[data-city-name]");
const countryFlag = document.querySelector("[country-icon]");
const type = document.querySelector("[weather-type]");
const weatherIcon = document.querySelector("[weather-icon]");
const temp = document.querySelector("[temp-reading]");
const wind = document.querySelector("[wind-value]");
const humidity = document.querySelector("[humidity-value]");
const clouds = document.querySelector("[clouds-value]");

const apiErrorContainer = document.querySelector(".api-error-container");
const messageText = document.querySelector("[data-messageText]");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");

const API_key = "1db014595a89a98867debd536bad0b26";

// "current-tab" -> it will add a background color to the tab and track it, default tab visible to user
let currentTab = userTab;
currentTab.classList.add("current-tab");                  
getFormSessionStorage()                                   //if initially location access is active in the devise

// <--------------------------------------------------- FUNCTIONS ------------------------------------------->

function switchTab(clickedTab) {

    //remove the error message if previously it became activated for not finding the searched place
    apiErrorContainer.classList.remove("active");          

    //if we have clicked the tab on which we are not present
    if( clickedTab !== currentTab ) {
        
        //update the current tab ( background color )
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        //if form-container is not visible, i am on user tab -> need to shift to search tab
        if(!formContainer.classList.contains("active")) {  
            weatherInfo.classList.remove("active");
            grantLocation.classList.remove("active");
            formContainer.classList.add("active");
        }

        //i am on search tab -> need to shift to user tab
        else {
            formContainer.classList.remove("active");
            weatherInfo.classList.remove("active");
            getFormSessionStorage();
        }
    }
}


//check if coordinates are already present in session storage
function getFormSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if( !localCoordinates ) {
        grantLocation.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

//fetch user weather info with ihs coordinates
async function fetchUserWeatherInfo(coordinates) {
    const {lat, long} = coordinates;
    //make grant location container invisible
    grantLocation.classList.remove("active");
    loading.classList.add("active");
    

    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${API_key}`);  //site name -> OpenWeatherMap.org
        const data = await res.json();
        loading.classList.remove("active");
        weatherInfo.classList.add("active"); 
        renderWeatherInfo(data);
    }
    catch(error) {
        loading.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorImg.style.display = "none";
        apiErrorMessage.innerText = `Error: ${error?.message}`;
        weatherInfo.classList.remove("active"); 
    }
}

function renderWeatherInfo(weatherInfo) {    
    cityName.innerHTML = weatherInfo?.name;
    countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    type.innerHTML = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerHTML =`${weatherInfo?.main?.temp} °C`;
    wind.innerHTML = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerHTML = `${weatherInfo?.main?.humidity} %`;
    clouds.innerHTML = `${weatherInfo?.clouds?.all} %`;
}

function getLocation() {
    if( navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showLocation, showError);
    }
    else {
        messageText.innerText = "Geolocation is not supported by this browser.";
        grantAccessButton.style.display = "none";
    }
}

// Handle any errors
function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
  }

function showLocation(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        long: position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

async function fetchSearchWeatherInfo(city) {
    loading.classList.add("active");
    weatherInfo.classList.remove("active");
    grantLocation.classList.remove("active");
    apiErrorContainer.classList.remove("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`);  //site name -> OpenWeatherMap.org
        const data_weather = await response.json();
        loading.classList.remove("active");
        weatherInfo.classList.add("active"); 
        renderWeatherInfo(data_weather);
        if (!data_weather.sys) {
            throw data_weather;
        }
    }
    catch(error) {
        loading.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorMessage.innerText = `${error?.message}`;
        weatherInfo.classList.remove("active"); 
    }
}

// <--------------------------------------------------- EVENT LISTENERS ------------------------------------------->

userTab.addEventListener('click', () => {
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    switchTab(searchTab);
});

grantAccessButton.addEventListener('click', getLocation);

formContainer.addEventListener('submit', (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "") {
        return;
    }
    else {
        fetchSearchWeatherInfo(cityName);
    }
})

searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "") {
        return;
    }
    else {
        fetchSearchWeatherInfo(cityName);
    }
})