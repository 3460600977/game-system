<template>
  <div class="user-info">
    <div @click="toggleActions" class="user-name">
      <img
        class="user-avatar"
        :class="{'with-shadow': showActions}"
        style="width: 44px; height: 44px; margin-right:10px;"
        src="~@/assets/platform/avatar.png"
        alt="头像"
      />
      <span class="username">{{user.username}}</span>
    </div>
    <ul v-show="showActions" class="user-actions" :class="{'without-password' : !showChangePassword}">
      <!-- <div class="triangle"></div> -->
      <li @click="showUserChangeModal = true" class="user-action-item">
        <Icon type="md-person" />
        <span>个人信息</span>
      </li>
      <li v-if="showChangePassword" @click="showChangepasswordModal = true" class="user-action-item">
        <Icon type="md-key" />
        <span>密码修改</span>
      </li>
      <li @click="__logOut" class="user-action-item">
        <Icon type="md-log-out" />
        <span>退出登录</span>
      </li>
    </ul>
    <Modal class="platform-modal user-info-modal" v-model="showUserChangeModal">
      <div class="user-change-info">
        <h3 class="user-info-header-title">个人信息</h3>
        <div class="user-info">
          <span class="label">账 号</span>
          <span>：</span>
          <span class="value">{{user.username}}</span>
        </div>
        <div class="user-info">
          <span class="label">姓 名</span>
          <span>：</span>
          <span class="value">{{user.actualName}}</span>
        </div>
        <div class="user-info">
          <span class="label">职 位</span>
          <span>：</span>
          <span class="value">{{user.postName}}</span>
        </div>
        <div class="user-info">
          <span class="label">手机号码</span>
          <span>：</span>
          <span class="value">{{user.phone}}</span>
        </div>
        <div class="user-info">
          <span class="label">Email</span>
          <span>：</span>
          <span class="value">{{user.email}}</span>
        </div>
      </div>
      <div class="footer" slot="footer"></div>
    </Modal>
    <Modal class="platform-modal user-info-modal" v-model="showChangepasswordModal">
      <div class="user-change-info">
        <h3 class="user-info-header-title">修改密码</h3>
        <Form
          class="change-password-form"
          :model="changePasswordInput"
          ref="changePasswordForm"
          :rules="passwordRules"
        >
          <FormItem prop="password" label="现密码">
            <Input type="password" v-model="changePasswordInput.password" />
          </FormItem>
          <FormItem prop="newPassword" label="新密码">
            <Input type="password" v-model="changePasswordInput.newPassword" />
          </FormItem>
          <FormItem prop="confirmPassword" label="确认新密码">
            <Input type="password" v-model="changePasswordInput.confirmPassword" />
          </FormItem>
        </Form>
        <div class="buttons" style="margin-top: 10px;">
          <Button @click="changePwd" :loading="isChangingPassword" type="primary">修改密码</Button>
        </div>
      </div>
      <div class="footer" slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
// import { logOut } from '@/api/platformUser';
import { mapGetters, mapMutations } from 'vuex';
import { getUserInfo, updatePwd } from '@/api/user';

export default {
  props: {
    showChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const validatePasswordAndConfirmPassword = (rule, value, callback) => {
      if (value !== this.changePasswordInput.newPassword) {
        callback(new Error('新密码与确认密码不一致'));
      } else {
        callback();
      }
    };

    return {
      showActions: false,
      showUserChangeModal: false,
      showChangepasswordModal: false,
      changePasswordInput: {
        password: '',
        newPassword: '',
        confirmPassword: '',
      },
      passwordRules: {
        password: [
          { required: true, message: '现密码不能为空', trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          {
            type: 'string',
            min: 6,
            message: '密码必须大于等于6位',
            trigger: 'blur',
          },
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { validator: validatePasswordAndConfirmPassword, trigger: 'blur' },
        ],
      },
      isChangingPassword: false,
    };
  },
  mounted() {
    getUserInfo().then((res) => {
      this.setUser(res);
    });
  },
  methods: {
    __logOut() {
      window.location.href = `${window.g.baseUrl}/logout`;
      // logOut().then(() => {
      //   this.$Message.success('退出登录');
      //   window.location.href = window.g.loginPageUrl;
      // });
    },
    ...mapMutations({
      setUser: 'SET_USER',
    }),
    toggleActions() {
      this.showActions = !this.showActions;
    },
    closeUserChangeModal() {
      this.showUserChangeModal = false;
    },
    changePwd() {
      this.$refs.changePasswordForm.validate((valid) => {
        if (valid) {
          this.isChangingPassword = true;
          updatePwd(this.changePasswordInput)
            .then(() => {
              this.$Message.success('修改密码成功');
              this.isChangingPassword = false;
              this.showChangepasswordModal = false;
            })
            .catch(() => {
              this.isChangingPassword = false;
            });
        }
      });
    },
  },
  computed: {
    ...mapGetters(['userMenus', 'user']),
  },
};
</script>

<style lang="less">
.platform-modal {
  &.user-info-modal {
    .ivu-modal-footer {
      display: none;
    }
  }

  .ivu-modal-content {
    background-color: #30304c;
    border: 2px solid #50fffd;
    border-radius: 18px;
  }

  .change-password-form {
    width: 50%;
  }

  .ivu-modal-body {
    padding: 18px 0;
  }

  .user-change-info {
    display: flex;
    flex-direction: column;
    align-items: center;

    .ivu-form-item-label {
      color: #fff;
    }

    .user-info-header-title {
      font-size: 30px;
      color: #fff;
      padding-bottom: 15px;
      border-bottom: 2px solid #468392;
      width: 100%;
      text-align: center;
    }

    .user-info {
      width: 50%;
      margin-top: 10px;

      span {
        color: #fff;
        font-size: 16px;
      }

      .label {
        display: inline-block;
        width: 65px;
        text-align: justify;
        text-align-last: justify;
      }
    }
  }
}

.user-info {
  width: 200px;
  display: flex;
  align-items: center;
  position: relative;
  height: 44px;

  .user-avatar {
    transition: all 0.3s;
    border-radius: 50%;

    &.with-shadow {
      box-shadow: 0 0 3px 1px #50fffd;
    }
  }

  .user-name {
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 100%;
  }

  .user-actions {
    background-color: #30304c;
    position: absolute;
    left: -10px;
    bottom: -120px;
    list-style: none;
    border-radius: 6px;
    border: 2px solid #50fffd;

    &.without-password {
      bottom: -83px;
    }

    .user-action-item {
      cursor: pointer;
      padding: 5px 15px;
      border-bottom: 1px solid #50fffd;
      display: flex;
      align-items: center;
      font-size: 17px;

      span {
        margin-left: 10px;
        transition: all 0.3s;
        color: #9797a5;
        display: inline-block;
        height: 24.44px;
        line-height: 24.44px;
      }

      .ivu-icon {
        transition: all 0.3s;
        color: #9797a5;
      }

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        span,
        .ivu-icon {
          color: #fff;
        }
      }
    }
    .triangle {
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 7px solid #e5bf42;
    }
  }
}

.username {
  font-size: 14px;
  color: #fff;
  margin-right: 10px;
}
</style>
