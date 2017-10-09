/**
 *  @Author:    chenrongxin
 *  @Create Date:   2017-10-09
 *  @Description:   学优生信息
 */
var mongoose = require('./db'),
    Schema = mongoose.Schema,
    moment = require('moment')

var xuekunshengSchema = new Schema({          
    code :{type : String },//课程码
    majorName :{type:String},//课程名
    stuName :{type:String},//学优生姓名
    stuXueHao :{type:String},//学号
    stuNianJi :{type:String},//年级
    stuPhoneNum : {type:String},//联系号码
    teachPlace :{type:String},//辅导地点
    teachTime :{type:String},//辅导时间
    createTime : {type : String, default : moment().format('YYYY-MM-DD HH:mm:ss') },  
    createTimeStamp : {type : String,default:moment().format('X')},
    xuekunshengxuehao :{type:String},
    xuekunshengxiaoyuankahao : {type:String},
    xuekunshengGender : {type:String},
    xuekunshengContace : {type:String},
    xuekunshengName : {type:String},
    xuekunshengbeizhu:{type:String}
})

module.exports = mongoose.model('xuekunsheng',xuekunshengSchema);