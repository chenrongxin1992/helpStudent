var express = require('express');
var router = express.Router();
const major = require('../db/major')
const formatInfo = require('../formatInfo/formatInfo')
const logic = require('../logic/logic')
const xlsx = require('xlsx')
const busBoy = require('busboy')
const request = require('request')
const majorStu = require('../db/majorstu')
const fs = require('fs')
const ejsExcel = require('ejsExcel')
const async = require('async')

let MyServer = "http://116.13.96.53:81",
	//CASserver = "https://auth.szu.edu.cn/cas.aspx/",
	CASserver = 'https://authserver.szu.edu.cn/authserver/',
	ReturnURL = "http://116.13.96.53:81";


/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/xys/majorlist')
  //res.render('index', { title: 'Express' });
});

// 添加专业
// router.get('/major',function(req,res){
// 	let majorInfo = new major({
// 			majorName : '高等数学A(1)',
// 			code : '0001'
// 		})
// 	majorInfo.save(function(err,doc){
// 		if(err){
// 			res.json(formatInfo.checkError(-1,err.message))
// 		}
// 		res.json(formatInfo.resResult(0,doc))
// 	})
// })

router.get('/importnew',function(req,res){
	console.log(__dirname)
    let exBuf=fs.readFileSync(__dirname+'/高数1.xlsx');
		ejsExcel.getExcelArr(exBuf).then(exlJson=>{
		    console.log("---------------- read success:getExcelArr ----------------");
		    let workBook=exlJson;
		    let workSheets=workBook[0];
		    // let testarr = new Array()
		    // console.log('type of workSheets-->',typeof workSheets)
		    // console.log('testarr -->',typeof testarr)
		    async.eachLimit(workSheets,1,function(item,cb){
		    	console.log('item[7]-->',item[7])
		    	console.log('item[8]-->',item[8])
			    let tempTime = ''
				if(item[7] != '没空'){
					tempTime = '周一 ' + item[7] + '， '
				}
				if(item[8] != '没空'){
					tempTime = tempTime + '周二' + item[8] + '， '
				}
				if(item[9] != '没空'){
					tempTime = tempTime + '周三 ' + item[9] + '， '
				}
				if(item[10] != '没空'){
					tempTime = tempTime + '周四 ' + item[10] + '， '
				}
				if(item[11] != '没空'){
					tempTime = tempTime + '周五 ' + item[11] + '， '
				}
				if(item[12] != '没空'){
					tempTime = tempTime + '周六 ' + item[12] + '， '
				}
				if(item[13] != '没空'){
					tempTime = tempTime + '周日 ' + item[13] 
				}
			
		    	let majorstu_new = new majorStu({
		    		code : item[0],
		    		stuName : item[1],
		    		stuXueHao : item[2],
		    		stuGender : item[3],
		    		stuPhoneNum : item[4],
		    		majorName : item[5],
		    		dang : (item[6] == '是') ? '党员' : '',
		    		teachTime : tempTime
		    	})
		    	majorstu_new.save(function(err,doc){
		    		if(err){
		    			console.log('save err')
		    			cb(err)
		    		}
		    		//console.log('save success')
		    		//console.log('result-->',doc)
		    		cb(null)
		    	})
		    },function(err){
		    	if(err){
		    		console.log('eachLimit err')
		    		console.log(err.message)
		    	}
		    })
		    // workSheets.forEach((item,index)=>{
		    //         console.log((index+1)+" row:"+item.join('    '));
		    // })
		}).catch(error=>{
		    console.log("************** had error!");
		    console.log(error);
		});
})
//添加对应专业学生
// router.get('/import',function(req,res){
// 	return res.render('import',{title:'导入学优生信息'})
// }).post('/import',function(req,res){
// 	let excelArray = new Array()
// 	formatInfo.checkResult(req.headers)
// 	let busboy = new busBoy({
// 		headers: req.headers,
//         limits: {
//             files: 1,
//             fileSize: 50000000
//         }
// 	})
// 	busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//         file.on('limit', function() {
//             res.json(formatInfo.resResult(-1,'File is To Large'));
//             return
//         });
//         file.on('data', function(data) {
//         	formatInfo.checkResult(fieldname)
//         	formatInfo.checkResult(file)
//         	formatInfo.checkResult(filename)
//         	formatInfo.checkResult(encoding)
//         	formatInfo.checkResult(mimetype)
//         	formatInfo.checkResult(data)
//             console.log('File [' + filename + '] got ' + data.length + ' bytes');
//             let workbook = xlsx.read(data);
//             let sheetNames = workbook.SheetNames; // 返回 ['sheet1', 'sheet2',……]
//             let worksheet = workbook.Sheets[sheetNames[0]];// 获取excel的第一个表格
//             console.log(worksheet)
//             let ref = worksheet['!ref']; //获取excel的有效范围,比如A1:F20
//             let reg = /[a-zA-Z]/g;
//             ref = ref.replace(reg,"");
//             let line = parseInt(ref.split(':')[1]); // 获取excel的有效行数
//             console.log("line====>",line);
//             // header ['课程号','姓名','学号','性别','手机号','辅导课程','是否党员','辅导时间'] 

