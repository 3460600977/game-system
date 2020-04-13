<template>
  <div id="app" class="layout">
    <Layout>
      <Header class="header">
        <div class="layout-logo">
          <a class="layout-logo-img" :href="collectionUrl">
            <img src="./assets/logo.png" alt="利比科技" />
          </a>
        </div>
        <user-info></user-info>
      </Header>
      <Layout :style="{ minHeight: '100vh' }">
        <Sider
          :style="{ background: '#515a6e' }"
          class="slider"
          :collapsed-width="78"
          v-model="isCollapsed"
        >
          <Menu theme="dark" :active-name="activeTab" width="auto" :class="menuitemClasses">
            <MenuItem
              v-for="menuItem in menus"
              :key="menuItem.name"
              :to="menuItem.url"
              :name="menuItem.url"
            >
              <Icon :type="menuItem.icon"></Icon>
              <span>{{ menuItem.title }}</span>
            </MenuItem>
          </Menu>
        </Sider>
        <Layout :class="{ collapse: isCollapsed }" class="content">
          <Breadcrumb class="breadcrumb-wrapper">
            <BreadcrumbItem v-for="item in breadCrumbs" :to="item.url" :key="item.url">{{
              item.title
            }}</BreadcrumbItem>
          </Breadcrumb>
          <Content class="content-wrapper">
            <keep-alive include="drawList">
              <router-view :isCollapsed="isCollapsed" @expand="expandSlider"></router-view>
            </keep-alive>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  </div>
</template>

<script>
import { setAxiosInterceptors } from '@/api/axios';
import UserInfo from '@/components/UserInfo.vue';

export default {
  components: {
    UserInfo,
  },
  data() {
    return {
      collectionUrl: window.g.collectionUrl,
      // 左侧导航栏是否折叠
      isCollapsed: false,
      // 左侧显示的菜单，后期做成ajax获取
      menus: [
        {
          url: '/draw',
          icon: 'ios-stats',
          name: '1-1',
          title: '首页',
        },
        {
          url: '/picture',
          icon: 'md-image',
          name: '1-2',
          title: '图案列表',
        },
        // {
        //   url: '/permission',
        //   icon: 'ios-eye',
        //   name: '1-3',
        //   title: '权限管理',
        // },
        // {
        //   url: '/log',
        //   icon: 'ios-calendar',
        //   name: '1-4',
        //   title: '操作日志',
        // },
      ],
      activeMenuItem: '/',
    };
  },
  created() {
    setAxiosInterceptors(this);
  },
  mounted() {
    // APP全局信息
  },
  methods: {
    collapseSlider() {
      this.isCollapsed = true;
    },
    expandSlider() {
      this.isCollapsed = false;
    },
  },
  computed: {
    // 左侧导航栏的收缩动效
    menuitemClasses() {
      return ['menu-item', this.isCollapsed ? 'collapsed-menu' : ''];
    },
    // 用于左侧导航栏的高亮
    activeTab() {
      const routePathArr = this.$route.path.split('/');
      const parentRoute = routePathArr[1];
      return `/${parentRoute}`;
    },
    // 面包屑导航的数组
    breadCrumbs() {
      const { meta, fullPath } = this.$route;
      const currentBreadcrumb = { title: meta.title, url: fullPath };
      if (meta.parents) {
        const routeArr = [];
        meta.parents.forEach((item) => {
          routeArr.push({ title: item.title, url: item.path });
        });
        routeArr.push(currentBreadcrumb);
        return routeArr;
      }
      return [currentBreadcrumb];
    },
  },
};
</script>

<style lang="less">
@import "./my-theme/index.less";
@import "~@/common/style/common.less";

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.no-message {
  text-align: center;
  padding: 20px 0;
  font-size: 16px;
}

.layout {
  background: #f5f7f9;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.layout-logo {
  height: 100%;
  border-radius: 3px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 30px;
}

.layout-nav {
  width: 420px;
  margin: 0 auto;
  margin-right: 20px;
}

.layout-logo-img {
  width: 110px;
  line-height: 100%;
  padding: 0 10px;

  img {
    width: 100%;
    height: 100%;
  }
}

.layout-con {
  height: 100%;
  width: 100%;
}

.menu-item span {
  display: inline-block;
  overflow: hidden;
  width: 69px;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  transition: width 0.2s ease 0.2s;
}

.menu-item i {
  transform: translateX(0px);
  transition: font-size 0.2s ease, transform 0.2s ease;
  vertical-align: middle;
  font-size: 16px;
}

.collapsed-menu span {
  width: 0px;
  transition: width 0.2s ease;
}

.collapsed-menu i {
  transform: translateX(5px);
  transition: font-size 0.2s ease 0.2s, transform 0.2s ease 0.2s;
  vertical-align: middle;
  font-size: 22px;
}

.breadcrumb-wrapper {
  padding: 24px;
  padding-bottom: 0;
}

.content-wrapper {
  padding: 24px;
  min-height: 280px;
  background-color: #f5f7f9;
}

#app {
  .header {
    position: fixed;
    width: 100vw;
    z-index: 2;
    background-color: #515a6e;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }

  .slider {
    position: fixed;
    height: 100vh;
    padding-top: 64px;
    box-sizing: border-box;
  }

  .content {
    margin-left: 200px;
    margin-top: 64px;
    transition: all 0.3s;

    &.collapse {
      margin-left: 78px;
    }
  }
}
</style>
