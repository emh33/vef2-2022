/*
Keyrt með:
node 02.post.js

Keyrir upp express vefjón sem leyfir að sækja lista af færslum og búa til nýja
færslu með því að gera POST fyrirspurn á / með JSON gögnum.
Geymir gögn í minni, aðeins fyrir dæmi. Í alvöru væri einhver gagnagrunnur í
notkun til að geyma gögn.

Með cURL:

> curl -vH "Content-Type: application/json" -d '{x}' http://localhost:3000/
{"error":"Invalid json"}

> curl -vH "Content-Type: application/json" -d '{"title":""}' http://localhost:3000/
{"field":"title","error":"Title must be a non-empty string"}

> curl -vH "Content-Type: application/json" -d '{"title":"bar"}' http://localhost:3000/
{"id":2,"title":"foo"}
*/

import express from 'express';

const app = express();

// án json body handlers getum við ekki lesið JSON frá notanda
app.use(express.json());

const data = [{ id: 1, title: 'Item 1' }];

app.get('/', (req, res) => {
  res.json(data);
});

app.post('/', (req, res) => {
  const { title = '' } = req.body;

  // Hér ætti að vera meira robust validation
  if (typeof title !== 'string' || title.length === 0) {
    return res.status(400).json({
      field: 'title',
      error: 'Title must be a non-empty string',
    });
  }

  // Útbýr ID fyrir færslu, aðeins fyrir dæmi, ekki nota í neinu alvöru!
  // Ef við höfum gagnagrunn myndum við nota serial primary key þar til að
  // útbúa ID
  const nextId = data.map((i) => i.id).reduce((a, b) => (a > b ? a : b + 1), 1);

  const item = { id: nextId, title };
  data.push(item);

  return res.status(201).json(item);
});

function notFoundHandler(req, res, next) { // eslint-disable-line
  console.warn('Not found', req.originalUrl);
  res.status(404).json({ error: 'Not found' });
}
app.use(notFoundHandler);

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);

  // Grípum illa formað JSON og sendum 400 villu til notanda
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}
app.use(errorHandler);

const port = 3000;
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
