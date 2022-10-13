// Routes for invoices in db

const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

let router = new express.Router();

// Get invoices list
router.get('/', async function(req, res, next) {
	try {
		console.log('Hit route!');
		const results = await db.query('SELECT * FROM invoices');
		return res.json({ invoices: results.rows });
	} catch (e) {
		return next(e);
	}
});

router.get('/:id', async function(req, res, next) {
	try {
		let id = req.params.id;
		const invoiceIdResult = await db.query(`SELECT * FROM invoices WHERE id = $1`, [ id ]);
		if (invoiceIdResult.rows.length === 0) {
			throw new ExpressError(`No such invoice with id of ${id}`, 404);
		}
		const invoice = invoiceIdResult.rows[0];
		return res.json({ invoice: invoice });
	} catch (e) {
		return next(e);
	}
});

// Get single invoice with :id

// Add an invoice

// update an invoice

// delete an invoice

module.exports = router;
