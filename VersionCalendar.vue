<script setup>
import { ref, defineProps, computed } from 'vue';
import dayjs from 'dayjs';

// 日历的起始和结束日期
const StartDay = ref(dayjs().format('YYYY-MM-DD'));
const EndDay = ref(dayjs().set('month', dayjs().format('MM')).set('date', 30).format('YYYY-MM-DD'));

// 计算属性：生成从 StartDay 到 EndDay 的所有日期列表
const dateList = computed(() => {
    const start = dayjs(StartDay.value);
    const end = dayjs(EndDay.value);
    const daysDiff = end.diff(start, 'day');
    const list = [];
    for (let i = 0; i <= daysDiff; i++) {
        list.push(start.add(i, 'day').format('YYYY-MM-DD'));
    }
    return list;
});

const props = defineProps({
    version: {
        type: Array,
        default: () => []
    },
    title: {
        type: String,
        default: null
    }
});

// 计算属性：为每个版本条目生成对应的样式（宽度和左偏移量）
const versionItems = computed(() => {
    const totalDays = dateList.value.length;
    if (totalDays === 0) return [];

    const startBoundary = dayjs(StartDay.value);
    const endBoundary = dayjs(EndDay.value);

    return props.version
        .map((item) => {
            // 解析版本的起始和结束日期
            const startDate = dayjs(item.start);
            const endDate = dayjs(item.end);

            let back;
            if (item.background == undefined) {
                back = "#09f";
            } else {
                back = `url(${item.background})`;
            }

            // 如果日期无效，则跳过该版本
            if (!startDate.isValid() || !endDate.isValid()) return null;

            // 计算版本在日历中的索引范围（边界裁剪）
            let startIndex = startDate.diff(startBoundary, 'day');
            let endIndex = endDate.diff(startBoundary, 'day');

            // 完全不在日历范围内，不显示
            if (startIndex > totalDays - 1 || endIndex < 0) return null;

            // 裁剪到有效索引范围
            startIndex = Math.max(0, startIndex);
            endIndex = Math.min(totalDays - 1, endIndex);

            // 如果裁剪后起始大于结束，不显示
            if (startIndex > endIndex) return null;

            let leftPercent = 0;
            let widthPercent = 0;

            // 判断版本内容是否完全覆盖或超出整个日历宽度
            const isFullWidth = (startDate.isBefore(startBoundary) || startDate.isSame(startBoundary)) &&
                (endDate.isAfter(endBoundary) || endDate.isSame(endBoundary));

            if (isFullWidth) {
                // 超出日历宽度，默认最宽
                leftPercent = 0;
                widthPercent = 100;
            } else {
                // 正常计算宽度与偏移
                leftPercent = (startIndex / totalDays) * 100;
                const spanDays = endIndex - startIndex + 1;
                widthPercent = (spanDays / totalDays) * 100;
            }

            // 返回原始数据及计算好的样式
            return {
                ...item,
                style: {
                    marginLeft: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    background: back
                }
            };
        })
        .filter(item => item !== null); // 过滤掉无效项
});
</script>

<template>
    <div class="version_calendar">
        <div v-if="title" class="version_calendar_title">{{ title }}</div>
        <div style="padding: 15px;">
            <!-- 版本日历：日期选项列表 -->
            <div class="date_option_list">
                <span class="date_option_item" v-for="(date, index) in dateList" :key="index">
                    <span class="date_option_item_month">{{ dayjs(date).format('MM') }}</span>
                    {{ dayjs(date).format('DD') }}
                </span>
            </div>

            <!-- 版本内容：每个版本条宽度与位置对应起始日和结束日 -->
            <div class="version_content">
                <div class="version_content_item" v-for="(item, index) in versionItems" :key="index"
                    :style="item.style">
                    <div class="version_content_item_start">
                        {{ dayjs(item.start).format('MM.DD') }}
                        <i class="bi bi-clock-history"></i>
                    </div>
                    <div class="version_content_item_content">
                        {{ item.content }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
/* @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"); */

.version_calendar {
    overflow: hidden;
    border: 1px solid #dcdfe6;
    border-radius: 5px;
}

.version_calendar_title {
    padding: 10px;
    font-size: 16px;
    border-bottom: 1px solid #dcdfe6;
    font-weight: 300;
}

.date_option_list {
    display: flex;
    justify-content: space-between;
}

.date_option_item {
    padding: 10px;
    position: relative;
    color: #0e5e93;
}

.date_option_item:nth-child(1) {
    color: #b01d1d;
}


.date_option_item_month {
    font-size: 12px;
    position: absolute;
    top: 0;
    left: 0;
}

.version_content {
    /* 确保子元素的百分比宽度参照此容器 */
    width: 100%;
}

.version_content_item_content{
    text-overflow: ellipsis;
    white-space: nowrap;
}

.version_content_item {
    background-color: #00b3ff;
    color: #fff;
    padding: 25px 15px;
    border-radius: 5px;
    margin: 20px 0;
    position: relative;
    box-sizing: border-box;
    /* 确保 padding 不会撑大宽度，使百分比宽度准确 */
    /* 内容过长时的处理 */
    word-break: break-word;
    white-space: normal;
    background-repeat: no-repeat !important;
    background-size: cover !important;
    background-position: center !important;
}

.version_content_item_start {
    display: flex;
    width: 50px;
    position: absolute;
    top: -10px;
    left: 10px;
    border-radius: 50px;
    padding: 2px 5px;
    background-color: #9b1717;
    background-image: linear-gradient(45deg, #9c9c9c2f 25%, transparent 25%, transparent 50%, #9c9c9c2f 50%, #9c9c9c2f 75%, transparent 75%, transparent);
    background-size: 4px 4px;
    background-position: 0 0;
    background-repeat: repeat;
    font-size: 12px;
    white-space: nowrap;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}
</style>