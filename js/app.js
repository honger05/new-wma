;(function($, owner) {
	var HOSTNAME = 'http://192.168.10.215/';
	var URL_LOGIN = HOSTNAME + 'cl-restapi/login.do';
	var URL_SUMMARY = HOSTNAME + 'cl-restapi/stock/query/summary.do';
	var URL_DETAIL = HOSTNAME + 'cl-restapi/stock/query/detail.do';
	var URL_STOCK_IN = HOSTNAME + 'cl-restapi/order/save.do';
	var URL_STOCK_OUT = HOSTNAME + 'cl-restapi/stockoutorder/save.do';
	var URL_FINACIAL = HOSTNAME + 'cl-restapi/finacial/detail.do';
	var URL_GOODS_REFRESH = HOSTNAME + 'cl-restapi/cache/refresh.do';
	var STOCK_IN_TYPE = 'com.chenlai.cloud.wms.stockin.order.entity.StockInOrder';
	var STOCK_IN_GOODS_TYPE = 'com.chenlai.cloud.wms.stockin.order.entity.StockInOrderGoods';
	var STOCK_OUT_TYPE = 'com.chenlai.cloud.wms.stockout.order.entity.StockOutOrder';
	var STOCK_OUT_GOODS_TYPE = 'com.chenlai.cloud.wms.goods.entity.OrderGodos';
	var STATIC_TYPE = 'com.chenlai.cloud.paas.common.entity.StaticExchangeEntity';
	var DYNAMIC_TYPE = 'com.chenlai.cloud.paas.common.entity.DynamicExchangeEntity';
	var D_DYNAMIC_TYPE = 'com.chenlai.cloud.paas.common.entity.DynamicEntity';
	
	var TIMEOUT = 10 * 1000;
	
	owner.DURATION_TIME = 250;
	owner.ANISHOW = 'pop-in';
	if ($.os.android && parseFloat($.os.version) < 4.4) {
		owner.DURATION_TIME = 150;
		owner.ANISHOW = 'slide-in-right';
	}
	
	owner.login = function(loginInfo, callback, no_mask) {
		callback = callback || $.noop;
		if (loginInfo.userCode.length <= 0) {
			return callback('请输入账号');
		}
		if (loginInfo.password.length <= 0) {
			return callback('请输入密码');
		}
		
		loginInfo = $.extend({
			tenantCode: 'yp',
			userCode: '005',
			password: '123456',
			isExpire: true,
			clientType: 'M',
			productCode: 'WMS',
			appCode: 'WMA'
		}, loginInfo);
		
		this.ajax(URL_LOGIN, {
			data: loginInfo,
			successHandle: function(data) {
				if (data.status == 0) {
					return callback(data.message);
				}
				var state = data.sessionUser;
				state.authtoken = data.authtoken;
				state.status = data.status;
				owner.setState(state);
				callback();
			}
		}, no_mask);
	};
	
	owner.getRemoteFinacial = function(callback, no_mask) {
		var state = app.getState();
		this.ajax(URL_FINACIAL, {
			data: {
				branchCode: state.branchCode,
				authtoken: state.authtoken
			},
			successHandle: function(data) {
				callback(data.main);
			}
		}, no_mask)
	};
	
	owner.getRemoteGoodsRefresh = function(callback, no_mask) {
		var state = app.getState();
		var goods = {
			"@type": D_DYNAMIC_TYPE,
			"clientType": "M",
			"version": 0,
			tenantId: state.tenantId,
			userCode: state.userCode
		}
		var staticExchangeEntity = {
			"@type": DYNAMIC_TYPE,
			main: [goods]
		}
		this.ajax(URL_GOODS_REFRESH + '?authtoken=' + state.authtoken, {
			dataJson: staticExchangeEntity,
			successHandle: function(data) {
				callback && callback(data.main);
			}
		}, no_mask);
	};
	
	owner.getRemoteSummary = function(callback, no_mask) {
		var state = app.getState();
		var dataInfo = {
			"authtoken": state.authtoken,
			"branchCode": state.branchCode
		}
		
		this.ajax(URL_SUMMARY, {
			data: dataInfo,
			successHandle: function(data) {
				data = data.extraEntities;
				var summarydata = [];
				for (var i in data) {
					summarydata.push({
						"type": i,
						"typeData": data[i]
					})
				}
				callback(summarydata);
			}
		}, no_mask);
	}
	
	owner.getRemoteDetail = function(barCode, callback, no_mask) {
		var state = app.getState();
		var dataInfo = {
			"authtoken": state.authtoken,
			"branchCode": state.branchCode,
			"barCode": barCode
		}
		
		this.ajax(URL_DETAIL, {
			data: dataInfo,
			successHandle: function(data){
				if (data.main[0]) {
					var reData = {};
					reData.goodsName = data.main[0].goodsName;
					reData.goodsCode = data.main[0].goodsCode;
					reData.allStockQuantity = data.main[0].allStockQuantity;
					reData.goodsInfo = [];
					for (var i in data.main) {
						var goodsSku = JSON.parse(data.main[i].goodsSku);
						goodsSku['color'] = '';
						goodsSku['size'] = '';
						for (var x in goodsSku) {
							if (x == '颜色') {
								goodsSku['color'] = goodsSku[x];
							}
							if (x == '尺码') {
								goodsSku['size'] = goodsSku[x];
							}
						}
						reData.goodsInfo.push({
							goodsId: data.main[i].goodsId,
							quantity: data.main[i].quantity,
							goodsSku: goodsSku
						})
					}
					callback(reData);
				}
			}
		}, no_mask);
	}
	
	owner.stockIn = function(dataInfo, callback) {
		var dates = format(new Date());
		var state = app.getState();
		var stockInOrder = {
			"@type": STOCK_IN_TYPE,
			arrivingTime: dates,
			orderDate: dates,
			startTime: dates,
			branchCode: state.branchCode,
			tenantId: state.tenantId
		};
		stockInOrder.goods = [];
		stockInOrder.totalQuantity = 0;
		for (var i = dataInfo.length - 1; i >= 0; i--) {
			stockInOrder.totalQuantity += dataInfo[i].num;
			stockInOrder.goods.push({
				"@type": STOCK_IN_GOODS_TYPE,
				goodsId: parseInt(dataInfo[i].goodsId),
				quantity: dataInfo[i].num
			});
		}

		var staticExchangeEtity = {
			"@type": STATIC_TYPE,
			main: [stockInOrder]
		};
		
		console.log(JSON.stringify(staticExchangeEtity));
		
		this.ajax(URL_STOCK_IN + '?authtoken=' + state.authtoken, {
			dataJson: staticExchangeEtity,
	 		successHandle: function(data) {
				callback && callback(data);
			}
 		});
	};
	
	owner.stockOut = function(dataInfo, callback) {
		var date = format(new Date());
		var state = app.getState();
		var stockOutOrder = {
			"@type": STOCK_OUT_TYPE,
			contactor: "待定",
			contactorPhone: "13800000000",
			receiverName: "待定",
			receiveTime: date,
			orderTime: date,
			sendAddress: "待定",
			branchCode: state.branchCode,
			tenantId: state.tenantId,
		}
		stockOutOrder.goods = [];
		stockOutOrder.totalQuantity = 0;
		for (var i = dataInfo.length - 1; i >= 0; i--) {
			stockOutOrder.totalQuantity += dataInfo[i].num;
			stockOutOrder.goods.push({
				"@type": STOCK_OUT_GOODS_TYPE,
				goodsId: parseInt(dataInfo[i].goodsId),
				quantity:dataInfo[i].num
			})
		}
		var staticExchangeEntity = {
			"@type": STATIC_TYPE,
			main: [stockOutOrder]
		}
		
		console.log(JSON.stringify(staticExchangeEtity));
		
		this.ajax(URL_STOCK_OUT + '?authtoken=' + state.authtoken, {
			dataJson: staticExchangeEntity,
			successHandle: function(data) {
				callback && callback(data);
			}
		})
	};
	
	$.ready(function() {
		$('body').on('click', 'a', function(e) {
			e.preventDefault();
		})
	});
	
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}
	
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || '{}';
		return JSON.parse(settingsText);
	}
	
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
	}
	
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || '{}';
		return JSON.parse(stateText);
	}
	
	owner.setSummary = function(summary) {
		summary = summary || {};
		localStorage.setItem('$summary', JSON.stringify(summary));
	}
	
	owner.getSummary = function() {
		var summaryText = localStorage.getItem('$summary') || '{}';
		return JSON.parse(summaryText);
	}
	
	owner.setOrders = function(orders) {
		orders = orders || [];
		localStorage.setItem('$orders', JSON.stringify(orders));
	}
	
	owner.getOrders = function() {
		var ordersText = localStorage.getItem('$orders') || '[]';
		return JSON.parse(ordersText);
	}
	
	owner.setOrder = function(order) {
		order = order || {};
		localStorage.setItem('$order', JSON.stringify(order));
	}
	
	owner.getOrder = function() {
		var orderText = localStorage.getItem('$order') || '{}';
		return JSON.parse(orderText);
	}
	
	owner.setCacheVersion = function(cacheVersion) {
		var cacheVersion = cacheVersion || {};
		localStorage.setItem('$cacheVersion', JSON.stringify(cacheVersion));
	}
	
	owner.getCacheVersion = function() {
		var cacheVersionText = localStorage.getItem('$cacheVersion') || '{}';
		return JSON.parse(cacheVersionText);
	}
	
	owner.ajax = function(url, config, no_mask) {
		console.log(url);
		if (plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE) {
			plus.nativeUI.toast('似乎已断开与互联网的连接', {
				verticalAlign: "bottom"
			});
			return;
		}
		if (window.plus && !no_mask) {
			plus.nativeUI.showWaiting();
		}
		config.dataJson && $.extend(config, {
			contentType: "application/json",
			data: JSON.stringify(config.dataJson)
		});
		config = $.extend({
			type:"post",
			async:true,
			dataType: "json",
			timeout: TIMEOUT,
			data: {},
			success: function(data) {
				if (window.plus && !no_mask) {
					plus.nativeUI.closeWaiting();
				}
				console.log(JSON.stringify(data));
				config.successHandle && config.successHandle.apply(this, arguments);
			},
			error: function(xhr, type, errorThrown) {
				if (window.plus && !no_mask) {
					plus.nativeUI.closeWaiting();
				}
				if (type == 'timeout') {
					plus.nativeUI.toast('网速太不给力了');
				}
				if (type == 'abort') {
					plus.nativeUI.toast('后台服务已停止');
				}
				console.error(type);
				config.errorHandle && config.errorHandle.apply(this, arguments);
			}
		}, config);
		$.ajax(url, config);
	}
	
    function format(date) {
    	function pad(n) {return n < 10 ? '0' + n : n;}
    	return date.getFullYear() + '-' 
    		+ pad(date.getMonth() + 1) + '-' 
    		+ pad(date.getDate()) + 'T' 
    		+ pad(date.getHours()) + ':' 
    		+ pad(date.getMinutes()) + ':' 
    		+ pad(date.getSeconds());
    }
	
})(mui, window.app = {});
