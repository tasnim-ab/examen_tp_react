import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, RefreshControl } from 'react-native';
import { List, FAB, Card, Text, Chip, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { tasksAPI, membersAPI, taskTypesAPI } from '../services/api';
import { Task, Member, TaskType } from '../types';

type TasksScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tasks'>;

interface Props {
  navigation: TasksScreenNavigationProp;
}

const TasksScreen: React.FC<Props> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Chargement des données...');
      const [tasksResponse, membersResponse, taskTypesResponse] = await Promise.all([
        tasksAPI.getAll(),
        membersAPI.getAll(),
        taskTypesAPI.getAll()
      ]);

      console.log(`✅ ${tasksResponse.data.length} tâches chargées`);
      setTasks(tasksResponse.data);
      setMembers(membersResponse.data);
      setTaskTypes(taskTypesResponse.data);
    } catch (error: any) {
      console.error('❌ Erreur chargement données:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les données. Vérifiez la connexion au serveur.',
        [
          { text: 'Réessayer', onPress: () => loadData() },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'nouveau': '#FF9800',
      'vue': '#2196F3',
      'planifiée': '#9C27B0',
      'en cours': '#FFC107',
      'achevée': '#4CAF50',
      'annulée': '#F44336'
    };
    return colors[status] || '#757575';
  };

  const getMemberName = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Inconnu';
  };

  const getTaskTypeTitle = (typeId: number) => {
    const taskType = taskTypes.find(t => t.id === typeId);
    return taskType ? taskType.title : 'Inconnu';
  };

  const deleteTask = (task: Task) => {
    Alert.alert(
      'Supprimer Tâche',
      `Êtes-vous sûr de vouloir supprimer "${task.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await tasksAPI.delete(task.id);
              Alert.alert('Succès', 'Tâche supprimée avec succès');
              loadData();
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="titleLarge">Chargement des tâches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text variant="titleMedium" style={styles.emptyText}>
              Aucune tâche trouvée
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Créez la première tâche de votre famille
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('TaskForm')}
              style={styles.emptyButton}
            >
              Créer une tâche
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <List.Section style={styles.listSection}>
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          {tasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.taskTitle}>
                  {task.title}
                </Text>
                <Text variant="bodyMedium" style={styles.taskDescription}>
                  {task.description}
                </Text>
                <View style={styles.chipsContainer}>
                  <Chip
                    mode="flat"
                    style={[styles.statusChip, { backgroundColor: getStatusColor(task.status) }]}
                    textStyle={styles.chipText}
                  >
                    {task.status}
                  </Chip>
                  <Chip mode="outlined" style={styles.typeChip}>
                    {getTaskTypeTitle(task.typeId)}
                  </Chip>
                  <Chip mode="outlined" style={styles.memberChip}>
                    {getMemberName(task.memberId)}
                  </Chip>
                </View>
                <View style={styles.actions}>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
                    style={styles.editButton}
                  >
                    Modifier
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => deleteTask(task)}
                    textColor="#F44336"
                    style={styles.deleteButton}
                  >
                    Supprimer
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </List.Section>
      )}

      {tasks.length > 0 && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('TaskForm')}
          label="Nouvelle tâche"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    marginTop: 16,
    alignItems: 'center',
    padding: 20,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  emptyButton: {
    marginTop: 8,
  },
  listSection: {
    flex: 1,
  },
  taskCard: {
    marginVertical: 4,
    elevation: 2,
  },
  taskTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskDescription: {
    color: '#666',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  statusChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  typeChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  memberChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    marginRight: 8,
  },
  deleteButton: {
    // Style par défaut
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default TasksScreen;