import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Statistics card data type
type StatisticsCardProps = {
  icon: ReactNode
  value: string
  title: string
  changePercentage: string
  changeType?: 'up' | 'down' | 'neutral'
  className?: string
}

const StatisticsCard = ({ icon, value, title, changePercentage, changeType = 'up', className }: StatisticsCardProps) => {
  const isPositive = changeType === 'up' || changePercentage.startsWith('+')

  return (
    <Card className={className}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm'>
          {icon}
        </div>
        <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
          {changePercentage}
        </span>
      </CardHeader>
      <CardContent className='flex flex-col gap-1'>
        <span className='text-2xl font-bold'>{value}</span>
        <span className='text-base text-muted-foreground'>{title}</span>
      </CardContent>
    </Card>
  )
}

export default StatisticsCard
