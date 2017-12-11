/**
 *  @Author:    chenrongxin
 *  @Create Date:   2017-10-04
 *  @Description:   学优生信息
 */
var mongoose = require('./db'),
    Schema = mongoose.Schema,
    moment = require('moment')

var majorStuSchema = new Schema({          
    code :{type : String },//课程码
    majorName :{type:String},//课程名
    stuName :{type:String},//学优生姓名
    stuXueHao :{type:String},//学号
    stuGender :{type:String},//年级
    stuPhoneNum : {type:String},//联系号码
    teachPlace :{type:String},//辅导地点
    teachTime :{type:String},//辅导时间
    teachLimitNum :{type:Number,default:3},//教人上限
    chooseNum :{type:Number,default:0},//已选人数
    createTime : {type : String, default : moment().format('YYYY-MM-DD HH:mm:ss') },  
    createTimeStamp : {type : String,default:moment().format('X')},
    dang:{type:String,default:null}//0群众，1党员，2积极分子
})

module.exports = mongoose.model('majorstu',majorStuSchema);