//             //循环读出每一行，然后处理 
//             for(let i = 2; i <= line; i++){
//                 if(!worksheet['A'+i] && !worksheet['B'+i] && !worksheet['C'+i] && !worksheet['D'+i] && !worksheet['E'+i] && !worksheet['F'+i] && !worksheet['G'+i] && !worksheet['H'+i]  && !worksheet['I'+i] && !worksheet['J'+i] && !worksheet['K'+i] && !worksheet['L'+i] && !worksheet['M'+i] && !worksheet['N'+i] && i != 2){   //如果大于2的某行为空,则下面的行不算了
//                     break;
//                 }
//                 let tempItem = {
//                 	code : worksheet['A'+i].v || '',
//                 	stuName : worksheet['B'+i].v || '',
//                 	stuXueHao : worksheet['C'+i].v || '',
//                 	stuGender : worksheet['D'+i].v || '',
//                 	stuPhoneNum : worksheet['E'+i].v || '',
//                 	majorName : worksheet['F'+i].v || '',
//                 	dang : worksheet['G'+i].v || '',
//                 	zhouyi : worksheet['H'+i].v || '',
//                 	zhouer : worksheet['I'+i].v || '',
//                 	zhousan : worksheet['J'+i].v || '',
//                 	zhousi : worksheet['K'+i].v || '',
//                 	zhouwu : worksheet['L'+i].v || '',
//                 	zhouliu : worksheet['M'+i].v || '',
//                 	zhouri : worksheet['N'+i].v || ''
//                 }

//                 excelArray.push(tempItem)
//             }
//             formatInfo.checkResult(excelArray)
//             logic.importExcel(excelArray,function(error,result){
//             	if(error){
//             		formatInfo.checkError(error.message)
//             		return res.json(formatInfo.resResult(-1,error.message))
//             	}
//             	return res.json(formatInfo.resResult(0,'import success'))
//             })
//         })
//     })
//    /*busboy.on('finish', function() {
//         res.writeHead(200);
//         //res.end('upload OK!');
//     });*/
//     return req.pipe(busboy);
// })

//专业列表
router.get('/majorlist',function(req,res){
	logic.getMajorList(function(error,result){
		if(error){
			formatInfo.checkError(error.message)
			return res.json(formatInfo.resResult(-1,error.message))
		}
		return res.render('majorlist',{title:'课程列表',majorlist:result})
	})
})

//专业对应学优生
router.get('/majorstu',function(req,res){
	//获取分页参数
	let limit = req.query.limit, 	//这个相当于条数
		offset = req.query.offset 	//这个相当于pages
	if(!limit || limit == null || typeof limit == 'undefined'){//页面记录数
		limit = 16
	}
	if(!offset || offset == null || typeof offset == 'undefined'){//当前页数
		offset = 0
	}
	offset = parseInt(offset/limit)
	console.log('check limit && offset: ',limit,offset)

	let code = req.query.code
	formatInfo.checkResult(code)
	logic.getMajorStu(code,limit,offset,function(error,result){
		if(error){
			return res.json(formatInfo.resResult(-1,error.message))
		}
		return res.render('majorstu',{title:'选择学优生',majorstu:result.docs,majorName:result.majorName,totalpage:result.totalPage})
	})
}).post('/majorstu',function(req,res){
	//获取分页参数
	let limit = req.body.limit, 	//这个相当于条数
		offset = req.body.offset 	//这个相当于pages
	console.log('req.body-->',req.body)
	console.log('offset -- >',offset)
	if(!limit || limit == null || typeof limit == 'undefined'){//页面记录数
		limit = 16
	}
	if(!offset || offset == null || typeof offset == 'undefined'){//当前页数
		offset = 0
	}
	//offset = parseInt(offset/limit)
	console.log('check limit && offset-->',limit,offset)

	let code = req.body.code
	formatInfo.checkResult(code)
	console.log('post')
	logic.getMajorStuPost(code,limit,offset,function(error,result){
		if(error){
			console.log('logic error')
			return res.json(formatInfo.resResult(-1,error.message))
		}
		return res.json({'result':result})
	})
})

