import { useContext, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { firebaseDb } from '../../config/FirebaseConfig'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { UserDetailContext } from './../../context/UserDetailContext'
import Header from '@/components/ui/custom/Header'
import PromptBox from '@/components/ui/custom/PromptBox'
import MyProjects from '@/components/ui/custom/MyProjects'

function Workspace() {
  const { user, isLoaded } = useUser();
  const { setUserDetail } = useContext(UserDetailContext);
  const location = useLocation();

  useEffect(() => {
    user && createNewUser();
  }, [user])

  const createNewUser = async () => {
    if (user) {
      const docRef = doc(firebaseDb, 'users', user?.primaryEmailAddress?.emailAddress ?? '');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserDetail(docSnap.data());
      } else {
        const data = {
          fullName: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          createdAt: new Date(),
          credits: 5,
        };
        await setDoc(doc(firebaseDb, 'users', user.primaryEmailAddress?.emailAddress ?? ''), data);
        setUserDetail(data);
      }
    }
  }

  if (!user && isLoaded) {
    return (
      <div className='flex flex-col items-center text-2xl font-bold mt-20 gap-10'>
        <div>Please Sign in to Access the WorkSpace</div>
        <Link to="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Header />
      {location.pathname === '/workspace' && (
        <div>
          <PromptBox />
          <MyProjects />
        </div>
      )}
      <Outlet />
    </div>
  )
}

export default Workspace
