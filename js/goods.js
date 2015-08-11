!function($, cl, websql, owner) {
	
	var DB_VERSION_NUMBER = '1.0';
	var TIME_UPDATE = 'TIME_UPDATE';
	var TIME_INTERVAL = 2 * 60 *1000;
	
	var SQL_TABLE = 'DROP TABLE IF EXISTS cl_goods;CREATE TABLE cl_goods(goodsId TEXT PRIMARY KEY, barCode TEXT, goodsName TEXT, quantity INTEGER);';
	var SQL_SELECT = 'SELECT goodsId, barCode, goodsName, quantity FROM cl_goods WHERE 1 = 1';
	var SQL_INSERT = 'INSERT INTO cl_goods(goodsId, barCode, goodsName, quantity) VALUES(?, ?, ?, ?);';
	var SQL_UPDATE = 'UPDATE cl_goods SET quantity = ? WHERE goodsId = ?;';
	var SQL_DELETE = 'DELETE FORM cl_goods;';
	var SQL_SELECT_BY_BARCODE = 'SELECT * FROM cl_goods WHERE barCode = ?';
	
	cl.dbReady = function(successCallback, errorCallback) {
		websql.openDatabase('cl', 'cl db', 5 * 1024 * 1024);
		if (websql.database.version === '') {
			websql.changeVersion('', DB_VERSION_NUMBER, SQL_TABLE, function() {
				successCallback && successCallback(true);
			}, function(error, failingQuery) {
				errorCallback && errorCallback(error, failingQuery);
			});
		} else {
			successCallback && successCallback(false);
		}
	};
	
	cl.getGoodsByBarCode = function(barCode, successCallback, errorCallback) {
		websql.process([{
			"sql": SQL_SELECT_BY_BARCODE,
			"data": [barCode]
		}], function(tx, results) {
			successCallback && successCallback.call(this, results.rows);
		}, function(error, failingQuery) {
			errorCallback && errorCallback.apply(this, arguments);
		})
	};
	
	cl.getGoods = function(successCallback, errorCallback) {
		websql.process(SQL_SELECT, function(tx, results) {
			successCallback && successCallback.call(this, results.rows);
		}, function(error, failingQuery) {
			errorCallback && errorCallback.apply(this, arguments);
		});
	};
	
	cl.addGoods = function(goods, successCallback, errorCallback) {
		var sqls = [];
		$.each(goods, function(index, item) {
			sqls.push({
				"sql": SQL_INSERT,
				"data": item
			});
		});
		websql.process(sqls, function(tx, results) {
			successCallback && successCallback(true);
		}, function(error, failingQuery) {
			errorCallback && errorCallback.apply(this, arguments);
		});
	};
	
	cl.updateGoods = function(quantity, goodsId, successCallback, errorCallback) {
		websql.process([{
			"sql": SQL_UPDATE,
			"data": [quantity, goodsId]
		}], function(tx, results) {
			successCallback && successCallback();
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		})
	};
	
	cl.deleteGoods = function(successCallback, errorCallback) {
		websql.process(SQL_DELETE, function(tx, results) {
			successCallback && successCallback();
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	
}(mui, window.cl = {}, html5sql, app);
