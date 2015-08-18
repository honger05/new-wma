!function($, cl, websql) {
	
	var OLD_VERSION_NUMBER = '';
	var DB_VERSION_NUMBER = '1.2';
	var TIME_UPDATE = 'TIME_UPDATE';
	var TIME_INTERVAL = 2 * 60 *1000;
	
	var SQL_TABLE = 'DROP TABLE IF EXISTS cl_goods;CREATE TABLE cl_goods(goodsId INTEGER PRIMARY KEY,goodsCode Text, barCode TEXT, goodsName TEXT, imgUrl TEXT, ext1 TEXT, ext2 TEXT);';
	var SQL_SELECT = 'SELECT goodsId, goodsCode, barCode, goodsName, imgUrl, ext1, ext2 FROM cl_goods WHERE 1 = 1';
	var SQL_INSERT = 'INSERT INTO cl_goods(goodsId, goodsCode, barCode, goodsName, imgUrl, ext1, ext2) VALUES(?, ?, ?, ?, ?, ?, ?);';
	var SQL_UPDATE = 'UPDATE cl_goods SET imgUrl = ? WHERE goodsId = ?;';
	var SQL_DELETE = 'DELETE FROM cl_goods WHERE 1 = 1;';
	var SQL_SELECT_BY_BARCODE = 'SELECT * FROM cl_goods WHERE barCode = ?';
	
	cl.dbReady = function(successCallback, errorCallback) {
		websql.openDatabase('cl', 'cl db', 5 * 1024 * 1024);
		if (websql.database.version === OLD_VERSION_NUMBER) {
			websql.changeVersion(OLD_VERSION_NUMBER, DB_VERSION_NUMBER, SQL_TABLE, function() {
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
			console.log('websql (get goods by barCode):success');
			var goods = {};
			var rows = results.rows;
			goods.goodsName = rows.item(0).goodsName;
			goods.goodsCode = rows.item(0).goodsCode;
			goods.imgUrl = rows.item(0).imgUrl;
			goods.goodsInfo = [];
			for (var i = rows.length - 1; i >= 0; i--) {
				goods.goodsInfo.push({
					goodsId: rows.item(i).goodsId,
					goodsSku: {
						"size": rows.item(i).ext2, 
						"color": rows.item(i).ext1 
					}
				})
			}
			successCallback && successCallback.call(this, goods);
		}, function(error, failingQuery) {
			console.log('websql (get goods by barCode):error --> ' + error);
			errorCallback && errorCallback.apply(this, arguments);
		})
	};
	
	cl.getGoods = function(successCallback, errorCallback) {
		websql.process(SQL_SELECT, function(tx, results) {
			console.log('websql (get goods):success');
			successCallback && successCallback.call(this, results.rows);
		}, function(error, failingQuery) {
			console.log('websql (get goods):error --> ' + error);
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
			console.log('websql (add goods):success');
		}, function(error, failingQuery) {
			errorCallback && errorCallback.apply(this, arguments);
			console.log('websql (add goods):error --> ' + error);
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
			console.log('websql (delete goods): success');
			successCallback && successCallback();
		}, function(error, failingQuery) {
			console.log('websql (delete goods): error --> ' + failingQuery);
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	
}(mui, window.cl = {}, html5sql);
