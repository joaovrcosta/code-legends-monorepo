import {
  File,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
  Hammer,
  ListChecks,
} from 'lucide-react'

export function ModuleFolderIcon({
  open,
  className = 'text-sky-500',
}: {
  open: boolean
  className?: string
}) {
  const Icon = open ? FolderOpen : Folder
  return <Icon className={`h-4 w-4 shrink-0 ${className}`} aria-hidden />
}

export function GroupFolderIcon({
  open,
  className = 'text-amber-500',
}: {
  open: boolean
  className?: string
}) {
  const Icon = open ? FolderOpen : Folder
  return <Icon className={`h-3.5 w-3.5 shrink-0 ${className}`} aria-hidden />
}

export function LessonFileIcon({ type }: { type: string }) {
  const key = type.trim().toLowerCase()
  const className = 'h-3.5 w-3.5 shrink-0 text-ch-muted'

  switch (key) {
    case 'video':
      return <FileVideo className={className} aria-hidden />
    case 'article':
    case 'text':
      return <FileText className={className} aria-hidden />
    case 'quiz':
    case 'multi_quiz':
      return <ListChecks className={className} aria-hidden />
    case 'project':
      return <Hammer className={className} aria-hidden />
    case 'lab':
      return <ListChecks className={`${className} text-cyan-500`} aria-hidden />
    default:
      return <File className={className} aria-hidden />
  }
}
