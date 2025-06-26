import {
  DatePicker,
  DatePickerProps,
  RangePickerProps
} from '@arco-design/web-react'
import dayjs from 'dayjs'

type MyDatePickerProps = Omit<DatePickerProps, 'value' | 'onChange'> & {
  value?: number
  onChange?: (value: number) => void
}

/**
 * 日期选择器，值为时间戳，仅支持受控模式
 */
export function MyDatePicker(props: MyDatePickerProps) {
  const { value, onChange, ...restProps } = props

  return (
    <DatePicker
      value={value ? dayjs.unix(value) : void 0}
      {...restProps}
      onChange={(val) => onChange?.(dayjs(val).unix())}
    />
  )
}

type MyRangePickerProps = Omit<RangePickerProps, 'value' | 'onChange'> & {
  value?: [number | undefined, number | undefined]
  onChange?: (value: [number, number] | undefined) => void
}

/**
 * 日期范围选择器，值为时间戳，仅支持受控模式
 */
MyDatePicker.RangePicker = function MyRangePicker(props: MyRangePickerProps) {
  const { value, onChange, ...restProps } = props

  return (
    <DatePicker.RangePicker
      value={
        value?.[0] && value[1]
          ? [dayjs.unix(value[0]), dayjs.unix(value[1])]
          : void 0
      }
      {...restProps}
      onChange={(val) =>
        onChange?.(
          (val as string[] | undefined)
            ? [
                dayjs(val[0]).startOf('day').unix(),
                dayjs(val[1]).endOf('day').unix()
              ]
            : void 0
        )
      }
    />
  )
}
