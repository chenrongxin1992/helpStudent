var express = require('express');
var router = express.Router();
const major = require('../db/major')
const formatInfo = require('../formatInfo/formatInfo')
const logic = require('../logic/logic')
const xlsx = require('xlsx')
const busBoy = require('busboy')
const request = require('request')

let MyServer = "http://116.13.96.53:81",
	//CASserver = "https://auth.szu.edu.cn/cas.aspx/",
	CASserver = 'https://authserver.szu.edu.cn/authserver/',
	ReturnURL = "http://116.13.96.53:81";


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//添加专业
router.get('/major',function(req,res){
	let majorInfo = new major({
			majorName : 'dddd',
			code : '0005'
		})
	majorInfo.save(function(err,doc){
		if(err){
			res.json(formatInfo.checkError(-1,err.message))
		}
		res.json(formatInfo.resResult(0,doc))
	})
})

//添加对应专业学生
router.get('/import',function(req,res){
	return res.render('import',{title:'导入学优生信息'})
}).post('/import',function(req,res){
	let excelArray = new Array()
	formatInfo.checkResult(req.headers)
	let busboy = new busBoy({
		headers: req.headers,
        limits: {
            files: 1,
            fileSize: 50000000
        }
	})
	busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        file.on('limit', function() {
            res.json(formatInfo.resResult(-1,'File is To Large'));
            return
        });
        file.on('data', function(data) {
        	formatInfo.checkResult(fieldname)
        	formatInfo.checkResult(file)
        	formatInfo.checkResult(filename)
        	formatInfo.checkResult(encoding)
        	formatInfo.checkResult(mimetype)
        	formatInfo.checkResult(data)
            console.log('File [' + filename + '] got ' + data.length + ' bytes');
            let workbook = xlsx.read(data);
            let sheetNames = workbook.SheetNames; // 返回 ['sheet1', 'sheet2',……]
            let worksheet = workbook.Sheets[sheetNames[0]];// 获取excel的第一个表格
            let ref = worksheet['!ref']; //获取excel的有效范围,比如A1:F20
            let reg = /[a-zA-Z]/g;
            ref = ref.replace(reg,"");
            let line = parseInt(ref.split(':')[1]); // 获取excel的有效行数
            console.log("line====>",line);
            // header ['序号','姓名','学号','年级','手机号','辅导课程','辅导地点','辅导时间'] 

            //循环读出每一行，然后处理 那为什么想打我呀？
            for(let i = 2; i <= line; i++){
                if(!worksheet['A'+i] && !worksheet['B'+i] && !worksheet['C'+i] && !worksheet['D'+i] && !worksheet['E'+i] && i != 2){   //如果大于2的某行为空,则下面的行不算了
                    break;
                }
                let tempItem = {
                	code : worksheet['A'+i].v || '',
                	stuName : worksheet['B'+i].v || '',
                	stuXueHao : worksheet['C'+i].v || '',
                	stuNianJi : worksheet['D'+i].v || '',
                	stuPhoneNum : worksheet['E'+i].v || '',
                	majorName : worksheet['F'+i].v || '',
                	teachPlace : worksheet['G'+i].v || '',
                	teachTime : worksheet['H'+i].v || '' 
                }
                excelArray.push(tempItem)
            }
            formatInfo.checkResult(excelArray)
            logic.importExcel(excelArray,function(error,result){
            	if(error){
            		formatInfo.checkError(error.message)
            		return res.json(formatInfo.resResult(-1,error.message))
            	}
            	return res.json(formatInfo.resResult(0,'import success'))
            })
        })
    })
   /*busboy.on('finish', function() {
        res.writeHead(200);
        //res.end('upload OK!');
    });*/
    return req.pipe(busboy);
})

//专业列表
router.get('/majorlist',function(req,res){
	logic.getMajorList(function(error,result){
		if(error){
			formatInfo.checkError(error.message)
			return res.json(formatInfo.resResult(-1,error.message))
		}
		return res.render('majorlist',{title:'专业列表',majorlist:result})
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

//学生选择学优生，跳转，然后填写信息
router.get('/choosestu',function(req,res){
	// let majorstuinfo = req.query.majorstuinfo,
	// 	majorstuxuehao = majorstuinfo.substring(0,9)
	// 	code = majorstuinfo.substring(9,13)
	// console.log()
	if(!req.query.ticket){
		let ReturnURL = 'http://qiandao.szu.edu.cn:81' + req.originalUrl
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
			logic.choosestu(req.session.student,function(error,result){
				if(error){
					res.json(formatInfo.resResult(-1,error.message))
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
			logic.choosestu(req.session.student,function(error,result){
				if(error){
					res.json(formatInfo.resResult(-1,error.message))
				}
				res.render('choosestu',{title:'选择学优生',result:result})
			})
		}
		else{
			let majorstuinfo = req.query.majorstuinfo,
				stuXueHao = majorstuinfo.substring(0,10),
				code = majorstuinfo.substring(10,14)
			let ReturnURL = 'http://qiandao.szu.edu.cn:81' + req.originalUrl
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
module.exports = router;
