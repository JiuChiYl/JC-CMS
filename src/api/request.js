
import axios from 'axios'
import { HashHistory } from '../utils/history';
import { ElMessage } from 'element-plus'
// axios 配置代码 
// 封装代码 get post delete patch 
// 反向代理不能使用基路径 
const baseURL =   "http://loaclhost:8085/" 

axios.defaults.baseURL =   baseURL // 基路径   反向代理是不能使用基路径 
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;  // 请求头 设置token 
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';   // 设置POST请求数据提交方式
let loading = null;

export function showLoading(msg='加载中...'){
    // ElMessage.close()
    ElMessage({
        message: msg,
        type: 'warning',
        duration:1.5
    })
}

export function showSuccess(msg='成功'){
    // ElMessage.close()
    ElMessage({
        message: msg,
        type: 'success',
        duration: 1
    })
}

export function showFail(msg='失败'){
    // ElMessage.close()
    ElMessage.error(msg)
}


// Interceptors 拦截器   request req 
// 添加一个请求发送之前的拦截器
axios.interceptors.request.use(function (config) {
    // 请求动画 Loading 
    // 设置 token 
    var token = sessionStorage.getItem('token') || '';
    config.headers.token  = token    // 以后所有的接口都会带上token  
    showLoading()
    return config;
}, function (error) {
    // 请求发送失败 
    console.log(error)
    showFail('请求失败')
    return Promise.reject(error);
});

// 添加一个响应完成之前的拦截器   response res 
axios.interceptors.response.use(function (response) {
    console.log(response.data)
    // 根据状态 code 实现对应的业务逻辑 
    // 成功 code 200 
    // 失败 code !=200
    if(response.data.code==200){
        showSuccess(response.data.msg)
    }else{
        if(response.data.code==3000){
            // 重定向到登录页面 
            HashHistory.push("/login")
            window.location.reload() 
        }
        showFail(response.data.msg)
    }
    return response;
  }, function (error) {
    // 响应失败 
    // 404 503 
    console.log(error)
    showFail('服务器异常')
    return Promise.reject(error);
});

// 增删改查  Promise 
// get
export function get(url,params,headers){
    return new Promise(function(resolve,reject){
        axios({
            url,
            method:"GET",
            params:params,  
            headers,
        })
        .then(result=>{
            resolve(result.data)   // axios 里面的 data 数据解析 
        })
        .catch(err=>{
            reject(err)
        })
    })
}
// post
export function post(url,data,params,headers){
    return new Promise(function(resolve,reject){
        axios({
            url,
            method:"post",
            params:params,    // POST 也可以拼接 url?id=1
            headers:headers,
            data,   // POST 请求提交的数据 
        })
        .then(result=>{
            resolve(result.data)   // axios 里面的 data 数据解析 
        })
        .catch(err=>{
            reject(err)
        })
    })
}
// delete
export function Delete(url,params){
    return new Promise(function(resolve,reject){
        axios({
            url,
            method:"delete",
            params:params,    
        })
        .then(result=>{
            resolve(result.data)   // axios 里面的 data 数据解析 
        })
        .catch(err=>{
            reject(err)
        })
    })
}
// patch
export function Patch(url,data){
    return new Promise(function(resolve,reject){
        axios({
            url,
            method:"patch",
            data
        })
        .then(result=>{
            resolve(result.data)   // axios 里面的 data 数据解析 
        })
        .catch(err=>{
            reject(err)
        })
    })
}

export {
    axios,
    baseURL
}
