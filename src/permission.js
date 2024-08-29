import router from './router';
import { ElMessage } from 'element-plus';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { getToken } from '@/utils/auth';
import { isHttp } from '@/utils/validate';
import { isRelogin } from '@/utils/request';
import useUserStore from '@/store/modules/user';
import useSettingsStore from '@/store/modules/settings';
import usePermissionStore from '@/store/modules/permission';
import {encrypt} from "@/utils/jsencrypt";
// import Layout from "@/layout/index.vue";
NProgress.configure({ showSpinner: false });

const whiteList = [
  // '/login',
  '/register',
  '/vip/login',
  '/back/java/list',
  '/back/java/interview',
  '/front/front/list',
  '/front/front/interview',
  '/parse/login',
  '/parse/index',
  '/401',
  '/video/index'
];

router.beforeEach((to, from, next) => {
  NProgress.start();
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title);
    NProgress.done();
    if (useUserStore().roles.length === 0) {
      isRelogin.show = true;
      // 判断当前用户是否已拉取完user_info信息
      useUserStore()
        .getInfo()
        .then((res) => {
          // if (res.roles && res.roles.length > 0) {
          //   // 验证返回的roles是否是一个非空数组
          //   useUserStore().roles = res.roles;
          //   useUserStore().permissions = res.permissions;
          // } else {
          //   useUserStore().roles = ['ROLE_DEFAULT'];
          // }
          //       if(res.code === 200){
          //         if(res.user.createBy === createBy){
          //           router.push({ path: '/parse/login'});
          //         }else{
          //           loading.value = false;
          //           ElMessage.error("登录错误,无权限！")
          //         }
          //       }else{
          //         ElMessage.error("登录错误！")
          //       }
          isRelogin.show = false;
          usePermissionStore()
            .generateRoutes()
            .then((accessRoutes) => {
              // 根据roles权限生成可访问的路由表
              accessRoutes.forEach((route) => {
                if (!isHttp(route.path)) {
                  router.addRoute(route); // 动态添加可访问路由表
                }
              });
            });
          next({ ...to, replace: true }); // hack方法 确保addRoutes已完成

        })
        .catch((err) => {
          useUserStore()
            .logOut()
            .then(() => {
              ElMessage.error(err);
              next({ path: '/vip/login' });
            });
        });
    } else {
      console.log(11111);
      console.log(router.getRoutes
      ());
      next();
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      //在免登录白名单，直接进入
      next();
    } else {
      // const index = to.path.lastIndexOf("/");
      // const key = to.path.substring(index+1);
      // sessionStorage.setItem("userKey",key)
      // if(key.length === 6 ){
      //   router.push({
      //     path: '/parse/login',
      //     query: {
      //       userKey:key
      //     },
      //   })
      //   NProgress.done();
      // }else{
      //
      // }

      router.push({
        path: '/parse/login',
        query: {
          userKey:sessionStorage.getItem("userKey") ? sessionStorage.getItem("userKey") :"main"
        },
      })

    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
