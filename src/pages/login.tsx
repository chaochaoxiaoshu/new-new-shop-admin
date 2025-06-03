import { type } from 'arktype'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'

import { Button, Form, FormInstance, Input, Notification, Select, Spin } from '@arco-design/web-react'
import type { RefInputType } from '@arco-design/web-react/es/Input'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import {
  type LoginReq,
  type SwitchAuthorzieReq,
  getAgentConfig,
  getDepartmentsByToken,
  getDepartmentsForAccount,
  login,
  switchAuthorzie,
  wecomAuthorize
} from '@/api'
import { checkWxApiReady } from '@/helpers'
import { useUserStore } from '@/stores'

const searchSchema = type({
  'redirect?': 'string',
  'code?': 'string',
  'type?': '1'
})

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: '登录 | 振东健康城' }],
    script: [
      {
        src: 'https://wwcdn.weixin.qq.com/node/wework/wwopen/js/wwLogin-1.2.7.js'
      },
      {
        src: 'https://res.wx.qq.com/wwopen/js/jsapi/jweixin-1.0.0.js'
      },
      {
        src: 'https://open.work.weixin.qq.com/wwopen/js/jwxwork-1.0.0.js'
      }
    ]
  }),
  component: AuthView
})

type AuthForm = {
  username: string
  password: string
  department_id?: number
}

