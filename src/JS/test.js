
// Get the start button and nickname input
const startButton = document.querySelector('#start-button')

// When the user clicks the start button
startButton.addEventListener('click', async () => {
  let url = 'https://courselab.lnu.se/quiz/question/1'
  let result = await fetch(url)
  console.log(result.status)
  let data = await result.json()
  console.log('data: ' + data)
  const body = {
    answer: '2'
  }
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
  url = data.nextURL
  result = await fetch(url, options)
  console.log(result.status)
  data = await result.json()
  console.log('data: ' + JSON.stringify(data))
  url = data.nextURL
  result = await fetch(url)
  console.log(result.status)
  data = await result.json()
  console.log('data: ' + JSON.stringify(data))
})
