// 云函数入口文件
const cloud = require('wx-server-sdk')
const { second } = require('./second.js')

cloud.init()

const db = cloud.database();
const lession = db.collection('lession')
const _ = db.command



// 云函数入口函数
// async 该函数有异步操作
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { a, b } = event;

  // 异步，await
  let res = await lession.where({
    "_openid": wxContext.OPENID
  }).update({
    data: {
      name: 'haha',
      arr: _.push(3),
      // style: {
      //   "color": 'red',
      //   "fontSize": "16px"
      // },
      // 整个对象的改变
      // style: _.set({
      //   "fontSize": "16px"
      // })
      // 原子自增
      age: _.inc(10)
    }
  })
  return {
    // msg: '哈哈哈',
    // sum: a + b,
    // second: second(),
    res,
    event,
    // openid: wxContext.OPENID,
    // appid: wxContext.APPID,
    // unionid: wxContext.UNIONID,
  }
}