import * as REST from './rest.js'

const quiz = {
  nickname: '',
  score: 0,
  timeRemaining: 0,
  timer: null,
  questions: [],
  answers: [],

  // Start the quiz game
  async startQuiz (nickname) {
    this.nickname = nickname
    document.querySelector('#start-screen').style.display = 'none'
    document.querySelector('#quiz-screen').style.display = 'block'
    await this.fetchQuestion('https://courselab.lnu.se/quiz/question/1')
    this.startTimer()
  },

  // Start the timer for the question
  startTimer () {
    this.timeRemaining = 10
    this.updateTimer()
    this.timer = setInterval(() => {
      this.timeRemaining--
      try {
        this.updateTimer()
      } catch (error) {
        if (error instanceof TypeError) {
          console.error('Error Updating Timer')
        } else {
          throw error
        }
      }
      if (this.timeRemaining === 0) {
        console.log('ending quiz, time up')
        this.endQuiz()
      }
    }, 1000)
  },

  // Update the page with the question
  updatePage () {
    if (this.questions.length === 0) {
      throw new TypeError('The questions array is empty')
    }
    const question = this.questions[this.questions.length - 1]
    document.querySelector('#question').textContent = question.question
    document.querySelector('#score').textContent = `Score: ${this.score}`
    document.querySelector('#answer-form').style.display = 'block'
    if (question.type === 'alternatives') {
      console.log('question has alternatives')
      document.querySelector('#answer-input').style.display = 'none'
      document.querySelector('#answer-alternatives').style.display = 'block'
      document.querySelector('#answer-alternatives').innerHTML = ''
      question.alternatives.forEach((alternative, index) => {
        document.querySelector('#answer-alternatives').innerHTML += `<input type="radio" id="answer-${index}" name="answer" value="${alternative}"><label for="answer-${index}">${alternative}</label><br>`
      })
    } else {
      console.log('question has input')
      document.querySelector('#answer-input').style.display = 'block'
      document.querySelector('#answer-alternatives').style.display = 'none'
    }
  },

  updateTimer () {
    document.querySelector('#time-remaining').textContent = `Time remaining: ${this.timeRemaining}s`
  },

  // Handle the user's answer
  async handleAnswer () {
    if (this.questions[this.questions.length - 1].type === 'alternatives') {
      const answer = document.querySelector('input[name="answer"]:checked').value
      console.log('checking answer ', answer)
      await this.checkAnswer(answer)
    } else {
      const answer = document.querySelector('#answer-input').value
      console.log('checking answer ', answer)
      await this.checkAnswer(answer)
    }
  },

  async checkAnswer (value) {
    const answer = {
      answer: value
    }
    const data = await this.postReply(this.questions[this.questions.length - 1].nextURL, answer)
    if (await data.nextURL) {
      this.score++
      console.log('fetching next question ' + data.nextURL)
      await this.fetchQuestion(data.nextURL)
      this.startTimer()
    } else {
      this.endQuiz()
    }
  },

  // Post reply to server
  async postReply (url, body) {
    try {
      const data = await REST.post(url, body)
      this.answers.push(await data)
      console.log([...this.answers])
      return data
    } catch (error) {
      console.error(error)
    }
  },

  // Fetch a question from the server
  async fetchQuestion (url) {
    try {
      const data = await REST.get(url)
      this.questions.push(data)
      console.log('Fetched questions: ', JSON.stringify([...this.questions]))
      this.updatePage()
      return data
    } catch (error) {
      console.error(error)
    }
  },

  // End the quiz game
  endQuiz () {
    clearInterval(this.timer)
    document.querySelector('#question').textContent = `Game over! Your final score is ${this.score}.`
    document.querySelector('#answer-form').style.display = 'none'
  },

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

}
export default quiz
