import { useParams } from 'react-router-dom';

const Project = () => {
    const { ProjectId } = useParams();
  return (
    <div>
      <h1>I am A project: {ProjectId}</h1>
    </div>
  )
}

export default Project
