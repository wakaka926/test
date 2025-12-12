import useDictStore from "@/store/modules/dict"
import { getDicts } from "@/api/system/dict/data"
import { ref, toRefs } from "vue"

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({})
  return (() => {
    args.forEach((dictType, index) => {
      res.value[dictType] = []
      const dicts = useDictStore().getDict(dictType)
      if (dicts) {
        res.value[dictType] = dicts
      } else {

        })
      }
    })
    return toRefs(res.value)
  })()
}
