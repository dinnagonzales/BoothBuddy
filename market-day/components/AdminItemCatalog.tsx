import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { ExpandableCard, OutlineAddButton } from '@/components/ExpandableCard';
import { colors } from '@/constants/theme';
import type { AdminItem } from '@/lib/catalog';
import { createSqliteCatalog } from '@/lib/db/catalog';
import { ItemHasSalesError } from '@/lib/market-day';
import { formatMoney, parseMoneyInput } from '@/lib/money';

type AdminItemCatalogProps = {
  db: SQLiteDatabase;
  autoOpenAdd?: boolean;
};

type FormMode = { type: 'add' } | { type: 'edit'; item: AdminItem };

type ItemFormState = {
  emoji: string;
  name: string;
  cost: string;
  price: string;
};

const emptyForm = (): ItemFormState => ({
  emoji: '📦',
  name: '',
  cost: '',
  price: '',
});

const formCardStyle = { borderRadius: 24 };

export function AdminItemCatalog({ db, autoOpenAdd = false }: AdminItemCatalogProps) {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [autoOpenHandled, setAutoOpenHandled] = useState(false);

  const refreshItems = useCallback(async () => {
    const catalog = createSqliteCatalog(db);
    setItems(await catalog.listForAdmin());
  }, [db]);

  useEffect(() => {
    void refreshItems();
  }, [refreshItems]);

  useEffect(() => {
    if (!autoOpenAdd || autoOpenHandled || formMode != null) return;
    if (items.length > 0) {
      setAutoOpenHandled(true);
      return;
    }
    setForm(emptyForm());
    setFormMode({ type: 'add' });
    setAutoOpenHandled(true);
  }, [autoOpenAdd, autoOpenHandled, formMode, items.length]);

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

  const deleteItem = (item: AdminItem) => {
    Alert.alert(
      'Delete this item?',
      `${item.emoji} ${item.name} will be removed from inventory permanently. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete item',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await createSqliteCatalog(db).deleteItem(item.id);
                closeForm();
                await refreshItems();
              } catch (error) {
                if (error instanceof ItemHasSalesError) {
                  Alert.alert(
                    'Cannot delete this item',
                    'It appears in past sales. Use Archive to hide it from the menu instead.',
                  );
                }
              }
            })();
          },
        },
      ],
    );
  };

  const canSave = form.name.trim().length > 0 && parseMoneyInput(form.price) > 0;

  return (
    <View style={styles.wrap}>
      {items.length === 0 && !formMode ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No items yet.</Text>
        </View>
      ) : (
        items.map((item) => {
          const isEditing = formMode?.type === 'edit' && formMode.item.id === item.id;

          if (isEditing) {
            return (
              <ExpandableCard
                key={item.id}
                expanded
                headerDivider
                style={formCardStyle}
                headerStyle={styles.editHeader}
                bodyStyle={styles.editBody}
                header={
                  <ItemRow
                    item={item}
                    editing
                    onEdit={() => openEditForm(item)}
                  />
                }>
                <ItemForm
                  mode={formMode}
                  form={form}
                  setForm={setForm}
                  canSave={canSave}
                  onSave={saveItem}
                  onArchive={() => archiveItem(item.id)}
                  onUnarchive={() => unarchiveItem(item.id)}
                  onDelete={() => deleteItem(item)}
                  onCancel={closeForm}
                />
              </ExpandableCard>
            );
          }

          return (
            <View
              key={item.id}
              style={[styles.costRow, item.archived && styles.costRowArchived]}>
              <ItemRow item={item} onEdit={() => openEditForm(item)} />
            </View>
          );
        })
      )}

      {formMode?.type === 'add' ? (
        <ExpandableCard
          expanded
          headerDivider
          style={formCardStyle}
          headerStyle={styles.addHeader}
          bodyStyle={styles.editBody}
          header={<Text style={styles.addHeaderTitle}>Add Item</Text>}>
          <ItemForm
            mode={formMode}
            form={form}
            setForm={setForm}
            canSave={canSave}
            onSave={saveItem}
            onCancel={closeForm}
          />
        </ExpandableCard>
      ) : (
        <OutlineAddButton label="➕ Add Item" onPress={openAddForm} />
      )}
    </View>
  );
}

function ItemRow({
  item,
  editing = false,
  onEdit,
}: {
  item: AdminItem;
  editing?: boolean;
  onEdit: () => void;
}) {
  return (
    <>
      <Text style={[styles.emoji, editing && styles.emojiEdit]}>{item.emoji}</Text>
      <View style={styles.meta}>
        <Text style={[styles.name, editing && styles.nameEdit]}>
          {item.name}
          {item.archived ? ' (archived)' : ''}
        </Text>
        <Text style={[styles.figs, editing && styles.figsEdit]}>
          cost {formatMoney(item.costCents)} · sells {formatMoney(item.priceCents)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${item.name}`}
        onPress={onEdit}
        style={({ pressed }) => [
          styles.pencil,
          editing && styles.pencilActive,
          pressed && styles.pencilPressed,
        ]}>
        <Text style={[styles.pencilIcon, editing && styles.pencilIconActive]}>✏️</Text>
      </Pressable>
    </>
  );
}

