import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { Card, Button, Input } from '@/components/ui';
import type { AdminItem } from '@/lib/catalog';
import { createSqliteCatalog } from '@/lib/db/catalog';
import { formatMoney, parseMoneyInput } from '@/lib/money';

type AdminItemCatalogProps = {
  db: SQLiteDatabase;
};

type FormMode = { type: 'add' } | { type: 'edit'; item: AdminItem };

const emptyForm = () => ({
  emoji: '📦',
  name: '',
  cost: '',
  price: '',
});

export function AdminItemCatalog({ db }: AdminItemCatalogProps) {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [form, setForm] = useState(emptyForm);

  const refreshItems = useCallback(async () => {
    const catalog = createSqliteCatalog(db);
    setItems(await catalog.listForAdmin());
  }, [db]);

  useEffect(() => {
    void refreshItems();
  }, [refreshItems]);

  const openAddForm = () => {
    setForm(emptyForm());
    setFormMode({ type: 'add' });
  };

  const openEditForm = (item: AdminItem) => {
    setForm({
      emoji: item.emoji,
      name: item.name,
      cost: formatMoney(item.costCents),
      price: formatMoney(item.priceCents),
    });
    setFormMode({ type: 'edit', item });
  };

  const closeForm = () => {
    setFormMode(null);
    setForm(emptyForm());
  };

  const saveItem = () => {
    void (async () => {
      const catalog = createSqliteCatalog(db);
      const draft = {
        name: form.name.trim(),
        emoji: form.emoji.trim() || '📦',
        costCents: parseMoneyInput(form.cost),
        priceCents: parseMoneyInput(form.price),
      };
      if (!draft.name || draft.priceCents <= 0) return;

      if (formMode?.type === 'add') {
        await catalog.createItem(draft);
      } else if (formMode?.type === 'edit') {
        await catalog.updateItem(formMode.item.id, draft);
      }

      closeForm();
      await refreshItems();
    })();
  };

  const retireItem = (id: number) => {
    void (async () => {
      await createSqliteCatalog(db).retire(id);
      closeForm();
      await refreshItems();
    })();
  };

  const canSave = form.name.trim().length > 0 && parseMoneyInput(form.price) > 0;

  return (
    <View className="gap-2">
      {items.length === 0 ? (
        <Card className="p-4">
          <Text className="text-muted font-semibold text-center">No Items yet.</Text>
        </Card>
      ) : (
        items.map((item) => (
          <Pressable key={item.id} onPress={() => openEditForm(item)}>
            <Card className={`p-3.5 flex-row items-center justify-between ${item.retired ? 'opacity-60' : ''}`}>
              <Text className="font-extrabold text-[14px] text-foreground flex-1">
                {item.emoji} {item.name}
                {item.retired ? ' (retired)' : ''}
              </Text>
              <Text className="text-[13px] text-muted font-semibold">
                cost {formatMoney(item.costCents)} · {formatMoney(item.priceCents)}
              </Text>
            </Card>
          </Pressable>
        ))
      )}

      {formMode ? (
        <Card className="p-4 gap-3">
          <Text className="text-[11px] font-extrabold uppercase text-muted">
            {formMode.type === 'add' ? 'Add Item' : 'Edit Item'}
          </Text>
          <Field label="Emoji" value={form.emoji} onChangeText={(emoji) => setForm((f) => ({ ...f, emoji }))} />
          <Field label="Name" value={form.name} onChangeText={(name) => setForm((f) => ({ ...f, name }))} />
          <Field
            label="Cost — not shown to the seller"
            value={form.cost}
            onChangeText={(cost) => setForm((f) => ({ ...f, cost }))}
            keyboardType="decimal-pad"
          />
          <Field
            label="Price"
            value={form.price}
            onChangeText={(price) => setForm((f) => ({ ...f, price }))}
            keyboardType="decimal-pad"
          />
          <Button size="lg" isDisabled={!canSave} onPress={saveItem}>
            <Button.Label className="font-bold">Save Item</Button.Label>
          </Button>
          {formMode.type === 'edit' && !formMode.item.retired ? (
            <Button size="lg" variant="secondary" onPress={() => retireItem(formMode.item.id)}>
              <Button.Label className="font-bold">Retire Item</Button.Label>
            </Button>
          ) : null}
          <Button size="lg" variant="secondary" onPress={closeForm}>
            <Button.Label className="font-bold">Cancel</Button.Label>
          </Button>
        </Card>
      ) : (
        <Button size="lg" variant="secondary" onPress={openAddForm}>
          <Button.Label className="font-bold">Add Item</Button.Label>
        </Button>
      )}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'decimal-pad' | 'default';
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-[11px] font-extrabold uppercase text-muted">{label}</Text>
      <Input value={value} onChangeText={onChangeText} keyboardType={keyboardType} />
    </View>
  );
}
