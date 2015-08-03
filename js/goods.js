(function($, cl, websql) {
	
	var URL_SUMMAY = 'http://192.168.10.215/cl-restapi/stock/query/summary.do';
	
	cl.getSummary = function(datainfo, onSuccess) {
		$.post(URL_SUMMAY, datainfo, onSuccess, 'json');
	}
	
})(mui, window.cl = {}, html5sql);
