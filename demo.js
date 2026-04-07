// Function to calculate the area of a circle
function calculateCircleArea(radius) {
    if (radius < 0) {
        throw new Error("Radius cannot be negative");
    }
    return Math.PI * Math.pow(radius, 2);
}

// Example usage
try {
    const radius = 5;
    const area = calculateCircleArea(radius);
    console.log(`The area of a circle with radius ${radius} is ${area.toFixed(2)}`);
} catch (error) {
    console.error(error.message);
}   

// Function to validate email addresses using a regular expression
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}   

// Example usage
const email = "Selin@gmail.com";
if (validateEmail(email)) {
    console.log(`${email} is a valid email address.`);
} else {
    console.log(`${email} is not a valid email address.`);
} 

// function to fetch data from an API and log the response
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(`Failed to fetch data: ${error.message}`);
    }
}

// Example usage
const apiUrl = "https://jsonplaceholder.typicode.com/posts/1";
fetchData(apiUrl);  

