import { useAppSelector } from 'ui/store';

import { LoadingScreen } from './pages/loadingScreen';

interface Props {
  children: React.ReactNode;
}

export function RootWrapper({ children }: Props) {
  const isLoading = useAppSelector(state => state.localState.loading);

  return (
    <div className="app">
      <div className="height">{isLoading ? <LoadingScreen /> : children}</div>
    </div>
  );
}
