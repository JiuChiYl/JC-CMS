<script setup>
import { ref, watch } from 'vue'
const avatar_url = ref('img/f8e3dc529a2e6727c7523aa610391cc11104997814.png');
const musicList_flag = ref(false);
const m_setting = ref(false);

const button_theme = ref('#0099ff');
const predefineColors = ref([
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
    'rgba(255, 69, 0, 0.68)',
    'rgb(255, 120, 0)',
    'hsv(51, 100, 98)',
    'hsva(120, 40, 94, 0.5)',
    'hsl(181, 100%, 37%)',
    'hsla(209, 100%, 56%, 0.73)',
    '#c7158577',
]);

const selectedMusic = ref(1);
// 播放列表-模拟数据
const options = ref([
    { value: 1, singer: "鸣潮先约电台", label: 'Daisy Crown (中文版) - 鸣潮先约电台' },
    { value: 2, singer: "战双帕弥什/Sawako碎花", label: '她的梦 - 战双帕弥什/Sawako碎花' },
    { value: 3, singer: "韩兮浅", label: '画心 - 韩兮浅' },
    { value: 4, singer: "猫瑾", label: '勾指起誓 - 猫瑾' },
    { value: 5, singer: "封茗囧菌", label: '东京不太热（人太多 大部分是漫无目的的走） - 封茗囧菌' },
]);
const musicInfo = ref({
    singer: "鸣潮先约电台",
    label: "Daisy Crown (中文版) - 鸣潮先约电台",
});

// 歌曲切换后处理逻辑-
watch(selectedMusic, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        // console.log(`selectedMusic 从 ${oldVal} 变化到 ${newVal}`);
        musicInfo.value = options.value.find(item => item.value === newVal);
    }
});

// 播放与暂停
const playFlag = ref(true);
function playMusic() {
    playFlag.value = !playFlag.value;
    // 控件处理逻辑
}
function prevMusic() {
    if (selectedMusic.value > 1) {
        selectedMusic.value -= 1;
        // 如果是第一首
        if (playFlag.value) {
            playMusic();
        }
    }
}
function nextMusic() {
    if (selectedMusic.value < options.value.length) {
        selectedMusic.value += 1;
        // 如果是最后一首
        if (playFlag.value) {
            playMusic();
        }
    }
}
const musicList_appendTo = ref('#app');
setTimeout(() => {
    musicList_appendTo.value = '.musicToolBox';
}, 0);

setTimeout(() => {
    document.querySelector('.music_back_img').style.backgroundImage = `url(${avatar_url.value})`;
}, 0);

