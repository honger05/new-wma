;(function($, owner) {
	
	var URL_LOGIN = 'http://192.168.10.215/cl-restapi/login.do';
	
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		if (loginInfo.account.length <= 0) {
			return callback('请输入账号');
		}
		if (loginInfo.password.length <= 0) {
			return callback('请输入密码');
		}
		
//		loginInfo = {
//			tenantCode: 'yp',
//			userCode: '005',
//			password: '123456',
//			isExpire: true,
//			clientType: 'M',
//			productCode: 'WMS',
//			appCode: 'WMA'
//		}
//		
//		$.post(URL_LOGIN, loginInfo, function(data) {
//			var state = data.sessionUser;
//			state.authtoken = data.authtoken;
//			state.status = data.status;
//			owner.setState(state);
//			callback();
//		}, 'json');

		loginInfo.authtoken = 'sdsdsdsdd';
		owner.setState(loginInfo);
		setTimeout(function() {
			callback();	
		}, 1000);
	}
	
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
})(mui, window.app = {});
