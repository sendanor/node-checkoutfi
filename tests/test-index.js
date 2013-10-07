"use strict";

/* */
describe('index', function(){

	var util = require('util');
	var Q = require('q');
	Q.longStackSupport = true;
	var is = require('nor-is');
	var assert = require('assert');
	var config = JSON.parse(require('fs').readFileSync(__dirname + '/config.json'));

	describe('co', function(){
		var co = require('../src/');

		it('should be object', function(){
			assert.strictEqual(typeof co, 'object');
		});

		describe('.parsePaymentOptions', function() {

			it('should be function', function(){
				assert.strictEqual(typeof co.parsePaymentOptions, 'function');
			});

			it('should parse values correctly', function(){
				var res = co.parsePaymentOptions({
					'stamp': 0,
					'amount': 1,
					'reference': 13,
					'merchant': config.merchant,
					'return': 'https://example.com/co',
					'cancel': 'https://example.com/co',
					'delivery_date': '20131007'
				});
				assert.strictEqual(typeof res, 'object');

				assert.deepEqual(Object.keys(res), ['stamp', 'amount', 
					'reference', 'merchant', 'return', 'cancel', 
					'delivery_date', 'version', 'message', 'language', 
					'reject', 'delayed', 'country', 'currency', 'device', 
					'content', 'type', 'algorithm', 'firstname', 'familyname', 
					'address', 'postcode', 'postoffice' ]);

				assert.strictEqual(res.stamp,     '0');
				assert.strictEqual(res.amount,    '1');
				assert.strictEqual(res.reference, '13');
				assert.strictEqual(res.merchant,  '375917');
				assert.strictEqual(res['return'], 'https://example.com/co');
				assert.strictEqual(res.cancel,    'https://example.com/co');
				assert.strictEqual(res.delivery_date,    '20131007');

			});

		});

		describe('.getPaymentMAC', function() {

			it('should be function', function(){
				assert.strictEqual(typeof co.getPaymentMAC, 'function');
			});

			it('should parse values correctly', function(){
				var res = co.getPaymentMAC({
					'stamp': 0,
					'amount': 1,
					'reference': 13,
					'merchant': config.merchant,
					'return': 'https://example.com/co',
					'cancel': 'https://example.com/co',
					'delivery_date': '20131007'
				});
				assert.strictEqual(res, '98189F2BCD9F378F8DB73B3A04B4B708');
			});

		});

		describe('.getPaymentObject', function() {

			it('should be function', function(){
				assert.strictEqual(typeof co.getPaymentObject, 'function');
			});

			it('should parse values correctly', function(){
				var res = co.getPaymentObject({
					'stamp': 0,
					'amount': 1,
					'reference': 13,
					'merchant': config.merchant,
					'return': 'https://example.com/co',
					'cancel': 'https://example.com/co',
					'delivery_date': '20131007'
				});
				assert.strictEqual(typeof res, 'object');

				assert.deepEqual(Object.keys(res), ['stamp', 'amount', 
					'reference', 'merchant', 'return', 'cancel', 
					'delivery_date', 'version', 'message', 'language', 
					'reject', 'delayed', 'country', 'currency', 'device', 
					'content', 'type', 'algorithm', 'firstname', 'familyname', 
					'address', 'postcode', 'postoffice', 'mac' ]);

				assert.strictEqual(res.stamp,     '0');
				assert.strictEqual(res.amount,    '1');
				assert.strictEqual(res.reference, '13');
				assert.strictEqual(res.merchant,  '375917');
				assert.strictEqual(res['return'], 'https://example.com/co');
				assert.strictEqual(res.cancel,    'https://example.com/co');
				assert.strictEqual(res.delivery_date,    '20131007');

				assert.strictEqual(res.mac, '98189F2BCD9F378F8DB73B3A04B4B708');

			});

		});

	});

});

/* EOF */
