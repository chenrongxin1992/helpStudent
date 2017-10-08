/**
 *  @Author:    chenrongxin
 *  @Create Date:   2017-10-04
 *  @Description:   格式化信息
 */

//res.json的结果
exports.resResult = function(errCode,errMsg){
	(errCode == 0) ? errCode : -1
	(errMsg) ? errMsg : 'error accoured'
	return {'errCode':errCode,'result':errMsg}
}

//抛出错误信息
exports.checkError = function(errMsg){
	(errMsg) ? errMsg :'error accoured'
	console.log('errMsg -- > ',errMsg)
	return 
}

//console信息
exports.checkResult = function(arg){
	(arg) ? arg : 'arg is null'
	console.log('check arg --> ',arg)
	return 
}