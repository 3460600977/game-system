<template>
  <div class="draw-detail">
    <Spin v-if="loading" fix size="large"></Spin>
    <div class="section-wrapper">
      <h2 class="section-title">涂鸦详情</h2>
      <div class="img-basic-info">
        <img class="drawing-img" :src="data.imgPath" alt="涂鸦" />
        <Button type="primary" :data-href="data.imgPath" @click="forceDownload(data.imgPath)">下载图片</Button>
      </div>
    </div>
    <div class="section-wrapper">
      <h2 class="section-title">基本信息</h2>
      <div class="info-wrapper">
        <div class="info-item" v-for="item in infoItems" :key="item.key">
          <span class="info-label">{{ item.label }}：</span>
          <template v-if="!item.star">
            <span class="info-value" v-if="!item.format">{{
              item.map ? item.map[data[item.key]] : data[item.key]
            }}</span>
            <span class="info-value" v-if="item.format">{{ item.format(data[item.key]) }}</span>
          </template>
          <StarRating :maxNumber="3" v-if="item.star" :starNumber="data[item.key]"></StarRating>
          <Tooltip placement="top" :content="item.buttonTip">
            <Button
              size="small"
              style="margin-left: 10px;"
              v-if="item.buttonIcon"
              @click="item.action(data)"
              type="primary"
              shape="circle"
              :icon="item.buttonIcon"
            ></Button>
          </Tooltip>
        </div>
      </div>
    </div>
    <div class="section-wrapper">
      <h2 class="section-title">安装信息</h2>
      <div class="info-wrapper">
        <div class="info-item" v-for="item in installItems" :key="item.key">
          <span class="info-label">{{ item.label }}：</span>
          <span class="info-value">{{ data[item.key] }}</span>
          <Tooltip placement="top" :content="item.buttonTip">
            <Button
              size="small"
              style="margin-left: 10px;"
              v-if="item.buttonIcon"
              @click="item.action(data)"
              type="primary"
              shape="circle"
              :icon="item.buttonIcon"
            ></Button>
          </Tooltip>
        </div>
      </div>
    </div>
    <div class="section-wrapper">
      <h2 class="section-title">笔刷信息</h2>
      <div class="brush-wrapper">
        <div class="left-panel">
          <h4 class="panel-title">笔刷</h4>
          <div
            @click="activePenIndex = index"
            class="brush-item"
            :class="{ active: index === activePenIndex }"
            v-for="(item, index) in data.penTypes"
            :key="item.brushId"
          >
            <Tooltip transfer placement="left">
              <img :src="item.path" :alt="item.brushId" class="brush-img" />
              <div slot="content">
                <p>ID：{{ item.brushId }}</p>
                <p>解锁类型：{{ item.brushLockType }}</p>
                <p>本次解锁：{{ LOCK_TYPE_MAP[item.currentUnlockBrush] }}</p>
              </div>
            </Tooltip>
            <div class="line" :class="{ active: index === activePenIndex }"></div>
            <!-- <Icon type="ios-arrow-forward" class="brush-arrow" /> -->
          </div>
        </div>
        <div class="right-panel">
          <Table :data="selectedPenColors" :columns="colorTableColumns"> </Table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { getDrawingDetail } from '@/api/color';
import StarRating from '@/components/StarRating.vue';

const LOCK_TYPE_MAP = {
  0: '否',
  1: '是',
};

