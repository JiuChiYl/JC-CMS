<template>
    <div class="user-color-card-main"
        :style="{ backgroundImage: `linear-gradient(90deg, ${props.BodyColor[0]}, ${props.BodyColor[1]})` }">
        <div class="card-body">
            <div class="card_backImg" :style="{ backgroundImage: `url(${props.userInfo.avatar})` }"></div>
            <div class="user_info_box">
                <div class="user_avatar_box">
                    <img :src="props.userInfo.avatar" width="100px" alt="">
                </div>
                <div class="user_info_content">
                    <p class="user_name">{{ props.userInfo.username }}<i v-if="patchCheck"
                            class="bi bi-patch-check-fill"></i></p>
                    <p class="user_uid">UID:{{ props.userInfo.uid }}</p>
                    <div class="user_tab">
                        <div class="user_tab_item"><i class="bi bi-gender-female"></i>天蝎座</div>
                        <div class="user_tab_item">Web前端设计师</div>
                    </div>
                </div>
            </div>
            <div class="description_box">
                <div class="description_content" :style="{ gridTemplateRows: descriptionShow ? '1fr' : '0fr' }">
                    <div style="overflow: hidden;">
                        {{ props.userInfo.description }}
                    </div>
                </div>

                <div class="description_btn " ref="user_colorCard_description_btn" @click="description_btn_click"
                    v-if="props.position_to && props.btn_position == 'center'" :style="{ right: btn_position }">
                    <i class="bi bi-chevron-compact-up" v-if="descriptionShow"></i>
                    <i class="bi bi-chevron-compact-down" v-else></i>
                </div>
                <div class="description_btn " @click="showDescription" v-else :style="{ right: btn_position }">
                    <i class="bi bi-chevron-compact-up" v-if="descriptionShow"></i>
                    <i class="bi bi-chevron-compact-down" v-else></i>
                </div>

            </div>
        </div>
        <div class="card-footer" :style="{ backgroundColor: props.FooterColor }">
            <!-- <slot></slot> -->
            <div class="card_footer_icon">
                <!-- 社交图标 - 待设置链接 -->
                <i class="bi bi-github"></i>
                <i class="bi bi-twitter-x"></i>
                <i class="bi bi-twitch"></i>
                <i class="bi bi-telegram"></i>
                <i class="bi bi-instagram"></i>
                <i class="bi bi-wechat"></i>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ca } from 'element-plus/es/locales.mjs';
import { ref, defineProps, onMounted } from 'vue';
const props = defineProps({
    BodyColor: {
        type: Array,
        default: () => ['#FF9AC6', '#B0DDFE']
    },
    FooterColor: {
        type: String,
        default: '#FFE5F9'
    },
    userInfo: {
        type: Object,
        default: () => ({
            avatar: 'https://q7.itc.cn/q_70/images03/20240613/38e50443a3a148b287d1d13bd43ebd69.jpeg',
            username: 'User',
            uid: '',
            description: '',
        })
    },
    btn_position: {
        type: String,
        default: 'center'
    },
    position_to: {
        type: String,
        default: ''
    }
});

const btn_position = ref('');

const description_btn_animation = ref(false);


switch (props.btn_position) {
    case 'right':
        btn_position.value = '0';
        break;
    case 'center':
        btn_position.value = '50%';
        break;
    case 'left':
        btn_position.value = 'auto';
        break;
}



const user_colorCard_description_btn = ref(null);
const description_btn = ref(null);
onMounted(() => {
    description_btn.value = user_colorCard_description_btn.value;
});

const description_btn_click = () => {
    showDescription();

    description_btn_animation.value = !description_btn_animation.value;

    switch (props.position_to) {
        case 'right':
            if (description_btn_animation.value) {
                description_btn.value.classList.add('description_btn_animation_show_right');
                description_btn.value.classList.remove('description_btn_animation_hide_right');
            } else {
                description_btn.value.classList.remove('description_btn_animation_show_right');
                description_btn.value.classList.add('description_btn_animation_hide_right');
            }
            break;
        case 'left':
            if (description_btn_animation.value) {
                description_btn.value.classList.add('description_btn_animation_show_left');
                description_btn.value.classList.remove('description_btn_animation_hide_left');
            } else {
                description_btn.value.classList.remove('description_btn_animation_show_left');
                description_btn.value.classList.add('description_btn_animation_hide_left');
            }
            break;
        default:
            return;
    }
}

