// Routes for companies in db

const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

let router = new express.Router();

router.get('/', async function(req, res, next) {
	try {
		const results = await db.query(`SELECT code, name FROM companies ORDER BY name`);
		return res.json({ companies: results.rows });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
