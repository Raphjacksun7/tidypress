import Callout from '@/components/Callout.astro'
import FileTree from '@/components/FileTree.astro'
import Image from '@/components/Image.astro'
import Mermaid from '@/components/Mermaid.astro'
import Tab from '@/components/Tab.astro'
import Tabs from '@/components/Tabs.astro'
import Tooltip from '@/components/Tooltip.astro'
import Steps from '@/components/Steps.astro'
import Step from '@/components/Step.astro'

export function createMdxComponentMap() {
  return {
    Tooltip,
    FileTree,
    Callout,
    img: Image,
    Image,
    Tabs,
    Tab,
    Mermaid,
    Steps,
    Step,
  }
}
