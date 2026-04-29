import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import JSZip from 'jszip';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 8085;

app.use(cors());


// 配置multer处理文件上传
const upload = multer({
    dest: 'uploads/', // 临时存储上传文件的目录
    limits: {
        fileSize: 100 * 1024 * 1024, // 限制100MB
    }
});

// 中间件：创建上传目录（如果不存在）
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// 把vue文件内容写入到components目录下的vue文件中
function createVueViewForFile(fileName, content) {
    const componentsDir = path.join(__dirname, '../src/components');
    const vueFilePath = path.join(componentsDir, fileName.replace('.vue', '') + '.vue');

    // 确保目录存在
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    fs.writeFileSync(vueFilePath, content);
    console.log(`Successfully created Vue file: ${vueFilePath}`);
}

async function upLoadConf(configJson) {
    console.log('开始处理配置更新...');

    try {
        const configFilePath = path.join(__dirname, '../src/conf/conf.json');

        // 确保配置目录存在
        const confDir = path.dirname(configFilePath);
        try {
            await fs.promises.mkdir(confDir, { recursive: true });
        } catch (mkdirError) {
            // 目录可能已经存在，忽略错误
        }

        // 确保配置文件存在
        let currentConfig;
        try {
            const fileContent = await fs.promises.readFile(configFilePath, 'utf8');
            currentConfig = JSON.parse(fileContent);
        } catch (readError) {
            // 文件不存在或读取失败，创建默认配置
            currentConfig = { moreExpansion: [] };
        }

        // 确保moreExpansion是数组
        if (!Array.isArray(currentConfig.moreExpansion)) {
            currentConfig.moreExpansion = [];
        }

        // 检查新配置是否有效
        if (!configJson || typeof configJson !== 'object') {
            console.error('无效的配置数据:', configJson);
            return;
        }

        // 查重逻辑：如果name相同，比较version，使用最新版本
        const existingIndex = currentConfig.moreExpansion.findIndex(item =>
            item && item.name && configJson.name && item.name === configJson.name
        );

        if (existingIndex !== -1) {
            // 找到同名配置，比较版本号
            const existingConfig = currentConfig.moreExpansion[existingIndex];
            const existingVersion = existingConfig.version || '0.0.0';
            const newVersion = configJson.version || '0.0.0';

            // 简单的版本号比较（按字符串比较，适用于标准版本号格式）
            if (newVersion > existingVersion) {
                // 新版本更高，替换旧配置
                console.log(`更新配置: ${configJson.name} (版本 ${existingVersion} -> ${newVersion})`);
                currentConfig.moreExpansion[existingIndex] = configJson;
            } else if (newVersion === existingVersion) {
                // 版本相同，检查expansion是否不同
                const existingExpansion = JSON.stringify(existingConfig.expansion || []);
                const newExpansion = JSON.stringify(configJson.expansion || []);

                if (existingExpansion !== newExpansion) {
                    // expansion不同，更新配置
                    console.log(`更新expansion配置: ${configJson.name} (版本 ${existingVersion})`);
                    currentConfig.moreExpansion[existingIndex] = configJson;
                } else {
                    // 完全相同，跳过
                    console.log(`配置已存在且相同: ${configJson.name} (版本 ${existingVersion})`);
                }
            } else {
                // 新版本更低，保留旧配置
                console.log(`保留旧版本配置: ${configJson.name} (版本 ${existingVersion} > ${newVersion})`);
            }
        } else {
            // 新配置，直接添加
            console.log(`添加新配置: ${configJson.name} (版本 ${configJson.version || '未知'})`);
            currentConfig.moreExpansion.push(configJson);
        }

        // 写入配置文件
        await fs.promises.writeFile(configFilePath, JSON.stringify(currentConfig, null, 2));
        console.log('配置更新完成');

    } catch (error) {
        console.error('处理配置更新时出错:', error);
    }
}

