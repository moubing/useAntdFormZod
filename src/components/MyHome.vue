<!-- ComplexForm.vue -->
<template>
  <div class="h-screen w-full flex items-center justify-center relative">
    <div class="p-6 border rounded-2xl w-full max-w-xl">
      <Form
        :model="form"
        ref="formRef"
        :wrapper-col="{ span: 16 }"
        :label-col="{ span: 8 }"
        name="complex_form"
        :rules="rules"
      >
        <!-- 文本输入 -->
        <FormItem label="用户名" name="username" >
          <Input v-model:value="form.username" placeholder="4-16位字符" />
        </FormItem>

        <!-- 密码输入 -->
        <FormItem label="密码" name="password">
          <InputPassword v-model:value="form.password" />
        </FormItem>

        <!-- 数字输入 -->
        <FormItem label="年龄" name="age">
          <InputNumber v-model:value="form.age" class="w-full" />
        </FormItem>

        <!-- 单选按钮 -->
        <FormItem label="性别" name="gender">
          <RadioGroup v-model:value="form.gender">
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
            <Radio value="other">其他</Radio>
          </RadioGroup>
        </FormItem>

        <!-- 多选框 -->
        <FormItem label="兴趣爱好" name="hobbies">
          <CheckboxGroup v-model:value="form.hobbies">
            <Checkbox value="sports">运动</Checkbox>
            <Checkbox value="music">音乐</Checkbox>
            <Checkbox value="reading">阅读</Checkbox>
            <Checkbox value="travel">旅行</Checkbox>
          </CheckboxGroup>
        </FormItem>

        <!-- 选择器 -->
        <FormItem label="城市" name="city">
          <Select v-model:value="form.city" placeholder="请选择城市">
            <SelectOption value="beijing">北京</SelectOption>
            <SelectOption value="shanghai">上海</SelectOption>
            <SelectOption value="guangzhou">广州</SelectOption>
            <SelectOption value="shenzhen">深圳</SelectOption>
          </Select>
        </FormItem>

        <!-- 日期选择 -->
        <FormItem label="出生日期" name="birthday">
          <DatePicker
            v-model:value="form.birthday"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </FormItem>

        <!-- 时间选择 -->
        <FormItem label="工作时间" name="workTime">
          <TimePicker
            v-model:value="form.workTime"
            style="width: 100%"
            format="HH:mm"
            value-format="HH:mm"
          />
        </FormItem>

        <!-- 开关 -->
        <FormItem label="是否接受条款" name="acceptTerms">
          <Switch v-model:checked="form.acceptTerms" />
        </FormItem>

        <!-- 滑动输入 -->
        <FormItem label="满意度" name="satisfaction">
          <Slider v-model:value="form.satisfaction" :marks="marks" />
        </FormItem>

        <!-- 评分 -->
        <FormItem label="产品评分" name="rating">
          <Rate v-model:value="form.rating" />
        </FormItem>

        <!-- 上传文件 -->
        <FormItem label="头像上传" name="avatar">
          <Upload
            v-model:file-list="form.avatar"
            list-type="picture-card"
            :before-upload="beforeUpload"
          >
            <div v-if="form.avatar.length < 1">
              <PlusOutlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </Upload>
        </FormItem>

        <!-- 富文本编辑器 -->
        <FormItem label="个人简介" name="bio">
          <Textarea v-model:value="form.bio" :rows="4" />
        </FormItem>

        <!-- 表单操作 -->
        <FormItem :wrapper-col="{ span: 16, offset: 8 }">
          <Button type="primary" @click="onSubmit">提交</Button>
          <Button style="margin-left: 10px" @click="resetForm">重置</Button>
        </FormItem>
      </Form>
    </div>

    <!-- 调试面板 -->
    <div class="fixed top-2 left-2 p-4 bg-gray-100 rounded-xl min-w-[300px] max-w-[400px] max-h-[300px] overflow-auto">
      <h3>表单数据</h3>
      <pre>{{ formStateString }}</pre>
    </div>
    <div class="fixed bottom-2 left-2 p-4 bg-gray-100 rounded-xl min-w-[300px] max-w-[400px] max-h-[500px] overflow-auto">
      <h3>校验规则</h3>
      <pre>{{ rulesString }}</pre>
    </div>
        <div class="fixed top-2 right-2 p-4 bg-gray-100 rounded-xl min-w-[300px] max-w-[400px] max-h-[300px] overflow-auto">
      <h3>校验错误</h3>
      <pre>{{ errorString }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Form, 
  FormItem, 
  Input, 
  InputPassword, 
  InputNumber, 
  Radio, 
  RadioGroup, 
  Checkbox, 
  CheckboxGroup, 
  Select, 
  SelectOption, 
  DatePicker, 
  TimePicker, 
  Switch, 
  Slider, 
  Rate, 
  Upload, 
  Button,
  message,
  Textarea
} from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { computed, ref } from 'vue';
import { z } from 'zod';
import { useAntdFormZod } from '../composable/useAntdFormZod';