//正则匹配
function pipei(str,arg){
	let zhengze = '<cas:' + arg + '>(.*)<\/cas:' + arg + '>' 
	let res = str.match(zhengze)
	if(res){
		return res[1]
	}else{
		return null
	}
}

//选择我的学困生
router.get('/myhelpstu',function(req,res){
	if(!req.query.ticket){
		let ReturnURL = 'http://qiandao.szu.edu.cn:81/xys' + req.originalUrl
		console.log('ReturnURL url-->',ReturnURL)
		let url = CASserver + 'login?service=' + ReturnURL
		console.log('check redirecturl -->',url)

		if(req.session.student){
			console.log('没有ticket,学生有session')
			console.log('session-->',req.session.student)
			//返回页面让学困生填写联系方式，并将code对应的课程和学优生信息返回
			//如果学生已经选择好学优生，则直接显示最后结果
			//这一步加上判断，看学生是否已经选择了该辅导学生
			logic.mystu(req.session.student,function(error,result){
				if(error && error !=1 ){
					res.json(formatInfo.resResult(-1,error.message))
				}
				if(error && error == 1){
					return res.render('mystu',{title:'暂时没有学困生',result:null})
				}
				res.render('mystu',{title:'选择我的学困生',result:result})
			})
		}
		else{
			console.log('没有ticket，去获取ticket')
			return res.redirect(url)
		}
	}
	else{
		if(req.session.student){
			console.log('有ticket,也有session')
			console.log('session-->',req.session.student)
			logic.mystu(req.session.student,function(error,result){
				if(error && error !=1 ){
					res.json(formatInfo.resResult(-1,error.message))
				}
				if(error && error == 1){
					return res.render('mystu',{title:'暂时没有学困生',result:null})
				}
				res.render('mystu',{title:'选择我的学困生',result:result})
			})
		}
		else{
			// let majorstuinfo = req.query.majorstuinfo,
			// 	stuXueHao = majorstuinfo.substring(0,10),
			// 	code = majorstuinfo.substring(10,14)
			let ReturnURL = 'http://qiandao.szu.edu.cn:81/xys' + req.originalUrl
			console.log('ReturnURL url-->',ReturnURL)
			console.log('you ticket, meiyou session')
			let ticket = req.query.ticket
			console.log('check ticket-->',ticket)
			let url = CASserver + 'serviceValidate?ticket=' + ticket + '&service=' + ReturnURL
			console.log('check url -->',url)
			request(url, function (error, response, body) {
				    if (!error && response.statusCode == 200) {
				    	console.log('body -- >',body)
				       let user = pipei(body,'user'),//工号
						   eduPersonOrgDN = pipei(body,'eduPersonOrgDN'),//学院
						   alias = pipei(body,'alias'),//校园卡号
						   cn = pipei(body,'cn'),//姓名
						   gender = pipei(body,'gender'),//性别
						   containerId = pipei(body,'containerId'),//个人信息（包括uid，）
						   nianji = null
						if(containerId){
							RankName = containerId.substring(18,21)//卡类别 jzg-->教职工
						}else{
							RankName = null
						}
						if(user){
						   	nianji = user.substring(0,4)
						}else{
						   	nianji = null
						}
						console.log('check final result -->',user,eduPersonOrgDN,alias,cn,gender,containerId,RankName)
						let arg = {}
							arg.nianji = nianji
						   	arg.user = user
						   	arg.eduPersonOrgDN = eduPersonOrgDN
						   	arg.alias = alias
						   	arg.cn = cn
						   	arg.gender = gender
						   	arg.containerId = containerId
						   	arg.RankName = RankName
						   	// arg.code = code
						   	// arg.stuXueHao = stuXueHao
						    console.log('check arg-->',arg)

						   console.log('check arg-->',arg)
						   if(arg.user == null){
						   		console.log('ticket is unvalid,重新回去获取ticket，清空session')
						   		delete req.session.student
						   		console.log('check req.session.student-->',req.session.student)
						   		return res.json({'errCode':-1,'errMsg':body})
						   }else{
						   		req.session.student = arg
						   		return res.redirect(ReturnURL)
						  }
				     }else{
				     	console.log(error)
				     }
			    })
		}
	}
})

