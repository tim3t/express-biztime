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

// Get single invoice with :id

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

// Add an invoice
router.post('/', async function(req, res, next) {
	try {
		let { comp_code, amt } = req.body;
		const result = await db.query(
			`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[ comp_code, amt ]
		);
		return res.status(201).json({ invoice: result.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// update an invoice
router.put('/:id', async function(req, res, next) {
	try {
		let { amt, paid } = req.body;
		let id = req.params.id;
		let paidDate = null;

		const currResult = await db.query(
			`SELECT paid
             FROM invoices
             WHERE id = $1`,
			[ id ]
		);

		if (currResult.rows.length === 0) {
			throw new ExpressError(`No such invoice: ${id}`, 404);
		}

		const currPaidDate = currResult.rows[0].paid_date;

		if (!currPaidDate && paid) {
			paidDate = new Date();
		}
		else if (!paid) {
			paidDate = null;
		}
		else {
			paidDate = currPaidDate;
		}

		const result = await db.query(
			`UPDATE invoices
             SET amt=$1, paid=$2, paid_date=$3
             WHERE id=$4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[ amt, paid, paidDate, id ]
		);

		return res.json({ invoice: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});
// delete an invoice
router.delete('/:id', async function(req, res, next) {
	try {
		let id = req.params.id;

		const result = await db.query(
			`DELETE FROM invoices
             WHERE id = $1
             RETURNING id`,
			[ id ]
		);

		if (result.rows.length === 0) {
			throw new ExpressError(`No such invoice: ${id}`, 404);
		}

		return res.json({ status: 'deleted' });
	} catch (err) {
		return next(err);
	}
});
module.exports = router;
