<template>
  <div class="home">
    <div class="section-wrapper">
      <h2 class="section-title">涂鸦列表</h2>
      <div class="controller-wrapper">
        <div class="form-item">
          <span class="form-label">日期</span>
          <DatePicker
            placeholder="选择日期范围，默认不限制"
            v-model="date"
            @on-change="onFilterChange"
            type="daterange"
            class="form-input"
          ></DatePicker>
        </div>
        <div class="form-item">
          <span class="form-label">主题</span>
          <Select
            filterable
            @on-change="onFilterChange"
            v-model="filters.themeCode"
            class="form-input"
          >
            <Option value="all">全选</Option>
            <Option :value="item.id" v-for="item in themes" :key="item.id">{{
              item.nameCh
            }}</Option>
          </Select>
        </div>
        <!-- <div class="form-item">
          <span class="form-label">解锁类型：</span>
          <Select @on-change="onFilterChange" class="form-input"></Select>
        </div> -->
        <div class="form-item">
          <span class="form-label">国家</span>
          <Input
            @on-change="onInputChange"
            class="form-input"
            v-model="filters.country"
            placeholder="输入国家"
          />
        </div>
        <div class="form-item">
          <span class="form-label">平台</span>
          <Select
            filterable
            v-model="filters.platform"
            @on-change="onFilterChange"
            class="form-input"
          >
            <Option value="all">全选</Option>
            <Option :value="item.value" v-for="item in platforms" :key="item.value">{{
              item.name
            }}</Option>
          </Select>
        </div>
        <div class="form-item">
          <span class="form-label">语言</span>
          <Select v-model="filters.language" @on-change="onFilterChange" class="form-input">
            <Option value="all">全选</Option>
            <Option :value="item.value" v-for="item in languages" :key="item.value">{{
              item.name
            }}</Option>
          </Select>
        </div>
        <div class="form-item">
          <span class="form-label">渠道</span>
          <Select
            filterable
            v-model="filters.channel"
            @on-change="onFilterChange"
            class="form-input"
          >
            <Option value="all">全选</Option>
            <Option :value="item.channelId" v-for="item in channels" :key="item.channelId">{{
              item.channelName
            }}</Option>
          </Select>
        </div>
        <div class="form-item-select-input">
          <span class="form-label">设备ID：</span>
          <Input
            @on-change="onInputChange"
            v-model="filters.deviceCode"
            placeholder="输入ID查询"
            class="form-input"
          />

          <span style="margin-left: 30px;" class="form-label">图案ID：</span>
          <Input
            @on-change="onInputChange"
            v-model="filters.patternCode"
            placeholder="输入ID查询"
            class="form-input"
          />
        </div>
      </div>
      <Table :loading="tableLoading" :data="data" :columns="columns">
        <template slot-scope="{ row }" slot="action">
          <ButtonGroup>
            <Button @click="$router.push(`/draw/${row.imgId}`)" type="primary">查看详情</Button>
            <Button v-if="showDeleteButton" @click="deleteItem(row)" type="error">删除</Button>
          </ButtonGroup>
        </template>
      </Table>
      <div class="page-wrapper">
        <Page @on-change="onPageChange" :total="total" show-total :current="page" />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import {
  getDrawingList, getFilterOptions, getThemeOptions, getChannels, deleteDrawingItem,
} from '@/api/color';
import { getUserAuthInfo } from '@/api/user';
import { debounce } from '@/common/js/util';