function AuthView() {
  const queryClient = useQueryClient()
  const userStore = useUserStore()
  const search = Route.useSearch()
  const navigate = useNavigate()

  const [form] = Form.useForm<AuthForm>()

  const passwordInputRef = useRef<RefInputType>(null)

  const username: string = Form.useWatch('username', form as FormInstance)
  const password: string = Form.useWatch('password', form as FormInstance)
  const [debouncedUsername] = useDebounce(username, 500)
  const [debouncedPassword] = useDebounce(password, 500)

  const { data: departmentInfo } = useQuery({
    queryKey: ['auth-departmentList', debouncedUsername, debouncedPassword],
    queryFn: () => getDepartmentsForAccount({ username, password }),
    enabled: !!debouncedUsername && !!debouncedPassword
  })
  const departmentsOptions = useMemo(() => {
    return (
      departmentInfo?.departments?.map((d) => ({
        label: d?.name ?? '',
        value: d?.id ?? ''
      })) ?? []
    )
  }, [departmentInfo])

  /**
   * 单点登录状态
   *
   * sso-placeholder: 在企业微信中打开时，显示一个“已在系统浏览器打开”占位页面
   * sso-in-browser-pending: 通过企业微信 SDK 重定向到浏览器时，在 sso 请求 pending 时显示一个 Spin 占位
   * sso-in-browser-choose-department: sso 请求完成后，账号有多个事业部，显示选择事业部的表单
   * null: 没有单点登录，显示正常的登录表单
   */
  const [pageState, setPageState] = useState<
    'sso-placeholder' | 'sso-in-browser-pending' | 'sso-in-browser-choose-department' | null
  >(null)

  /**
   * 通过企业微信 SDK 的 code 换取到的 access_token，
   * 当账号为超级管理员或仅有一个事业部时，该 token 就是当前的登录 token
   * 当账号需要选择事业部时，该 token 需要在切换事业部时使用，因此暂时保存下来
   */
  const [tempToken, setTempToken] = useState<string>()

  useEffect(() => {
    if (!search.type) return
    void ssoInWeCom()
    void ssoInBrowser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * 在企业微信中打开时，请求 agentConfig，然后使用企业微信 SDK 唤起系统默认浏览器
   */
  const ssoInWeCom = async () => {
    if (search.code) return

    setPageState('sso-placeholder')
    const isWxReady = await checkWxApiReady()
    if (!isWxReady) {
      Notification.warning({ content: '企业微信API加载失败', icon: 'fail' })
      setPageState(null)
      return
    }
    const agentConfigRes = await getAgentConfig({ url: window.location.href })
    window.wx.agentConfig({
      ...agentConfigRes,
      jsApiList: ['openDefaultBrowser'],
      success: () => {
        const authUrl = new URL('https://open.weixin.qq.com/connect/oauth2/authorize')
        authUrl.searchParams.append('appid', agentConfigRes.corpid!)
        authUrl.searchParams.append('redirect_uri', window.location.href)
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('scope', 'snsapi_base')
        authUrl.searchParams.append('state', '')
        authUrl.searchParams.append('connect_redirect', '1')
        authUrl.hash = 'wechat_redirect'
        window.wx.invoke('openDefaultBrowser', {
          url: authUrl.toString()
        })
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fail: (res: any) => {
        Notification.error({ content: res.errMsg })
      }
    })
  }

  /**
   * 从企业微信跳转到系统默认浏览器后，使用 code 登录并获取事业部列表，
   * 若账号为超级管理员或仅有一个事业部，直接登录
   * 否则进入选择事业部状态
   */
  const ssoInBrowser = async () => {
    if (!search.code) return

    try {
      setPageState('sso-in-browser-pending')
      localStorage.clear()
      const firstAuthRes = await wecomAuthorize({ code: search.code })
      if (!firstAuthRes.access_token) {
        throw new Error('获取 token 失败')
      }
      const departmentsRes = await getDepartmentsByToken({
        token: firstAuthRes.access_token
      })
      if (departmentsRes.is_super || departmentsRes.departments?.length === 1) {
        void handleLoginSuccess({
          ...firstAuthRes,
          department_id: departmentsRes.is_super ? firstAuthRes.department_id : departmentsRes.departments?.[0]?.id
        })
        return
      }
      setTempToken(firstAuthRes.access_token)
      setPageState('sso-in-browser-choose-department')
      queryClient.setQueryData(['auth-departmentList'], departmentsRes)
    } catch {
      setPageState(null)
    }
  }

  /**
   * 不论是正常提交表单登录，还是在 sso 流程中，
   * 都会调用此方法，保存当前登录信息，然后跳转到重定向页面
   */
  const handleLoginSuccess = async (
    data: Partial<{
      access_token: string
      token_type: string
      expires_in: number
      username: string
      department_id: number
    }>
  ) => {
    if (
      typeof data.access_token === 'undefined' ||
      typeof data.department_id === 'undefined' ||
      typeof data.username === 'undefined' ||
      typeof data.expires_in === 'undefined'
    ) {
      Notification.error({ content: '登录失败', icon: 'fail' })
      return
    }
    userStore.login({
      token: data.access_token,
      departmentId: data.department_id,
      username: data.username,
      expiredAt: dayjs().add(data.expires_in, 'seconds').unix()
    })
    navigate({
      to: search.redirect ?? '/',
      replace: true
    })
    Notification.success({ content: '登录成功' })
  }

  const { mutate: loginMutate, isPending: loginPending } = useMutation({
    mutationKey: ['login'],
    mutationFn: (req: LoginReq) => login(req),
    onSuccess: (data) => handleLoginSuccess(data)
  })

  const { mutate: ssoChooseDepartmentMutate, isPending: ssoChooseDepartmentPending } = useMutation({
    mutationKey: ['sso-choose-department', tempToken],
    mutationFn: (req: SwitchAuthorzieReq) => switchAuthorzie(req),
    onSuccess: (data) => handleLoginSuccess(data),
    onError: () => setPageState(null)
  })

  /**
   * 提交表单时，若 pageState 为 sso-in-browser-choose-department，则处于单点登录流程中，否则正常提交表单
   */
  const handleSubmit = (values: AuthForm) => {
    if (pageState === 'sso-in-browser-choose-department') {
      if (!values.department_id) {
        Notification.warning({ content: '请选择事业部' })
        return
      }
      ssoChooseDepartmentMutate({
        department_id: values.department_id,
        token: tempToken!
      })
      return
    }
    loginMutate({
      username: values.username,
      password: values.password,
      department_id: values.department_id ?? null
    })
  }

  if (pageState === 'sso-placeholder') {
    return (
      <div className='flex flex-col justify-center items-center h-screen'>
        <img
          className='w-[400px] h-[300px]'
          src='https://qiniu.zdjt.com/shop/ReH1Z6dQlq88YSQwgu47uJ2610UVwijRf5.png'
          alt='placeholder'
        />
        <div className='text-sm text-gray-500 mt-6'>已在系统默认浏览器中打开</div>
      </div>
    )
  }

  if (pageState === 'sso-in-browser-pending') {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spin loading={true} />
      </div>
    )
  }

  return (
    <div className='flex justify-center items-center h-screen bg-[url("https://qiniu.zdjt.com/shop/K168hi5uPMV8a5f689pwVh1D8mx06pycT0.jpeg")] bg-cover bg-no-repeat'>
      <div className='flex flex-col w-[480px] bg-white/60 p-12 rounded-sm'>
        <img src='https://qiniu.zdjt.com/shop/D1w6t8Q68a5w6g19tV6z2Ns193Ra5ugo30.png' alt='Logo' />
        <span className='text-center mt-8 text-base'>振东集团 -为中国人设计，让中国人健康！</span>
        <div className='mt-8'>
          <Form form={form} layout='vertical' onSubmit={handleSubmit}>
            {pageState === null && (
              <>
                <Form.Item field='username' rules={[{ required: true, message: '请输入账号' }]}>
                  <Input placeholder='请输入账号' />
                </Form.Item>
                <Form.Item field='password' rules={[{ required: true, message: '请输入密码' }]}>
                  <Input ref={passwordInputRef} type='password' placeholder='请输入密码' />
                </Form.Item>
              </>
            )}
            {departmentInfo?.departments && departmentInfo.departments.length > 0 && (
              <Form.Item field='department_id'>
                <Select options={departmentsOptions} placeholder='请选择事业部' allowClear />
              </Form.Item>
            )}
            <Button
              type='primary'
              htmlType='submit'
              loading={loginPending || ssoChooseDepartmentPending}
              style={{ marginTop: 8 }}
            >
              登录
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}
