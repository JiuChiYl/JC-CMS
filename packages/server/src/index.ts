import express from 'express'
import multer from 'multer'
import path from 'node:path'
import cors from 'cors'
import JSZip from 'jszip'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import type { ConfigJson, ExpansionItem, ConfData, RouteListData, TitleMapData } from '@jc-cms/shared'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 8085

app.use(cors())

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
})

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

function createVueViewForFile(fileName: string, content: string): void {
  const componentsDir = path.join(__dirname, '../../app/src/components')
  const vueFilePath = path.join(componentsDir, fileName.replace('.vue', '') + '.vue')

  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true })
  }

  fs.writeFileSync(vueFilePath, content)
  console.log(`Successfully created Vue file: ${vueFilePath}`)
}

async function upLoadConf(configJson: ConfigJson): Promise<void> {
  console.log('开始处理配置更新...')

  try {
    const configFilePath = path.join(__dirname, '../../app/src/conf/conf.json')

    const confDir = path.dirname(configFilePath)
    try {
      await fs.promises.mkdir(confDir, { recursive: true })
    }
    catch {
      // 目录可能已经存在
    }

    let currentConfig: ConfData
    try {
      const fileContent = await fs.promises.readFile(configFilePath, 'utf8')
      currentConfig = JSON.parse(fileContent)
    }
    catch {
      currentConfig = { moreExpansion: [] }
    }

    if (!Array.isArray(currentConfig.moreExpansion)) {
      currentConfig.moreExpansion = []
    }

    if (!configJson || typeof configJson !== 'object') {
      console.error('无效的配置数据:', configJson)
      return
    }

    const existingIndex = currentConfig.moreExpansion.findIndex(item =>
      item && item.name && configJson.name && item.name === configJson.name,
    )

    if (existingIndex !== -1) {
      const existingConfig = currentConfig.moreExpansion[existingIndex]
      const existingVersion = existingConfig.version || '0.0.0'
      const newVersion = configJson.version || '0.0.0'

      if (newVersion > existingVersion) {
        console.log(`更新配置: ${configJson.name} (版本 ${existingVersion} -> ${newVersion})`)
        currentConfig.moreExpansion[existingIndex] = configJson
      }
      else if (newVersion === existingVersion) {
        const existingExpansion = JSON.stringify(existingConfig.expansion || [])
        const newExpansion = JSON.stringify(configJson.expansion || [])

        if (existingExpansion !== newExpansion) {
          console.log(`更新expansion配置: ${configJson.name} (版本 ${existingVersion})`)
          currentConfig.moreExpansion[existingIndex] = configJson
        }
        else {
          console.log(`配置已存在且相同: ${configJson.name} (版本 ${existingVersion})`)
        }
      }
      else {
        console.log(`保留旧版本配置: ${configJson.name} (版本 ${existingVersion} > ${newVersion})`)
      }
    }
    else {
      console.log(`添加新配置: ${configJson.name} (版本 ${configJson.version || '未知'})`)
      currentConfig.moreExpansion.push(configJson)
    }

    await fs.promises.writeFile(configFilePath, JSON.stringify(currentConfig, null, 2))
    console.log('配置更新完成')
  }
  catch (error) {
    console.error('处理配置更新时出错:', error)
  }
}

async function addTitleMap(expansionArray: ExpansionItem[]): Promise<void> {
  console.log('开始处理标题映射更新...')

  try {
    const configFilePath = path.join(__dirname, '../../app/src/titleMap.json')

    let currentConfig: TitleMapData
    try {
      const fileContent = await fs.promises.readFile(configFilePath, 'utf8')
      currentConfig = JSON.parse(fileContent)
    }
    catch {
      currentConfig = {
        default: {
          home: '主页',
          eventLog: '工具 / 周期事件记录器',
          calendaryDate: '工具 / 日程',
          pageExpansion: '工具 / 组件拓展',
        },
        moreExpansion: {},
      }
    }

    if (!currentConfig.moreExpansion || typeof currentConfig.moreExpansion !== 'object') {
      currentConfig.moreExpansion = {}
    }

    if (!Array.isArray(expansionArray)) {
      console.error('无效的expansion数据:', expansionArray)
      return
    }

    for (const component of expansionArray) {
      if (component && component.vuePage && component.name) {
        const vuePage = component.vuePage
        const displayName = component.name

        if (currentConfig.moreExpansion[vuePage]) {
          console.log(`标题映射已存在: ${vuePage} -> ${currentConfig.moreExpansion[vuePage]}`)
          currentConfig.moreExpansion[vuePage] = displayName
          console.log(`更新标题映射: ${vuePage} -> ${displayName}`)
        }
        else {
          currentConfig.moreExpansion[vuePage] = displayName
          console.log(`添加新标题映射: ${vuePage} -> ${displayName}`)
        }
      }
    }

    await fs.promises.writeFile(configFilePath, JSON.stringify(currentConfig, null, 2))
    console.log('标题映射更新完成')
  }
  catch (error) {
    console.error('处理标题映射更新时出错:', error)
  }
}

