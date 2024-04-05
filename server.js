let express = require('express')
let cors = require('cors')
let parser = require('body-parser')

const router = express()
router.use(express.static('public'))

router.use(cors());
router.use(parser.json())

var routesDMS = require("./router");
router.use('/DMSSystem', routesDMS)
/////
router.listen(8080, () => {
  console.log(`Server is running on port ${8080}.`);
});
