import { useLocalSearchParams, useRouter } from 'expo-router';

import { SaleDetailScreen } from '@/components/SaleDetailScreen';
import { safeBack } from '@/lib/navigation';

export default function AdminEditSaleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    saleNumber: string;
    returnTo?: string;
    marketDayId?: string;
  }>();
  const saleNumber = Number(params.saleNumber ?? 0);

  return (
    <SaleDetailScreen
      saleNumber={saleNumber}
      preorderMode={params.returnTo === 'preorders'}
      onBack={() => {
        if (params.returnTo === 'preorders') {
          router.replace('/preorders');
          return;
        }
        if (params.returnTo === 'past' && params.marketDayId) {
          safeBack(router, {
            pathname: '/past/[id]',
            params: { id: params.marketDayId },
          });
          return;
        }
        safeBack(router, '/sales');
      }}
      onSaved={(savedSaleNumber) => {
        if (params.returnTo === 'preorders') {
          router.replace({
            pathname: '/preorders',
            params: { saleSaved: String(savedSaleNumber) },
          });
          return;
        }

        if (params.returnTo === 'past' && params.marketDayId) {
          router.replace({
            pathname: '/past/[id]',
            params: {
              id: params.marketDayId,
              saleSaved: String(savedSaleNumber),
            },
          });
          return;
        }

        router.replace({
          pathname: '/settings',
          params: { saleSaved: String(savedSaleNumber) },
        });
      }}
      onCompleted={() => {
        router.replace('/sales');
      }}
    />
  );
}
