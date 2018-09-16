// Taken straight from: https://docs.arangodb.com/3.3/Manual/Foxx/GettingStarted.html

'use strict';
const createRouter = require('@arangodb/foxx/router');
const joi = require('joi');

const router = createRouter();

module.context.use(router);


router.get('/users/:id', (req, res) => {
  res.send(`Hellow ${req.pathParams.id}!`)
})
.pathParam('id', joi.string().required(), 'ID of user')
.response(['text/plain'], 'A generic greeting.')
.summary('Generic greeting')
.description('Prints a generic greeting.');

router.all('/users', (req, res) => {
  res.send('Working')
})