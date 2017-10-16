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

//导出学困生选择情况
exports.downloadxuekunsheng = function(callback){
	let search = xuekunsheng.find({})
		search.sort('-createTimeStamp')
		search.exec(function(err,docs){
			if(err){
				console.log('----- search err -----')
				callback(err)
			}
			if(!docs){
				console.log('----- docs is null -----')
				callback(null,null)
			}
			if(docs){
				console.log('----- check result -----')
				//以下为将数据封装成array数组。因为下面的方法里头只接受数组。
	            let vac = new Array();
	            for (let i = 0; i < docs.length; i++) {
	                let temp = new Array();
	                temp[0] = i + 1
	                temp[1] = docs[i].xuekunshengName
	                temp[2] = docs[i].xuekunshengxuehao
	                temp[3] = docs[i].majorName
	                temp[4] = docs[i].stuName
	                vac.push(temp);
	            };
				console.log('check vac -- >',vac)
				let result = {}
					result.vac = vac
					//result.meeting_name = docs[0].meeting_name + '-' + docs[0].meeting_date
				//vac.meeting_name = docs[0].meeting_name
				//info.vac = vac
				callback(null,result)
			}
		})
}

//导入excel
exports.importExcel = function(arrayInfo,callback){
	async.eachLimit(arrayInfo,10,function(item,cb){
		let tempTime = ''
		if(item.zhouyi != '没空'){
			tempTime = '周一 ' + item.zhouyi + ','
		}
		if(item.zhouer != '没空'){
			tempTime = tempTime + '周二 ' + item.zhouer + ','
		}
		if(item.zhousan != '没空'){
			tempTime = tempTime + '周三 ' + item.zhousan + ','
		}
		if(item.zhousi != '没空'){
			tempTime = tempTime + '周四 ' + item.zhousi + ','
		}
		if(item.zhouwu != '没空'){
			tempTime = tempTime + '周五 ' + item.zhouwu + ','
		}
		if(item.zhouliu != '没空'){
			tempTime = tempTime + '周六 ' + item.zhouliu + ','
		}
		if(item.zhouri != '没空'){
			tempTime = tempTime + '周日 ' + item.zhouri + ','
		}
		formatInfo.checkResult(item)
		console.log('辅导时间-->',tempTime)
		let majorstu = new majorStu({
			code:item.code,
			stuName:item.stuName,
			majorName:item.majorName,
			stuXueHao:item.stuXueHao,
			stuGender:item.stuGender,
			dang:(item.dang == '是') ? '党员' : '',
			teachTime : tempTime
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
	async.waterfall([
		function(cb){
			let search = xuekunsheng.findOne({})
				search.where('code').equals(arg.code)
				search.where('xuekunshengxiaoyuankahao').equals(arg.alias)
				search.exec(function(err,doc){
					if(err){
						console.log('search err')
						cb(err)
					}
					if(!doc){
						console.log('没有选过学优生')
						cb(null)
					}
					if(doc){
						console.log('该课程已经选过学优生，不能再选')
						console.log(doc)
						cb(1,'已选过该课程')
					}	
				})
		},
		function(cb){
			let search = majorStu.findOne({})
				search.where('code').equals(arg.code)
				search.where('stuXueHao').equals(arg.stuXueHao)
				search.exec(function(err,doc){
					if(err){
						formatInfo.checkError(err.message)
						cb(err)
					}
					console.log('搜索结果-->',doc)
					formatInfo.checkResult(doc)
					cb(null,doc)
				})
		}
	],function(error,result){
		if(error && error != 1){
			console.log('async err')
			callback(error)
		}
		if(error && error == 1){
			console.log('async')
			callback(1,'已选过该课程')
		}
		if(!error){
			callback(null,result)
		}

	})
}

//
exports.choosestusucess = function(arg,callback){
	console.log('check arg-->',arg)
	let search = xuekunsheng.findOne({})
		search.where('code').equals(arg.code)
		search.where('stuXueHao').equals(arg.stuXueHao)
		search.where('xuekunshengxiaoyuankahao').equals(arg.alias)
		search.exec(function(err,doc){
			if(err){
				console.log('search err')
				callback(err)
			}
			console.log('doc -->',doc)
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
				dang:doc.dang,
				stuGender:doc.stuGender,
				xuekunshengxuehao:arg.xuehao,
				xuekunshengxiaoyuankahao:arg.xiaoyuankahao,
				xuekunshengGender:arg.gender,
				xuekunshengContact:arg.contact,
				xuekunshengbeizhu : (arg.beizhu) ? arg.beizhu : '暂无',
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

exports.mychoose = function(arg,callback){
	let search = xuekunsheng.find({})
		search.where('xuekunshengxiaoyuankahao').equals(arg.alias)
		search.exec(function(err,docs){
			if(err){
				console.log('search err',err)
				callback(err)
			}
			if(!docs || docs.length == 0){
				console.log('没有选择学生')
				callback(1,null)
			}
			if(docs && docs.length != 0){
				console.log('结果-->',docs)
				callback(null,docs)
			}
		})
}

//选择我的学困生
exports.mystu = function(arg,callback){
	let search = xuekunsheng.find({})
		search.where('stuXueHao').equals(arg.user)
		search.sort('-code')
		search.exec(function(err,docs){
			if(err){
				console.log('search err')
				callback(err)
			}
			if(!docs || docs.length == 0){
				console.log('没有学困生选择')
				callback(1,null)
			}
			if(docs && docs.length != 0){
				console.log('结果-->',docs)
				callback(null,docs)
			}
		})
}