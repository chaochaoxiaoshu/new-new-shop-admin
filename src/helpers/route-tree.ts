import { LayoutGrid, type LucideIcon } from 'lucide-react'

export interface RouteTreeNode {
  name: string | LucideIcon
  path: string
  children?: RouteTreeNode[]
}

export const routeTree: RouteTreeNode = {
  name: LayoutGrid,
  path: '',
  children: [
    {
      name: '首页',
      path: '/'
    },
    {
      name: '商品',
      path: '',
      children: [
        {
          name: '商品管理',
          path: '/commodity/merchandiseCon',
          children: [
            {
              name: '添加/编辑商品',
              path: '/commodity/merchandiseCon/detail'
            }
          ]
        },
        {
          name: '总部分类',
          path: '/commodity/categoryAdmin',
          children: [
            {
              name: '二级分类',
              path: '/commodity/categoryAdmin/info',
              children: [
                {
                  name: '查看所选商品',
                  path: '/commodity/categoryAdmin/goods'
                }
              ]
            }
          ]
        },
        {
          name: '商品分类',
          path: '/commodity/category',
          children: [
            {
              name: '二级分类',
              path: '/commodity/category/info'
            }
          ]
        },
        {
          name: '商品品牌',
          path: '/commodity/brand'
        },
        {
          name: '商品评价',
          path: '/commodity/merchandiseCon/evaluate'
        }
      ]
    },
    {
      name: '客户',
      path: '',
      children: [
        {
          name: '客户列表',
          path: '/client/account',
          children: [
            {
              name: '客户详情',
              path: '/client/account/detail'
            }
          ]
        },
        {
          name: '客户标签',
          path: '/client/clientTags',
          children: [
            {
              name: '编辑标签',
              path: '/client/clientTags/edit'
            }
          ]
        }
      ]
    },
    {
      name: '订单',
      path: '',
      children: [
        {
          name: '订单列表',
          path: '/order',
          children: [
            {
              name: '订单详情',
              path: '/order/order-detail'
            }
          ]
        },
        {
          name: '售后管理',
          path: '/order/afterSale'
        },
        {
          name: '发货单',
          path: '/order/dispatch'
        },
        {
          name: '提货单',
          path: '/order/billLading'
        },
        {
          name: '退货单',
          path: '/order/reship'
        },
        {
          name: '运费模板',
          path: '/order/freight'
        }
      ]
    },
    {
      name: '营销',
      path: '',
      children: [
        {
          name: '优惠券',
          path: '/marketing/coupon',
          children: [
            {
              name: '添加/编辑优惠券',
              path: '/marketing/coupon/edit'
            },
            {
              name: '优惠券数据',
              path: '/marketing/coupon/data'
            },
            {
              name: '定向发放',
              path: '/marketing/coupon/targeted-distribution'
            }
          ]
        },
        {
          name: 'N元N件',
          path: '/marketing/valuepack',
          children: [
            {
              name: '添加/编辑N元N件',
              path: '/marketing/valuepack/edit'
            },
            {
              name: 'N元N件数据',
              path: '/marketing/valuepack/data'
            }
          ]
        },
        {
          name: '满减邮',
          path: '/marketing/reduction',
          children: [
            {
              name: '添加/编辑满减邮',
              path: '/marketing/reduction/edit'
            },
            {
              name: '满减邮数据',
              path: '/marketing/reduction/data'
            }
          ]
        },
        {
          name: '拼团',
          path: '/marketing/teambuy',
          children: [
            {
              name: '添加/编辑拼团',
              path: '/marketing/teambuy/edit'
            },
            {
              name: '拼团数据',
              path: '/marketing/teambuy/data'
            }
          ]
        },
        {
          name: '秒杀',
          path: '/marketing/seckilling',
          children: [
            {
              name: '添加/编辑秒杀',
              path: '/marketing/seckilling/edit'
            },
            {
              name: '秒杀数据',
              path: '/marketing/seckilling/data'
            }
          ]
        },
        {
          name: '满赠',
          path: '/marketing/fulldiscounts',
          children: [
            {
              name: '添加/编辑满赠',
              path: '/marketing/fulldiscounts/edit'
            },
            {
              name: '满赠数据',
              path: '/marketing/fulldiscounts/data'
            }
          ]
        },
        {
          name: '满M付N',
          path: '/marketing/fullMpayN',
          children: [
            {
              name: '添加/编辑满M付N',
              path: '/marketing/fullMpayN/edit'
            },
            {
              name: '满M付N数据',
              path: '/marketing/fullMpayN/data'
            }
          ]
        },
        {
          name: '幸运大抽奖',
          path: '/marketing/raffle',
          children: [
            {
              name: '添加/编辑幸运大抽奖',
              path: '/marketing/raffle/edit'
            },
            {
              name: '幸运大抽奖数据',
              path: '/marketing/raffle/data'
            }
          ]
        },
        {
          name: 'X件X折',
          path: '/marketing/piece',
          children: [
            {
              name: '添加/编辑X件X折',
              path: '/marketing/piece/edit'
            },
            {
              name: 'X件X折数据',
              path: '/marketing/piece/data'
            }
          ]
        },
        {
          name: '加价购',
          path: '/marketing/purchase',
          children: [
            {
              name: '添加/编辑加价购',
              path: '/marketing/purchase/edit'
            },
            {
              name: '加价购数据',
              path: '/marketing/purchase/data'
            }
          ]
        },
        {
          name: '素材库',
          path: '/marketing/timeline',
          children: [
            {
              name: '添加/编辑素材库',
              path: '/marketing/timeline/editing'
            }
          ]
        },
        {
          name: '直播列表',
          path: '/marketing/live',
          children: [
            {
              name: '创建直播',
              path: '/marketing/live/edit'
            },
            {
              name: '直播商品',
              path: '/marketing/live/goods'
            },
            {
              name: '直播数据',
              path: '/marketing/live/data'
            }
          ]
        },
        {
          name: '分销管理',
          path: '',
          children: [
            {
              name: '分销列表',
              path: '/marketing/drp/distrList',
              children: [
                {
                  name: '新增分销商品',
                  path: '/marketing/drp/distrList/goodsList'
                }
              ]
            },
            {
              name: '规则列表',
              path: '/marketing/drp/rule'
            },
            {
              name: '分销历史列表',
              path: '/marketing/drp/distrHistory'
            },
            {
              name: '客户关系查询',
              path: '/marketing/drp/customer'
            },
            {
              name: '分销员',
              path: '/marketing/drp/userIndex'
            },
            {
              name: '客户关系设置',
              path: '/marketing/drp/settings'
            }
          ]
        }
      ]
    },
    {
      name: '财务',
      path: '',
      children: [
        {
          name: '提现管理',
          path: '',
          children: [
            {
              name: '提现申请',
              path: '/finance/application'
            }
          ]
        },
        {
          name: '支付单',
          path: '/finance/payment'
        },
        {
          name: '退款单',
          path: '/finance/refund'
        },
        {
          name: '资金明细',
          path: '/finance/details'
        },
        {
          name: '月度统计报表',
          path: '/finance/monthly'
        }
      ]
    },
    {
      name: '统计',
      path: '',
      children: [
        {
          name: '商品统计',
          path: '/statistics/products'
        },
        {
          name: '分销统计',
          path: '/statistics/old-distribution'
        },
        {
          name: '分佣失败统计',
          path: '/statistics/giveaway'
        },
        {
          name: '新分销统计-otc',
          path: '/statistics/distributionotc'
        },
        {
          name: '月度结算报表',
          path: '/statistics/orderReport'
        },
        {
          name: '订单统计',
          path: '/statistics/orders'
        }
      ]
    },
    {
      name: '钱包',
      path: '',
      children: [
        {
          name: '提现管理',
          path: '/wallet/management'
        },
        {
          name: '钱包账户',
          path: '/wallet/account'
        },
        {
          name: '余额明细',
          path: '/wallet/statement'
        },
        {
          name: '提现记录',
          path: '/wallet/record',
          children: [
            {
              name: '核对明细',
              path: '/wallet/record-detail'
            }
          ]
        },
        {
          name: '账户列表',
          path: '/wallet/accountList'
        },
        {
          name: '交易对账单',
          path: '/wallet/transactions'
        }
      ]
    },
    {
      name: '设置',
      path: '',
      children: [
        {
          name: '文章管理',
          path: '',
          children: [
            {
              name: '文章列表',
              path: '/station/articles',
              children: [
                {
                  name: '添加/编辑文章',
                  path: '/station/articles/editing'
                }
              ]
            },
            {
              name: '文章栏目',
              path: '/station/articles/columns'
            }
          ]
        },
        {
          name: '平台设置',
          path: '/setting/manage'
        },
        {
          name: '万里牛参数',
          path: '/setting/wln'
        },
        {
          name: '公告列表',
          path: '/setting/notice'
        },
        {
          name: '金刚区管理',
          path: '/setting/kongKim'
        },
        {
          name: '门店管理',
          path: '/setting/outlet'
        },
        {
          name: '图片管理',
          path: '/setting/imageManage'
        },
        {
          name: '账号管理',
          path: '',
          children: [
            {
              name: '平台角色',
              path: '/setting/aManage/platform'
            },
            {
              name: '事业部管理',
              path: '/setting/aManage/management'
            },
            {
              name: '平台管理员',
              path: '/setting/aManage/info'
            }
          ]
        },
        {
          name: '短信管理',
          path: '/setting/sms'
        },
        {
          name: '首页管理',
          path: '',
          children: [
            {
              name: '系统首页',
              path: '/setting/home-management/system-home-editing'
            },
            {
              name: '店铺首页',
              path: '/setting/home-management/store-home-list'
            }
          ]
        },
        {
          name: '专题页',
          path: '/setting/home-management/store-home-list-subject'
        }
      ]
    }
  ]
}