//学生选择学优生，跳转，然后填写信息
router.get('/choosestu',function(req,res){
	// let majorstuinfo = req.query.majorstuinfo,
	// 	majorstuxuehao = majorstuinfo.substring(0,9)
	// 	code = majorstuinfo.substring(9,13)
	// console.log()
	if(!req.query.ticket){
		let ReturnURL = 'http://qiandao.szu.edu.cn:81/xys' + req.originalUrl
		console.log('ReturnURL url-->',ReturnURL)
		let url = CASserver + 'login?service=' + ReturnURL
		console.log('check redirecturl -->',url)
		console.log('跳转获取ticket')

		if(req.session.student){
			console.log('没有ticket,学生有session')
			console.log('session-->',req.session.student)
			//返回页面让学困生填写联系方式，并将code对应的课程和学优生信息返回
			//如果学生已经选择好学优生，则直接显示最后结果
			//这一步加上判断，看学生是否已经选择了该辅导学生
			let majorstuinfo = req.query.majorstuinfo,
				stuXueHao = majorstuinfo.substring(0,10),
				code = majorstuinfo.substring(10,14)
			let arg = req.session.student
				arg.code = code
				arg.stuXueHao = stuXueHao
			console.log('有session，加入code和stuxuehao-->',arg)
			logic.choosestu(arg,function(error,result){
				if(error && error != 1){
					res.json(formatInfo.resResult(-1,error.message))
				}
				if(error && error == 1){
					return res.render('haschoosestu',{title:'已选过该课程'})
				}
				res.render('choosestu',{title:'选择学优生',result:result})
			})
		}
		else{
			console.log('没有ticket，去获取ticket')
			return res.redirect(url)
		}
	}
	else{
		if(req.session.student){
			console.log('有ticket,也有session')
			console.log('session-->',req.session.student)
			let majorstuinfo = req.query.majorstuinfo,
				stuXueHao = majorstuinfo.substring(0,10),
				code = majorstuinfo.substring(10,14)
			let arg = req.session.student
				arg.code = code
				arg.stuXueHao = stuXueHao
			console.log('有session，加入code和stuxuehao-->',arg)
			logic.choosestu(arg,function(error,result){
				if(error && error !=1 ){
					res.json(formatInfo.resResult(-1,error.message))
				}
				if(error && error == 1){
					return res.render('haschoosestu',{title:'已选过该课程'})
				}
				res.render('choosestu',{title:'选择学优生',result:result})
			})
		}
		else{
			let majorstuinfo = req.query.majorstuinfo,
				stuXueHao = majorstuinfo.substring(0,10),
				code = majorstuinfo.substring(10,14)
			let ReturnURL = 'http://qiandao.szu.edu.cn:81/xys' + req.originalUrl
			console.log('ReturnURL url-->',ReturnURL)
			console.log('you ticket, meiyou session')
			let ticket = req.query.ticket
			console.log('check ticket-->',ticket)
			let url = CASserver + 'serviceValidate?ticket=' + ticket + '&service=' + ReturnURL
			console.log('check url -->',url)
			request(url, function (error, response, body) {
				    if (!error && response.statusCode == 200) {
				    	console.log('body -- >',body)
				       let user = pipei(body,'user'),//工号
						   eduPersonOrgDN = pipei(body,'eduPersonOrgDN'),//学院
						   alias = pipei(body,'alias'),//校园卡号
						   cn = pipei(body,'cn'),//姓名
						   gender = pipei(body,'gender'),//性别
						   containerId = pipei(body,'containerId'),//个人信息（包括uid，）
						   nianji = null
						if(containerId){
							RankName = containerId.substring(18,21)//卡类别 jzg-->教职工
						}else{
							RankName = null
						}
						if(user){
						   	nianji = user.substring(0,4)
						}else{
						   	nianji = null
						}
						console.log('check final result -->',user,eduPersonOrgDN,alias,cn,gender,containerId,RankName)
						let arg = {}
							arg.nianji = nianji
						   	arg.user = user
						   	arg.eduPersonOrgDN = eduPersonOrgDN
						   	arg.alias = alias
						   	arg.cn = cn
						   	arg.gender = gender
						   	arg.containerId = containerId
						   	arg.RankName = RankName
						   	arg.code = code
						   	arg.stuXueHao = stuXueHao
						    console.log('check arg-->',arg)

						   console.log('check arg-->',arg)
						   if(arg.user == null){
						   		console.log('ticket is unvalid,重新回去获取ticket，清空session')
						   		delete req.session.student
						   		console.log('check req.session.student-->',req.session.student)
						   		return res.json({'errCode':-1,'errMsg':'ticket is unvalid,请重新扫码！'})
						   }else{
						   		req.session.student = arg
						   		return res.redirect(ReturnURL)
						  }
				     }else{
				     	console.log(error)
				     }
			    })
		}
	}
})

