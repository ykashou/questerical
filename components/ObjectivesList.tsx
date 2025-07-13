import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';

interface ObjectivesListProps {
  objectives: string[];
  onChange: (objectives: string[]) => void;
  editable?: boolean;
}

export default function ObjectivesList({ objectives, onChange, editable = true }: ObjectivesListProps) {
  const { colors } = useThemeStore();
  
  const addObjective = () => {
    onChange([...objectives, '']);
  };

  const removeObjective = (index: number) => {
    const newObjectives = [...objectives];
    newObjectives.splice(index, 1);
    onChange(newObjectives);
  };

  const updateObjective = (index: number, text: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = text;
    onChange(newObjectives);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Objectives</Text>
        {editable && (
          <TouchableOpacity style={styles.addButton} onPress={addObjective}>
            <Plus size={18} color={colors.text} />
            <Text style={[styles.addButtonText, { color: colors.text }]}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {objectives.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No objectives added yet.</Text>
      ) : (
        <View style={styles.list}>
          {objectives.map((objective, index) => (
            <View key={index} style={[styles.objectiveItem, { backgroundColor: colors.background }]}>
              <View style={styles.objectiveContent}>
                <Text style={[styles.objectiveNumber, { color: colors.textSecondary }]}>{index + 1}.</Text>
                {editable ? (
                  <TextInput
                    style={[styles.objectiveInput, { color: colors.text }]}
                    value={objective}
                    onChangeText={(text) => updateObjective(index, text)}
                    placeholder="Enter objective"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={[styles.objectiveText, { color: colors.text }]}>{objective}</Text>
                )}
              </View>
              {editable && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeObjective(index)}
                >
                  <Minus size={18} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyText: {
    fontStyle: 'italic',
  },
  list: {
    gap: 8,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  objectiveContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  objectiveNumber: {
    marginRight: 8,
    width: 20,
  },
  objectiveInput: {
    flex: 1,
  },
  objectiveText: {
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
});