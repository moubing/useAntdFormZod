import type { Rule } from "ant-design-vue/es/form";
import { ref } from "vue";
import type { ZodArray, ZodObject, ZodType } from "zod";

// type FieldConfig = {
//   required?: boolean;
//   trigger?: "change" | "blur" | ["change", "blur"];
// };

// const defaultConfig: FieldConfig = { required: true, trigger: "blur" };

export function useAntdFormZod<T extends Record<string, any>>(
  schema: ZodObject<any>,
  defaultData: T,
) {
  const form = ref(defaultData);
  const rules: Record<string, Rule[]> = {};

  function processSchema(schema: ZodType, name?: string) {
    const schemaType = schema.def.type;
    switch (schemaType) {
      case "object":
        const shape = (schema as ZodObject).shape;
        if (!name) {
          rules["root"] = [
            {
              validator: async (_rule: Rule, value: any) => {
                // 非必填字段允许它的值为undefined，null，空字符，当满足这个条件时会跳过zod校验
                if (isEmpty(value)) {
                  return Promise.resolve();
                }
                const result = (schema as ZodType).safeParse(value);
                if (!result.success) {
                  throw new Error(result.error.issues[0].message);
                }
              },
            },
          ];
        }
        Object.entries(shape).forEach(([fieldName, fieldSchema]) => {
          const concatName = !name ? fieldName : `${name}.${fieldName}`;

          rules[concatName] = [
            {
              validator: async (_rule: Rule, value: any) => {
                // // 非必填字段允许它的值为undefined，null，空字符，当满足这个条件时会跳过zod校验
                // if (isEmpty(value)) {
                //   return Promise.resolve();
                // }
                console.log('validating')
                const result = (fieldSchema as ZodType).safeParse(value);
                if (!result.success) {
                  throw new Error(result.error.issues[0].message);
                }
              },
              trigger:  "change",
              required:  true,
            },
          ];
          const fieldSchemaType = (fieldSchema as ZodType).def.type;
          console.log(rules[concatName], `${concatName}`);
          console.log(concatName, '-->', fieldSchema);

          if (fieldSchemaType === "object" || fieldSchemaType === "array") {
            processSchema(fieldSchema, concatName);
          }
        });
        break;
      case "array":
        if (!name) {
          console.error("请传入一个ZodObject类型的schema");
          return;
        }
        const element = (schema as ZodArray).element;
        const concatName = `${name}[0]`;

        rules[name] = [
          {
            validator: async (_rule: Rule, value: any) => {
              // // 非必填字段允许它的值为undefined，null，空字符，当满足这个条件时会跳过zod校验
              // if (isEmpty(value)) {
              //   return Promise.resolve();
              // }
                console.log('validating')

              const result = (schema as ZodType).safeParse(value);
              if (!result.success) {
                throw new Error(result.error.issues[0].message);
              }
            },
                          trigger:  "change",
              required:  true,
          },
        ];
          console.log(rules[concatName], `${concatName}`);
          console.log(concatName, `--> ${schema}`);

        const elementSchemaType = (element as ZodType).def.type;
        if (elementSchemaType === "object" || elementSchemaType === "array") {
          processSchema(element as ZodArray | ZodObject, concatName);
        }
        break;
      default:
        if (!name) {
          console.error("请传入一个ZodObject类型的schema");
          return;
        }
        console.log("default");
    }
  }
  processSchema(schema);

  function getRule(key: string ): Rule[] {
    return rules[key as string] || [];
  }

  return { form, rules, getRule};
}

function isEmpty(value: any): boolean {
  return value === undefined || value === null || value === "";
}

const rules: Record<string, Rule[]> = {};
export function processSchema(schema: ZodType, name?: string) {
  const schemaType = schema.def.type;
  switch (schemaType) {
    case "object":
      const shape = (schema as ZodObject).shape;
      if (!name) {
        rules["root"] = [
          {
            validator: async (_rule: Rule, value: any) => {
              // 非必填字段允许它的值为undefined，null，空字符，当满足这个条件时会跳过zod校验
              if (isEmpty(value)) {
                return Promise.resolve();
              }
              const result = (schema as ZodType).safeParse(value);
              if (!result.success) {
                throw new Error(result.error.issues[0].message);
              }
            },
          },
        ];
      }
      Object.entries(shape).forEach(([fieldName, fieldSchema]) => {
        const concatName = !name ? fieldName : `${name}.${fieldName}`;

        rules[concatName] = [
          {
            validator: async (_rule: Rule, value: any) => {
              // 非必填字段允许它的值为undefined，null，空字符，当满足这个条件时会跳过zod校验
              if (isEmpty(value)) {
                return Promise.resolve();
              }
              const result = (fieldSchema as ZodType).safeParse(value);
              if (!result.success) {
                throw new Error(result.error.issues[0].message);
              }
            },
          },
        ];
        const fieldSchemaType = (fieldSchema as ZodType).def.type;
        if (fieldSchemaType === "object" || fieldSchemaType === "array") {
          processSchema(fieldSchema, concatName);
        }
        console.log(rules, "rules");
      });
      break;
    case "array":
      if (!name) {
        console.error("请传入一个ZodObject类型的schema");
        return;
      }
      const element = (schema as ZodArray).element;
      const concatName = `${name}[0]`;
      rules[name] = [
        {
          validator: async (_rule: Rule, value: any) => {
            // 非必填字段允许它的值为undefined，null，空字符，当满足这个条件时会跳过zod校验
            if (isEmpty(value)) {
              return Promise.resolve();
            }
            const result = (schema as ZodType).safeParse(value);
            if (!result.success) {
              throw new Error(result.error.issues[0].message);
            }
          },
        },
      ];
      const elementSchemaType = (element as ZodType).def.type;
      if (elementSchemaType === "object" || elementSchemaType === "array") {
        processSchema(element as ZodArray | ZodObject, concatName);
      }
      break;
    default:
      if (!name) {
        console.error("请传入一个ZodObject类型的schema");
        return;
      }
      console.log("default");
  }
}

  // Object.entries(schema.shape).forEach(([fieldName, fieldSchema]) => {
  //   const config = fieldConfigs?.[fieldName as keyof T] || defaultConfig;
  //   rules[fieldName] = [
  //     {
  //       validator: async (_rule: Rule, value: any) => {
  //         // 非必填字段允许它的值为undefined，null，空字符，当满足这个条件时会跳过zod校验
  //         if (!config.required && isEmpty(value)) {
  //           return Promise.resolve();
  //         }
  //         const result = (fieldSchema as ZodType).safeParse(value);
  //         if (!result.success) {
  //           throw new Error(result.error.issues[0].message);
  //         }
  //       },
  //       trigger: config.trigger || "change",
  //       required: config.required || true,
  //     },
  //   ];
  // });