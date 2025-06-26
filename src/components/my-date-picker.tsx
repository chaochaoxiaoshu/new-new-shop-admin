import {
  DatePicker,
  DatePickerProps,
  RangePickerProps
} from '@arco-design/web-react'
import dayjs from 'dayjs'
import { ForwardedRef, forwardRef } from 'react'

interface MyDatePickerComponent
  extends React.ForwardRefExoticComponent<
    // biome-ignore lint/suspicious/noExplicitAny: false
    MyDatePickerProps & React.RefAttributes<any>
  > {
  RangePicker: typeof MyRangePicker
}

type MyDatePickerProps = Omit<DatePickerProps, 'value' | 'onChange'> & {
  value?: number
  onChange?: (value: number) => void
}

/**
 * 日期选择器，值为时间戳，仅支持受控模式
 */
export const MyDatePicker = forwardRef(
  // biome-ignore lint/suspicious/noExplicitAny: false
  (props: MyDatePickerProps, ref: ForwardedRef<any>) => {
    const { value, onChange, ...restProps } = props

    return (
      <DatePicker
        ref={ref}
        value={value ? dayjs.unix(value) : void 0}
        {...restProps}
        onChange={(val) => onChange?.(dayjs(val).unix())}
      />
    )
  }
) as MyDatePickerComponent
MyDatePicker.displayName = 'MyDatePicker'

type MyRangePickerProps = Omit<RangePickerProps, 'value' | 'onChange'> & {
  value?: [number | undefined, number | undefined]
  onChange?: (value: [number, number] | undefined) => void
}

/**
 * 日期范围选择器，值为时间戳，仅支持受控模式
 */
const MyRangePicker = forwardRef(
  // biome-ignore lint/suspicious/noExplicitAny: false
  (props: MyRangePickerProps, ref: ForwardedRef<any>) => {
    const { value, onChange, ...restProps } = props

    return (
      <DatePicker.RangePicker
        ref={ref}
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
)
MyRangePicker.displayName = 'MyRangePicker'

MyDatePicker.RangePicker = MyRangePicker
