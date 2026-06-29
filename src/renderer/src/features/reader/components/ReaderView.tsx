import { ScrollArea } from '@/components/ui/scroll-area'
import { SampleDocument } from './SampleDocument'

export function ReaderView(): React.JSX.Element {
  return (
    <ScrollArea className="h-full flex-1 bg-background">
      <SampleDocument />
    </ScrollArea>
  )
}
