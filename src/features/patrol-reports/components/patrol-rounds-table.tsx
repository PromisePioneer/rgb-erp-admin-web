import { useEffect } from 'react'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { usePatrolReportsStore } from '../store/patrol-reports-store'
import type { PatrolReportsFilters, PatrolAreaRounds, PatrolRoundWithCheckpoints } from '../types/patrol-reports.types'

interface PatrolRoundsTableProps {
    filters?: Partial<PatrolReportsFilters>
}

export function PatrolRoundsTable(props?: PatrolRoundsTableProps) {
    const { rounds, isLoading, fetchRounds, filters } = usePatrolReportsStore()

    useEffect(() => {
        fetchRounds({
            month: filters.month ?? props?.filters?.month,
            project_id: filters.project_id ?? props?.filters?.project_id,
            page: 1,
            per_page: 100,
        })
    }, [filters?.month, filters?.project_id])

    if (isLoading && rounds.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Memuat...
            </div>
        )
    }

    if (rounds.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Tidak ada data ronde untuk periode ini
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {rounds.map((area: PatrolAreaRounds) => (
                <AreaRoundCard key={area.area_id} area={area} />
            ))}
        </div>
    )
}

function AreaRoundCard({ area }: { area: PatrolAreaRounds }) {
    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Area Header */}
            <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-lg">
                    {area.area_name}
                    {area.client_name && area.client_name !== '-' && (
                        <span className="text-muted-foreground ml-2">
                            — {area.client_name}
                        </span>
                    )}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {area.total_rounds} ronde • {area.rounds.filter(r => r.status === 'completed').length} selesai
                </p>
            </div>

            {/* Rounds List */}
            <div className="divide-y">
                {area.rounds.map((round) => (
                    <RoundCard key={round.round_id} round={round} />
                ))}
            </div>
        </div>
    )
}

function RoundCard({ round }: { round: PatrolRoundWithCheckpoints }) {
    const isCompleted = round.status === 'completed'

    return (
        <div className={`p-4 ${isCompleted ? 'bg-white' : 'bg-gray-50/50'}`}>
            {/* Round Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{round.date}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{round.start_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">Ronde #{round.round_number}</span>
                        <span className="text-sm text-muted-foreground">({round.shift_name})</span>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(round.status)}`}>
                    {getStatusIcon(round.status)}
                    <span className="ml-1">{round.status_text}</span>
                </span>
            </div>

            {/* Checkpoints Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {round.checkpoints.map((cp) => (
                    <CheckpointItem key={cp.id} checkpoint={cp} />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gray-400'}`}
                        style={{ width: `${round.progress_percent}%` }}
                    />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                    {round.scanned_checkpoints}/{round.total_checkpoints}
                </span>
            </div>
        </div>
    )
}

function CheckpointItem({ checkpoint }: { checkpoint: { id: number; name: string; sequence_order: number; scanned: boolean; scanned_at: string | null; employee_name: string | null } }) {
    return (
        <div
            className={`p-2 rounded border text-xs ${
                checkpoint.scanned
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-100 border-gray-200'
            }`}
        >
            <div className="flex items-center gap-1 mb-1">
                {checkpoint.scanned ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                    <Circle className="h-3 w-3 text-gray-400" />
                )}
                <span className="font-medium">{checkpoint.sequence_order}</span>
            </div>
            <div className="truncate font-medium">{checkpoint.name}</div>
            {checkpoint.scanned && checkpoint.employee_name ? (
                <div className="text-muted-foreground truncate">
                    {checkpoint.employee_name}
                </div>
            ) : (
                <div className="text-gray-400 italic">Belum discan</div>
            )}
            {checkpoint.scanned && checkpoint.scanned_at && (
                <div className="text-muted-foreground">
                    {checkpoint.scanned_at}
                </div>
            )}
        </div>
    )
}

// Helper functions (duplicated for standalone usage)
function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <CheckCircle className="h-4 w-4 text-green-600" />
        case 'skipped':
            return <AlertCircle className="h-4 w-4 text-gray-400" />
        default:
            return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
}

function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
        completed: 'bg-green-100 text-green-800',
        skipped: 'bg-gray-100 text-gray-600',
    }
    return colors[status] ?? 'bg-gray-100 text-gray-800'
}
