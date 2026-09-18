import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { ExpandableCard, OutlineAddButton } from '@/components/ExpandableCard';
import { IconInput } from '@/components/ui/IconInput';
import { IconTile } from '@/components/ui/IconTile';
import { colors } from '@/constants/theme';
import type { AdminItem } from '@/lib/catalog';
import { createSqliteCatalog } from '@/lib/db/catalog';
import { isItemVisualComplete, iconTileProps } from '@/lib/item-visual';
import { deleteItemPhoto, persistItemPhoto, pickItemPhoto } from '@/lib/local-image';
import { ItemHasSalesError } from '@/lib/market-day';
import { formatMoney, parseMoneyInput } from '@/lib/money';

type AdminItemCatalogProps = {
  db: SQLiteDatabase;
  autoOpenAdd?: boolean;
};

type FormMode = { type: 'add' } | { type: 'edit'; item: AdminItem };

type VisualMode = 'icon' | 'photo';

type ItemFormState = {
  visualMode: VisualMode;
  icon: string;
  name: string;
  cost: string;
  price: string;
  photoUri: string | null;
};

const emptyForm = (): ItemFormState => ({
  visualMode: 'icon',
  icon: '',
  name: '',
  cost: '',
  price: '',
  photoUri: null,
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
      visualMode: item.photoUri ? 'photo' : 'icon',
      icon: item.photoUri ? '' : item.icon,
      name: item.name,
      cost: formatMoney(item.costCents),
      price: formatMoney(item.priceCents),
      photoUri: item.photoUri,
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
        icon: form.visualMode === 'icon' ? form.icon.trim() : '',
        costCents: parseMoneyInput(form.cost),
        priceCents: parseMoneyInput(form.price),
        photoUri: form.visualMode === 'photo' ? form.photoUri : null,
      };
      if (!draft.name || draft.priceCents <= 0) return;
      if (!isItemVisualComplete(draft)) return;

      if (formMode?.type === 'add') {
        const created = await catalog.createItem({ ...draft, photoUri: null });
        if (draft.photoUri) {
          const persisted = await persistItemPhoto(draft.photoUri, created.id);
          await catalog.updateItem(created.id, { ...draft, photoUri: persisted });
        }
      } else if (formMode?.type === 'edit') {
        const previousPhotoUri = formMode.item.photoUri;
        if (previousPhotoUri && previousPhotoUri !== draft.photoUri) {
          await deleteItemPhoto(previousPhotoUri);
        }
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
      `${item.photoUri ? '📷' : item.icon} ${item.name} will be removed. Can't be undone.`,
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

  const canSave =
    form.name.trim().length > 0 &&
    parseMoneyInput(form.price) > 0 &&
    isItemVisualComplete({
      icon: form.visualMode === 'icon' ? form.icon : '',
      photoUri: form.visualMode === 'photo' ? form.photoUri : null,
    });

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
      {item.photoUri ? (
        <IconTile
          {...iconTileProps(item)}
          size={editing ? 28 : 24}
          style={editing ? styles.iconTileEdit : styles.iconTile}
        />
      ) : (
        <Text style={[styles.icon, editing && styles.iconEdit]}>{item.icon}</Text>
      )}
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
  const pickPhoto = () => {
    void (async () => {
      try {
        const uri = await pickItemPhoto();
        if (!uri) return;

        if (mode.type === 'edit') {
          const persisted = await persistItemPhoto(uri, mode.item.id);
          setForm((f) => ({
            ...f,
            visualMode: 'photo',
            photoUri: persisted,
            icon: '',
          }));
          return;
        }

        setForm((f) => ({
          ...f,
          visualMode: 'photo',
          photoUri: uri,
          icon: '',
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not pick that image.';
        Alert.alert('Photo error', message);
      }
    })();
  };

  const chooseVisualMode = (visualMode: VisualMode) => {
    setForm((f) => {
      if (visualMode === 'icon') {
        return { ...f, visualMode, photoUri: null };
      }
      return { ...f, visualMode, icon: '' };
    });
  };

  return (
    <View style={styles.formBody}>
      <VisualModePicker mode={form.visualMode} onChange={chooseVisualMode} />
      {form.visualMode === 'photo' ? (
        <PhotoField photoUri={form.photoUri} onPick={pickPhoto} />
      ) : (
        <Field
          label="Icon"
          value={form.icon}
          onChangeText={(icon) => setForm((f) => ({ ...f, icon }))}
          icon
          first
        />
      )}
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
              Hides from the menu. Past sales stay.
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
              Only for mistakes. Archive if this item has sold before.
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

function VisualModePicker({
  mode,
  onChange,
}: {
  mode: VisualMode;
  onChange: (mode: VisualMode) => void;
}) {
  return (
    <View style={styles.visualModeField}>
      <Text style={styles.fieldLabel}>Look</Text>
      <Text style={styles.photoHint}>Choose an emoji icon or a photo — not both.</Text>
      <View style={styles.visualModeRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: mode === 'icon' }}
          onPress={() => onChange('icon')}
          style={[styles.visualModeChip, mode === 'icon' && styles.visualModeChipSelected]}>
          <Text style={[styles.visualModeChipLabel, mode === 'icon' && styles.visualModeChipLabelSelected]}>
            Icon
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: mode === 'photo' }}
          onPress={() => onChange('photo')}
          style={[styles.visualModeChip, mode === 'photo' && styles.visualModeChipSelected]}>
          <Text
            style={[styles.visualModeChipLabel, mode === 'photo' && styles.visualModeChipLabelSelected]}>
            Photo
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function PhotoField({
  photoUri,
  onPick,
}: {
  photoUri: string | null;
  onPick: () => void;
}) {
  return (
    <View style={styles.photoField}>
      <Text style={styles.fieldLabel}>Photo</Text>
      <Text style={styles.photoHint}>Shows on Home and checkout.</Text>
      <Pressable accessibilityRole="button" onPress={onPick} style={styles.photoPreview}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoImage} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderLabel}>Tap to add photo</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  icon = false,
  first = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'decimal-pad' | 'default';
  icon?: boolean;
  first?: boolean;
}) {
  return (
    <View style={[styles.field, first && styles.fieldFirst]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {icon ? (
        <IconInput
          value={value}
          onChangeText={onChangeText}
          branded={false}
          style={[styles.fieldInput, styles.fieldInputIcon]}
        />
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={colors.inkSoft}
          style={styles.fieldInput}
        />
      )}
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
  icon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  iconTile: {
    width: 24,
  },
  iconTileEdit: {
    width: 28,
  },
  iconEdit: {
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
  photoField: {
    marginTop: 14,
    marginBottom: 0,
  },
  visualModeField: {
    marginBottom: 0,
  },
  visualModeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  visualModeChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.white,
    paddingVertical: 12,
    alignItems: 'center',
  },
  visualModeChipSelected: {
    borderColor: colors.purple,
    backgroundColor: colors.surfaceMuted,
  },
  visualModeChipLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    color: colors.inkSoft,
  },
  visualModeChipLabelSelected: {
    color: colors.ink,
  },
  photoHint: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
    marginBottom: 10,
  },
  photoPreview: {
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  photoImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  photoPlaceholderLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
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
  fieldInputIcon: {
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
