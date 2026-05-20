<template>
  <div class="relative w-full min-h-screen flex items-center justify-center p-4 lg:p-10 overflow-hidden" style="background: #0A1628;">
    <!-- 全屏背景图 -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('');"
    />

    <!-- 内容：桌面端左右并排，平板/手机端仅卡片 -->
    <div class="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full max-w-[1200px] gap-8 lg:gap-12">
      <!-- 左侧装饰图 -- 仅桌面端显示 -->
      <div class="hidden lg:block flex-1">
        <img
          src=""
          alt=""
          class="w-full max-w-[700px] object-contain mx-auto"
        />
      </div>

      <!-- 登录卡片 -->
      <div
        class="w-full max-w-[420px] flex-shrink-0"
        style="
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          filter: drop-shadow(0px 10px 20px rgba(0, 0, 0, 0.3));
          padding: 48px 40px;
        "
      >
        <!-- 动态面板内容区 -->
        <div class="relative w-full">
          <!-- 标题 -->
          <div class="text-center mb-6">
            <h1
              class="font-semibold"
              style="
                font-family: 'Microsoft YaHei', sans-serif;
                font-size: 28px;
                color: #1A365D;
                line-height: 37px;
              "
            >
              管理能源管理系统
            </h1>
          </div>

          <!-- 副标题 -->
          <div class="text-center mb-8">
            <p
              style="
                font-family: 'Microsoft YaHei', sans-serif;
                font-size: 14px;
                color: #666666;
              "
            >
              智慧能源 · 安全高效
            </p>
          </div>

          <!-- 表单内容 -->
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="auto"
          >
            <div style="margin-top: 40px;">
              <!-- 账号标签 -->
              <div
                style="
                  font-family: 'Microsoft YaHei', sans-serif;
                  font-weight: 500;
                  font-size: 14px;
                  color: #333;
                  margin-bottom: 4px;
                "
              >
                账号
              </div>
              <!-- 账号输入框 -->
              <el-input
                v-model="form.username"
                placeholder="请输入账号"
                size="large"
                class="login-input"
                style="margin-bottom: 20px;"
              />

              <!-- 密码标签 -->
              <div
                style="
                  font-family: 'Microsoft YaHei', sans-serif;
                  font-weight: 500;
                  font-size: 14px;
                  color: #333;
                  margin-bottom: 4px;
                "
              >
                密码
              </div>
              <!-- 密码输入框 -->
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                class="login-input"
                style="margin-bottom: 16px;"
              />

              <!-- 协议勾选 -->
              <div class="flex items-start gap-2 py-2" style="margin-top: 8px;">
                <el-checkbox v-model="form.agreed" class="agreement-checkbox">
                  <span style="font-size: 13px; color: #666;">
                    我已阅读并同意
                    <span style="font-size: 14px; color: #0000FF; cursor: pointer;"> 服务协议 </span>
                    和
                    <span style="font-size: 14px; color: #0000FF; cursor: pointer;"> 隐私协议</span>
                    。
                  </span>
                </el-checkbox>
              </div>

              <!-- 登录按钮 -->
              <div
                class="relative w-full"
                :class="loading ? 'pointer-events-none opacity-60' : 'cursor-pointer'"
                style="
                  height: 47px;
                  margin-top: 24px;
                  background-image: url('/images/登录/u11_div.png');
                  background-repeat: no-repeat;
                  background-size: 100% 47px;
                  border-radius: 6px;
                "
                @click="handleLogin"
              >
                <div
                  class="absolute inset-0 flex items-center justify-center"
                  style="
                    font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
                    font-weight: 700;
                    font-size: 16px;
                    color: #FFFFFF;
                  "
                >
                  {{ loading ? '登录中...' : '登录' }}
                </div>
              </div>
            </div>
          </el-form>

          <!-- 底部信息 -->
          <div class="mt-8 text-center space-y-2">
            <p style="font-size: 12px; color: #666666;">
              © 2026 园区能源管理中心 版本 2.0.0
            </p>
            <p style="font-size: 12px; color: #999999;">
              技术支持：400-888-9999
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: 'admin123',
  agreed: false
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

/**
 * 登录表单提交
 * 先执行表单校验，校验通过后调用 userStore.login 进行登录，
 * 成功后跳转到首页
 */
const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (!form.agreed) {
      ElMessage.warning('请先阅读并同意服务协议和隐私协议')
      return
    }
    loading.value = true
    const success = await userStore.login({
      username: form.username,
      password: form.password
    })
    loading.value = false
    if (success) {
      router.push('/')
    } else {
      ElMessage.error('账号或密码错误')
    }
  })
}
</script>

<style scoped>
:deep(.login-input .el-input__wrapper) {
  background: #f5f7fa;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  border-radius: 6px;
  padding: 4px 15px;
}

:deep(.login-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #02A7F0 inset;
}

:deep(.agreement-checkbox .el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #0000FF;
  border-color: #0000FF;
}
</style>
