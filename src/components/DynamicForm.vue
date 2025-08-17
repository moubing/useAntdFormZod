<template>
  <div class="flex items-center justify-center h-screen w-full">
    <div
      class="w-[1000px] max-h-[600px] rounded-lg shadow-2xl p-6 bg-gray-100 outline-2 outline-dashed overflow-auto"
    >
      <Form
        ref="formRef"
        :model="form"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        :rules="rules"
      >
        <!-- 第一行：基本信息 -->
        <Row :gutter="24">
          <Col :span="8">
            <FormItem label="假期名称" name="holidayName">
              <Input v-model:value="form.holidayName" />
            </FormItem>
          </Col>
          <Col :span="8">
            <FormItem label="使用范围" name="useRange">
              <Select v-model:value="form.useRange" mode="multiple"  placeholder="请选择">
                <SelectOption value="九讯云">九讯云</SelectOption>
                <SelectOption value="我的店">我的店</SelectOption>
                <SelectOption value="你的店">你的店</SelectOption>
                <SelectOption value="他的店">他的店</SelectOption>
              </Select>
            </FormItem>
          </Col>
          <Col :span="8">
            <FormItem label="请假单位" name="leaveUnit">
              <Select v-model:value="form.leaveUnit">
                <SelectOption value="按天请假">按天请假</SelectOption>
                <SelectOption value="按小时请假">按小时请假</SelectOption>
              </Select>
            </FormItem>
          </Col>
        </Row>

        <!-- 第二行：单选按钮组 -->
        <Row :gutter="24">
          <Col :span="8">
            <FormItem label="是否带薪" name="isPaidLeave">
              <RadioGroup v-model:value="form.isPaidLeave">
                <Radio :value="true">是</Radio>
                <Radio :value="false">否</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col :span="8">
            <FormItem label="是否影响全勤" name="effectFull">
              <RadioGroup v-model:value="form.effectFull">
                <Radio :value="true">是</Radio>
                <Radio :value="false">否</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="24">
          <Col :span="8">
            <FormItem label="扣款方式" name="deductionType">
              <RadioGroup v-model:value="form.deductionType">
                <Radio value="基础扣款">基础扣款</Radio>
                <Radio value="阶梯扣款">阶梯扣款</Radio>
                <Radio value="分段扣款">分段扣款</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>

        <!-- 计算规则 -->
        <Row :gutter="24">
          <Col :span="8">
            <FormItem label="计算规则" name="calculateRule">
              <Select v-model:value="form.calculateRule" style="width: 100%">
                <SelectOption value="按请假时长">按请假时长</SelectOption>
                <SelectOption value="按请假次数">按请假次数</SelectOption>
              </Select>
            </FormItem>
          </Col>
        </Row>

        <!-- 动态表格部分 -->

        <div
          class="ml-[100px] flex itmes-center gap-4"
          v-for="(leaveGroup, index) in form.leaveGroups"
          :key="index"
        >
          <FormItem :name="['leaveGroups', index, 'rangeStart']" :rules="rules['leaveGroups[0].rangeStart']">
            <InputNumber
              class="!w-[100px]"
              v-model:value="leaveGroup.rangeStart"
              
            />
          </FormItem>
          <FormItem :name="['leaveGroups', index, 'rangeEnd']" :rules="rules['leaveGroups[0].rangeEnd']">
            <InputNumber
              class="ml-[20px]"
              v-model:value="leaveGroup.rangeEnd"
              

            />
          </FormItem>

          <FormItem :name="['leaveGroups', index, 'amoutType']" :rules="rules['leaveGroups[0].amoutType']">
            <Select class="!w-[140px]" v-model:value="leaveGroup.amountType" >
              <SelectOption value="应发工资总额">应发工资总额</SelectOption>
              <SelectOption value="基础工资总额">基础工资总额</SelectOption>
              <SelectOption value="固定工资">固定工资</SelectOption>
            </Select>
          </FormItem>

          <FormItem :name="['leaveGroups', index, 'value']" :rules="rules['leaveGroups[0].value']">
            <InputNumber v-model:value="leaveGroup.value" />
          </FormItem>
        </div>

        <FormItem :wrapper-col="{ span: 24, offset: 0 }">
          <Button type="dashed" @click=""> <PlusOutlined /> 添加规则 </Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Form,
  FormItem,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  Select,
  SelectOption,
  Button,
  Row,
  Col,
} from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { ref } from "vue";
import z from "zod";
import { useAntdFormZod } from "../composable/useAntdFormZod";

const formRef = ref();
const formSchema = z.object({
  holidayName: z.string().min(4, 'too short').max(10, 'too long'),
  useRange: z.array(z.enum(["他的店", "你的店", "我的店", "九讯云"])),
  leaveUnit: z.enum(["按小时请假", "按天请假"]),
  isPaidLeave: z.boolean(),
  effectFull: z.boolean(),
  deductionType: z.enum(["基础扣款", "阶梯扣款", "分段扣款"]),
  calculateRule: z.enum(["按请假次数", "按请假时长"]),
  leaveGroups: z.array(
    z.object({
      rangeStart: z.coerce.number().min(100).max(10000),
      rangeEnd: z.coerce.number(),
      amountType: z.enum(["应发工资总额", "固定工资", "基础工资总额"]),
      value: z.coerce.number().min(100).max(10000),
    })
  ),
});

type formSchemaType = z.infer<typeof formSchema>;

const { form, rules, getRule } = useAntdFormZod<formSchemaType>(formSchema, {
  holidayName: "",
  useRange: ["九讯云"],
  leaveUnit: "按小时请假",
  isPaidLeave: false,
  effectFull: true,
  deductionType: "基础扣款",
  calculateRule: "按请假次数",
  leaveGroups: [
    {
      rangeStart: 0,
      rangeEnd: 10,
      amountType: "应发工资总额",
      value: 20,
    },
  ],
});

getRule('calculateRule')

console.log(rules['leaveGroups[0].rangeStart'], 'kkkk')


// test
// const testSchema = z.object({
//   name: z.string(),
//   address: z.object({
//     nation: z.string(),
//     province: z.string()
//   }),
//   hobbies: z.array(z.object({
//     firstName: z.string(),
//     lastName: z.string()
//   })),
//   mom: z.object({
//     name: z.string(),
//     age: z.int()
//   })
// })

// type testSchemaType = z.infer<typeof testSchema>
// processSchema(testSchema)
// const {form, rules} = useAntdFormZod<testSchemaType>(testSchema, {
//   name: '',
//   address: {
//     nation: '',
//     province: '',
//   },
//   hobbies: [{
//     firstName: '',
//     lastName: ''
//   }],
//   mom: {
//     name: '',
//     age: 50
//   }

// })
// console.log(rules, 'use rules')
</script>

<style>
.ant-form-item {
  margin-bottom: 16px;
}
</style>
