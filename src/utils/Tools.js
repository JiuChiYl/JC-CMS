
/**
 * 数组转换为访问函数
 * @param {Array} arr 数组 数组元素为字符串或数字 - ['page1','user','0']
 * @returns {Function} 访问函数，接收上下文对象作为参数
 */
export const arrayToExpression = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) {
        return () => undefined;
    }

    // 预处理数组项
    const processed = arr.map(item => {
        if (!isNaN(Number(item)) && item !== '') {
            return Number(item);
        }
        return item;
    });

    // 返回访问函数
    return (context) => {
        let result = context;
        for (const key of processed) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return undefined;
            }
        }
        return result;
    };
}

// 使用示例：
// const getValue = arrayToExpression(['page1', 'user', '0']);
// const obj = { page1: { user: ['admin', 'guest'] } };
// getValue(obj); // 返回: 'admin'



/**
 * 函数闭包演示 - 搜索对象并返回索引组和对象组
 * 
 * 这是一个经典的闭包示例，展示了JavaScript中闭包的工作原理：
 * - 外层函数接收一个对象参数
 * - 返回一个内层函数，该内层函数可以访问外层函数的参数（obj）
 * - 即使外层函数执行完毕，内层函数仍然可以访问obj参数
 * 
 * 闭包概念：函数可以记住并访问其词法作用域中的变量，即使该函数在其作用域之外执行
 * 
 * @param {Object} obj - 要搜索的目标对象，应该包含数组属性
 * @returns {Function} 返回一个搜索函数，该函数接收键名和搜索条件
 * 
 * 使用示例：
 * const data = {
 *   users: [
 *     { name: 'Alice', age: 25 },
 *     { name: 'Bob', age: 30 },
 *     { name: 'Alice', age: 28 }
 *   ]
 * };
 * 
 * const searchUsers = searchObj(data);
 * const result = searchUsers('users', { name: 'Alice' });
 * // 返回: { index: [0, 2], object: [{name: 'Alice', age: 25}, {name: 'Alice', age: 28}] }
 */
export function searchObj(obj) {
    // 返回一个内层函数 - 这就是闭包
    // 这个内层函数可以访问外层函数的obj参数
    return (k, v) => {
        // 初始化结果对象，包含索引数组和匹配的对象数组
        let result = {
            index: [],    // 存储匹配项的索引
            object: []    // 存储匹配的对象
        };

        // 遍历obj对象中指定键名(k)对应的数组
        // 注意：这里假设obj[k]是一个数组
        obj[k].forEach((item, index) => {
            // 获取搜索条件v的键名（Object.keys(v)返回键名数组，取第一个）
            const searchKey = Object.keys(v)[0];
            // 获取搜索条件v的值（Object.values(v)返回值数组，取第一个）
            const searchValue = Object.values(v)[0];

            // 检查当前数组项是否匹配搜索条件
            // 注意：这里使用==而不是===，允许类型转换
            if (item[searchKey] == searchValue) {
                // 如果匹配，将索引添加到结果中
                result.index.push(index);
                // 将匹配的对象添加到结果中
                result.object.push(item);
            }
        });

        return result;
    }
}


// 函数的链式调用
export function chainFun() {
    const objs = {
        rbq: function (val) {
            console.log(val);
            return this;
        },
        rq: function (val) {
            console.log(val);
            return this;
        },
        br: function (val) {
            console.log(val);
            return this;
        }
    };
    return objs;
}
chainFun().rbq('123').br('789').rq('456');


// 处理贡献数据
// utils/contributions.js
export function processContributions(apiData) {
    // 扁平化数据，并映射为组件所需的格式
    const contributionsMap = new Map()

    apiData.contributions.forEach(week => {
        week.forEach(day => {
            contributionsMap.set(day.date, {
                date: day.date,
                count: day.count,
                intensity: parseInt(day.intensity)  // '0' -> 0, '1' -> 1, ...
            })
        })
    })

    return contributionsMap
}

// 根据贡献次数计算颜色强度（0-4）
export function getIntensityLevel(count) {
    if (count === 0) return 0
    if (count <= 3) return 1
    if (count <= 6) return 2
    if (count <= 9) return 3
    return 4
}