const patchCheck = ref(true);
const descriptionShow = ref(false);
function showDescription() {
    descriptionShow.value = !descriptionShow.value;
}
</script>
<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css");

.user-color-card-main * {
    transition: all 0.3s ease-in-out;
}

.user-color-card-main {
    padding: 10px;
    border-radius: 5px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    /* background-image: linear-gradient(90deg, #FF9AC6, #B0DDFE); */
}

.card_backImg {
    position: absolute;
    width: 35%;
    right: 0;
    top: 0;
    height: 100%;
    background-size: cover;
    background-position: center;
    mask: linear-gradient(to right, transparent 0%, hsla(0, 0%, 0%, 0.3) 100%);
}

.card-body {
    padding: 10px;
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
}

.user_info_box {
    margin-left: 10px;
    color: #FFF;
    display: flex;
    align-items: center;
}

.user_info_box p {
    margin: 3px 0px;
}

.user_info_content {
    margin-left: 10px;
}

.description_box {
    margin-left: 10px;
    position: relative;
}

.description_content {
    display: grid;
    grid-template-rows: 0fr;
    color: #FFF;
    font-size: 14px;
    overflow: hidden;
    /* text-overflow: ellipsis;
    white-space: nowrap; */
    margin: 5px 0;
    white-space: pre-wrap;
    /* transition: all .3s cubic-bezier(0.56, 0.02, 1, 0.27); */
}

.description_btn {
    background-color: #ffffff58;
    padding: 0 8px;
    border-radius: 15px;
    width: fit-content;
    color: #fff;
    font-size: 11px;
    float: right;
    cursor: pointer;
    z-index: 100;
    position: absolute;
    bottom: -15px;
    /* right: 50%; */
}

/* ------------------- 描述按钮动画 ------------------- */

.description_btn_animation_show_right {
    animation: description_btn_animation_right_show .3s cubic-bezier(0.56, 0.02, 1, 0.27) forwards;
}

.description_btn_animation_hide_right {
    animation: description_btn_animation_right_hide .3s cubic-bezier(0.56, 0.02, 1, 0.27) forwards;
}

@keyframes description_btn_animation_right_show {
    0% {
        right: 50%;
    }

    100% {
        right: 0;
    }
}

@keyframes description_btn_animation_right_hide {
    0% {
        right: 0;
    }

    100% {
        right: 50%;
    }
}

.description_btn_animation_show_left {
    animation: description_btn_animation_left_show .5s cubic-bezier(0.56, 0.02, 1, 0.27) forwards;
}

.description_btn_animation_hide_left {
    animation: description_btn_animation_left_hide .5s cubic-bezier(0.56, 0.02, 1, 0.27) forwards;
}

@keyframes description_btn_animation_left_show {
    0% {
        right: 50%;
    }

    100% {
        right: calc(100% - 27px);
    }
}

@keyframes description_btn_animation_left_hide {
    0% {
        right: calc(100% - 27px);
    }

    100% {
        right: 50%;
    }
}

/* ------------------------------------------------- */

.user_name {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
}

.user_name i {
    margin-left: 5px;
    font-size: 18px;
    background-image: linear-gradient(-45deg, #FFE5F9, #B0DDFE);
    background-clip: text;
    color: transparent;
}

.user_uid,
.user_tab,
.user_tab_item {
    font-size: 14px;
    font-weight: 100 !important;
}

.user_tab {
    display: flex;
}

.user_tab_item {
    font-size: 12px;
    background-color: #a1d1fe87;
    display: flex;
    align-items: center;
    width: fit-content;
    padding: 2px 8px;
    border-radius: 15px;
    margin-right: 5px;
}

.user_tab_item i {
    margin-right: 3px;
    color: #FF9AC6;
}

.user_avatar_box {
    border-radius: 50%;
    width: 100px;
    height: 100px;
    border: 5px solid #FFF;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-footer {
    padding: 10px 0px;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
}

.card_footer_icon {
    margin: 0px 5px;
    float: right;
}

.card_footer_icon i {
    margin: 5px 10px;
    color: #B7B6FF;
}
</style>