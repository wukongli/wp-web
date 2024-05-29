import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

const usePermissionStore = defineStore(
  'permission',
  {
    state: () => ({
      routes: [],
      addRoutes: [],
      defaultRoutes: [],
      topbarRouters: [],
      sidebarRouters: constantRoutes
    }),
    actions: {
      setRoutes(routes) {
        this.addRoutes = routes
        this.routes = constantRoutes.concat(routes)
      },
      setDefaultRoutes(routes) {
        this.defaultRoutes = constantRoutes.concat(routes)
      },
      setTopbarRoutes(routes) {
        this.topbarRouters = routes
      },
      setSidebarRouters(routes) {
        this.sidebarRouters = routes
      },
      generateRoutes(roles) {
        return new Promise(resolve => {
          // 向后端请求路由数据
          getRouters().then(res => {
            const sdata = JSON.parse(JSON.stringify(res.data))
            const rdata = JSON.parse(JSON.stringify(res.data))
            const defaultData = JSON.parse(JSON.stringify(res.data))
            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)
            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            asyncRoutes.forEach(route => { router.addRoute(route) })
            this.setRoutes(rewriteRoutes)
            const result = constantRoutes.filter((e)=>{
              sidebarRoutes.forEach((item)=>{
                if(e.path !== item.path){
                  return e;
                }
              })
            })
            this.setSidebarRouters(result.concat(sidebarRoutes));
            this.setDefaultRoutes(sidebarRoutes)
            this.setTopbarRoutes(defaultRoutes)
            resolve(rewriteRoutes)
          })
        })
      },
      generateStaticRoutes(roles) {
        return new Promise(resolve => {
          const res = {
            msg: "操作成功",
            code: 200,
            data: [
              {
                name: "Front",
                path: "/front",
                hidden: false,
                redirect: "noRedirect",
                component: "Layout",
                alwaysShow: true,
                meta: {
                  title: "前端教程",
                  icon: "front",
                  noCache: false,
                  link: null
                },
                children: [
                  {
                    name: "Front/list",
                    path: "front/list",
                    hidden: false,
                    component: "front/index",
                    meta: {
                      title: "前端列表",
                      icon: "course",
                      noCache: false,
                      link: null
                    }
                  }
                ]
              },
              {
                name: "Back",
                path: "/back",
                hidden: false,
                redirect: "noRedirect",
                component: "Layout",
                alwaysShow: true,
                meta: {
                  title: "Java教程",
                  icon: "back",
                  noCache: false,
                  link: null
                },
                children: [
                  {
                    name: "Java/list",
                    path: "java/list",
                    hidden: false,
                    component: "back/index",
                    meta: {
                      title: "Java列表",
                      icon: "course",
                      noCache: false,
                      link: null
                    }
                  }
                ]
              },
              {
                name: "Parse",
                path: "/parse",
                hidden: false,
                redirect: "noRedirect",
                component: "Layout",
                alwaysShow: true,
                meta: {
                  title: "高速下载",
                  icon: "upload",
                  noCache: false,
                  link: null
                },
                children: [
                  {
                    name: "Login",
                    path: "login",
                    hidden: false,
                    component: "parse/login",
                    meta: {
                      title: "下载列表",
                      icon: "example",
                      noCache: false,
                      link: null
                    }
                  },
                  {
                    name: "Index",
                    path: "index",
                    hidden: true,
                    component: "parse/index",
                    meta: {
                      title: "解析列表",
                      icon: "example",
                      noCache: false,
                      link: null
                    }
                  }
                ]
              }
            ]
          }
          // 向后端请求路由数据
            const sdata = JSON.parse(JSON.stringify(res.data))
            const rdata = JSON.parse(JSON.stringify(res.data))
            const defaultData = JSON.parse(JSON.stringify(res.data))
            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)
            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            asyncRoutes.forEach(route => { router.addRoute(route) })
            this.setRoutes(rewriteRoutes)
            this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
            this.setDefaultRoutes(sidebarRoutes)
            this.setTopbarRoutes(defaultRoutes)
            resolve(rewriteRoutes)
        })
      }
    }
  })

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach(c => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
    }
    children = children.concat(el)
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

export const loadView = (view) => {
  let res;
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0];
    if (dir === view) {
      res = () => modules[path]();
    }
  }
  return res;
}

export default usePermissionStore
