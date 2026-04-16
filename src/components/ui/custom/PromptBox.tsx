import { useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Crown, Loader2Icon, Send } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { doc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { firebaseDb } from '../../../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { UserDetailContext } from '../../../../context/UserDetailContext';
import { Link } from 'react-router-dom';

function PromptBox() {
  const [userInput, setUserInput] = useState<string>();
  const [noOfSlides, setnoOfSlides] = useState<string>('4to6');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  const isPremium = userDetail?.isPremium === true;
  const hasCredits = isPremium || (userDetail?.credits ?? 0) > 0;

  const CreateAndSaveProject = async () => {
    if (!hasCredits) return;
    const projectId = uuidv4();
    setLoading(true);

    await setDoc(doc(firebaseDb, 'projects', projectId), {
      projectId,
      userInputPrompt: userInput,
      createdBy: user?.primaryEmailAddress?.emailAddress,
      createdAt: serverTimestamp(),
      noOfSlides,
    });

    // Decrement credits only for non-premium users
    if (!isPremium) {
      const email = user?.primaryEmailAddress?.emailAddress ?? '';
      await updateDoc(doc(firebaseDb, 'users', email), { credits: increment(-1) });
      setUserDetail((prev: any) => ({ ...prev, credits: (prev?.credits ?? 1) - 1 }));
    }

    setLoading(false);
    navigate(`/workspace/project/${projectId}/outline`);
  };

  return (
    <div className='w-full flex items-center justify-center mt-28'>
      <div className='flex flex-col gap-3 items-center justify-center'>
        <h2 className='font-bold text-4xl text-center'>
          Describe your topic, we'll design the{' '}
          <span className='text-primary'>Presentation</span> slides!
        </h2>
        <p className='text-xl text-gray-500'>Your design will be saved as a new project.</p>

        {!hasCredits && (
          <div className="flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/10 px-5 py-2.5 rounded-xl">
            You have no credits left.{' '}
            <Link to="/pricing" className="underline flex items-center gap-1 font-bold">
              <Crown className="w-4 h-4" /> Upgrade to Pro
            </Link>
          </div>
        )}

        <InputGroup>
          <InputGroupTextarea
            placeholder="E.g. Create slides on AI in Healthcare, Future of Work, etc."
            className="min-h-25 w-96 h-24 resize-none"
            onChange={(e) => setUserInput(e.target.value)}
            disabled={!hasCredits}
          />
          <InputGroupAddon align={'block-end'}>
            <Select onValueChange={(v) => setnoOfSlides(v)} disabled={!hasCredits}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="No. of slides" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>No. of slides</SelectLabel>
                  <SelectItem value="4to6">4-6 slides</SelectItem>
                  <SelectItem value="6to8">6-8 slides</SelectItem>
                  <SelectItem value="8to10">8-10 slides</SelectItem>
                  <SelectItem value="10to12">10-12 slides</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <InputGroupButton
              variant='default'
              className='ml-auto'
              size='sm'
              onClick={CreateAndSaveProject}
              disabled={!userInput || userInput.trim().length === 0 || !hasCredits || loading}
            >
              {loading ? <Loader2Icon className='animate-spin' /> : <Send />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}

export default PromptBox
