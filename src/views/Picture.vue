<template>
  <div class="picture">
    <Spin class="picture-spin" fix v-if="pageLoading">
      <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
      <div>上传中...</div>
    </Spin>
    <Modal title="导入图案数据" footer-hide v-model="showImportModal">
      <Spin fix v-if="importModalLoading"></Spin>
      <Form :label-width="100" ref="form">
        <FormItem label="是否覆盖原数据">
          <RadioGroup v-model="importType">
            <Radio label="否" value="part"></Radio>
            <Radio label="是" value="all"></Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="上传文件">
          <Upload action="." :before-upload="onExcelFileUpload" type="drag">
            <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
              <p>拖动或者点击上传excel文件</p>
            </div>
          </Upload>
        </FormItem>
      </Form>
    </Modal>
    <Modal
      @on-visible-change="onFormModalVisibleChange"
      :title="isEdit ? '编辑图案' : '新增图案'"
      v-model="showFormModal"
    >
      <Form :rules="formRules" :model="formData" :label-width="100" ref="form">
        <FormItem label="图案主题" prop="themeId">
          <Select filterable v-model="formData.themeId" class="form-input">
            <Option :value="item.id" v-for="item in themes" :key="item.id">{{
              item.nameCh
            }}</Option>
          </Select>
        </FormItem>
        <FormItem label="图片文件" prop="patternImgShowPath">
          <Upload action="." :before-upload="onIconFileSelected" type="drag">
            <div v-if="!formData.patternImgShowPath" style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
              <p>拖动或者点击选择图片文件</p>
            </div>
            <img
              v-if="formData.patternImgShowPath"
              :src="formData.patternImgShowPath"
              class="upload-img"
            />
          </Upload>
        </FormItem>
        <!-- <FormItem label="unity文件" prop="unityFileName">
          <Upload action="." :before-upload="onUnityFileSelected" type="drag">
            <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
              <p>拖动或者点击选择unity文件</p>
            </div>
          </Upload>
          <span v-if="formData.unityFileName">
            已选择文件：<a>{{ formData.unityFileName }}</a>
          </span>
        </FormItem> -->
      </Form>
      <template slot="footer">
        <Button @click="showFormModal = false">取消</Button>
        <Button :loading="modalLoading" @click="onFormSubmit" type="primary">提交</Button>
      </template>
    </Modal>
    <div class="section-wrapper">
      <h2 class="section-title">图案列表</h2>
      <div class="controller-wrapper">
        <div class="form-item">
          <span class="form-label">主题</span>
          <Select
            filterable
            @on-change="onFilterChange"
            v-model="filters.themeId"
            class="form-input"
          >
            <Option value="all">全选</Option>
            <Option :value="item.id" v-for="item in themes" :key="item.id">{{
              item.nameCh
            }}</Option>
          </Select>
        </div>
        <div class="form-item">
          <span class="form-label">图案ID</span>
          <Input
            @on-change="onInputChange"
            v-model="filters.id"
            placeholder="输入ID查询"
            class="form-input"
          />
        </div>
        <div class="form-item-select-input">
          <Button @click="showImportModal = true" type="success" style="margin-right: 10px;"
            >导入图案数据</Button
          >
          <Upload
            multiple
            style="margin-right: 10px;"
            :before-upload="debouncedOnMultiIconFilesUpload"
            action="."
            accept="image/*"
          >
            <Button type="primary">批量上传图片</Button>
          </Upload>
          <Upload
            multiple
            style="margin-right: 10px;"
            :before-upload="onMultiUnityFilesUpload"
            action="."
            accept=".zip"
          >
            <Button type="primary">上传AB包</Button>
          </Upload>
          <Button @click="newPicture" type="primary">新建图案</Button>
        </div>
      </div>
      <Table
        @on-sort-change="onTableSortChange"
        :loading="tableLoading"
        :data="data"
        :columns="columns"
      >
        <template slot-scope="{ row }" slot="action">
          <ButtonGroup>
            <Button @click="$router.replace(`/?patternCode=${row.id}`)">查看</Button>
            <Button @click="editPicture(row)" type="primary">修改</Button>
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
import { getThemeOptions } from '@/api/color';
import {
  getPictureList,
  deletePicture,
  newPicture,
  updatePicture,
  uploadExcelFile,
  uploadMultiFiles,
  uploadZipFile,
} from '@/api/picture';
import { getUserAuthInfo } from '@/api/user';
import { debounce } from '@/common/js/util';

