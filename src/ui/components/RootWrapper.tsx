import { useAppSelector } from 'popup/store/react';

import { LoadingScreen } from './pages/loadingScreen';

interface Props {
  children: React.ReactElement;
}

export function RootWrapper({ children }: Props) {
  const isLoading = useAppSelector(state => state.localState.loading);

  return isLoading ? <LoadingScreen /> : children;
}
