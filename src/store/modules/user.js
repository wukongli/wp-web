import {
    adminLogin,
    logout,
    getInfo,
    parseCopyLink as parse,
    parseLinkReq,
    getSignReq,
    getVip,
    getCode,
    loginNoPwd,
    getCourseByType, delCode,getInfoByUserKey,
    tryDownUrl
} from '@/api/login';
import { getToken, setToken, removeToken } from '@/utils/auth';
import defAva from '@/assets/images/profile.png';

const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
  }),
  actions: {
    // 登录
    login(userInfo) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code;
      const uuid = userInfo.uuid;
      return new Promise((resolve, reject) => {
        loginNoPwd(username, password, code, uuid)
          .then((res) => {
            setToken(res.token);
            this.token = res.token;
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  // loginNoPwd(){
  //     return new Promise((resolve, reject) => {
  //         loginNoPwd()
  //             .then((res) => {
  //                 setToken(res.token);
  //                 this.token = res.token;
  //                 resolve(res);
  //             })
  //             .catch((error) => {
  //                 reject(error);
  //             });
  //     });
  // },
    parseCopyLink(params) {
      return new Promise((resolve, reject) => {
        parse(params)
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    parseLink(parseLink) {
      return new Promise((resolve, reject) => {
        parseLinkReq(parseLink)
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    getSignData(params) {
      return new Promise((resolve, reject) => {
        getSignReq(params)
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 登录
    adminLogin(userInfo) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code;
      const uuid = userInfo.uuid;
      return new Promise((resolve, reject) => {
        adminLogin(username, password, code, uuid)
          .then((res) => {
              setToken(res.token);
              this.token = res.token;
              resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            const user = res.user;
            const avatar =
              user.avatar == '' || user.avatar == null
                ? defAva
                : import.meta.env.VITE_APP_BASE_API + user.avatar;

            // if (res.roles && res.roles.length > 0) {
            //   // 验证返回的roles是否是一个非空数组
            //   this.roles = res.roles;
            //   this.permissions = res.permissions;
            // } else {
            //   this.roles = ['ROLE_DEFAULT'];
            // }
            this.name = user.userName;
            this.avatar = avatar;
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        logout(this.token)
          .then(() => {
            this.token = '';
            this.roles = [];
            this.permissions = [];
            removeToken();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    getVipNum() {
      return new Promise((resolve, reject) => {
        getVip()
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    getCodeNum(data){
      return new Promise((resolve, reject) => {
        getCode(data)
            .then((res) => {
              resolve(res);
            })
            .catch((error) => {
              reject(error);
            });
      });
    },

      delCodeNum(data){
          return new Promise((resolve, reject) => {
              delCode(data)
                  .then((res) => {
                      resolve(res);
                  })
                  .catch((error) => {
                      reject(error);
                  });
          });
      },
      getCourse(type){
          return new Promise((resolve, reject) => {
              getCourseByType(type)
                  .then((res) => {
                      resolve(res);
                  })
                  .catch((error) => {
                      reject(error);
                  });
          });
      },
      getUserInfo(data){
          return new Promise((resolve, reject) => {
              getInfoByUserKey(data)
                  .then((res) => {
                      resolve(res);
                  })
                  .catch((error) => {
                      reject(error);
                  });
          });
      },
      tryDown(data){
          return new Promise((resolve, reject) => {
              tryDownUrl(data)
                  .then((res) => {
                      resolve(res);
                  })
                  .catch((error) => {
                      reject(error);
                  });
          });
      },
  },
});

export default useUserStore;