async function addTitleMap(expansionArray) {
    console.log('开始处理标题映射更新...');

    try {
        const configFilePath = path.join(__dirname, '../src/titleMap.json');

        // 确保配置文件存在
        let currentConfig;
        try {
            const fileContent = await fs.promises.readFile(configFilePath, 'utf8');
            currentConfig = JSON.parse(fileContent);
        } catch (readError) {
            // 文件不存在或读取失败，创建默认配置
            currentConfig = {
                default: {
                    home: "主页",
                    eventLog: "工具 / 周期事件记录器",
                    calendaryDate: "工具 / 日程",
                    pageExpansion: "工具 / 组件拓展"
                },
                moreExpansion: {}
            };
        }

        // 确保moreExpansion是对象
        if (!currentConfig.moreExpansion || typeof currentConfig.moreExpansion !== 'object') {
            currentConfig.moreExpansion = {};
        }

        // 检查输入参数是否有效
        if (!Array.isArray(expansionArray)) {
            console.error('无效的expansion数据:', expansionArray);
            return;
        }

        // 处理expansion数组中的每个组件配置
        for (const component of expansionArray) {
            if (component && component.vuePage && component.name) {
                // vuePage作为键，name作为值
                const vuePage = component.vuePage;
                const displayName = component.name;

                // 查重逻辑：如果vuePage已存在，可以选择更新或跳过
                if (currentConfig.moreExpansion[vuePage]) {
                    console.log(`标题映射已存在: ${vuePage} -> ${currentConfig.moreExpansion[vuePage]}`);
                    // 更新现有映射
                    currentConfig.moreExpansion[vuePage] = displayName;
                    console.log(`更新标题映射: ${vuePage} -> ${displayName}`);
                } else {
                    // 新映射，直接添加
                    currentConfig.moreExpansion[vuePage] = displayName;
                    console.log(`添加新标题映射: ${vuePage} -> ${displayName}`);
                }
            }
        }

        // 写入配置文件
        await fs.promises.writeFile(configFilePath, JSON.stringify(currentConfig, null, 2));
        console.log('标题映射更新完成');

    } catch (error) {
        console.error('处理标题映射更新时出错:', error);
    }
}

