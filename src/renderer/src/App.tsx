import { TooltipProvider } from '@/components/ui/tooltip'
import { ReaderScreen } from './features/reader/screen/ReaderScreen'

function App(): React.JSX.Element {
  return (
    <TooltipProvider>
      <ReaderScreen />
    </TooltipProvider>
  )
}

export default App
