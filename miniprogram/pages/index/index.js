//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      // 上传数量
      count: 1,
      // 是否压缩
      sizeType: ['compressed'],
      // 选择来源 相机或者相册
      sourceType: ['album', 'camera'],
      success: function (res) {
        console.log('临时路径', res)
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  // 给数据库添加数据
  add() {
    // loading
    // wx.showLoading({
    //   title: '正在添加',
    // })
    // 弹窗
    wx.showToast({
      title: '正在添加',
      icon: 'loading',
      mask: true
    })
    // 1、找到数据库
    const db = wx.cloud.database()
    // 2、找到要操作的集合
    const lession = db.collection('lession')
    // 3、增删改查
    lession.add({
      data: {
        name: 'jack',
        age: 5,
        value: '小程序云开发'
      },
      // success(res) {
      //   console.log('添加成功', res)
      // }
      /**
       * "_id": XDAZ997E7L4wJPP3
        "_openid": oTqHb4kfLV9qM_OQxCET4pKFMsJw
        "age": 18
        "name": jack
        _openid 只会在【小程序端】创建数据库时默认添加
       * */ 

      //  支持promise的语法
    }).then((res) => {
      console.log('添加成功', res)
      // 添加完隐藏
      // wx.hideLoading()
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      })
    }).catch(err => {
      console.log('添加失败', err)
    })
    // 4、得到结果  (成功或者失败)
  },

  // 查询
  find() {

    // 弹窗
    wx.showToast({
      title: '正在查询',
      icon: 'loading',
      mask: true
    })
    // 1、找到数据库
    const db = wx.cloud.database()
    // 2、找到要操作的集合
    const lession = db.collection('lession')
    // 根据_id查询
    // lession.doc('XDAZ997E7L4wJPP3').get({
    //   success(res) {
    //     console.log('查询成功', res)
    //     wx.showToast({
    //       title: '查询成功',
    //       icon: 'success',
    //       mask: true
    //     })
    //   }
    // })
    // 获取多个记录的数据,
    // 指定查询结果集数量上限limit,
    // skip 指定查询返回结果时从指定序列后的结果开始返回，常用于分页
    // 指定查询排序条件  orderBy(asc:升序, desc:降序)
    // field 指定返回结果中记录需返回的字段


    /**指令
     * db.command获取数据库查询及更新指令
     * eq查询筛选条件，表示字段等于某个值
     * and查询指令，用于表示逻辑 "与" 的关系
     * or查询指令，用于表示逻辑 "或" 的关系
     * nin查询筛选条件，表示字段的值需不在给定的数组内。
     * neq表示字段不等于某个值，和 db.command.eq 相反
     * */ 
    const _ = db.command;
    lession.where({
      name: 'jack',
      // 年龄大于12
      // 'age': _.gt(12)
      // 年龄大于3 小于 18
      'age': _.gt(3).and(_.lt(18))
    })
    // .limit(5).skip(5)
    // .orderBy('age', 'desc')
    // .field({
    //   'value': true,
    //   'done': true
    // })
    .get().then(res => {
      console.log('查询成功', res)
      wx.showToast({
        title: '查询成功',
        icon: 'success',
        mask: true
      })
    })
  },
  // 数据更新
  update() {
    // 1、找到数据库
    const db = wx.cloud.database()
    // 2、找到要操作的集合
    const lession = db.collection('lession')
    // lession.doc('XDAZ997E7L4wJPP3').update({
    //   data: {
    //     age: 10,
    //     name: 'jenny',
    //     done: true
    //   },
    //   
    //   success(res) {
    //     console.log(res)
    //   }
    // })
    lession.doc('XDAZ997E7L4wJPP3').set({
      // set更新指令。用于设定字段等于指定值。整条数据替换
      data: {
        method: 'set方法'
      }
    }).then(res => {
      console.log('已更新',res)
    })
  },
  // 删除数据
  remove() {
    // 1、找到数据库
    const db = wx.cloud.database()
    // 2、找到要操作的集合
    const lession = db.collection('lession')
    lession.doc('XDAZ997E7L4wJPP3').remove({
      success(res) {
        console.log(res)
      }
    })
  },

  // 调用云函数方法
  cloud_sum() {
    wx.cloud.callFunction({
      name: 'sum',
      data: {
        a: 10,
        b: 20
      },
      success(res) {
        console.log(res)
      }
    })
  }
})
