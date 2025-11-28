import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { List, FAB, Card, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { taskTypesAPI } from '../services/api';
import { TaskType } from '../types';

type TaskTypesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskTypes'>;

interface Props {
  navigation: TaskTypesScreenNavigationProp;
}

const TaskTypesScreen: React.FC<Props> = ({ navigation }) => {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskTypes();
  }, []);

  const loadTaskTypes = async () => {
    try {
      const response = await taskTypesAPI.getAll();
      setTaskTypes(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du chargement des types de tâches');
    } finally {
      setLoading(false);
    }
  };

  const deleteTaskType = (taskType: TaskType) => {
    Alert.alert(
      'Supprimer Type',
      `Êtes-vous sûr de vouloir supprimer "${taskType.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskTypesAPI.delete(taskType.id);
              loadTaskTypes();
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {taskTypes.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.emptyText}>
              Aucun type de tâche trouvé
            </Text>
            <Text variant="bodyMedium">
              Ajoutez le premier type de tâche
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <List.Section>
          {taskTypes.map((taskType) => (
            <List.Item
              key={taskType.id}
              title={taskType.title}
              left={props => <List.Icon {...props} icon="format-list-bulleted" />}
              right={props => <List.Icon {...props} icon="dots-vertical" />}
              onPress={() => navigation.navigate('TaskTypeForm', { taskTypeId: taskType.id })}
              onLongPress={() => deleteTaskType(taskType)}
            />
          ))}
        </List.Section>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('TaskTypeForm')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyCard: {
    marginTop: 16,
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TaskTypesScreen;