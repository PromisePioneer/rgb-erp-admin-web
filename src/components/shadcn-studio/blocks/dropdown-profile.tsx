import type { ReactElement } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UserIcon, SettingsIcon, LogOutIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

type Props = {
  trigger: ReactElement
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

const ProfileDropdown = ({ trigger, defaultOpen, align = 'end' }: Props) => {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent className='w-80' align={align || 'end'}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='flex items-center gap-4 px-4 py-2.5 font-normal'>
            <div className='relative'>
              <Avatar size='lg'>
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className='absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2 ring-background' />
            </div>
            <div className='flex flex-1 flex-col items-start'>
              <span className='text-lg font-semibold'>{user?.name || 'User'}</span>
              <span className='text-muted-foreground text-base'>{user?.email || 'user@example.com'}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='gap-2 px-4 py-2.5 text-base'>
            <UserIcon className='size-5' />
            <span>Profil Saya</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='gap-2 px-4 py-2.5 text-base'>
            <SettingsIcon className='size-5' />
            <span>Pengaturan</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem variant='destructive' className='gap-2 px-4 py-2.5 text-base' onClick={handleLogout}>
            <LogOutIcon className='size-5' />
            <span>Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
