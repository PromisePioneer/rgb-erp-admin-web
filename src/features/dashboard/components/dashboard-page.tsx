'use client'

import {useEffect, useState} from 'react'
import {
    Users,
    UserCheck,
    UserX,
    FileText,
    TrendingUp,
    TrendingDown,
    Calendar,
    Building,
    DollarSign,
    AlertTriangle,
    CheckCircle2,
} from 'lucide-react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {Separator} from '@/components/ui/separator'
import {cn} from '@/lib/utils'
import {useAuthStore} from '@/stores/auth-store'
import StatisticsCard from '@/components/shadcn-studio/blocks/statistics-card-01'

// Format currency
function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

// Format date
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

// Statistics data type
interface DashboardStats {
    totalEmployees: number
    activeEmployees: number
    absentEmployees: number
    totalClients: number
    activeClients: number
    pendingReports: number
    totalPayroll: number
}

interface RecentReport {
    id: number
    employee_name: string
    client_name: string
    date: string
    status: string
    notes: string
}

interface TopEmployee {
    id: number
    name: string
    client: string
    reports_count: number
}

export default function DashboardPage() {
    const {user} = useAuthStore()
    const [stats, setStats] = useState<DashboardStats>({
        totalEmployees: 0,
        activeEmployees: 0,
        absentEmployees: 0,
        totalClients: 0,
        activeClients: 0,
        pendingReports: 0,
        totalPayroll: 0,
    })
    const [recentReports, setRecentReports] = useState<RecentReport[]>([])
    const [topEmployees, setTopEmployees] = useState<TopEmployee[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // In a real app, fetch this from API
        // For now, use mock data
        setStats({
            totalEmployees: 156,
            activeEmployees: 142,
            absentEmployees: 14,
            totalClients: 28,
            activeClients: 25,
            pendingReports: 12,
            totalPayroll: 285000000,
        })

        setRecentReports([
            {
                id: 1,
                employee_name: 'Ahmad Wijaya',
                client_name: 'PT Sentosa',
                date: '2026-08-27',
                status: 'submitted',
                notes: 'Patroli malam normal'
            },
            {
                id: 2,
                employee_name: 'Budi Santoso',
                client_name: 'Mall Central',
                date: '2026-08-27',
                status: 'submitted',
                notes: 'Shift pagi selesai'
            },
            {
                id: 3,
                employee_name: 'Citra Dewi',
                client_name: 'Bank Nusantara',
                date: '2026-08-26',
                status: 'approved',
                notes: 'Absensi lengkap'
            },
            {
                id: 4,
                employee_name: 'Dedi Kurniawan',
                client_name: 'PT Jaya',
                date: '2026-08-26',
                status: 'pending',
                notes: 'Menunggu konfirmasi'
            },
        ])

        setTopEmployees([
            {id: 1, name: 'Ahmad Wijaya', client: 'PT Sentosa', reports_count: 45},
            {id: 2, name: 'Budi Santoso', client: 'Mall Central', reports_count: 42},
            {id: 3, name: 'Eko Prasetyo', client: 'Hotel Bintang', reports_count: 38},
            {id: 4, name: 'Fajar Nugroho', client: 'PT Sentosa', reports_count: 36},
            {id: 5, name: 'Gita Permata', client: 'Bank Nusantara', reports_count: 34},
        ])

        setIsLoading(false)
    }, [])

    const statisticsData = [
        {
            icon: <Users className='size-4'/>,
            value: stats.totalEmployees.toString(),
            title: 'Total Karyawan',
            changePercentage: '+5.2%',
            changeType: 'up' as const,
        },
        {
            icon: <UserCheck className='size-4'/>,
            value: stats.activeEmployees.toString(),
            title: 'Karyawan Aktif',
            changePercentage: '+3.8%',
            changeType: 'up' as const,
        },
        {
            icon: <UserX className='size-4'/>,
            value: stats.absentEmployees.toString(),
            title: 'Tidak Hadir',
            changePercentage: '-2.1%',
            changeType: 'down' as const,
        },
        {
            icon: <Building className='size-4'/>,
            value: stats.activeClients.toString(),
            title: 'Klien Aktif',
            changePercentage: '+1.5%',
            changeType: 'up' as const,
        },
        {
            icon: <FileText className='size-4'/>,
            value: stats.pendingReports.toString(),
            title: 'Laporan Tertunda',
            changePercentage: '-8.3%',
            changeType: 'down' as const,
        },
        {
            icon: <DollarSign className='size-4'/>,
            value: formatCurrency(stats.totalPayroll).replace('Rp', ''),
            title: 'Total Gaji (Rp)',
            changePercentage: '+12.5%',
            changeType: 'up' as const,
        },
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className='bg-green-100 text-green-700'>Disetujui</Badge>
            case 'submitted':
                return <Badge className='bg-blue-100 text-blue-700'>Terkirim</Badge>
            case 'pending':
                return <Badge className='bg-yellow-100 text-yellow-700'>Tertunda</Badge>
            default:
                return <Badge variant='secondary'>{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-bold'>Dashboard</h2>
                    <p className='text-muted-foreground'>
                        Selamat datang, {user?.name || 'User'}! Berikut ringkasan aktivitas hari ini.
                    </p>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Calendar className='h-4 w-4'/>
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                {statisticsData.map((stat, index) => (
                    <StatisticsCard
                        key={index}
                        icon={stat.icon}
                        value={stat.value}
                        title={stat.title}
                        changePercentage={stat.changePercentage}
                        changeType={stat.changeType}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Recent Reports */}
                <Card className='lg:col-span-2'>
                    <CardHeader>
                        <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <FileText className='h-5 w-5'/>
                Laporan Terbaru
              </span>
                            <Badge variant='secondary'>{recentReports.length} laporan</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {recentReports.map((report) => (
                                <div key={report.id}
                                     className='flex items-center justify-between p-3 rounded-lg border'>
                                    <div className='flex items-center gap-3'>
                                        <Avatar className='size-10'>
                                            <AvatarFallback className='text-xs'>
                                                {report.employee_name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className='font-medium text-sm'>{report.employee_name}</p>
                                            <p className='text-xs text-muted-foreground'>{report.client_name}</p>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        {getStatusBadge(report.status)}
                                        <p className='text-xs text-muted-foreground mt-1'>{formatDate(report.date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performers */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <TrendingUp className='h-5 w-5'/>
                            Top Karyawan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {topEmployees.map((employee, index) => (
                                <div key={employee.id} className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className={cn(
                                            'flex items-center justify-center size-6 rounded-full text-xs font-bold',
                                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-muted text-muted-foreground'
                                        )}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className='font-medium text-sm'>{employee.name}</p>
                                            <p className='text-xs text-muted-foreground'>{employee.client}</p>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <p className='font-semibold'>{employee.reports_count}</p>
                                        <p className='text-xs text-muted-foreground'>laporan</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card>
                    <CardContent className='pt-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Tingkat Kehadiran</p>
                                <p className='text-2xl font-bold'>91.0%</p>
                            </div>
                            <div className='h-12 w-12 rounded-full bg-green-100 flex items-center justify-center'>
                                <CheckCircle2 className='h-6 w-6 text-green-600'/>
                            </div>
                        </div>
                        <Separator className='my-4'/>
                        <div className='flex items-center gap-2 text-sm text-green-600'>
                            <TrendingUp className='h-4 w-4'/>
                            <span>+2.3% dari bulan lalu</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className='pt-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Klien Baru</p>
                                <p className='text-2xl font-bold'>3</p>
                            </div>
                            <div className='h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center'>
                                <Building className='h-6 w-6 text-blue-600'/>
                            </div>
                        </div>
                        <Separator className='my-4'/>
                        <div className='flex items-center gap-2 text-sm text-blue-600'>
                            <TrendingUp className='h-4 w-4'/>
                            <span>Bulan ini</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className='pt-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground'>Insiden</p>
                                <p className='text-2xl font-bold'>2</p>
                            </div>
                            <div className='h-12 w-12 rounded-full bg-red-100 flex items-center justify-center'>
                                <AlertTriangle className='h-6 w-6 text-red-600'/>
                            </div>
                        </div>
                        <Separator className='my-4'/>
                        <div className='flex items-center gap-2 text-sm text-red-600'>
                            <TrendingDown className='h-4 w-4'/>
                            <span>-1 dari minggu lalu</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
