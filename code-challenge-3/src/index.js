// Your code here
// send HTTP request to the server and fetch API return a promise to resolve the response object from the server
fetch('http://localhost:3000/films/1')
    //parse the reponse as JSON
    .then(response => response.json())
    // from our JSON data returned we calculate available tickets 
    .then(data => {
        const availableTickets = data.capacity - data.tickets_sold;

        // Create a div for movie details
        const movieDetails = document.createElement('div');

        // Add the movie poster to div created above
        const poster = document.createElement('img');
        poster.src = data.poster;
        movieDetails.appendChild(poster);

        // Add the movie details to the page
        document.getElementById('movie-details').appendChild(movieDetails);

        // Add the movie title to (movie details) div
        const title = document.getElementById('title');
        title.textContent = data.title;

        // Add the movie runtime to (movie details) div
        const runtime = document.getElementById('runtime');
        runtime.textContent = `${data.runtime} minutes`;

        // Add the movie showtime to (movie details) div
        const showtime = document.getElementById('showtime');
        showtime.textContent = `Showtime: ${data.showtime}`;

        // Add the number of available tickets to (movie details) div
        const ticketNum = document.getElementById('ticket-num');
        ticketNum.textContent = availableTickets;

        //Add filminfo to (movie details) div
        const filmInfo = document.getElementById('film-info');
        filmInfo.textContent = data.description;
    });



//select the HTML element with ID (buy-ticket)
const button = document.getElementById('buy-ticket');
// Add a click event to (#buy-ticket) button
button.addEventListener('click', function () {
    // Get the current available tickets
    const ticketNums = document.getElementById('ticket-num');
    const availableTickets = parseInt(ticketNums.textContent);

    // Check if tickets are available
    if (availableTickets > 0) {
        // if available Subtract 1 from the number of available tickets
        const newAvailableTickets = availableTickets - 1;

        // Update the number of available tickets on the page
        ticketNums.textContent = newAvailableTickets;
        // Check if all the tickets are sold out
        if (newAvailableTickets === 0) {
            // if they are all sold out Change the button text to "Sold out"
            button.textContent = "Sold Out";
        }

        // Send a HTTP PATCH request to update the number of tickets sold out on the server
        fetch(`http://localhost:3000/films/${movieId}`, {
                //set HTTP method to PATCH and headers for the HTTP to Content-Type
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                // set body that contain new number of tickets sold
                body: JSON.stringify({
                    tickets_sold: newAvailableTickets
                })
            })
            // receives response object from HTTP PATCH request, if the request is successful, execute
            .then(response => {
                //throw error if not successful
                if (!response.ok) {
                    throw new Error('Failed to update the number of tickets sold.');
                }
                // return the promise to resolve JSON data of the HTTP response
                return response.json();
            })
            //receives JSON data from previous promise and sends an HTTP POST request
            .then(data => {
                // Send a POST request to create a new ticket in the database
                fetch('http://localhost:3000/tickets', {
                        //set HTTP method to POST and headers for the HTTP to Content-Type
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        //body to contain ID of the film and number Of tickets purchased
                        body: JSON.stringify({
                            film_id: movieId,
                            number_of_tickets: 1
                        })
                    })
                    // receives response object from HTTP POST request,if request is successful, execute
                    .then(response => {
                        //incase it's not successful throw error
                        if (!response.ok) {
                            throw new Error('Failed to create a new ticket.');
                        }
                        // return the promise 
                        return response.json();
                    })
                    //logs a success message 
                    .then(data => {
                        console.log('Ticket purchased successfully.');
                    })
                    // handles any errors in our previous promise chain, logs errors
                    .catch(error => {
                        console.error(error);
                        alert('Failed to purchase the ticket.');

                        // Revert the number of available tickets on the page
                        ticketNums.textContent = availableTickets;
                    });
            })
            // handles any errors from previous promise chain ,logs errors
            .catch(error => {
                console.error(error);
                alert('Failed to purchase the ticket.');

                // Revert the number of available tickets on the page
                ticketNums.textContent = availableTickets;
            });
    }
});


// send an HTTP GET request for movie data
fetch('http://localhost:3000/films')
    // //parse the reponse as JSON
    .then(response => response.json())
    // from JSON data, execute this code
    .then(data => {
        // Remove the placeholder li element
        const placeholder = document.querySelector('#films .film.item');
        placeholder.parentNode.removeChild(placeholder);


        // Create a li element for each movie
        data.forEach(movie => {
            const li = document.createElement('li');
            li.className = 'film item';
            li.textContent = movie.title;

            // Add a delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                // Send a HTTP DELETE request to the server to delete the movie
                fetch(`http://localhost:3000/films/${movie.id}`, {
                        method: 'DELETE'
                    })
                    // receives the DELETE request movie data
                    .then(response => {
                        // check if the request was successful
                        if (response.ok) {
                            // Remove the movie from the list
                            li.parentNode.removeChild(li);
                        } else {
                            throw new Error('Failed to delete the movie.');
                        }
                    })
                    // handle any error from the previous promise chain
                    .catch(error => {
                        console.error(error);
                        alert('Failed to delete the movie.');
                    });
            });
            li.appendChild(deleteButton);

            // Check if the movie is sold out
            if (movie.tickets_sold === movie.capacity) {
                // Add a class of sold-out to the li element
                li.classList.add('sold-out');

                // Update the delete button text to Sold Out
                deleteButton.textContent = 'Sold Out';

                // Remove the delete button event listener
                deleteButton.removeEventListener('click', deleteMovie);
            } else {
                // Add a click event listener to the li element to display the movie details
                li.addEventListener('click', () => {
                    // Make a GET request to retrieve the selected movie's data
                    fetch(`http://localhost:3000/films/${movie.id}`)
                        .then(response => response.json())
                        .then(data => {
                            // Display the selected movie's details


                        });
                });
            }

            document.getElementById('films').appendChild(li);
        });
    });