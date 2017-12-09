Stripe

200 - OK	Everything worked as expected.
400 - Bad Request	The request was unacceptable, often due to missing a required parameter.
401 - Unauthorized	No valid API key provided.
402 - Request Failed	The parameters were valid but the request failed.
404 - Not Found	The requested resource doesn't exist.
409 - Conflict	The request conflicts with another request (perhaps due to using the same idempotent key).
429 - Too Many Requests	Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.
500, 502, 503, 504 - Server Errors	Something went wrong on Stripe's end. (These are rare.)

TYPES
api_connection_error	Failure to connect to Stripe's API.
api_error	API errors cover any other type of problem (e.g., a temporary problem with Stripe's servers) and are extremely uncommon.
authentication_error	Failure to properly authenticate yourself in the request.
card_error	Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can't be charged for some reason.
invalid_request_error	Invalid request errors arise when your request has invalid parameters.
rate_limit_error	Too many requests hit the API too quickly.
validation_error	Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).

CODES
invalid_number	The card number is not a valid credit card number.
invalid_expiry_month	The card's expiration month is invalid.
invalid_expiry_year	The card's expiration year is invalid.
invalid_cvc	The card's security code is invalid.
invalid_swipe_data	The card's swipe data is invalid.
incorrect_number	The card number is incorrect.
expired_card	The card has expired.
incorrect_cvc	The card's security code is incorrect.
incorrect_zip	The card's zip code failed validation.
card_declined	The card was declined.
missing	There is no card on a customer that is being charged.
processing_error	An error occurred while processing the card.