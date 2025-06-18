import { MyUploadResource } from '@/components/my-upload'

export const IsRx = {
  非药品: 0,
  处方药: 1,
  非处方药: 2
} as const
export type IsRx = (typeof IsRx)[keyof typeof IsRx]

export const DeliveryType = {
  快递发货: 1,
  到店自提: 2,
  '快递发货/到店自提': 3
} as const
export type DeliveryType = (typeof DeliveryType)[keyof typeof DeliveryType]

export type Product = {
  /**
   * 前端使用的临时 id，用于渲染
   */
  temp_id?: string
  /**
   * 后端的真实 id，在编辑时存在
   */
  id?: number
  /**
   * 排序
   */
  sort: number | null
  /**
   * 是否默认
   */
  is_default: number
  /**
   * 规格名称
   */
  spes_desc: string
  /**
   * 规格值
   */
  spes_nums: number
  /**
   * 图片
   */
  image?: MyUploadResource
  /**
   * 货号
   */
  sn?: string
  /**
   * 库存
   */
  stock?: number
  /**
   * 冻结库存
   */
  freeze_stock?: number
  /**
   * 销售价
   */
  price?: number
  /**
   * 成本价
   */
  costprice?: number
  /**
   * 供货成本价
   */
  supplyprice?: number
  /**
   * 划线价
   */
  mktprice?: number
  /**
   * 是否支持内购
   */
  is_lnternal: 1 | 2
  /**
   * 内购价
   */
  internal_price?: number
  /**
   * 是否支持会员价
   */
  is_member_price: 1 | 2
  /**
   * 重量
   */
  weight?: number
  /**
   * 单位
   */
  unit?: string
  /**
   * 上架
   */
  marketable: 1 | 2
}

export type GoodsFormData = {
  /**
   * 是否是处方药
   */
  is_rx: IsRx
  /**
   * 总部分类
   */
  goods_cat_id?: number
  /**
   * 商品名称
   */
  name?: string
  /**
   * 商品分类
   */
  goods_departype_id?: number
  /**
   * 商品品牌
   */
  brand_id?: number
  /**
   * 适用疾病
   */
  try_disease?: string[]
  /**
   * 药店
   */
  drugstore_id?: number
  /**
   * 用药提示
   */
  medicine_tips: { key: string; value: string }[]
  /**
   * 商品参数
   */
  parameters: { key: string; value: string }[]
  /**
   * 处方药商品参数
   */
  rx_parameters: { key: string; value?: string }[]
  /**
   * 配送方式
   */
  delivery_type: DeliveryType
  /**
   * 运费模板
   */
  ship_id?: number
  /**
   * 商品简介
   */
  brief?: string
  /**
   * 商品图片
   */
  images: MyUploadResource[]
  /**
   * 商品视频
   */
  videos: MyUploadResource[]
  /**
   * 商品规格
   */
  products: Product[]
  /**
   * 是否限购
   */
  is_purchase?: 1 | 2
  /**
   * 限购名称
   */
  purchase_name?: string
  /**
   * 限购数量
   */
  purchase_num?: number
  /**
   * 是否上架
   */
  marketable?: 1 | 2
  /**
   * 是否推荐
   */
  is_recommend?: 1 | 2
  /**
   * 是否热门
   */
  is_hot?: 1 | 2
  /**
   * 是否仅员工可见
   */
  is_approve?: 1 | 2
  /**
   * 是否隐藏链接
   */
  is_hidelinks?: 1 | 2
  /**
   * 简介图片
   */
  intro?: MyUploadResource[]
}
