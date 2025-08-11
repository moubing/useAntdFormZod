import type { Rule } from "ant-design-vue/es/form";
import { ref } from "vue";
import { type ZodObject, type ZodType } from "zod";

type FieldConfig = {
  required?: boolean;
  trigger?: 'change' | 'blur' | ['change', 'blur'];
};

const defaultConfig:FieldConfig = {required: true, trigger: 'blur'} 

export function useAntdFormZod<T extends Record<string, any>>(
  schema: ZodObject<any>,
  defaultData: T,
  fieldConfigs?: { [K in keyof T]?: FieldConfig }
) {
  const form = ref(defaultData);
  const rules: Record<string, Rule[]> = {};

  Object.entries(schema.shape).forEach(([fieldName, fieldSchema]) => {
    const config = fieldConfigs?.[fieldName as keyof T] || defaultConfig;
    rules[fieldName] = [
      {
        validator: async (_rule: Rule, value: any) => {
          // 非必填字段允许它的值为undefined，null，空字符，当满足这个条件时会跳过zod校验
          if (!config.required && isEmpty(value)) {
            return Promise.resolve();
          }
          const result = (fieldSchema as ZodType).safeParse(value);
          if (!result.success) {
            throw new Error(result.error.issues[0].message);
          }
        },
        trigger: config.trigger || 'change',
        required: config.required || true
      }
    ];
  });
  return { form, rules };
}

function isEmpty(value: any): boolean {
  return value === undefined || value === null || value === '';
}