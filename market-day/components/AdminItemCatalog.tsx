import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { Card, Button, Input } from '@/components/ui';
import { colors } from '@/constants/theme';
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

  const archiveItem = (id: number) => {
    void (async () => {
      await createSqliteCatalog(db).archive(id);
      closeForm();
      await refreshItems();
    })();
  };

  const unarchiveItem = (id: number) => {
    void (async () => {
      await createSqliteCatalog(db).unarchive(id);
      closeForm();
      await refreshItems();
    })();
  };

  const canSave = form.name.trim().length > 0 && parseMoneyInput(form.price) > 0;

  return (
    <View style={styles.wrap}>
      {items.length === 0 && !formMode ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No items yet.</Text>
        </View>
      ) : (
        items.map((item) => (
          <View
            key={item.id}
            style={[styles.costRow, item.archived && styles.costRowArchived]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.meta}>
              <Text style={styles.name}>
                {item.name}
                {item.archived ? ' (archived)' : ''}
              </Text>
              <Text style={styles.figs}>
                cost {formatMoney(item.costCents)} · sells {formatMoney(item.priceCents)}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${item.name}`}
              onPress={() => openEditForm(item)}
              style={({ pressed }) => [styles.pencil, pressed && styles.pencilPressed]}>
              <Text style={styles.pencilIcon}>✏️</Text>
            </Pressable>
          </View>
        ))
      )}

      {formMode ? (
        <Card className="p-4 gap-3 mt-2">
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
          {formMode.type === 'edit' && !formMode.item.archived ? (
            <Button size="lg" variant="secondary" onPress={() => archiveItem(formMode.item.id)}>
              <Button.Label className="font-bold">Archive Item</Button.Label>
            </Button>
          ) : null}
          {formMode.type === 'edit' && formMode.item.archived ? (
            <Button size="lg" variant="secondary" onPress={() => unarchiveItem(formMode.item.id)}>
              <Button.Label className="font-bold">UnArchive Item</Button.Label>
            </Button>
          ) : null}
          <Button size="lg" variant="secondary" onPress={closeForm}>
            <Button.Label className="font-bold">Cancel</Button.Label>
          </Button>
        </Card>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={openAddForm}
          style={({ pressed }) => [styles.addButtonOuter, pressed && styles.addButtonOuterPressed]}>
          <View style={styles.addButtonInner}>
            <Text style={styles.addButtonLabel}>➕ Add Item</Text>
          </View>
        </Pressable>
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

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
  },
  emptyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  costRowArchived: {
    opacity: 0.6,
  },
  emoji: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  meta: {
    flex: 1,
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.ink,
  },
  figs: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 2,
  },
  pencil: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3EFFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pencilPressed: {
    opacity: 0.8,
  },
  pencilIcon: {
    fontSize: 11,
  },
  addButtonOuter: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: colors.purpleDark,
    paddingBottom: 4,
  },
  addButtonOuterPressed: {
    paddingBottom: 1,
    marginTop: 3,
  },
  addButtonInner: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },
});