function ItemForm({
  mode,
  form,
  setForm,
  canSave,
  onSave,
  onArchive,
  onUnarchive,
  onDelete,
  onCancel,
}: {
  mode: FormMode;
  form: ItemFormState;
  setForm: Dispatch<SetStateAction<ItemFormState>>;
  canSave: boolean;
  onSave: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.formBody}>
      <Field
        label="Emoji"
        value={form.emoji}
        onChangeText={(emoji) => setForm((f) => ({ ...f, emoji }))}
        emoji
        first
      />
      <Field label="Name" value={form.name} onChangeText={(name) => setForm((f) => ({ ...f, name }))} />
      <Field
        label="Cost — not shown to staff"
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

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          disabled={!canSave}
          onPress={onSave}
          style={({ pressed }) => [
            styles.saveButtonOuter,
            !canSave && styles.saveButtonOuterDisabled,
            pressed && canSave && styles.saveButtonOuterPressed,
          ]}>
          <View style={styles.saveButtonInner}>
            <Text style={styles.saveButtonLabel}>Save Item</Text>
          </View>
        </Pressable>

        {mode.type === 'edit' && !mode.item.archived && onArchive ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={onArchive}
              style={({ pressed }) => [styles.archiveButton, pressed && styles.archiveButtonPressed]}>
              <Text style={styles.archiveButtonLabel}>📦 Archive Item</Text>
            </Pressable>
            <Text style={styles.archiveHint}>
              Hides it from the menu — doesn&apos;t delete past sales
            </Text>
          </>
        ) : null}

        {mode.type === 'edit' && mode.item.archived && onUnarchive ? (
          <Pressable
            accessibilityRole="button"
            onPress={onUnarchive}
            style={({ pressed }) => [styles.archiveButton, pressed && styles.archiveButtonPressed]}>
            <Text style={styles.archiveButtonLabel}>📦 UnArchive Item</Text>
          </Pressable>
        ) : null}

        {mode.type === 'edit' && onDelete ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={onDelete}
              style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}>
              <Text style={styles.deleteButtonLabel}>🗑 Delete Item</Text>
            </Pressable>
            <Text style={styles.deleteHint}>
              Only for mistakes — use Archive if this item has been sold before
            </Text>
          </>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}>
          <Text style={styles.cancelButtonLabel}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  emoji = false,
  first = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'decimal-pad' | 'default';
  emoji?: boolean;
  first?: boolean;
}) {
  return (
    <View style={[styles.field, first && styles.fieldFirst]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={colors.inkSoft}
        style={[styles.fieldInput, emoji && styles.fieldInputEmoji]}
      />
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
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  addHeader: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  addHeaderTitle: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.ink,
  },
  editBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
  },
  emoji: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  emojiEdit: {
    fontSize: 22,
    width: 28,
  },
  meta: {
    flex: 1,
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.ink,
  },
  nameEdit: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
  },
  figs: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 2,
  },
  figsEdit: {
    fontSize: 12,
    marginTop: 0,
  },
  pencil: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pencilActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.purple,
  },
  pencilPressed: {
    opacity: 0.85,
  },
  pencilIcon: {
    fontSize: 11,
  },
  pencilIconActive: {
    fontSize: 14,
  },
  formBody: {
    gap: 0,
  },
  field: {
    marginTop: 14,
  },
  fieldFirst: {
    marginTop: 0,
  },
  fieldLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    marginBottom: 6,
  },
  fieldInput: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.ink,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  fieldInputEmoji: {
    fontSize: 24,
    paddingTop: 6,
    paddingBottom: 10,
  },
  actions: {
    marginTop: 24,
  },
  saveButtonOuter: {
    borderRadius: 18,
    backgroundColor: colors.purpleDark,
    paddingBottom: 4,
    marginBottom: 10,
  },
  saveButtonOuterDisabled: {
    opacity: 0.45,
  },
  saveButtonOuterPressed: {
    paddingBottom: 1,
    marginTop: 3,
  },
  saveButtonInner: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.ink,
  },
  archiveButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.amberBorder,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 6,
  },
  archiveButtonPressed: {
    opacity: 0.85,
  },
  archiveButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.amberDark,
  },
  archiveHint: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 14,
  },
  deleteButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.borderDanger,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 6,
  },
  deleteButtonPressed: {
    opacity: 0.85,
  },
  deleteButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.redDark,
  },
  deleteHint: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 14,
  },
  cancelButton: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    color: colors.inkSoft,
  },
});