export default {
  components: {
    StarRating,
  },
  data() {
    return {
      LOCK_TYPE_MAP,
      data: {},
      loading: false,
      infoItems: [
        {
          label: '图案ID',
          key: 'patternCode',
          buttonIcon: 'ios-search',
          buttonTip: '查看该图案ID的所有涂鸦',
          action: (item) => {
            this.showListWithParams('patternCode', item.patternCode);
          },
        },
        {
          label: '渠道',
          key: 'channel',
        },
        {
          label: '开始时间',
          key: 'startTime',
        },
        {
          label: '完成时间',
          key: 'completeTime',
        },
        {
          label: '解锁类型',
          key: 'patternLockType',
        },
        {
          label: '是否本次解锁',
          key: 'currentUnlockPattern',
          // 映射值
          map: {
            1: '是',
            0: '否',
          },
        },
        {
          label: '获取星数',
          key: 'starNum',
          star: true,
        },
        {
          label: '垃圾桶使用次数',
          key: 'trashNum',
        },
        {
          label: '下载保存次数',
          key: 'downloadNum',
        },
        {
          label: '撤销次数',
          key: 'undoNum',
        },
        {
          label: '还原次数',
          key: 'redoNum',
        },
        {
          label: '涂色时长',
          key: 'drawTime',
          format: data => moment.utc(data * 1000).format('HH:mm:ss'),
        },
        {
          label: '总时长',
          key: 'totalTime',
          format: data => moment.utc(data * 1000).format('HH:mm:ss'),
        },
      ],
      installItems: [
        {
          label: '设备ID',
          key: 'deviceCode',
          buttonIcon: 'ios-search',
          buttonTip: '查看该设备ID的所有涂鸦',
          action: (item) => {
            this.showListWithParams('deviceCode', item.deviceCode);
          },
        },
        {
          label: '平台',
          key: 'platform',
        },
        {
          label: '系统版本',
          key: 'os',
        },
        {
          label: '设备类型',
          key: 'deviceType',
        },
        {
          label: 'APP版本',
          key: 'appVersion',
        },
        {
          label: '语言',
          key: 'language',
        },
      ],
      colorTableColumns: [
        {
          title: '颜色',
          align: 'center',
          render: (h, params) => h('img', { attrs: { src: params.row.path }, class: 'color-img' }),
        },
        {
          title: '使用次数',
          align: 'center',
          key: 'num',
          sortable: true,
        },
        {
          title: '解锁类型',
          align: 'center',
          key: 'colorLockType',
        },
        {
          title: '是否本次解锁',
          align: 'center',
          render: (h, params) => h('span', LOCK_TYPE_MAP[params.row.currentUnlockColor]),
        },
      ],
      activePenIndex: -1,
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      this.loading = true;
      const { id } = this.$route.params;
      getDrawingDetail(id)
        .then((res) => {
          this.loading = false;
          if (res) {
            this.data = res;
            if (res.penTypes.length > 0) {
              this.activePenIndex = 0;
            }
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    showListWithParams(key, value) {
      this.$router.replace(`/?${key}=${value}`);
    },
    forceDownload(url) {
      const urlArr = url.split('/');
      const fileName = urlArr[urlArr.length - 1];
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(xhr.response);
        const tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = fileName;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
      };
      xhr.send();
    },
  },
  computed: {
    selectedPenColors() {
      if (this.activePenIndex !== -1 && this.data.penTypes[this.activePenIndex]) {
        return this.data.penTypes[this.activePenIndex].color;
      }
      return [];
    },
  },
};
</script>

<style lang="less">
.draw-detail {
  position: relative;

  .img-basic-info {
    display: flex;
    align-items: flex-end;
    width: 100%;

    .info-section-wrapper {
      margin-bottom: 20px;
    }

    .right-panel {
      flex: 1;
      padding-left: 30px;
    }

    .info-title {
      font-size: 16px;
      margin-bottom: 5px;
    }
  }

  .drawing-img {
    width: 80%;
    max-width: 1000px;
    margin-right: 10px;
    height: auto;
  }

  .info-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .info-item {
      min-width: 50%;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
    }

    span {
      font-size: 16px;
    }
  }

  // 笔刷样式
  .brush-wrapper {
    display: flex;
    border: 1px solid #e8eaec;
    border-radius: 6px;
    max-height: 500px;

    .panel-title {
      text-align: center;
      line-height: 40px;
      height: 40px;
      border-bottom: 1px solid #e8eaec;
      position: sticky;
      top: 0;
      background-color: #f8f8f9;
      z-index: 1;
      font-size: 12px;
    }

    .left-panel {
      border-right: 1px solid #e8eaec;
      width: 200px;
      position: relative;
      max-height: 100%;
      overflow: auto;

      /* 滚动槽 */
      &::-webkit-scrollbar {
        width: 3px;
        height: 3px;
      }
      &::-webkit-scrollbar-track {
        border-radius: 1.5px;
        background: rgba(0, 0, 0, 0.06);
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
      }
      /* 滚动条滑块 */
      &::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background: rgba(0, 0, 0, 0.12);
        -webkit-box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
      }
    }

    .brush-item {
      border-bottom: 1px solid #e8eaec;
      padding: 10px;
      height: 86px;
      cursor: pointer;
      background-color: #fff;
      transition: all 0.3s ease-in-out;
      position: relative;

      &:hover {
        background-color: #ebf7ff;
      }

      &:last-child {
        border: none;
      }

      &.active {
        background-color: #f0faff;
      }

      .brush-img {
        display: block;
        margin: 0 auto;
        height: 100%;
      }

      .brush-arrow {
        position: absolute;
        font-size: 30px;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }

      .line {
        background: #2d8cf0;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 2px;
        display: block;
        opacity: 0;
        transition: all 0.3s ease-in-out;

        &.active {
          opacity: 1;
        }
      }
    }

    .right-panel {
      flex: 1;
      position: relative;
      max-height: 100%;
      overflow: auto;

      /* 滚动槽 */
      &::-webkit-scrollbar {
        width: 3px;
        height: 3px;
      }
      &::-webkit-scrollbar-track {
        border-radius: 1.5px;
        background: rgba(0, 0, 0, 0.06);
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
      }
      /* 滚动条滑块 */
      &::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background: rgba(0, 0, 0, 0.12);
        -webkit-box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.color-img {
  height: 80px;
  padding: 10px 0;
}

.ivu-table-wrapper {
  border: 0;
  border-color: #e8eaec;
}

.ivu-table:before {
  content: "";
  width: 100%;
  height: 0px;
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 1;
}
.ivu-table:after {
  content: "";
  width: 0px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 3;
}

.ivu-tooltip {
  height: 100%;
  display: block;
}

.ivu-tooltip-rel {
  height: 100%;
  display: block;
}
</style>
