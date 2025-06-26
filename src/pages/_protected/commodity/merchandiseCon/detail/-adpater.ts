import { GetGoodsDetailRes, GetGoodsDiseaseRes } from '@/api'
import { createMyUploadResource } from '@/helpers/upload'
import { cleanObject } from '@/lib'

import { DeliveryType, GoodsFormData, IsRx } from './-definition'

/**
 * 将前端表单状态转换为后端需要的格式，主要执行以下处理：
 *
 * 1.表单状态中 try_disease 只有一个 name 字符串，而后端需要一个对象
 * 2.表单状态中分 parameters 和 rx_parameters，后端只要一个 parameters
 * 3.images, videos, products 的排序字段，前端根据数组顺序维护，提交前在这里补充 sort 字段
 * 4.intro 后端只要逗号分割的字符串
 */
export function f2b<ID extends number | undefined = undefined>(
  formData: GoodsFormData,
  extraData: {
    id?: ID
    departmentId: number
    goodsDisease?: GetGoodsDiseaseRes[]
    edit_products?: number[]
    del_products?: number[]
  }
) {
  const finalImages = (() => {
    const images = formData.images.map((item, index) => ({
      image_id: item.id,
      image_url: item.url,
      is_main: (item.payload?.is_main as 1 | 0 | undefined) ?? 0,
      sort: index + 1
    }))

    const mainCount = images.filter((item) => item.is_main === 1).length
    // 如果一张主图都没有设置，就把第一张设为主图
    if (images.length > 1 && mainCount === 0) {
      images[0].is_main = 1
    }
    return images
  })()

  return cleanObject({
    ...formData,
    id: extraData.id,
    // 补充事业部 id 用于表单提交
    department_id: extraData.departmentId,
    // 根据 name 取回对象
    try_disease: formData.try_disease?.map(
      (item) =>
        extraData.goodsDisease?.find((disease) => disease.icd_name === item)?.id
    ),
    // 根据 is_rx 将 parameters 或 rx_parameters 用于提交
    parameters:
      formData.is_rx === IsRx.非药品
        ? formData.parameters
        : formData.rx_parameters,
    // 将 MyUploadResource 转为后端要的格式
    images: finalImages,
    // 将 MyUploadResource 转为后端要的格式
    videos: formData.videos.map((item, index) => ({
      video_id: item.id,
      video_url: item.url,
      sort: index + 1
    })),
    // 补充排序字段
    products: formData.products.map((item, index) => ({
      ...item,
      sort: index + 1
    })),
    // 将 MyUploadResource 转为后端要的格式
    intro: formData.intro?.map((item) => item.url).join(','),
    edit_products: extraData.edit_products,
    del_products: extraData.del_products
  })
}

export function b2f(data: GetGoodsDetailRes): GoodsFormData {
  return {
    ...data,
    // 补充默认值
    is_rx: data.is_rx ?? IsRx.非药品,
    // 补充默认值
    delivery_type: data.delivery_type ?? DeliveryType.快递发货,
    // 遍历取 name，表单只使用 name
    try_disease: data.try_disease?.map((item) => item.icd_name) ?? [],
    // 补充默认值
    medicine_tips:
      data.medicine_tips && data.medicine_tips.length > 0
        ? data.medicine_tips
        : [
            { key: '主治功能', value: '' },
            { key: '用法用量', value: '' }
          ],
    // 根据 is_rx 的值，将 parameters 分别赋值给 rx_parameters 和 parameters
    parameters: data.is_rx === IsRx.非药品 ? data.parameters ?? [] : [],
    rx_parameters: data.is_rx !== IsRx.非药品 ? data.parameters ?? [] : [],
    // 接口返回的图片对象转换为 MyUploadResource
    images:
      data.images
        ?.slice()
        .sort((a, b) => a.sort - b.sort)
        .map((item) =>
          createMyUploadResource({
            id: item.image_id,
            type: 'image',
            url: item.image_url,
            payload: {
              is_main: item.is_main
            }
          })
        ) ?? [],
    // 接口返回的视频对象转换为 MyUploadResource
    videos:
      data.videos
        ?.slice()
        .sort((a, b) => a.sort - b.sort)
        .map((item) =>
          createMyUploadResource({
            id: item.video_id,
            type: 'video',
            url: item.video_url
          })
        ) ?? [],
    // 补充 temp_id
    products:
      data.products
        ?.slice()
        .sort((a, b) => a.sort - b.sort)
        .map((item) => ({
          ...item,
          sort: null,
          temp_id: item.id.toString()
        })) ?? [],
    // 详情图片对象转换为 MyUploadResource
    intro:
      data.intro?.split(',').map((item) =>
        createMyUploadResource({
          type: 'image',
          url: item
        })
      ) ?? []
  }
}
