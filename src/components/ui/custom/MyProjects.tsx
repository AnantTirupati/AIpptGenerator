import { useContext, useEffect, useState } from 'react'
import { Button } from '../button'
import { IconFolderCode } from "@tabler/icons-react"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { ArrowUpRightIcon, Loader2, PresentationIcon } from 'lucide-react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { firebaseDb } from '../../../../config/FirebaseConfig'
import { useUser } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { UserDetailContext } from '../../../../context/UserDetailContext'

type Project = {
    projectId: string;
    userInputPrompt: string;
    noOfSlides: string;
    createdAt: any;
    selectedStyle?: string;
}

function MyProjects() {
    const { user } = useUser();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { userDetail } = useContext(UserDetailContext);

    useEffect(() => {
        user && fetchProjects();
    }, [user, userDetail]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(firebaseDb, "projects"),
                where("createdBy", "==", user?.primaryEmailAddress?.emailAddress),
            );
            const querySnapshot = await getDocs(q);
            const projectList: Project[] = [];
            querySnapshot.forEach((doc) => {
                projectList.push(doc.data() as Project);
            });
            // Sort by createdAt descending (client-side to avoid index requirement)
            projectList.sort((a, b) => {
                const aTime = a.createdAt?.seconds ?? 0;
                const bTime = b.createdAt?.seconds ?? 0;
                return bTime - aTime;
            });
            setProjects(projectList);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        } finally {
            setLoading(false);
        }
    };

    const slideRangeLabel: Record<string, string> = {
        "4to6": "4-6 slides",
        "6to8": "6-8 slides",
        "8to10": "8-10 slides",
        "10to12": "10-12 slides",
    };

    return (
        <div className='mx-40 mt-20'>
            <div className='flex flex-row justify-between items-center'>
                <h2 className='font-bold text-xl'>My Projects</h2>
                <Button onClick={() => navigate('/workspace')}>+ Create New Project</Button>
            </div>

            <div className='mt-6'>
                {loading ? (
                    <div className='flex items-center justify-center py-16'>
                        <Loader2 className='animate-spin w-8 h-8 text-primary' />
                    </div>
                ) : projects.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <IconFolderCode />
                            </EmptyMedia>
                            <EmptyTitle>No Projects Yet</EmptyTitle>
                            <EmptyDescription>
                                You haven&apos;t created any projects yet. Get started by creating
                                your first project.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <div className="flex gap-2">
                                <Button onClick={() => navigate('/workspace')}>Create Project</Button>
                            </div>
                        </EmptyContent>
                        <Button
                            variant="link"
                            asChild
                            className="text-muted-foreground"
                            size="sm"
                        >
                            <a href="#">
                                Learn More <ArrowUpRightIcon />
                            </a>
                        </Button>
                    </Empty>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {projects.map((project) => (
                            <Link
                                to={`/workspace/project/${project.projectId}/outline`}
                                key={project.projectId}
                            >
                                <div className='border rounded-2xl p-5 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer bg-card'>
                                    <div className='flex items-center gap-3 mb-3'>
                                        <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0'>
                                            <PresentationIcon className='w-5 h-5' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='font-semibold text-sm truncate'>
                                                {project.userInputPrompt}
                                            </p>
                                            <p className='text-xs text-muted-foreground'>
                                                {slideRangeLabel[project.noOfSlides] ?? project.noOfSlides}
                                                {project.selectedStyle ? ` · ${project.selectedStyle}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <p className='text-xs text-muted-foreground'>
                                        {project.createdAt?.seconds
                                            ? new Date(project.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })
                                            : 'Just now'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyProjects
