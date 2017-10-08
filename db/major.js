/**
 *  @Author:    chenrongxin
 *  @Create Date:   2017-10-04
 *  @Description:   课程
 */
var mongoose = require('./db'),
    Schema = mongoose.Schema,
    moment = require('moment')

var majorSchema = new Schema({          
    code :{type : String },  //课程码
    majorName :{type:String},  //课程名
    createTime : {type : String, default : moment().format('YYYY-MM-DD HH:mm:ss') },  
    createTimeStamp : {type : String,default:moment().format('X')},
})

module.exports = mongoose.model('major',majorSchema);