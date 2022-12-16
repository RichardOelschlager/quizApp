import * as REST from './rest.js'

const quiz = {
  nickname: '',
  score: 0,
  timeRemaining: 0,
  timer: null,
  questions: [],
  answers: [],
  highScoresList: [],
  totalTime: 0,

  // Start the quiz game
  async startQuiz (nickname) {
    this.nickname = nickname
    this.loadHighScoreFromWebStorage()
    document.querySelector('#start-screen').style.display = 'none'
    document.querySelector('#quiz-screen').style.display = 'block'
    await this.fetchQuestion('https://courselab.lnu.se/quiz/question/1')
    this.startTimer()
  },

  async restartQuiz () {
    this.score = 0
    this.timeRemaining = 0
    this.timer = null
    this.questions = []
    this.answers = []
    this.totalTime = 0
    document.querySelector('#start-screen').style.display = 'block'
    document.querySelector('#quiz-screen').style.display = 'none'
    document.querySelector('#end-screen').style.display = 'none'
    document.querySelector('#answer-form').style.display = 'none'
    document.querySelector('#answer-input').style.display = 'none'
    document.querySelector('#answer-input').value = ''
    document.querySelector('#answer-button').textContent = 'Answer'
    document.querySelector('#answer-button').disabled = false
    document.querySelector('#answer-button').style.display = 'block'
    document.querySelector('#retry-button').style.display = 'none'
    document.querySelector('#score').textContent = '0'
    document.querySelector('#time-remaining').textContent = '0'
    document.querySelector('#total-time').textContent = '0'
    document.querySelector('#nickname-input').value = ''
    document.querySelector('#nickname').textContent = ''
  },

  // Start the timer for the question
  startTimer () {
    this.timeRemaining = 10
    this.updateTimer()
    this.timer = setInterval(() => {
      this.timeRemaining--
      this.totalTime++
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
        console.log('Ending quiz, time up')
        this.endQuiz('Time is up!')
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
    document.querySelector('#answer-form').style.display = 'flex'
    if (question.type === 'alternatives') {
      console.log('question has alternatives')
      document.querySelector('#answer-input').style.display = 'none'
      document.querySelector('#answer-alternatives').style.display = 'flex'
      document.querySelector('#answer-alternatives').innerHTML = ''
      Object.entries(question.alternatives).forEach((alternative) => {
        const div = document.createElement('div')
        div.id = alternative[0]
        div.style.display = 'flex'
        div.style.alignItems = 'center'
        div.style.flexDirection = 'column'
        const input = document.createElement('input')
        input.type = 'radio'
        input.id = alternative[0]
        input.name = 'answer'
        input.style.margin = '0'
        const label = document.createElement('label')
        label.style.marginBottom = '10px'
        label.htmlFor = alternative[0]
        label.textContent = alternative[1]
        label.style.flex = '2'
        label.style.textAlign = 'left'
        div.appendChild(input)
        div.appendChild(label)
        document.querySelector('#answer-alternatives').appendChild(div)
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
    clearInterval(this.timer)
    if (this.questions[this.questions.length - 1].type === 'alternatives') {
      const answer = document.querySelector('input[name="answer"]:checked').id
      console.log('Checking answer: ', answer)
      await this.checkAnswer(answer)
    } else {
      const answer = document.querySelector('#answer-input').value
      console.log('Checking answer: ', answer)
      await this.checkAnswer(answer)
      document.querySelector('#answer-input').value = ''
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
      this.endQuiz('Congratulations! You won!')
    }
  },

  // Post reply to server
  async postReply (url, body) {
    try {
      const data = await REST.post(url, body)
      if (data === 400) {
        console.log('Bad request')
        this.endQuiz('Wrong answer!')
        return
      }
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
      if (data.alternatives) {
        console.log('question has alternatives')
        data.type = 'alternatives'
      } else {
        console.log('question has input')
        data.type = 'input'
      }
      this.questions.push(data)
      this.updatePage()
      return data
    } catch (error) {
      console.error(error)
    }
  },

  // End the quiz game
  endQuiz (message = 'Game over!') {
    if (message === 'Congratulations! You won!') {
      document.querySelector('#end-screen').style.display = 'block'
      this.highScoresList.push({ nickname: this.nickname, time: this.totalTime })
      this.highScoresList.sort((a, b) => a.time - b.time)
      document.querySelector('#high-score-list').innerHTML = ''
      this.highScoresList.forEach((score) => {
        const li = document.createElement('li')
        li.textContent = `${score.nickname} - ${score.time}s`
        document.querySelector('#high-score-list').appendChild(li)
      })
      document.querySelector('#high-score-list').style.display = 'block'
      document.querySelector('#time-remaining').textContent = 'Leaderboard'
      document.querySelector('#retry-button').style.display = 'block'
      clearInterval(this.timer)
      document.querySelector('#question').textContent = ` ${message} Your time was ${this.totalTime} seconds.`
      document.querySelector('#answer-form').style.display = 'none'
      this.saveHighScoreToWebStorage()
    } else {
      clearInterval(this.timer)
      document.querySelector('#question').textContent = ` ${message} Your score was ${this.score}.`
      document.querySelector('#answer-form').style.display = 'none'
      document.querySelector('#retry-button').style.display = 'block'
    }
  },

  saveHighScoreToWebStorage () {
    localStorage.setItem('highScores', JSON.stringify(this.highScoresList))
  },

  loadHighScoreFromWebStorage () {
    const highScores = JSON.parse(localStorage.getItem('highScores'))
    if (highScores) {
      this.highScoresList = highScores
    }
  }
}
export default quiz

