/**
 *  @Author:    chenrongxin
 *  @Create Date:   2017-10-05
 *  @Description:   logic
 */
const major = require('../db/major')
const formatInfo = require('../formatInfo/formatInfo')
const majorStu = require('../db/majorstu')
const async = require('async')

//专业列表
exports.getMajorList = function(callback){
	let search = major.find({})
		search.exec(function(err,docs){
			if(err){
				formatInfo.checkError(err.message)
			}
			formatInfo.checkResult(docs)
			callback(null,docs)
		})
}

//导入excel
exports.importExcel = function(arrayInfo,callback){
	async.eachLimit(arrayInfo,10,function(item,cb){
		formatInfo.checkResult(item)
		let majorstu = new majorStu({
			code:item.code,
			stuName:item.stuName,
			majorName:item.majorName,
			stuXueHao:item.stuXueHao,
			stuNianJi:item.stuNianJi,
			stuPhoneNum:item.stuPhoneNum,
			teachPlace:item.teachPlace,
			teachTime:item.teachTime
		})
		majorstu.save(function(err,doc){
			if(err){
				formatInfo.checkError(err.message)
				cb(err)
			}
			formatInfo.checkResult(doc)
			cb(null)
		})
	},function(err){
		if(err){
			formatInfo.checkError(err.message)
			callback(err)
		}
		callback(null,null)
	})
}

//获取课程对应的学优生
exports.getMajorStu = function(code,limit,offset,callback){
	async.waterfall([
		function(cb){
			let search = majorStu.find({}).count()
				search.where('code').equals(code)
				search.exec(function(err,count){
					if(err){
						formatInfo.checkError(err.message)
						cb(err)
					}
					formatInfo.checkResult(count)
					let totalPage = (count + limit -1) / limit;
					cb(null,totalPage)
				})
		},
		//获取code对应的课程
		function(totalPage,cb){
			let search = major.findOne({})
				search.where('code').equals(code)
				search.exec(function(err,doc){
					if(err){
						formatInfo.checkError(err.message)
						cb(err)
					}
					formatInfo.checkResult(doc)
					cb(null,doc.majorName,totalPage)
				})
		},
		function(majorName,totalPage,cb){
			limit = parseInt(limit)
			offset = parseInt(offset)
			let numSkip = (offset)*limit
			let search = majorStu.find({})
				search.where('code').equals(code)
				search.limit(limit)
				search.skip(numSkip)
				search.exec(function(err,docs){
					if(err){
						formatInfo.checkError(err.message)
						cb(err)
					}
					formatInfo.checkResult(docs)
					let result = {}
						result.majorName = majorName
						result.docs = docs
						result.totalPage = totalPage
					cb(null,result)
				})
		}
	],function(error,result){
		if(error){
			formatInfo.checkError(error.message)
			callback(error)
		}
		callback(null,result)
	})
}

exports.getMajorStuPost = function(code,limit,offset,callback){
	async.waterfall([
		function(cb){
			let search = majorStu.find({}).count()
				search.where('code').equals(code)
				search.exec(function(err,count){
					if(err){
						formatInfo.checkError(err.message)
						cb(err)
					}
					formatInfo.checkResult(count)
					let totalPage = (count + limit -1) / limit;
					cb(null,totalPage)
				})
		},
		function(totalpage,cb){
			limit = parseInt(limit)
			offset = parseInt(offset)
			let numSkip = (offset)*limit
			console.log('check -- >',limit,offset,numSkip)
			let search = majorStu.find({})
				search.where('code').equals(code)
				search.limit(limit)
				search.skip(numSkip)
				search.exec(function(err,docs){
					if(err){
						formatInfo.checkError(err.message)
						cb(err)
					}
					//formatInfo.checkResult(docs)
					cb(null,docs)
				})
		}
	],function(error,result){
		if(error){
			formatInfo.checkError(error.message)
			callback(error)
		}
		formatInfo.checkResult(result)
		callback(null,result)
	})
}