let multiFiles = [];

function filesDebounce(fun, delay) {
  multiFiles = [];
  return function debouncedFunc(file) {
    const that = this;
    const _args = file;
    multiFiles.push(file);
    clearTimeout(fun.id);
    fun.id = setTimeout(() => {
      fun.call(that, _args);
    }, delay);
    return false;
  };
}

export default {
  data() {
    return {
      pageLoading: false,
      showDeleteButton: false,
      page: 1,
      total: 0,
      tableLoading: false,
      themes: [],
      filters: {
        id: '',
        themeId: 'all',
      },
      data: [],
      // 图案ID 图案类型 图标 数量 操作（查看、修改、删除）
      columns: [
        {
          title: '图案ID',
          key: 'id',
          align: 'center',
          sortable: 'custom',
        },
        {
          title: '图案主题',
          key: 'themeId',
          align: 'center',
          render: (h, params) => h('span', this.themeIdNameMap[params.row.themeId]),
        },
        {
          title: '图标',
          key: 'icon',
          align: 'center',
          render: (h, params) => h('img', {
            attrs: { src: params.row.path, style: 'width: 90px; padding: 10px 0;' },
            class: 'drawing-image',
          }),
        },
        {
          title: '图标名称',
          key: 'iconName',
          align: 'center',
        },
        {
          title: '数量',
          key: 'num',
          align: 'center',
          render: (h, params) => h('span', params.row.num || 0),
          sortable: 'custom',
        },
        {
          title: '操作',
          slot: 'action',
          align: 'center',
        },
      ],
      isEdit: false,
      showFormModal: false,
      modalLoading: false,
      formRules: {
        themeId: [{ required: true, message: '此项为必选项' }],
        patternImgShowPath: [{ required: true, message: '请上传icon图片' }],
        unityFileName: [{ required: true, message: '请上传unity文件' }],
      },
      formData: {
        themeId: '',
        patternImg: '',
        unityFile: '',
        iconName: '',
      },
      // 导入modal
      showImportModal: false,
      importModalLoading: false,
      importType: '否',
    };
  },
  mounted() {
    this.checkDeleteAuth();
    getThemeOptions().then((res) => {
      this.themes = res;
      // 制作图案id到图案名称的映射
      this.themeIdNameMap = {};
      res.forEach((item) => {
        this.themeIdNameMap[item.id] = item.nameCh;
      });
    });
    this.getData();
  },
  methods: {
    checkDeleteAuth() {
      getUserAuthInfo('/pattern/delete', 'DELETE').then((res) => {
        this.showDeleteButton = res;
      });
    },
    getData(sortField = '', sortOrder = '') {
      this.tableLoading = true;
      const queryParams = Object.assign(JSON.parse(JSON.stringify(this.filters)), {
        page: this.page,
        themeId: this.filters.themeId === 'all' ? '' : this.filters.themeId,
      });
      if (sortField && sortOrder) {
        queryParams.sortField = sortField;
        queryParams.sortOrder = sortOrder;
      }
      getPictureList(queryParams)
        .then((res) => {
          this.data = res.list;
          this.total = res.total;
          this.tableLoading = false;
        })
        .catch(() => {
          this.tableLoading = false;
        });
    },
    onInputChange: debounce(function onInputChange() {
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
    onTableSortChange(sortData) {
      const { key, order } = sortData;
      this.page = 1;
      this.getData(key, order);
    },
    deleteItem(item) {
      this.$Modal.confirm({
        title: '删除图案',
        content: '<p>确定删除该图案？</p>',
        loading: true,
        onOk: () => {
          deletePicture(item.id)
            .then(() => {
              this.$Message.success('删除成功！');
              this.getData();
              this.$Modal.remove();
            })
            .catch(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    editPicture(row) {
      this.isEdit = true;
      this.formData = {
        id: row.id,
        themeId: row.themeId,
        patternImg: row.path,
        patternImgShowPath: row.path, // 用于展示
        unityFile: row.unityPath,
        unityFileName: row.unityPath, // 用于展示
        iconName: row.iconName,
      };
      this.showFormModal = true;
    },
    newPicture() {
      this.isEdit = false;
      this.formData = {
        themeId: '',
        patternImg: '',
        patternImgShowPath: '',
        unityFile: '',
        unityFileName: '',
        iconName: '',
      };
      this.showFormModal = true;
    },
    onFormSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.modalLoading = true;
          const postParams = {
            themeId: this.formData.themeId,
            // patternImg: this.formData.patternImg,
            // unityFile: this.formData.unityFile,
            iconName: this.formData.iconName,
          };
          if (this.formData.id) {
            postParams.id = this.formData.id;
          }
          if (typeof this.formData.patternImg === 'object') {
            postParams.patternImg = this.formData.patternImg;
          }
          if (this.isEdit) {
            updatePicture(postParams)
              .then(() => {
                this.$Message.success('编辑成功');
                this.modalLoading = false;
                this.getData();
              })
              .catch(() => {
                this.modalLoading = false;
              });
          } else {
            newPicture(postParams)
              .then(() => {
                this.$Message.success('新增成功');
                this.modalLoading = false;
                this.getData();
              })
              .catch(() => {
                this.modalLoading = false;
              });
          }
        }
      });
    },
    onExcelFileUpload(file) {
      this.importModalLoading = true;
      uploadExcelFile(file, this.importType)
        .then(() => {
          this.$Message.success('导入成功');
          this.importModalLoading = false;
          this.page = 1;
          this.getData();
        })
        .catch(() => {
          this.importModalLoading = false;
        });
      return false;
    },
    onIconFileSelected(file) {
      this.formData.iconName = file.name;
      this.formData.patternImg = file;
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        this.formData.patternImgShowPath = event.target.result;
      };
      fileReader.readAsDataURL(file);
      return false;
    },
    onUnityFileSelectmled(file) {
      this.formData.unityFileName = file.name;
      this.formData.unityFile = file;
      return false;
    },
    onFormModalVisibleChange(visible) {
      if (!visible) {
        setTimeout(() => {
          this.$refs.form.resetFields();
        }, 300);
      }
    },
    onMultiUnityFilesUpload(file) {
      this.pageLoading = true;
      uploadZipFile(file)
        .then(() => {
          this.$Message.success('上传成功');
          this.pageLoading = false;
          this.page = 1;
          this.getData();
        })
        .catch(() => {
          this.pageLoading = false;
        });
      return false;
    },
    /**
     * 已弃用
     */
    // debouncedOnMultiUnityFilesUpload: filesDebounce(function onMultiUnityFilesUpload() {
    //   this.pageLoading = true;
    //   uploadMultiFiles(multiFiles, 'unity')
    //     .then(() => {
    //       this.$Message.success('上传成功');
    //       this.pageLoading = false;
    //       this.page = 1;
    //       this.getData();
    //     })
    //     .catch(() => {
    //       this.pageLoading = false;
    //     });
    //   return false;
    // }, 200),
    debouncedOnMultiIconFilesUpload: filesDebounce(function onMultiIconFilesUpload() {
      this.pageLoading = true;
      uploadMultiFiles(multiFiles, 'img')
        .then(() => {
          this.$Message.success('上传成功');
          this.pageLoading = false;
          this.page = 1;
          this.getData();
        })
        .catch(() => {
          this.pageLoading = false;
        });
      return false;
    }, 200),
  },
};
</script>

<style lang="less">
// .picture {
//   position: relative;
// }

.demo-spin-icon-load {
  font-size: 48px!important;
  margin-bottom: 10px;
  animation: ani-demo-spin 1s linear infinite;
}

.picture-spin {
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  position: fixed;
}

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
  width: 90px;
}

.ivu-upload-list {
  display: none;
}
</style>