// 监听selectedMusic变化
watch(selectedMusic, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        console.log(`selectedMusic 从 ${oldVal} 变化到 ${newVal}`);
        setTimeout(() => {
            document.querySelector('.music_back_img').style.backgroundImage = `url(${avatar_url.value})`;
        }, 0);
    }
});
</script>
<template>
    <el-card body-class="bd_ui_lin" header-class="music_back">
        <template #header>
            <el-row style="z-index: 2;" :gutter="0">
                <el-col :span="5" style="display: flex;align-items: center;justify-content: center;">
                    <el-avatar shape="square" :size="50" fit="cover" :src="avatar_url" />
                </el-col>
                <el-col :span="1">
                    <el-divider direction="vertical" style="height: 100%;" />
                </el-col>
                <el-col :span="17" style="display: flex;flex-direction: column;justify-content: center">
                    <el-tooltip :content="musicInfo.label" placement="top">
                        <el-text truncated title=" ">{{ musicInfo.label }}</el-text>
                    </el-tooltip>
                    <el-text size="small">{{ musicInfo.singer }}</el-text>
                </el-col>
            </el-row>
            <div class="music_back_img"></div>
        </template>
        <div class="elpr_div">
            <el-text size="small">0:00</el-text>
            <div class="elpr_div_bar">
                <el-progress :color="button_theme" :percentage="50" :show-text="false" />
            </div>
            <el-text size="small">0:00</el-text>
        </div>
        <el-row :gutter="10" style="justify-content: space-between;margin-top: 20px;">
            <el-col style="text-align: center;" :span="3">
                <el-button type="primary" link>
                    <el-icon :color="button_theme" @click="prevMusic" size="large">
                        <i class="bi bi-skip-start-circle"></i>
                    </el-icon>
                </el-button>
            </el-col>
            <el-col style="text-align: center;" :span="3">
                <el-button type="primary" @click="playMusic" link>
                    <el-icon :color="button_theme" size="large">
                        <i v-if="playFlag" class="bi bi-pause-circle"></i>
                        <i v-else class="bi bi-play-circle"></i>
                    </el-icon>
                </el-button>
            </el-col>
            <el-col style="text-align: center;" :span="3">
                <el-button type="primary" @click="nextMusic" link>
                    <el-icon :color="button_theme" size="large">
                        <i class="bi bi-skip-end-circle"></i>
                    </el-icon>
                </el-button>
            </el-col>
            <el-col style="text-align: center;" :span="3">
                <el-popover placement="bottom" width="350" :append-to="musicList_appendTo" :visible="musicList_flag">
                    <template #reference>
                        <el-button @click="musicList_flag = !musicList_flag" type="primary" link>
                            <el-icon :color="button_theme" size="large">
                                <i class="bi bi-music-note-list"></i>
                            </el-icon>
                        </el-button>
                    </template>
                    <ul style="list-style-type: none;" class="music-list">
                        <el-scrollbar height="150px">
                            <li v-for="item in options"
                                :class="{ 'music_active ui-bg_2': item.value === selectedMusic }"
                                @click="selectedMusic = item.value" :key="item.value" :value="item.value">{{ item.label
                                }}</li>
                        </el-scrollbar>
                    </ul>
                </el-popover>
            </el-col>
            <el-col style="text-align: center;" :span="3">
                <el-popover placement="bottom" width="155" :append-to="musicList_appendTo" :visible="m_setting">
                    <template #reference>
                        <el-button @click="m_setting = !m_setting" type="primary" link>
                            <el-icon :color="button_theme" size="large">
                                <i class="bi bi-sliders2"></i>
                            </el-icon>
                        </el-button>
                    </template>
                    <el-row :gutter="20">
                        <el-col style="display: flex;justify-content: center; align-items: center;" :span="13">
                            <el-text>按钮主题</el-text>
                        </el-col>
                        <el-col style="display: flex;justify-content: center; align-items: center;" :span="11">
                            <el-color-picker v-model="button_theme" show-alpha :predefine="predefineColors"
                                size="small" />
                        </el-col>
                    </el-row>
                </el-popover>
            </el-col>
        </el-row>
    </el-card>
</template>
<style>
.elpr_div {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    justify-content: space-between;
}

.elpr_div_bar {
    width: 75%;
}

.music-list {
    padding: 0;
    margin: 0;
}

.music-list li {
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    margin-bottom: 5px;
}

.music-list li:hover {
    background-color: #f5f5f5;
}

.music_active {
    /* background-color: #0f52aa !important ; */
    color: #fff;
    position: relative;
    overflow: hidden;
    background: linear-gradient(90deg, #143a86 30%, #02ab7fa1 100%);
}

.music_active::after {
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: .5;
    backdrop-filter: blur(10px);
    background-image: linear-gradient(45deg,
            #9c9c9c2f 25%, transparent 25%, transparent 50%,
            #9c9c9c2f 50%, #9c9c9c2f 75%, transparent 75%, transparent);
    background-size: 4px 4px;
    background-position: 0 0;
    background-repeat: repeat;
}

.music_back {
    position: relative;
    overflow: hidden;
}

/* .music_back::after{
    position: absolute;
    content: '';
    height: 100%;
    width: 10px;
    top: 0;
    left: 0;
    background-image: linear-gradient(45deg,
            #FFF 25%, transparent 25%, transparent 50%,
            #FFF 50%, #FFF 75%, transparent 75%, transparent);
    background-size: 4px 4px;
    background-position: 0 0;
    background-repeat: repeat;
    opacity: .2;
} */

.music_back_img {
    position: absolute;
    filter: blur(10px);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
}

.music_back_img::after {
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    background-color: #ffffff69;
    top: 0;
    left: 0;
    opacity: .5;
}
</style>