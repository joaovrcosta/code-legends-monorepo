import { Loading } from '@/components/loading'

export default function LoadingTestPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-surface">
            <Loading width={64} />
        </div>
    )
}