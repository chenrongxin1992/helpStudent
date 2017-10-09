/**
 *  @Author:    chenrongxin
 *  @Create Date:   2017-10-05
 *  @Description:   logic
 */
const major = require('../db/major')
const formatInfo = require('../formatInfo/formatInfo')
const majorStu = require('../db/majorstu')
const xuekunsheng = require('../db/xuekunsheng')
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

//选择逻辑
//返回页面让学困生填写联系方式，并将code对应的课程和学优生信息返回
//如果学生已经选择好学优生，则直接显示最后结果
exports.choosestu = function(arg,callback){
	console.log('进入logic')
	console.log(arg)
	let search = majorStu.findOne({})
		search.where('code').equals(arg.code)
		search.where('stuXueHao').equals(arg.stuXueHao)
		search.exec(function(err,doc){
			if(err){
				formatInfo.checkError(err.message)
				callback(err)
			}
			console.log('搜索结果-->',doc)
			formatInfo.checkResult(doc)
			callback(null,doc)
		})
}

//选择确认逻辑
exports.choosestuconfirm = function(arg,callback){
	console.log('body -- >',arg)
	async.waterfall([
		function(cb){
			console.log('更新已选人数')
			let search = majorStu.findOne({})
				search.where('code').equals(arg.code)
				search.where('stuXueHao').equals(arg.stuXueHao)
				search.exec(function(err,doc){
					if(err){
						console.log('search err')
						cb(err)
					}
					if(doc){
						let num = doc.chooseNum + 1
						console.log('new chooseNum -- >',num)
						majorStu.update({_id:doc._id},{$set:{chooseNum:num}},function(err){
							if(err){
								console.log('update err')
								cb(err)
							}
							console.log('update success')
							cb(null,doc)
						})
					}
				})
		},
		function(doc,cb){
			console.log('保存记录')
			let newxuekunsheng = new xuekunsheng({
				code:doc.code,
				majorName:doc.majorName,
				stuName:doc.stuName,
				stuXueHao:doc.stuXueHao,
				stuNianJi:doc.stuNianJi,
				stuPhoneNum:doc.stuPhoneNum,
				teachPlace:doc.teachPlace,
				teachTime:doc.teachTime,
				xuekunshengxuehao:arg.xuehao,
				xuekunshengxiaoyuankahao:arg.xiaoyuankahao,
				xuekunshengGender:arg.gender,
				xuekunshengContace:arg.contact,
				xuekunshengbeizhu : arg.beizhu,
				xuekunshengName : arg.name
			})
			newxuekunsheng.save(function(err,docs){
				if(err){
					console.log('save err')
					cb(err)
				}
				console.log('save success')
				cb(null,docs)
			})
		}
	],function(error,result){
		if(error){
			console.log('async err')
			callback(error)
		}
		console.log('async success')
		callback(null,result)
	})
}