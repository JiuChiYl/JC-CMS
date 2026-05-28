import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

import listJson from './list.json'
import type { RouteListData } from '@jc-cms/shared'

const list = listJson as RouteListData

function importComponent(componentName: string[], pagePath: string): RouteRecordRaw[] {
  const paths: string[] = []
  const names: string[] = []
  const components: (() => Promise<unknown>)[] = []
  componentName.forEach((item) => {
    paths.push(`/${item.charAt(0).toLowerCase() + item.slice(1)}`)
    names.push(item.charAt(0).toLowerCase() + item.slice(1))
    components.push(() => import(`@/${pagePath}/${item}.vue`))
  })
  return paths.map((item, index) => {
    return {
      path: item,
      name: names[index],
      component: components[index],
      meta: { transition: 'fade' },
    }
  })
}

const view: RouteRecordRaw[] = [
  ...importComponent(list.view, 'views'),
  ...importComponent(list.component, 'components'),
  {
    path: '',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: view,
})

export default router
