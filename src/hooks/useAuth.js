import AuthServices from '../services/AuthServices';
import {useQuery} from '@tanstack/react-query';

const useAuth = () => {
  const query = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => AuthServices.getProfile(),
  });

  return query;
};

export default useAuth;
