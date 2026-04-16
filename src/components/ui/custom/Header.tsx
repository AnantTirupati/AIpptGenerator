import { useContext } from 'react'
import logo from '../../../assets/logo.png'
import { Button } from '../button'
import { useUser, SignInButton, UserButton } from '@clerk/clerk-react'
import { Link, useLocation } from 'react-router-dom'
import { UserDetailContext } from '../../../../context/UserDetailContext'
import { Crown, Gem } from 'lucide-react'

function Header() {
  const { user } = useUser();
  const location = useLocation();
  const { userDetail } = useContext(UserDetailContext);

  const inWorkspace = location.pathname.includes('workspace');
  const isPremium = userDetail?.isPremium === true;

  return (
    <div className='flex items-center justify-between px-10 py-2 shadow bg-background sticky top-0 z-50'>
      <Link to="/">
        <img src={logo} alt="logo" width={130} height={130} />
      </Link>

      {!user ? (
        <SignInButton mode='modal'>
          <Button>Get Started</Button>
        </SignInButton>
      ) : (
        <div className='flex gap-3 items-center'>
          {/* Credits / Premium badge */}
          {inWorkspace && (
            isPremium ? (
              <div className='flex gap-2 items-center px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold'>
                <Crown className="w-4 h-4" />
                {userDetail?.premiumPlan ?? 'Premium'}
              </div>
            ) : (
              <div className='flex gap-2 items-center px-3 py-1.5 bg-orange-100 rounded-full text-sm font-medium'>
                <Gem className="w-4 h-4" />
                {userDetail?.credits ?? 0} credits
              </div>
            )
          )}

          {/* Upgrade button — only when not premium */}
          {!isPremium && user && (
            <Link to="/pricing">
              <Button variant="outline" size="sm" className="gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Crown className="w-3.5 h-3.5" /> Upgrade
              </Button>
            </Link>
          )}

          {/* Workspace / Home toggle */}
          {inWorkspace ? null : (
            <Link to="/workspace">
              <Button>Go to WorkSpace</Button>
            </Link>
          )}

          <UserButton />
        </div>
      )}
    </div>
  )
}

export default Header
