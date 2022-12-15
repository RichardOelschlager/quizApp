/**
 * Do a fetch GET request and return the response as JSON.
 *
 * @param {string} url to send request to
 * @returns {object} the JSON response
 */
export async function get (url) {
  // Do a fetch request on that url using await
  console.log('Fetching: ' + url)
  const response = await fetch(url)
  console.log(response.status)
  const data = await response.json()
  // Get the response as json (asynchronous request)
  console.log(data)
  return data
}

/**
 * Do a fetch POST request and return the response as JSON.
 *
 * @param {string} url to send request to
 * @param {object} body to submit
 * @returns {object} the JSON response
 */
export async function post (url, body = null) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
  console.log('Posting: ' + url + ' Options: ' + JSON.stringify(options))
  const response = await fetch(url, options)
  console.log(response.status)
  const data = await response.json()
  console.log(data)
  return data
}