async function addComponents(expansionArray: ExpansionItem[]): Promise<void> {
  const componentNames = expansionArray.map(item => item.vuePage)

  console.log('开始处理组件配置...')

  try {
    const configFilePath = path.join(__dirname, '../../app/src/router/list.json')

    if (!Array.isArray(componentNames)) {
      console.error('addComponents: componentNames is not an array:', componentNames)
      return
    }

    const routerDir = path.dirname(configFilePath)
    try {
      await fs.promises.mkdir(routerDir, { recursive: true })
    }
    catch {
      // 目录可能已存在
    }

    let currentConfig: RouteListData
    try {
      const fileContent = await fs.promises.readFile(configFilePath, 'utf8')
      currentConfig = JSON.parse(fileContent)
    }
    catch {
      currentConfig = { view: [], component: [] }
    }

    if (!Array.isArray(currentConfig.component)) {
      currentConfig.component = []
    }

    const filteredConfig = componentNames.filter(item => !currentConfig.component.includes(item))

    if (filteredConfig.length > 0) {
      currentConfig.component.push(...filteredConfig)
      await fs.promises.writeFile(configFilePath, JSON.stringify(currentConfig, null, 2))
      console.log(`成功添加组件: ${filteredConfig}`)
    }
    else {
      console.log('没有新组件需要添加')
    }
  }
  catch (error) {
    console.error('处理组件配置时出错:', error)
  }
}

app.post('/uploadFile', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请提供ZIP文件' })
    }

    const fileType = req.file.mimetype
    if (
      fileType !== 'application/zip'
      && fileType !== 'application/x-zip-compressed'
      && !req.file.originalname.toLowerCase().endsWith('.zip')
    ) {
      return res.status(400).json({ error: '请上传有效的ZIP文件' })
    }

    const zipData = fs.readFileSync(req.file.path)
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(zipData)
    const files = Object.keys(zipContent.files)

    const extractedData = {
      totalFiles: files.length,
      jsonFiles: {} as ConfigJson | { error: string, errorMessage: string },
      vueFiles: [] as { fileName: string, content?: string, error?: string, errorMessage?: string }[],
    }

    for (const fileName of files) {
      const fileEntry = zipContent.files[fileName]

      if (fileEntry.dir) {
        continue
      }

      if (fileName.toLowerCase().endsWith('.json')) {
        try {
          const content = await fileEntry.async('text')
          const componentJson: ConfigJson = JSON.parse(content)

          if (componentJson) {
            console.log('开始异步调用upLoadConf...')
            upLoadConf(componentJson)
              .then(() => console.log('upLoadConf调用完成'))
              .catch(err => console.error('upLoadConf调用失败:', err))
          }
          if (componentJson.expansion) {
            console.log('异步调用addComponents...')
            addComponents(componentJson.expansion)
              .then(() => console.log('addComponents调用完成'))
              .catch(err => console.error('addComponents调用失败:', err))
          }
          if (componentJson.expansion) {
            console.log('异步调用addTitleMap...')
            addTitleMap(componentJson.expansion)
              .then(() => console.log('addTitleMap调用完成'))
              .catch(err => console.error('addTitleMap调用失败:', err))
          }

          extractedData.jsonFiles = componentJson
        }
        catch (error) {
          extractedData.jsonFiles = {
            error: '读取失败',
            errorMessage: (error as Error).message,
          }
        }
      }
      else if (fileName.toLowerCase().endsWith('.vue')) {
        try {
          const content = await fileEntry.async('text')
          setTimeout(() => {
            createVueViewForFile(fileName, content)
          }, 5000)

          extractedData.vueFiles.push({
            fileName,
            content,
          })
        }
        catch (error) {
          extractedData.vueFiles.push({
            fileName,
            error: '读取失败',
            errorMessage: (error as Error).message,
          })
        }
      }
    }

    try {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
        console.log('临时文件已清理')
      }
    }
    catch (cleanupError) {
      console.error('清理临时文件失败:', cleanupError)
    }

    res.json({
      code: 200,
      extractedData,
    })
  }
  catch (error) {
    console.error('处理ZIP文件时出错:', error)

    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path)
        console.log('临时文件已清理')
      }
      catch (cleanupError) {
        console.error('清理临时文件失败:', cleanupError)
      }
    }

    res.status(500).json({
      error: '处理ZIP文件时出错',
      message: (error as Error).message,
    })
  }
})

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    const uploadDir = 'img/'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename(_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const ext = path.extname(file.originalname)
    cb(null, uniqueSuffix + ext)
  },
})

const uploadImg = multer({
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  storage,
})

app.post('/upload/img', uploadImg.single('file'), (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`
  const imageUrl = `/uploads/${req.file!.filename}`
  const fullUrl = baseUrl + imageUrl

  res.json({
    errno: 0,
    data: [
      {
        url: fullUrl,
        alt: req.file!.originalname,
        href: fullUrl,
      },
    ],
  })
})

app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, 'img', filename)
  res.sendFile(filePath)
})

app.listen(port, () => {
  console.log(`Server is running, port: ${port}`)
  console.log('请注意，该服务器文件仅作为测试和参考使用，\n生产环境中请移除该文件并使用更为安全的部署环境')
})
