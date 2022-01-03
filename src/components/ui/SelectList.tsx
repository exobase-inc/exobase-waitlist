import {
  Pane,
  Text,
  Button,
  Card,
  majorScale
} from 'evergreen-ui'
import { Stack } from '../layout'
import Shimmer from './Shimmer'


export type SelectItem = {
  id: string | number
  label: string
  subtitle?: string
  link?: string
  selectable?: boolean
  selectLabel?: string
  selectAppearance?: 'minimal' | 'primary' | 'default'
}

export default function SelectList({
  maxHeight,
  loading = false,
  items = [],
  onSelect
}: {
  maxHeight?: string | number
  loading?: boolean
  items: SelectItem[]
  onSelect?: (item: SelectItem) => void
}) {
  return (
    <Pane
      maxHeight={maxHeight}
      overflowY={maxHeight ? 'scroll' : undefined}
    >
      {loading && (
        <>
          <Shimmer
            height={40}
            marginBottom={majorScale(2)}
          />
          <Shimmer
            height={40}
            marginBottom={majorScale(2)}
          />
          <Shimmer
            height={40}
          />
        </>
      )}
      {!loading && items && items.map(item => (
        <Card
          key={item.id}
          onClick={() => onSelect?.(item)}
          marginBottom={majorScale(2)}
          borderRadius={4}
          padding={majorScale(2)}
          alignItems='center'
          backgroundColor='white'
          elevation={0}
          display='flex'
          flexDirection='row'
        >
          <Stack flex={1}>
            <Text size={600}>{item.label}</Text>
            {item.subtitle && (
              <Text size={300}>{item.subtitle}</Text>
            )}
          </Stack>
          {(item.selectable === null || item.selectable === undefined || item.selectable === true) && (
            <Button
              appearance={item.selectAppearance ?? 'primary'}
            >
              {item.selectLabel ?? 'select'}
            </Button>
          )}
        </Card>
      ))}
    </Pane>
  )
}
