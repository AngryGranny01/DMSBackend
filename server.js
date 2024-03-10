let express = require('express')
let cors = require('cors')
let parser = require('body-parser')

const app = express()
app.use(express.static('public'))

app.use(cors());
app.use(parser.json())


var routesDMS = require("./routers/router");
app.use('/DMSSystem', routesDMS)
/////
app.listen(8080, () => {
  console.log(`Server is running on port ${8080}.`);
});
