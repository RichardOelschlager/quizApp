// Import the quiz module
import quiz from './modules/quiz.js'

// Get the start button and nickname input
const startButton = document.querySelector('#start-button')
const nicknameInput = document.querySelector('#nickname-input')

// When the user clicks the start button
startButton.addEventListener('click', async () => {
  const nickname = nicknameInput.value
  if (nickname) {
    await quiz.startQuiz(nickname)
  }
})

// When the user clicks the answer button
document.querySelector('#answer-button').addEventListener('click', async () => {
  const answer = document.querySelector('#answer-input').value
  if (answer) {
    console.log('Handling answer :', answer)
    await quiz.handleAnswer(answer)
  }
})