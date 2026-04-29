export default {
    // 安装方法
    install(app, options) {
        console.log('MyPlugin 安装中...', options)

        // 注册组件
        app.component('MyPluginComponent', {
            template: '<div>Hello from Plugin!</div>'
        })
    },

    // 插件配置
    config: {
        routes: [
            {
                path: '/plugin-page',
                name: 'PluginPage',
                component: {
                    template: '<div>Plugin Page Content</div>'
                },
                meta: {
                    title: '插件页面',
                    menu: true,
                    icon: 'Document'
                }
            }
        ],

        menus: [
            {
                title: '插件功能',
                path: '/plugin-page',
                icon: 'Document',
                order: 100
            }
        ]
    },

    // 插件清单
    manifest: {
        name: 'my-plugin',
        version: '1.0.0',
        description: '一个示例插件'
    }
}