// 处理ZIP文件上传的路由
async function addComponents(configJson) {

    let tmp = [];
    configJson.forEach(item => {
        tmp.push(item.vuePage);
    });
    configJson = tmp;



    console.log('开始处理组件配置...');

    try {
        const configFilePath = path.join(__dirname, '../src/router/list.json');

        if (!Array.isArray(configJson)) {
            console.error('addComponents: configJson is not an array:', configJson);
            return;
        }

        // 确保router目录存在
        const routerDir = path.dirname(configFilePath);
        try {
            await fs.promises.mkdir(routerDir, { recursive: true });
        } catch (mkdirError) {
            // 目录可能已经存在，忽略错误
        }

        // 使用异步API读取配置文件
        let currentConfig;
        try {
            const fileContent = await fs.promises.readFile(configFilePath, 'utf8');
            currentConfig = JSON.parse(fileContent);
        } catch (readError) {
            // 文件不存在或读取失败，创建默认配置
            currentConfig = { component: [] };
        }

        // 确保component是数组
        if (!Array.isArray(currentConfig.component)) {
            currentConfig.component = [];
        }

        // 移除重复项
        const filteredConfig = configJson.filter(item => !currentConfig.component.includes(item));

        if (filteredConfig.length > 0) {
            // 添加新组件
            currentConfig.component.push(...filteredConfig);

            // 使用异步API写入配置文件
            await fs.promises.writeFile(configFilePath, JSON.stringify(currentConfig, null, 2));
            console.log(`成功添加组件: ${filteredConfig}`);
        } else {
            console.log('没有新组件需要添加');
        }

    } catch (error) {
        console.error('处理组件配置时出错:', error);
    }
}
app.post('/uploadFile', upload.single('file'), async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({
                error: '请提供ZIP文件'
            });
        }

        // 验证文件类型
        const fileType = req.file.mimetype;
        if (fileType !== 'application/zip' &&
            fileType !== 'application/x-zip-compressed' &&
            !req.file.originalname.toLowerCase().endsWith('.zip')) {
            return res.status(400).json({
                error: '请上传有效的ZIP文件'
            });
        }

        // 读取ZIP文件
        const zipData = fs.readFileSync(req.file.path);
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipData);

        // 获取ZIP文件中的所有文件
        const files = Object.keys(zipContent.files);

        // 用于存储提取的内容
        const extractedData = {
            totalFiles: files.length,
            jsonFiles: {},
            vueFiles: []
        };

        // 遍历ZIP中的所有文件
        for (const fileName of files) {
            const fileEntry = zipContent.files[fileName];

            // 跳过目录
            if (fileEntry.dir) {
                continue;
            }
            // 根据文件扩展名处理不同类型文件
            if (fileName.toLowerCase().endsWith('.json')) {
                try {
                    // 读取JSON文件内容
                    const content = await fileEntry.async('text');
                    const componentJson = JSON.parse(content);

                    if (componentJson) {
                        console.log('开始异步调用upLoadConf...');
                        upLoadConf(componentJson)
                            .then(() => console.log('upLoadConf调用完成'))
                            .catch(err => console.error('upLoadConf调用失败:', err));
                        console.log('异步调用addComponents...');
                    }
                    if (componentJson.expansion) {
                        console.log('异步调用addComponents...');
                        // 使用setTimeout确保异步调用不会阻塞
                        addComponents(componentJson.expansion)
                            .then(() => console.log('addComponents调用完成'))
                            .catch(err => console.error('addComponents调用失败:', err));
                    }
                    if (componentJson.expansion) {
                        console.log('异步调用addTitleMap...');
                        // 使用setTimeout确保异步调用不会阻塞
                        addTitleMap(componentJson.expansion)
                            .then(() => console.log('addTitleMap调用完成'))
                            .catch(err => console.error('addTitleMap调用失败:', err));
                    }

                    extractedData.jsonFiles = componentJson;

                } catch (error) {
                    extractedData.jsonFiles = {
                        error: '读取失败',
                        errorMessage: error.message
                    };
                }
            } else if (fileName.toLowerCase().endsWith('.vue')) {
                try {
                    // 读取Vue文件内容
                    const content = await fileEntry.async('text');
                    // 写入vue文件
                    setTimeout(() => {
                        createVueViewForFile(fileName, content);
                    }, 5000);

                    extractedData.vueFiles.push({
                        fileName: fileName,
                        content: content
                    });
                } catch (error) {
                    extractedData.vueFiles.push({
                        fileName: fileName,
                        error: '读取失败',
                        errorMessage: error.message
                    });
                }
            }
        }

        // 清理临时文件
        try {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
                console.log('临时文件已清理');
            }
        } catch (cleanupError) {
            console.error('清理临时文件失败:', cleanupError);
        }

        // 返回提取的数据
        res.json({
            code: 200,
            extractedData: extractedData
        });

    } catch (error) {
        console.error('处理ZIP文件时出错:', error);

        // 清理临时文件（如果存在）
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                    console.log('临时文件已清理');
                }
            } catch (cleanupError) {
                console.error('清理临时文件失败:', cleanupError);
            }
        }

        res.status(500).json({
            error: '处理ZIP文件时出错',
            message: error.message
        });
    }
});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'img/'
        // 确保目录存在
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, uniqueSuffix + ext)
    }
})

const uploadImg = multer({
    limits: {
        fileSize: 20 * 1024 * 1024, // 限制20MB
    },
    storage: storage
});

app.post('/upload/img', uploadImg.single('file'), (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const imageUrl = `/uploads/${req.file.filename}`
    const fullUrl = baseUrl + imageUrl

    // WangEditor要求的返回格式 [citation:1][citation:7]
    res.json({
        errno: 0, // 注意：必须是数字0表示成功
        data: [
            {
                url: fullUrl,  // 图片访问URL
                alt: req.file.originalname, // 图片描述
                href: fullUrl  // 图片链接
            }
        ]
    });

});

app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'img', filename);
    res.sendFile(filePath);
});



app.listen(port, () => {
    console.log("Server is runing, port: " + port);
    console.log("请注意，该服务器文件仅作为测试和参考使用，\n生产环境中请移除该文件并使用更为安全的部署环境");
});