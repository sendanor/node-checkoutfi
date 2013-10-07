/* Checkout.fi Library */

/** The keys for values in payment object. These MUST BE in correct order! */
var _PAYMENT_KEYS = [
	'version', 'stamp', 'amount', 'reference', 'message', 'language', 'merchant', 'return', 'cancel', 'reject', 'delayed', 'country',
	'currency', 'device', 'content', 'type', 'algorithm', 'delivery_date', 'firstname', 'familyname', 'address', 'postcode', 'postoffice'
];

/** Types for payment object keywords. */
var _PAYMENT_KEY_TYPES = {
	'version'         : {'type':'string', 'length':4,     'required':true,  'default': '0001'},
	'stamp'           : {'type':'string', 'length':20,    'required':true},
	'amount'          : {'type':'number', 'length':8,     'required':true},
	'reference'       : {'type':'string', 'length':20,    'required':true},
	'message'         : {'type':'string', 'length':1000,  'required':false, 'default': ''},
	'language'        : {'type':'string', 'length':2,     'required':false, 'default': 'FI'},
	'merchant'        : {'type':'string', 'length':20,    'required':true},
	'return'          : {'type':'string', 'length':300,   'required':true},
	'cancel'          : {'type':'string', 'length':300,   'required':true},
	'reject'          : {'type':'string', 'length':300,   'required':false, 'default': ''},
	'delayed'         : {'type':'string', 'length':300,   'required':false, 'default': ''},
	'country'         : {'type':'string', 'length':3,     'required':false, 'default': 'FIN'},
	'currency'        : {'type':'string', 'length':3,     'required':true,  'default': 'EUR'},
	'device'          : {'type':'number', 'length':2,     'required':true,  'default': 1, 'values':[1, 10]},
	'content'         : {'type':'number', 'length':2,     'required':true,  'default': 1, 'values':[1, 2]},
	'type'            : {'type':'number', 'length':1,     'required':true,  'default': 0},
	'algorithm'       : {'type':'number', 'length':1,     'required':true,  'default': 2},
	'delivery_date'   : {'type':'number', 'length':8,     'required':true},
	'firstname'       : {'type':'string', 'length':40,    'required':false, 'default': ''},
	'familyname'      : {'type':'string', 'length':40,    'required':false, 'default': ''},
	'address'         : {'type':'string', 'length':40,    'required':false, 'default': ''},
	'postcode'        : {'type':'string', 'length':14,    'required':false, 'default': ''},
	'postoffice'      : {'type':'string', 'length':18,    'required':false, 'default': ''},
	'mac'             : {'type':'string', 'length':32,    'required':true}
};

var crypto = require('crypto');

var checkoutfi = module.exports = {};

/** Returns generated MAC for payment form */
checkoutfi.parsePaymentOptions = function(opts) {
	opts = opts ? JSON.parse(JSON.stringify(opts)) : {};
	
	_PAYMENT_KEYS.forEach(function(key) {
		var type = _PAYMENT_KEY_TYPES[key] || {};

		if( (opts[key] === undefined) && (type['default'] !== undefined) ) {
			opts[key] = type['default'];
		}

		if( (type.type === 'number') && (opts[key] !== undefined) ) {
			opts[key] = parseInt(opts[key], 10);
		}

		if(opts[key] === undefined) {
			if(type.required) {
				throw new TypeError("Bad input: Missing property: " + key);
			}
		} else {
			opts[key] = (''+opts[key]).trim();
		}

		if(opts[key].length > type.length) {
			throw new TypeError("Too long input for " + key + ": "+ opts[key].length + " (max length is " + type.length +")");
		}
	});

	// FIXME: Check version must always be "0001"
	// FIXME: Check stamp is [a-zA-Z0-9]+
	// FIXME: Check reference for finnish reference number validity
	// FIXME: Check language for "FI", "SE" or "EN"
	// FIXME: Check country for value FIN
	// FIXME: Check currency for value EUR
	// FIXME: Check device for 1 (HTML) or 10 (XML)
	// FIXME: Check content for 1 (normal) or 2 (adult)
	// FIXME: Check delivery_date for YYYYMMDD

	return opts;
};

/** Returns generated MAC for payment form */
checkoutfi.getPaymentMAC = function(opts) {
	opts = checkoutfi.parsePaymentOptions(opts);
	var data = _PAYMENT_KEYS.concat(['password']).map(function(key) {
		return (opts[key] !== undefined) ? ''+opts[key] : '';
	}).join('+');
	var md5 = crypto.createHash('md5');
	md5.update(data);
	return md5.digest('hex').toUpperCase();
};

checkoutfi.getPaymentMac = checkoutfi.getPaymentMAC;

/** Returns object with generated MAC and other values */
checkoutfi.getPaymentObject = function(opts) {
	opts = checkoutfi.parsePaymentOptions(opts);
	opts.mac = checkoutfi.getPaymentMAC(opts);
	return opts;
};

/** HTTP request */
checkoutfi._request = function(post) {
	post = post || {};

	var defer = require('Q').defer();

	var options = {
		hostname: 'payment.checkout.fi',
		port: 443,
		path: '/',
		method: 'POST'
	};
	
	var req = require('https').request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		var buffer = "";
		res.on('data', function (chunk) {
			buffer += chunk;
		});
		res.on('end', function() {
			if(res.statusCode === 200) {
				defer.resolve(buffer);
			} else {
				defer.reject('HTTP Status code was ' + res.statusCode + ': ' + buffer);
			}
		});
	});
	
	req.on('error', function(e) {
		defer.reject(e);
	});
	
	// write data to request body
	req.write( require('querystring').stringify(post) );
	req.end();
	
	return defer.promise;
}

/* EOF */