export default {
  name: 'drawList',
  data() {
    return {
      showDeleteButton: false,
      page: 1, // 当前页面
      total: 0,
      init: false,
      data: [], // 列表数据
      // 筛选框可选数据
      themes: [], // 可选的主题数据
      channels: [], // 可选的渠道数据
      platforms: [], // 可选的平台
      languages: [], // 可选的语言
      date: [], // 日期的选择
      tableLoading: false,
      lockTypeMap: {},
      filters: {
        // 获取列表数据的传参
        country: '',
        sortField: '',
        sortOrder: '',
        startTime: '',
        endTime: '',
        lockType: '',
        channel: 'all',
        language: 'all',
        platform: 'all',
        themeCode: 'all',
        patternCode: '',
        deviceCode: '',
      },
      columns: [
        {
          title: '图片',
          render: (h, params) => h('img', {
            attrs: { src: params.row.imgPath, style: 'width: 100%; padding: 10px 0;' },
            class: 'drawing-image',
          }),
          align: 'center',
        },
        {
          title: '完成日期',
          key: 'completeTime',
          align: 'center',
        },
        {
          title: '主题',
          key: 'themeName',
          align: 'center',
        },
        {
          title: '国家',
          key: 'country',
          align: 'center',
        },
        {
          title: '设备ID',
          key: 'deviceCode',
          align: 'center',
        },
        {
          title: '图案ID',
          key: 'patternCode',
          align: 'center',
        },
        {
          title: '解锁类型',
          key: 'patternLockType',
          render: (h, params) => h('span', this.lockTypeMap[params.row.patternLockType] || ''),
          align: 'center',
        },
        {
          title: '渠道',
          key: 'channel',
          align: 'center',
        },
        {
          title: '操作',
          slot: 'action',
          align: 'center',
          minWidth: 100,
        },
      ],
    };
  },
  mounted() {
    this.checkDeleteAuth();
    const { deviceCode, patternCode } = this.$route.query;
    if (deviceCode) this.filters.deviceCode = deviceCode;
    if (patternCode) this.filters.patternCode = patternCode;
    this.initDate();
    this.getFilterOptions();
    this.getData();
  },
  methods: {
    checkDeleteAuth() {
      getUserAuthInfo('/color', 'DELETE').then((res) => {
        this.showDeleteButton = res;
      });
    },
    initDate() {
      const startDay = new Date();
      // const yesterday = new Date(curryTime - 1000 * 60 * 60 * 24);
      const endDay = new Date(startDay.getTime() + 1000 * 60 * 60 * 24);
      this.date = [startDay, endDay];
    },
    getData() {
      this.tableLoading = true;
      if (this.date && this.date[0] && this.date[1]) {
        this.filters.startTime = moment(this.date[0]).format('YYYY-MM-DD');
        this.filters.endTime = moment(this.date[1]).format('YYYY-MM-DD');
      } else {
        this.filters.startTime = '';
        this.filters.endTime = '';
      }
      const queryParams = Object.assign(JSON.parse(JSON.stringify(this.filters)), {
        page: this.page,
        themeCode: this.filters.themeCode === 'all' ? '' : this.filters.themeCode,
        channel: this.filters.channel === 'all' ? '' : this.filters.channel,
        language: this.filters.language === 'all' ? '' : this.filters.language,
        platform: this.filters.platform === 'all' ? '' : this.filters.platform,
      });
      getDrawingList(queryParams)
        .then((res) => {
          this.data = res.list;
          this.total = res.total;
          this.tableLoading = false;
        })
        .catch(() => {
          this.tableLoading = false;
        });
    },
    getFilterOptions() {
      getFilterOptions('lockType').then((res) => {
        res.forEach((item) => {
          this.lockTypeMap[item.value] = item.name;
        });
      });
      getThemeOptions().then((res) => {
        this.themes = res;
      });
      getFilterOptions('language').then((res) => {
        this.languages = res;
      });
      getFilterOptions('platform').then((res) => {
        this.platforms = res;
      });
      getChannels().then((res) => {
        this.channels = res;
      });
    },
    onInputChange: debounce(function () {
      this.page = 1;
      this.getData();
    }, 500),
    onFilterChange() {
      this.page = 1;
      this.getData();
    },
    onPageChange(page) {
      this.page = page;
      this.getData();
    },
    deleteItem(item) {
      this.$Modal.confirm({
        title: '删除涂鸦',
        content: '<p>确定删除该涂鸦？</p>',
        loading: true,
        onOk: () => {
          deleteDrawingItem(item.imgId).then(() => {
            this.$Message.success('删除成功！');
            this.getData();
            this.$Modal.remove();
          }).catch(() => {
            this.$Modal.remove();
          });
        },
      });
    },
  },
  watch: {
    $route(to) {
      // console.log('???');
      if (to.name === 'home') {
        const { deviceCode, patternCode } = to.query;
        this.filters.deviceCode = deviceCode || '';
        this.filters.patternCode = patternCode || '';
        if (deviceCode || patternCode) {
          this.onFilterChange();
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.home {
  .form-item-select-input {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    align-items: flex-end;

    .form-label {
      line-height: 30px;
    }

    .form-input {
      max-width: 130px !important;
    }
  }

  .drawing-image {
    height: 100px;
    width: 100px;
  }
}
</style>
