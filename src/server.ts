import app from './app.js'
import './config/env.js'

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`>>> Running on port ${port}...`)
})