const lastError = ref<any>(null);

const formSchema = z.object({
  username: z.string().min(4, '用户名至少4位').max(12, '用户名最多16位'),
  password: z.string().min(8, '密码至少8位').regex(/[A-Z]/, '必须包含大写字母'),
  age: z.number().min(18, '年龄必须≥18').max(99, '年龄必须≤99'),
  gender: z.enum(['male', 'female', 'other']),
  hobbies: z.array(z.string()).min(1, '至少选择一项爱好'),
  city: z.string().min(1, '请选择城市'),
  birthday: z.string().min(1, '请选择出生日期'),
  workTime: z.string().min(1, '请选择工作时间'),
  acceptTerms: z.boolean().refine(val => val, '必须接受条款'),
  satisfaction: z.number().min(50, '满意度至少50%'),
  rating: z.number().min(1, '请至少给1星'),
  avatar: z.array(z.any()).min(1, '至少上传一张头像'),
  bio: z.string().max(500, '简介最多500字')
});

type formType = z.infer<typeof formSchema>

const { form, rules } = useAntdFormZod<formType>(formSchema, {
  username: '',
  password: '',
  age: 18,
  gender: 'male',
  hobbies: [],
  city: '',
  birthday: '',
  workTime: '',
  acceptTerms: false,
  satisfaction: 50,
  rating: 0,
  avatar: [],
  bio: ''
});
const formRef = ref();

const marks = {
  0: '0%',
  50: '50%',
  100: '100%'
};

const beforeUpload = (file: File) => {
  const isImage = file.type.includes('image');
  if (!isImage) {
    message.error('只能上传图片文件');
    return false;
  }
  return true;
};

const onSubmit = () => {
  formRef.value?.validateFields()
    .then(() => {
      lastError.value = null; // 清空错误
      message.success('提交成功!');
      console.log('表单数据:', form.value);
    })
    .catch((error: any) => {
      lastError.value = error; // 保存错误
      console.log('校验失败:', error);
    });
};

// 格式化错误显示
const errorString = computed(() => {
  if (!lastError.value) return '无错误';
  
  // 结构化错误信息
  return JSON.stringify({
    errorCount: lastError.value.errorFields?.length || 0,
    errors: lastError.value.errorFields?.map((field: any) => ({
      field: field.name.join('.'),
      messages: field.errors,
      warnings: field.warnings
    })),
    formValues: lastError.value.values
  }, null, 2);
});

const resetForm = () => {
  formRef.value?.resetFields();
  lastError.value = null
};

const formStateString = computed(() => JSON.stringify(form.value, null, 2));
const rulesString = computed(() => JSON.stringify(rules, null, 2));
</script>

<style>
.ant-form-item {
  margin-bottom: 16px;
}
</style>