//选择学优生确认
router.post('/choosestuconfirm',function(req,res){
	console.log('in choosestuconfirm router')
	console.log(req.body)
	logic.choosestuconfirm(req.body,function(error,result){
		if(error){
			console.log('error-->',error)
			return res.json(formatInfo.resResult(-1,error.message))
		}
		return res.json(formatInfo.resResult(0,'confirm success'))
	})
})

//选择成功时跳转
router.get('/choosestusucess',function(req,res){
	console.log('in router choosestusucess')
	logic.choosestusucess(req.session.student,function(error,result){
		if(error){
			res.json(formatInfo.resResult(-1,error.message))
		}
		res.render('choosestusucess',{title:'选择成功',result:result})
	})
})

//查询选择的学优生
router.get('/mychoose',function(req,res){
	if(!req.query.ticket){
		let ReturnURL = 'http://qiandao.szu.edu.cn:81/xys' + req.originalUrl
		console.log('ReturnURL url-->',ReturnURL)
		let url = CASserver + 'login?service=' + ReturnURL
		console.log('check redirecturl -->',url)

		if(req.session.student){
			console.log('没有ticket,学生有session')
			console.log('session-->',req.session.student)
			//返回页面让学困生填写联系方式，并将code对应的课程和学优生信息返回
			//如果学生已经选择好学优生，则直接显示最后结果
			//这一步加上判断，看学生是否已经选择了该辅导学生
			logic.mychoose(req.session.student,function(error,result){
				if(error && error !=1 ){
					res.json(formatInfo.resResult(-1,error.message))
				}
				if(error && error == 1){
					return res.render('mychoose',{title:'没有选择学优生',result:null})
				}
				res.render('mychoose',{title:'选择的学优生',result:result})
			})
		}
		else{
			console.log('没有ticket，去获取ticket')
			return res.redirect(url)
		}
	}
	else{
		if(req.session.student){
			console.log('有ticket,也有session')
			console.log('session-->',req.session.student)
			logic.mychoose(req.session.student,function(error,result){
				if(error && error !=1 ){
					res.json(formatInfo.resResult(-1,error.message))
				}
				if(error && error == 1){
					return res.render('mychoose',{title:'没有选择学优生',result:null})
				}
				res.render('mychoose',{title:'选择的学优生',result:result})
			})
		}
		else{
			// let majorstuinfo = req.query.majorstuinfo,
			// 	stuXueHao = majorstuinfo.substring(0,10),
			// 	code = majorstuinfo.substring(10,14)
			let ReturnURL = 'http://qiandao.szu.edu.cn:81/xys' + req.originalUrl
			console.log('ReturnURL url-->',ReturnURL)
			console.log('you ticket, meiyou session')
			let ticket = req.query.ticket
			console.log('check ticket-->',ticket)
			let url = CASserver + 'serviceValidate?ticket=' + ticket + '&service=' + ReturnURL
			console.log('check url -->',url)
			request(url, function (error, response, body) {
				    if (!error && response.statusCode == 200) {
				    	console.log('body -- >',body)
				       let user = pipei(body,'user'),//工号
						   eduPersonOrgDN = pipei(body,'eduPersonOrgDN'),//学院
						   alias = pipei(body,'alias'),//校园卡号
						   cn = pipei(body,'cn'),//姓名
						   gender = pipei(body,'gender'),//性别
						   containerId = pipei(body,'containerId'),//个人信息（包括uid，）
						   nianji = null
						if(containerId){
							RankName = containerId.substring(18,21)//卡类别 jzg-->教职工
						}else{
							RankName = null
						}
						if(user){
						   	nianji = user.substring(0,4)
						}else{
						   	nianji = null
						}
						console.log('check final result -->',user,eduPersonOrgDN,alias,cn,gender,containerId,RankName)
						let arg = {}
							arg.nianji = nianji
						   	arg.user = user
						   	arg.eduPersonOrgDN = eduPersonOrgDN
						   	arg.alias = alias
						   	arg.cn = cn
						   	arg.gender = gender
						   	arg.containerId = containerId
						   	arg.RankName = RankName
						   	// arg.code = code
						   	// arg.stuXueHao = stuXueHao
						    console.log('check arg-->',arg)

						   console.log('check arg-->',arg)
						   if(arg.user == null){
						   		console.log('ticket is unvalid,重新回去获取ticket，清空session')
						   		delete req.session.student
						   		console.log('check req.session.student-->',req.session.student)
						   		return res.json({'errCode':-1,'errMsg':body})
						   }else{
						   		req.session.student = arg
						   		return res.redirect(ReturnURL)
						  }
				     }else{
				     	console.log(error)
				     }
			    })
		}
	}
})

module.exports = router;
